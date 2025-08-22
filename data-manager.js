/**
 * DataManager - データ管理・LocalStorage操作モジュール
 * Firebase対応版（削除処理統合・根本修正版）
 */
class DataManagerClass {
    constructor() {
        this.books = {};
        this.bookOrder = [];
        this.allRecords = [];
        this.savedQuestionStates = {};
        this.studyPlans = [];
        this.csvTemplates = {};
        this.qaQuestions = {};
        this.examDate = null;
        this.analysisCardOrder = ['chart', 'history', 'heatmap', 'weakness'];
        this.heatmapPinnedBook = null;
        this.radarPinnedBook = null;
        this.firebaseEnabled = false;
        this.currentUser = null;
        this.initialized = false;
        this.deletedItems = []; // 削除済みアイテム追跡
    }

    /**
     * 初期化処理（修正版）
     */
    async initialize() {
        // 二重初期化を防ぐ
        if (this.initialized) {
            console.log('DataManager already initialized');
            return true;
        }

        try {
            console.log('Starting DataManager initialization...');
            
            // ローカルストレージからデータ読み込み
            this.loadAllData();
            
            // Firebaseの初期化確認（エラーを防ぐ）
            if (typeof firebase !== 'undefined' && 
                firebase.auth && 
                typeof firebase.auth === 'function') {
                try {
                    this.firebaseEnabled = true;
                    await this.initializeFirebase();
                } catch (firebaseError) {
                    console.warn('Firebase initialization skipped:', firebaseError.message);
                    this.firebaseEnabled = false;
                }
            } else {
                console.log('Firebase not available, using local storage only');
                this.firebaseEnabled = false;
            }
            
            // サンプルデータの初期化（必要な場合）
            if (Object.keys(this.books).length === 0) {
                this.initializeSampleData();
            }
            
            this.initialized = true;
            console.log('DataManager initialized successfully');
            return true;
        } catch (error) {
            console.error('DataManager initialization error:', error);
            // エラーが発生してもローカルストレージは使えるようにする
            this.initialized = true;
            return true;
        }
    }

    /**
     * Firebase初期化（エラーハンドリング強化）
     */
    async initializeFirebase() {
        if (!this.firebaseEnabled) return;

        try {
            // Firebase設定が適切か確認
            if (!firebase.apps || firebase.apps.length === 0) {
                console.log('Firebase app not initialized');
                this.firebaseEnabled = false;
                return;
            }

            // 認証状態の監視
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('Firebase user logged in:', user.email);
                    // 非同期でFirebaseと同期（エラーが発生してもアプリは動作継続）
                    this.syncWithFirebase().catch(error => {
                        console.warn('Firebase sync failed:', error);
                    });
                }
            });
        } catch (error) {
            console.warn('Firebase initialization error:', error);
            this.firebaseEnabled = false;
        }
    }

    /**
 * Firebaseとの同期（サブコレクション分散読み込み版）
 */
async syncWithFirebase() {
    if (!this.firebaseEnabled || !this.currentUser) return;

    try {
        const db = firebase.firestore();
        const userId = this.currentUser.uid;
        const userRef = db.collection('users').doc(userId);

        console.log('🔄 Firebase分散データ同期開始...');

        // 1. メインドキュメントからメタデータを読み込み
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const data = userDoc.data();
            
            // 削除済みアイテムを最初に読み込み
            if (data.deletedItems && Array.isArray(data.deletedItems)) {
                this.deletedItems = data.deletedItems;
                this.saveDeletedItems();
                console.log(`🗑️ 削除済みアイテム読み込み: ${data.deletedItems.length}件`);
            }
            
            // その他のメタデータ
            if (data.bookOrder) this.bookOrder = data.bookOrder;
            if (data.examDate) this.examDate = new Date(data.examDate);
            if (data.analysisCardOrder) this.analysisCardOrder = data.analysisCardOrder;
            if (data.heatmapPinnedBook) this.heatmapPinnedBook = data.heatmapPinnedBook;
            if (data.radarPinnedBook) this.radarPinnedBook = data.radarPinnedBook;
        }

        // 2. 問題集データをサブコレクションから読み込み
        const booksSnapshot = await userRef.collection('books').get();
        if (!booksSnapshot.empty) {
            const firebaseBooks = {};
            booksSnapshot.forEach(doc => {
                const bookId = doc.id;
                if (!this.isDeleted('books', bookId)) {
                    const book = doc.data();
                    // 削除済み階層アイテムを除外
                    if (book.structure) {
                        book.structure = this.filterDeletedHierarchy(book.structure, bookId, []);
                    }
                    firebaseBooks[bookId] = book;
                }
            });
            this.books = firebaseBooks;
            this.saveBooksToStorage();
            console.log(`📚 問題集データ同期: ${Object.keys(firebaseBooks).length}冊`);
        }

        // 3. 学習記録をサブコレクションから読み込み
        const recordsSnapshot = await userRef.collection('records').get();
        if (!recordsSnapshot.empty) {
            const allRecords = [];
            recordsSnapshot.forEach(doc => {
                const chunkData = doc.data();
                if (chunkData.records && Array.isArray(chunkData.records)) {
                    allRecords.push(...chunkData.records);
                }
            });
            // 時系列でソート
            allRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            this.allRecords = allRecords;
            localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
            console.log(`📈 学習記録同期: ${allRecords.length}件`);
        }

        // 4. 学習計画をサブコレクションから読み込み
        const plansSnapshot = await userRef.collection('studyPlans').get();
        if (!plansSnapshot.empty) {
            const plans = [];
            plansSnapshot.forEach(doc => {
                const plan = doc.data();
                if (!this.isDeleted('studyPlans', doc.id)) {
                    plans.push(plan);
                }
            });
            this.studyPlans = plans;
            this.saveStudyPlans();
            console.log(`📅 学習計画同期: ${plans.length}件`);
        }

        // 5. 一問一答をサブコレクションから読み込み
        const qaSnapshot = await userRef.collection('qaQuestions').get();
        if (!qaSnapshot.empty) {
            const qaQuestions = {};
            qaSnapshot.forEach(doc => {
                const qaId = doc.id;
                if (!this.isDeleted('qaQuestions', qaId)) {
                    qaQuestions[qaId] = doc.data();
                }
            });
            this.qaQuestions = qaQuestions;
            this.saveQAQuestions();
            console.log(`❓ 一問一答同期: ${Object.keys(qaQuestions).length}セット`);
        }

        // 6. CSVテンプレートをサブコレクションから読み込み
        const templatesSnapshot = await userRef.collection('csvTemplates').get();
        if (!templatesSnapshot.empty) {
            const templates = {};
            templatesSnapshot.forEach(doc => {
                const templateId = doc.id;
                if (!this.isDeleted('csvTemplates', templateId)) {
                    templates[templateId] = doc.data();
                }
            });
            this.csvTemplates = templates;
            this.saveCSVTemplates();
            console.log(`📄 CSVテンプレート同期: ${Object.keys(templates).length}件`);
        }

        console.log('✅ Firebase分散データ同期完了');

    } catch (error) {
        console.warn('Firebase sync failed:', error);
    }
}

/**
 * 削除済みアイテムかチェック
 */
isDeleted(type, id) {
    return this.deletedItems.some(item => 
        item.type === type && item.id === id
    );
}

/**
 * 削除済み階層アイテムを除外するフィルタ（★強化版）
 */
filterDeletedHierarchy(structure, bookId, basePath) {
    if (!structure || typeof structure !== 'object') {
        return {};
    }
    
    const filtered = {};
    
    Object.keys(structure).forEach(name => {
        const currentPath = [...basePath, name];
        const hierarchyId = `${bookId}_${currentPath.join('/')}`;
        
        // 削除済みかチェック
        if (!this.isDeleted('hierarchy', hierarchyId)) {
            const item = { ...structure[name] };
            
            // 子要素がある場合は再帰的にフィルタリング
            if (item.children && Object.keys(item.children).length > 0) {
                item.children = this.filterDeletedHierarchy(item.children, bookId, currentPath);
            }
            
            filtered[name] = item;
        }
    });
    
    return filtered;
}

/**
 * 削除済みアイテムを除外してフィルタリング（一問一答対応版）
 */
filterDeletedItems(data, type) {
    if (Array.isArray(data)) {
        return data.filter(item => !this.isDeleted(type, item.id));
    } else if (typeof data === 'object') {
        if (type === 'qaQuestions') {
            // ★追加: 一問一答の場合は個別問題も除外
            const filtered = {};
            Object.keys(data).forEach(setName => {
                if (!this.isDeleted('qaQuestions', setName)) {
                    // 問題集レベルで削除されていない場合、個別問題をチェック
                    if (Array.isArray(data[setName])) {
                        const filteredQuestions = data[setName].filter(q => 
                            !this.isDeletedQAQuestion(setName, q.id)
                        );
                        if (filteredQuestions.length > 0) {
                            filtered[setName] = filteredQuestions;
                        }
                    }
                }
            });
            return filtered;
        } else {
            const filtered = {};
            Object.keys(data).forEach(key => {
                if (!this.isDeleted(type, key)) {
                    filtered[key] = data[key];
                }
            });
            return filtered;
        }
    }
    return data;
}

/**
 * 一問一答の個別問題が削除済みかチェック（★追加）
 */
isDeletedQAQuestion(setName, questionId) {
    return this.deletedItems.some(item => 
        item.type === 'qa' && 
        item.setName === setName && 
        item.questionId === questionId
    );
}

/**
 * アイテム削除処理（Firebase統合・階層対応強化版）
 */
markAsDeleted(type, id, additionalData = {}) {
    const deletedItem = {
        type: type,
        id: id,
        deletedAt: new Date().toISOString(),
        ...additionalData
    };
    
    this.deletedItems.push(deletedItem);
    this.saveDeletedItems();
    
    // ★追加: ローカルからも即座に削除
    if (type === 'books') {
        delete this.books[id];
        this.bookOrder = this.bookOrder.filter(bookId => bookId !== id);
        this.saveBooksToStorage();
        this.saveBookOrder();
    } else if (type === 'hierarchy') {
        // ★追加: 階層削除の場合は、該当問題集の構造を再フィルタリング
        const bookId = additionalData.bookId;
        if (bookId && this.books[bookId] && this.books[bookId].structure) {
            this.books[bookId].structure = this.filterDeletedHierarchy(
                this.books[bookId].structure, 
                bookId, 
                []
            );
            this.saveBooksToStorage();
        }
    } else if (type === 'qa' && additionalData.setName && additionalData.questionId) {
        // ★追加: 一問一答の個別問題削除対応
        if (this.qaQuestions[additionalData.setName]) {
            this.qaQuestions[additionalData.setName] = this.qaQuestions[additionalData.setName]
                .filter(q => q.id !== additionalData.questionId);
            if (this.qaQuestions[additionalData.setName].length === 0) {
                delete this.qaQuestions[additionalData.setName];
            }
            this.saveQAQuestions();
        }
    } else if (type === 'studyPlan') {
        this.studyPlans = this.studyPlans.filter(plan => plan.id !== id);
        this.saveStudyPlans();
    } else if (type === 'csvTemplates') {
        delete this.csvTemplates[id];
        this.saveCSVTemplates();
    }
    
    // Firebaseにも保存
    if (window.ULTRA_STABLE_USER_ID && this.saveToFirestore) {
        this.saveToFirestore({
            type: 'itemDeleted',
            deletedType: type,
            deletedId: id,
            message: `${type}:${id}を削除しました`,
            ...additionalData
        });
    }
    
    console.log(`✅ ${type}:${id} を削除済みとしてマーク＆即座削除`);
}

/**
 * 特定問題集の記録をクリア（★追加）
 */
clearBookRecords(bookId) {
    try {
        if (!bookId) {
            console.error('❌ bookId が指定されていません');
            return false;
        }

        const book = this.books[bookId];
        if (!book) {
            console.error('❌ 指定された問題集が見つかりません:', bookId);
            return false;
        }

        console.log(`🔄 問題集「${book.name}」(${bookId})の記録をクリア開始`);

        // 削除前の記録数を保存
        const beforeCount = this.allRecords.length;
        
        // 学習履歴から該当問題集の記録を削除
        this.allRecords = this.allRecords.filter(record => record.bookId !== bookId);
        
        const afterCount = this.allRecords.length;
        const deletedCount = beforeCount - afterCount;
        
        // LocalStorageに保存
        localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
        
        // 問題状態をより確実にクリア
        const stateKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(`questionStates_${bookId}_`)
        );
        
        stateKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ 削除: ${key}`);
        });
        
        // savedQuestionStatesからも削除
        Object.keys(this.savedQuestionStates).forEach(key => {
            if (key.startsWith(`${bookId}_`)) {
                delete this.savedQuestionStates[key];
            }
        });
        localStorage.setItem('savedQuestionStates', JSON.stringify(this.savedQuestionStates));
        
        console.log(`✅ クリア完了: 学習記録 ${deletedCount}件、問題状態 ${stateKeys.length}件を削除`);
        
        return true;
    } catch (error) {
        console.error('❌ clearBookRecords エラー:', error);
        return false;
    }
}

/**
 * 削除済みアイテム一覧の保存
 */
saveDeletedItems() {
    try {
        localStorage.setItem('deletedItems', JSON.stringify(this.deletedItems));
    } catch (error) {
        console.error('Error saving deleted items:', error);
    }
}

/**
 * 削除済みアイテム一覧の読み込み
 */
loadDeletedItems() {
    try {
        const saved = localStorage.getItem('deletedItems');
        if (saved) {
            this.deletedItems = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading deleted items:', error);
        this.deletedItems = [];
    }
}

/**
 * Firebaseにデータを保存（サブコレクション分散保存版）
 */
async saveToFirebase() {
    if (!this.firebaseEnabled || !this.currentUser) return;

    try {
        const db = firebase.firestore();
        const userId = this.currentUser.uid;
        const userRef = db.collection('users').doc(userId);

        // ★修正：バッチ操作で複数コレクションに分散保存
        const batch = db.batch();

        // 1. メインドキュメントにメタデータのみ保存
        batch.set(userRef, {
            bookOrder: this.bookOrder || [],
            examDate: this.examDate ? this.examDate.toISOString() : null,
            deletedItems: this.deletedItems || [],
            analysisCardOrder: this.analysisCardOrder || ['chart', 'history', 'heatmap', 'weakness'],
            heatmapPinnedBook: this.heatmapPinnedBook,
            radarPinnedBook: this.radarPinnedBook,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. 問題集データをサブコレクションに保存
        const booksCollection = userRef.collection('books');
        if (this.books && Object.keys(this.books).length > 0) {
            Object.entries(this.books).forEach(([bookId, bookData]) => {
                const bookRef = booksCollection.doc(bookId);
                batch.set(bookRef, bookData, { merge: true });
            });
        }

        // 3. 学習記録をサブコレクションに保存（最新1000件ずつ）
        const recordsCollection = userRef.collection('records');
        if (this.allRecords && this.allRecords.length > 0) {
            // 記録を100件ずつのチャンクに分割
            const recentRecords = this.allRecords.slice(-1000);
            const chunks = [];
            for (let i = 0; i < recentRecords.length; i += 100) {
                chunks.push(recentRecords.slice(i, i + 100));
            }
            
            chunks.forEach((chunk, index) => {
                const chunkRef = recordsCollection.doc(`chunk_${index}`);
                batch.set(chunkRef, { records: chunk }, { merge: true });
            });
        }

        // 4. 学習計画をサブコレクションに保存
        const plansCollection = userRef.collection('studyPlans');
        if (this.studyPlans && this.studyPlans.length > 0) {
            this.studyPlans.forEach((plan, index) => {
                const planRef = plansCollection.doc(`plan_${index}`);
                batch.set(planRef, plan, { merge: true });
            });
        }

        // 5. 一問一答をサブコレクションに保存
        const qaCollection = userRef.collection('qaQuestions');
        if (this.qaQuestions && Object.keys(this.qaQuestions).length > 0) {
            Object.entries(this.qaQuestions).forEach(([qaId, qaData]) => {
                const qaRef = qaCollection.doc(qaId);
                batch.set(qaRef, qaData, { merge: true });
            });
        }

        // 6. CSVテンプレートをサブコレクションに保存
        const templatesCollection = userRef.collection('csvTemplates');
        if (this.csvTemplates && Object.keys(this.csvTemplates).length > 0) {
            Object.entries(this.csvTemplates).forEach(([templateId, templateData]) => {
                const templateRef = templatesCollection.doc(templateId);
                batch.set(templateRef, templateData, { merge: true });
            });
        }

        // 7. バッチ実行
        await batch.commit();
        console.log('✅ データを分散保存しました（サブコレクション使用）');

    } catch (error) {
        console.warn('Firebase save error (data saved locally):', error);
        // Firebaseへの保存が失敗してもローカルには保存されている
    }
}

/**
 * 全データの読み込み（削除済みアイテム含む）
 */
loadAllData() {
    try {
        this.loadDeletedItems(); // ★重要: 削除済みアイテムを最初に読み込み
        this.loadBooksFromStorage();
        this.loadBookOrder();
        this.loadAllRecords();
        this.loadSavedQuestionStates();
        this.loadStudyPlans();
        this.loadCSVTemplates();
        this.loadQAQuestions();
        this.loadExamDate();
        this.loadAnalysisCardOrder();
        this.loadPinnedSettings();
    } catch (error) {
        console.error('Error loading data:', error);
        // 個別のエラーがあっても他のデータは読み込む
    }
}

/**
 * 全データの保存（削除済みアイテム含む）
 */
saveAllData() {
    try {
        this.saveBooksToStorage();
        this.saveBookOrder();
        this.saveStudyPlans();
        this.saveCSVTemplates();
        this.saveQAQuestions();
        this.saveDeletedItems(); // 削除済みアイテムも保存
        
        // Firebaseにも保存（エラーが発生しても継続）
        if (this.firebaseEnabled) {
            this.saveToFirebase().catch(error => {
                console.warn('Firebase save failed:', error);
            });
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

/**
 * 問題集データの読み込み（エラーハンドリング強化）
 */
loadBooksFromStorage() {
    try {
        const stored = localStorage.getItem('studyTrackerBooks');
        if (stored) {
            const parsedData = JSON.parse(stored);
            // データ形式の妥当性チェック
            if (parsedData && typeof parsedData === 'object') {
                // 削除済みアイテムを除外
                this.books = this.filterDeletedItems(parsedData, 'books');
                // 古いデータ形式の変換（必要に応じて）
                this.migrateOldDataFormat();
            } else {
                this.books = {};
            }
        }
    } catch (error) {
        console.error('Error loading books:', error);
        this.books = {};
    }
}

/**
 * 古いデータ形式の変換
 */
migrateOldDataFormat() {
    try {
        Object.values(this.books).forEach(book => {
            // 必須プロパティが欠けている場合は追加
            if (!book.id) book.id = 'book_' + Date.now() + Math.random();
            if (!book.structure) book.structure = {};
            if (!book.numberingType) book.numberingType = 'reset';
            if (!book.examType) book.examType = 'gyousei';
            if (!book.createdAt) book.createdAt = new Date().toISOString();
        });
    } catch (error) {
        console.error('Error migrating data:', error);
    }
}

/**
 * 問題集データの保存（階層順序を保持・削除済み除外強化版）
 */
saveBooksToStorage() {
    try {
        // ★追加: 削除済みアイテムを除外してから保存
        const filteredBooks = {};
        Object.keys(this.books).forEach(bookId => {
            if (!this.isDeleted('books', bookId)) {
                const book = this.books[bookId];
                const orderedStructure = {};
                
                // ★追加: 階層の順序を固定化
                if (book.structure) {
                    Object.keys(book.structure).sort().forEach(subjectKey => {
                        orderedStructure[subjectKey] = book.structure[subjectKey];
                    });
                }
                
                filteredBooks[bookId] = {
                    ...book,
                    structure: orderedStructure
                };
            }
        });
        
        localStorage.setItem('studyTrackerBooks', JSON.stringify(filteredBooks));
        this.books = filteredBooks; // ★追加: 内部データも更新
        
        console.log(`💾 問題集保存: ${Object.keys(filteredBooks).length}件（削除済み除外済み）`);
        
        // Firebaseにも保存（エラーが発生しても継続）
        if (this.firebaseEnabled) {
            this.saveToFirebase().catch(error => {
                console.warn('Firebase save failed:', error);
            });
        }
    } catch (error) {
        console.error('Error saving books:', error);
        if (error.name === 'QuotaExceededError') {
            alert('ストレージ容量が不足しています。古いデータを削除してください。');
        }
    }
}

/**
 * 問題集順序の読み込み（削除済み除外）
 */
loadBookOrder() {
    try {
        const saved = localStorage.getItem('bookOrder');
        if (saved) {
            this.bookOrder = JSON.parse(saved).filter(id => !this.isDeleted('books', id));
        } else {
            this.bookOrder = Object.keys(this.books);
        }
    } catch (error) {
        console.error('Error loading book order:', error);
        this.bookOrder = Object.keys(this.books);
    }
}

/**
 * 問題集順序の保存
 */
saveBookOrder() {
    try {
        // ★追加: 削除済み除外
        const filteredOrder = this.bookOrder.filter(id => !this.isDeleted('books', id));
        localStorage.setItem('bookOrder', JSON.stringify(filteredOrder));
        this.bookOrder = filteredOrder;
    } catch (error) {
        console.error('Error saving book order:', error);
    }
}

    /**
     * 学習記録の読み込み
     */
    loadAllRecords() {
        try {
            const history = localStorage.getItem('studyHistory');
            if (history) {
                const parsed = JSON.parse(history);
                // 配列であることを確認
                this.allRecords = Array.isArray(parsed) ? parsed : [];
            } else {
                this.allRecords = [];
            }
        } catch (error) {
            console.error('Error loading records:', error);
            this.allRecords = [];
        }
    }

    /**
     * 学習記録の保存
     */
    saveToHistory(record) {
        try {
            if (record) {
                this.allRecords.push(record);
            }
            
            // 最大1000件に制限
            if (this.allRecords.length > 1000) {
                this.allRecords = this.allRecords.slice(-1000);
            }
            
            localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
            
            // Firebaseにも保存（エラーが発生しても継続）
            if (this.firebaseEnabled) {
                this.saveToFirebase().catch(error => {
                    console.warn('Firebase save failed:', error);
                });
            }
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    /**
     * 保存済み問題状態の読み込み
     */
    loadSavedQuestionStates() {
        try {
            const saved = localStorage.getItem('savedQuestionStates');
            if (saved) {
                this.savedQuestionStates = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading question states:', error);
            this.savedQuestionStates = {};
        }
    }

    /**
     * 問題状態の保存
     */
    saveQuestionStates(bookId, path, states) {
        try {
            const key = `${bookId}_${path.join('/')}`;
            this.savedQuestionStates[key] = states;
            localStorage.setItem('savedQuestionStates', JSON.stringify(this.savedQuestionStates));
        } catch (error) {
            console.error('Error saving question states:', error);
        }
    }

    /**
     * 問題状態の取得
     */
    getQuestionStates(bookId, path) {
        const key = `${bookId}_${path.join('/')}`;
        return this.savedQuestionStates[key] || {};
    }

    /**
     * 学習計画の読み込み（削除済み除外）
     */
    loadStudyPlans() {
        try {
            const saved = localStorage.getItem('studyPlans');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.studyPlans = this.filterDeletedItems(
                    Array.isArray(parsed) ? parsed : [], 
                    'studyPlans'
                );
            } else {
                this.studyPlans = [];
            }
        } catch (error) {
            console.error('Error loading study plans:', error);
            this.studyPlans = [];
        }
    }

    /**
     * 学習計画の保存
     */
    saveStudyPlans() {
        try {
            localStorage.setItem('studyPlans', JSON.stringify(this.studyPlans));
            if (this.firebaseEnabled) {
                this.saveToFirebase().catch(error => {
                    console.warn('Firebase save failed:', error);
                });
            }
        } catch (error) {
            console.error('Error saving study plans:', error);
        }
    }

    /**
     * CSVテンプレートの読み込み（削除済み除外）
     */
    loadCSVTemplates() {
        try {
            const saved = localStorage.getItem('csvTemplates');
            if (saved) {
                this.csvTemplates = this.filterDeletedItems(JSON.parse(saved), 'csvTemplates');
            }
        } catch (error) {
            console.error('Error loading CSV templates:', error);
            this.csvTemplates = {};
        }
    }

    /**
     * CSVテンプレートの保存
     */
    saveCSVTemplates() {
        try {
            localStorage.setItem('csvTemplates', JSON.stringify(this.csvTemplates));
        } catch (error) {
            console.error('Error saving CSV templates:', error);
        }
    }

    /**
     * 一問一答問題の読み込み（削除済み除外）
     */
    loadQAQuestions() {
        try {
            const saved = localStorage.getItem('qaQuestions');
            if (saved) {
                this.qaQuestions = this.filterDeletedItems(JSON.parse(saved), 'qaQuestions');
            }
        } catch (error) {
            console.error('Error loading QA questions:', error);
            this.qaQuestions = {};
        }
    }

    /**
     * 一問一答問題の保存（削除済み除外強化版）
     */
    saveQAQuestions() {
        try {
            // ★追加: 削除済み問題を除外してから保存
            const filteredQuestions = {};
            Object.keys(this.qaQuestions).forEach(setName => {
                if (!this.isDeleted('qaQuestions', setName)) {
                    const questions = this.qaQuestions[setName];
                    if (Array.isArray(questions)) {
                        const filteredQuestionsInSet = questions.filter(q => 
                            !this.isDeletedQAQuestion(setName, q.id)
                        );
                        if (filteredQuestionsInSet.length > 0) {
                            filteredQuestions[setName] = filteredQuestionsInSet;
                        }
                    }
                }
            });
            
            localStorage.setItem('qaQuestions', JSON.stringify(filteredQuestions));
            this.qaQuestions = filteredQuestions; // ★追加: 内部データも更新
            
            console.log(`💾 一問一答保存: ${Object.keys(filteredQuestions).length}セット（削除済み除外済み）`);
            
            if (this.firebaseEnabled) {
                this.saveToFirebase().catch(error => {
                    console.warn('Firebase save failed:', error);
                });
            }
        } catch (error) {
            console.error('Error saving QA questions:', error);
        }
    }

    /**
     * 一問一答問題の取得（★追加）
     */
    getQAQuestions() {
        return this.qaQuestions || {};
    }

    /**
     * 試験日の読み込み
     */
    loadExamDate() {
        try {
            const saved = localStorage.getItem('examDate');
            if (saved) {
                const date = new Date(saved);
                // 有効な日付かチェック
                if (!isNaN(date.getTime())) {
                    this.examDate = date;
                }
            }
        } catch (error) {
            console.error('Error loading exam date:', error);
            this.examDate = null;
        }
    }

    /**
     * 試験日の保存（修正版）
     */
    saveExamDate(date) {
        try {
            // 日付オブジェクトの妥当性チェック
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                console.error('Invalid date provided');
                return false;
            }
            
            this.examDate = date;
            localStorage.setItem('examDate', date.toISOString());
            if (this.firebaseEnabled) {
                this.saveToFirebase().catch(error => {
                    console.warn('Firebase save failed:', error);
                });
            }
            return true;
        } catch (error) {
            console.error('Error saving exam date:', error);
            return false;
        }
    }

    /**
     * 分析カード順序の読み込み
     */
    loadAnalysisCardOrder() {
        try {
            const saved = localStorage.getItem('analysisCardOrder');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.analysisCardOrder = parsed;
                }
            }
        } catch (error) {
            console.error('Error loading analysis card order:', error);
        }
    }

    /**
     * 分析カード順序の保存
     */
    saveAnalysisCardOrder() {
        try {
            localStorage.setItem('analysisCardOrder', JSON.stringify(this.analysisCardOrder));
        } catch (error) {
            console.error('Error saving analysis card order:', error);
        }
    }

    /**
     * ピン固定設定の読み込み
     */
    loadPinnedSettings() {
        try {
            const heatmapPinned = localStorage.getItem('heatmapPinnedBook');
            if (heatmapPinned && !this.isDeleted('books', heatmapPinned)) {
                this.heatmapPinnedBook = heatmapPinned;
            }
            
            const radarPinned = localStorage.getItem('radarPinnedBook');
            if (radarPinned && !this.isDeleted('books', radarPinned)) {
                this.radarPinnedBook = radarPinned;
            }
        } catch (error) {
            console.error('Error loading pinned settings:', error);
        }
    }

    /**
     * ヒートマップピン固定の保存
     */
    saveHeatmapPinned(bookId) {
        try {
            if (bookId && !this.isDeleted('books', bookId)) {
                this.heatmapPinnedBook = bookId;
                localStorage.setItem('heatmapPinnedBook', bookId);
            } else {
                this.heatmapPinnedBook = null;
                localStorage.removeItem('heatmapPinnedBook');
            }
        } catch (error) {
            console.error('Error saving heatmap pinned:', error);
        }
    }

    /**
     * レーダーチャートピン固定の保存
     */
    saveRadarPinned(bookId) {
        try {
            if (bookId && !this.isDeleted('books', bookId)) {
                this.radarPinnedBook = bookId;
                localStorage.setItem('radarPinnedBook', bookId);
            } else {
                this.radarPinnedBook = null;
                localStorage.removeItem('radarPinnedBook');
            }
        } catch (error) {
            console.error('Error saving radar pinned:', error);
        }
    }

    /**
     * 問題集から全問題を取得
     */
    getAllQuestionsFromBook(book) {
        const questions = [];
        
        if (!book || !book.structure) {
            return questions;
        }
        
        function traverse(structure, path = []) {
            Object.entries(structure).forEach(([name, item]) => {
                const newPath = [...path, name];
                
                if (item && item.questions && Array.isArray(item.questions)) {
                    item.questions.forEach(num => {
                        questions.push({
                            number: num,
                            subject: newPath[0],
                            chapter: newPath[1],
                            section: newPath[2],
                            subsection: newPath[3],
                            path: newPath
                        });
                    });
                }
                
                if (item && item.children) {
                    traverse(item.children, newPath);
                }
            });
        }
        
        traverse(book.structure);
        return questions;
    }

    /**
     * 問題集内の問題数をカウント
     */
    countQuestionsInBook(book) {
        if (!book || !book.structure) {
            return 0;
        }
        
        let count = 0;
        
        function traverse(structure) {
            if (!structure || typeof structure !== 'object') {
                return;
            }
            
            Object.values(structure).forEach(item => {
                if (!item) return;
                
                if (item.questions && Array.isArray(item.questions)) {
                    count += item.questions.length;
                }
                if (item.children && typeof item.children === 'object') {
                    traverse(item.children);
                }
            });
        }
        
        traverse(book.structure);
        return count;
    }

    /**
     * 連続学習日数の更新
     */
    updateDailyStreak() {
        try {
            const today = new Date().toDateString();
            const lastStudyDate = localStorage.getItem('lastStudyDate');
            let streakDays = parseInt(localStorage.getItem('streakDays') || '0');
            
            if (lastStudyDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastStudyDate === yesterday.toDateString()) {
                    streakDays++;
                } else if (lastStudyDate !== today) {
                    streakDays = 1;
                }
                
                localStorage.setItem('lastStudyDate', today);
                localStorage.setItem('streakDays', streakDays.toString());
            }
            
            return streakDays;
        } catch (error) {
            console.error('Error updating daily streak:', error);
            return 0;
        }
    }

    /**
     * サンプルデータの初期化
     */
    initializeSampleData() {
        // サンプル1: 肢別過去問集
        const sampleBook1 = {
            id: 'sample-2024',
            name: '合格革命 肢別過去問集 2024年版',
            examType: 'gyousei',
            numberingType: 'reset',
            structure: {
                '民法': {
                    type: 'subject',
                    children: {
                        '総則': {
                            type: 'chapter',
                            children: {
                                '権利能力': {
                                    type: 'section',
                                    questions: [1, 2, 3, 4, 5]
                                },
                                '意思能力': {
                                    type: 'section',
                                    questions: [1, 2, 3, 4, 5]
                                }
                            }
                        }
                    }
                },
                '行政法': {
                    type: 'subject',
                    children: {
                        '行政主体': {
                            type: 'chapter',
                            children: {
                                '国と地方': {
                                    type: 'section',
                                    questions: [1, 2, 3, 4, 5]
                                }
                            }
                        }
                    }
                }
            },
            createdAt: new Date().toISOString()
        };
        
        // サンプル2: 年度別過去問
        const sampleBook2 = {
            id: 'sample-kakomond-2024',
            name: '行政書士試験 過去問集',
            examType: 'gyousei',
            numberingType: 'continuous',
            structure: {
                '年度別過去問': {
                    type: 'subject',
                    children: {
                        '令和6年度': {
                            type: 'chapter',
                            questions: Array.from({length: 60}, (_, i) => i + 1),
                            children: {}
                        },
                        '令和5年度': {
                            type: 'chapter',
                            questions: Array.from({length: 60}, (_, i) => i + 61),
                            children: {}
                        }
                    }
                }
            },
            createdAt: new Date().toISOString()
        };
        
        this.books[sampleBook1.id] = sampleBook1;
        this.books[sampleBook2.id] = sampleBook2;
        this.bookOrder = [sampleBook1.id, sampleBook2.id];
        this.saveBooksToStorage();
        this.saveBookOrder();
        
        // サンプル一問一答データ
        this.qaQuestions['サンプル問題集'] = [
            {
                id: 1,
                question: '日本国憲法が保障する基本的人権の中で、最も重要とされる権利は何か？',
                answer: '個人の尊厳（憲法13条）。すべての基本的人権の根底にある権利とされる。'
            }
        ];
        this.saveQAQuestions();
    }

    /**
     * 全データのクリア
     */
    clearAllData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            if (confirm('本当に削除してもよろしいですか？')) {
                try {
                    localStorage.clear();
                    
                    // Firebaseからも削除（エラーが発生しても継続）
                    if (this.firebaseEnabled && this.currentUser) {
                        const db = firebase.firestore();
                        db.collection('users').doc(this.currentUser.uid).delete()
                            .catch(error => console.warn('Firebase delete failed:', error));
                    }
                    
                    location.reload();
                } catch (error) {
                    console.error('Error clearing data:', error);
                    alert('データの削除中にエラーが発生しました');
                }
            }
        }
    }

    /**
     * ★修正: CSV行の安全なパース処理
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * ★修正: CSVインポート処理（完全修復版）
     */
    importCSV(bookName, csvData, numberingType) {
        try {
            console.log('🔄 CSVインポート開始:', bookName, numberingType);
            
            if (!csvData || !csvData.trim()) {
                console.error('❌ CSVデータが空です');
                return false;
            }
            
            const lines = csvData.trim().split('\n');
            if (lines.length === 0) {
                console.error('❌ CSVデータに有効な行がありません');
                return false;
            }
            
            // 既存の問題集を探す
            let bookId = null;
            let book = null;
            
            for (let id in this.books) {
                if (this.books[id].name === bookName && !this.isDeleted('books', id)) {
                    bookId = id;
                    book = this.books[id];
                    console.log('📚 既存問題集を使用:', bookName);
                    break;
                }
            }
            
            // 新規作成または既存に追加
            if (!book) {
                bookId = 'book_' + Date.now();
                book = {
                    id: bookId,
                    name: bookName,
                    examType: 'gyousei',
                    numberingType: numberingType || 'reset',
                    structure: {},
                    createdAt: new Date().toISOString()
                };
                this.books[bookId] = book;
                this.bookOrder.push(bookId);
                console.log('✨ 新規問題集作成:', bookName);
            }
            
            // ヘッダー行をスキップ
            let startIndex = 0;
            if (lines[0].includes('科目') || lines[0].includes('章') || lines[0].includes('subject')) {
                startIndex = 1;
                console.log('📋 ヘッダー行をスキップ');
            }
            
            let processedCount = 0;
            
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) {
                    console.log(`⏭️ 空行をスキップ: ${i + 1}行目`);
                    continue;
                }
                
                // ★修正: 安全なCSVパース処理を使用
                const parts = this.parseCSVLine(line);
                console.log(`📝 処理中 ${i + 1}行目:`, parts);
                
                const [subject, chapter, section, subsection, startNum, endNum] = parts.map(p => p ? p.trim() : '');
                
                if (!subject) {
                    console.log(`⚠️ 科目名が空: ${i + 1}行目`);
                    continue;
                }
                
                try {
                    // 科目を追加
                    if (!book.structure[subject]) {
                        book.structure[subject] = {
                            type: 'subject',
                            children: {}
                        };
                        console.log(`📂 科目追加: ${subject}`);
                    }
                    
                    if (chapter) {
                        // 章を追加
                        if (!book.structure[subject].children[chapter]) {
                            book.structure[subject].children[chapter] = {
                                type: 'chapter',
                                children: {}
                            };
                            console.log(`📄 章追加: ${subject} > ${chapter}`);
                        }
                        
                        if (section) {
                            // 節を追加
                            if (!book.structure[subject].children[chapter].children[section]) {
                                book.structure[subject].children[chapter].children[section] = {
                                    type: 'section',
                                    children: {}
                                };
                                console.log(`📑 節追加: ${subject} > ${chapter} > ${section}`);
                            }
                            
                            if (subsection) {
                                // 項を追加
                                if (!book.structure[subject].children[chapter].children[section].children[subsection]) {
                                    book.structure[subject].children[chapter].children[section].children[subsection] = {
                                        type: 'subsection'
                                    };
                                    console.log(`📝 項追加: ${subject} > ${chapter} > ${section} > ${subsection}`);
                                }
                                
                                // 項に問題を追加
                                if (startNum && endNum) {
                                    const start = parseInt(startNum);
                                    const end = parseInt(endNum);
                                    if (!isNaN(start) && !isNaN(end) && start <= end) {
                                        const questions = [];
                                        for (let j = start; j <= end; j++) {
                                            questions.push(j);
                                        }
                                        book.structure[subject].children[chapter].children[section].children[subsection].questions = questions;
                                        console.log(`✅ 項に問題追加: ${questions.length}問 (${start}-${end})`);
                                        processedCount++;
                                    }
                                }
                            } else {
                                // 節に問題を追加
                                if (startNum && endNum) {
                                    const start = parseInt(startNum);
                                    const end = parseInt(endNum);
                                    if (!isNaN(start) && !isNaN(end) && start <= end) {
                                        const questions = [];
                                        for (let j = start; j <= end; j++) {
                                            questions.push(j);
                                        }
                                        book.structure[subject].children[chapter].children[section].questions = questions;
                                        console.log(`✅ 節に問題追加: ${questions.length}問 (${start}-${end})`);
                                        processedCount++;
                                    }
                                }
                            }
                        } else {
                            // 章に問題を追加
                            if (startNum && endNum) {
                                const start = parseInt(startNum);
                                const end = parseInt(endNum);
                                if (!isNaN(start) && !isNaN(end) && start <= end) {
                                    const questions = [];
                                    for (let j = start; j <= end; j++) {
                                        questions.push(j);
                                    }
                                    book.structure[subject].children[chapter].questions = questions;
                                    console.log(`✅ 章に問題追加: ${questions.length}問 (${start}-${end})`);
                                    processedCount++;
                                }
                            }
                        }
                    }
                } catch (rowError) {
                    console.error(`❌ ${i + 1}行目の処理エラー:`, rowError, parts);
                    // 個別行のエラーは継続して処理
                }
            }
            
            // データを保存
            this.saveBooksToStorage();
            this.saveBookOrder();
            
            console.log(`✅ CSVインポート完了: ${processedCount}個の項目を処理`);
            
            if (processedCount === 0) {
                console.warn('⚠️ 有効なデータが処理されませんでした');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ CSV import error:', error);
            console.error('❌ CSVデータ:', csvData?.substring(0, 200) + '...');
            return false;
        }
    }

    /**
     * Firestoreへの汎用保存メソッド（KeyPointsModule用）
     * ★追加: KeyPointsModuleなど外部モジュールからのFirebase保存用
     */
    async saveToFirestore(data) {
        if (!this.firebaseEnabled || !this.currentUser) {
            console.log('Firebase not available, saving to localStorage only');
            return false;
        }

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;
            
            // タイムスタンプを追加
            const saveData = {
                ...data,
                userId: userId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // データタイプに応じて適切なコレクションに保存
            if (data.type === 'keyPoints') {
                // KeyPointsデータの保存
                await db.collection('users').doc(userId).collection('keyPoints').doc('data').set({
                    keyPointsData: data.keyPointsData || {},
                    keyPointsCount: data.keyPointsCount || 0,
                    timestamp: data.timestamp,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('✅ KeyPoints saved to Firestore');
            } else if (data.type === 'itemDeleted') {
                // 削除アイテムの記録
                await db.collection('users').doc(userId).collection('deletedItems').add(saveData);
                console.log('✅ Deleted item recorded in Firestore');
            } else {
                // その他の汎用データ
                await db.collection('users').doc(userId).collection('activities').add(saveData);
                console.log('✅ Activity saved to Firestore');
            }
            
            return true;
        } catch (error) {
            console.warn('Firestore save error:', error);
            return false;
        }
    }

    /**
     * Firestoreから KeyPoints データを読み込む
     * ★追加: KeyPointsModule初期化時のデータ復元用
     */
    async loadKeyPointsFromFirestore() {
        if (!this.firebaseEnabled || !this.currentUser) {
            return null;
        }

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;
            
            const doc = await db.collection('users').doc(userId).collection('keyPoints').doc('data').get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ KeyPoints loaded from Firestore');
                return data.keyPointsData || null;
            }
            
            return null;
        } catch (error) {
            console.warn('Firestore load error:', error);
            return null;
        }
    }
}

// グローバルに公開（シングルトンインスタンス）
window.DataManager = new DataManagerClass();

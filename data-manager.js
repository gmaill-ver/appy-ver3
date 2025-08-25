/**
 * DataManager - データ管理・LocalStorage操作モジュール
 * Firebase対応版（修正版：データ保存と復元を完全対応）
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
        this.deletedItems = [];
        this.syncInProgress = false;
        this.pendingSaves = [];
    }

    /**
     * 初期化処理（修正版：Firebase統合強化）
     */
    async initialize() {
        if (this.initialized) {
            console.log('DataManager already initialized');
            return true;
        }

        try {
            console.log('🚀 DataManager初期化開始...');
            
            // まずローカルデータを読み込み
            this.loadAllData();
            
            // 固定IDの取得を待つ（最大10秒）
            await this.waitForStableUserId();
            
            // Firebase初期化
            await this.initializeFirebase();
            
            // サンプルデータの初期化（必要な場合）
            if (Object.keys(this.books).length === 0) {
                this.initializeSampleData();
            }
            
            this.initialized = true;
            console.log('✅ DataManager初期化完了');
            return true;
        } catch (error) {
            console.error('❌ DataManager初期化エラー:', error);
            // エラーが発生してもローカルストレージは使えるようにする
            this.initialized = true;
            return true;
        }
    }

    /**
     * 固定IDの取得を待つ（修正版）
     */
    async waitForStableUserId(maxWaitSeconds = 10) {
        const maxAttempts = maxWaitSeconds * 10; // 100ms間隔
        let attempts = 0;
        
        while (!window.ULTRA_STABLE_USER_ID && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            
            if (attempts % 10 === 0) {
                console.log(`⏳ 固定ID取得待機中... ${attempts/10}秒経過`);
            }
        }
        
        if (window.ULTRA_STABLE_USER_ID) {
            console.log('🔑 固定ID取得完了:', window.ULTRA_STABLE_USER_ID.substring(0, 20) + '...');
            return true;
        } else {
            console.warn('⚠️ 固定ID取得タイムアウト（ローカルストレージのみで動作）');
            return false;
        }
    }

    /**
     * Firebase初期化（修正版：一貫性のあるコレクション名）
     */
    async initializeFirebase() {
        try {
            if (!window.ULTRA_STABLE_USER_ID) {
                console.log('🔄 固定ID未取得のためFirebase初期化をスキップ');
                this.firebaseEnabled = false;
                return;
            }
            
            if (typeof firebase === 'undefined' || !firebase.apps || firebase.apps.length === 0) {
                console.log('❌ Firebase app未初期化');
                this.firebaseEnabled = false;
                return;
            }

            this.currentUser = { uid: window.ULTRA_STABLE_USER_ID };
            this.firebaseEnabled = true;
            
            console.log('🔥 Firebase初期化完了:', this.currentUser.uid.substring(0, 20) + '...');
            
            // 即座に同期を開始
            await this.syncWithFirebase();
            
        } catch (error) {
            console.warn('⚠️ Firebase初期化エラー:', error);
            this.firebaseEnabled = false;
        }
    }

    /**
     * Firebaseとの同期（修正版：完全データ復元）
     */
    async syncWithFirebase() {
        if (!this.firebaseEnabled || !this.currentUser || this.syncInProgress) return;

        this.syncInProgress = true;
        
        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;
            
            // ★修正: permanentUsersコレクションに統一
            const userRef = db.collection('permanentUsers').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                console.log('📥 Firebaseデータ復元開始...');
                const userData = userDoc.data();
                
                await this.restoreAllDataFromFirebase(userData);
                
                console.log('✅ Firebaseデータ復元完了');
                
                // UI更新通知
                this.notifyDataRestored(userData);
                
            } else {
                console.log('⚠️ Firebaseにデータなし（新規ユーザー）');
                // 新規ユーザーの場合、現在のデータをFirebaseに保存
                await this.saveToFirebase();
            }
            
        } catch (error) {
            console.error('❌ Firebase同期エラー:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Firebaseからの完全データ復元（修正版）
     */
    async restoreAllDataFromFirebase(userData) {
        let restoredCount = 0;
        
        try {
            // 1. 削除済みアイテムリストを最初に復元（重要）
            if (userData.deletedItems && Array.isArray(userData.deletedItems)) {
                this.deletedItems = userData.deletedItems;
                this.saveDeletedItems();
                restoredCount++;
                console.log(`🗑️ 削除済みアイテム復元: ${userData.deletedItems.length}件`);
            }

            // 2. 学習履歴の復元
            if (userData.allRecords && Array.isArray(userData.allRecords)) {
                this.allRecords = userData.allRecords;
                localStorage.setItem('studyHistory', JSON.stringify(userData.allRecords));
                restoredCount++;
                console.log(`📊 学習履歴復元: ${userData.allRecords.length}件`);
            }

            // 3. 問題集データの復元（削除済み除外）
            if (userData.books && typeof userData.books === 'object') {
                const filteredBooks = {};
                Object.keys(userData.books).forEach(bookId => {
                    if (!this.isDeleted('books', bookId)) {
                        const book = userData.books[bookId];
                        if (book.structure) {
                            book.structure = this.filterDeletedHierarchy(book.structure, bookId, []);
                        }
                        filteredBooks[bookId] = book;
                    }
                });
                
                if (Object.keys(filteredBooks).length > 0) {
                    this.books = filteredBooks;
                    this.saveBooksToStorage();
                    restoredCount++;
                    console.log(`📚 問題集復元: ${Object.keys(filteredBooks).length}件`);
                }
            }

            // 4. 問題集順序の復元（削除済み除外）
            if (userData.bookOrder && Array.isArray(userData.bookOrder)) {
                this.bookOrder = userData.bookOrder.filter(id => !this.isDeleted('books', id));
                this.saveBookOrder();
                restoredCount++;
                console.log(`📋 問題集順序復元: ${this.bookOrder.length}件`);
            }

            // 5. 学習計画の復元（削除済み除外）
            if (userData.studyPlans && Array.isArray(userData.studyPlans)) {
                const filteredPlans = userData.studyPlans.filter(plan => 
                    plan && !this.isDeleted('studyPlans', plan.id)
                );
                this.studyPlans = filteredPlans;
                this.saveStudyPlans();
                restoredCount++;
                console.log(`📅 学習計画復元: ${filteredPlans.length}件`);
            }

            // 6. 一問一答の復元（削除済み除外）
            if (userData.qaQuestions && typeof userData.qaQuestions === 'object') {
                const filteredQA = {};
                Object.keys(userData.qaQuestions).forEach(setName => {
                    if (!this.isDeleted('qaQuestions', setName)) {
                        const questions = userData.qaQuestions[setName];
                        if (Array.isArray(questions)) {
                            const filteredQuestions = questions.filter(q => 
                                !this.isDeletedQAQuestion(setName, q.id)
                            );
                            if (filteredQuestions.length > 0) {
                                filteredQA[setName] = filteredQuestions;
                            }
                        }
                    }
                });
                
                if (Object.keys(filteredQA).length > 0) {
                    this.qaQuestions = filteredQA;
                    this.saveQAQuestions();
                    restoredCount++;
                    console.log(`❓ 一問一答復元: ${Object.keys(filteredQA).length}セット`);
                }
            }

            // 7. CSVテンプレートの復元（削除済み除外）
            if (userData.csvTemplates && typeof userData.csvTemplates === 'object') {
                const filteredTemplates = {};
                Object.keys(userData.csvTemplates).forEach(templateId => {
                    if (!this.isDeleted('csvTemplates', templateId)) {
                        filteredTemplates[templateId] = userData.csvTemplates[templateId];
                    }
                });
                
                if (Object.keys(filteredTemplates).length > 0) {
                    this.csvTemplates = filteredTemplates;
                    this.saveCSVTemplates();
                    restoredCount++;
                    console.log(`📄 CSVテンプレート復元: ${Object.keys(filteredTemplates).length}件`);
                }
            }

            // 8. 問題状態の復元
            if (userData.savedQuestionStates && typeof userData.savedQuestionStates === 'object') {
                this.savedQuestionStates = userData.savedQuestionStates;
                localStorage.setItem('savedQuestionStates', JSON.stringify(userData.savedQuestionStates));
                restoredCount++;
                console.log(`✍️ 問題状態復元: ${Object.keys(userData.savedQuestionStates).length}件`);
            }

            // 9. 試験日の復元
            if (userData.examDate) {
                try {
                    this.examDate = new Date(userData.examDate);
                    localStorage.setItem('examDate', userData.examDate);
                    restoredCount++;
                    console.log(`📅 試験日復元: ${this.examDate.toLocaleDateString('ja-JP')}`);
                } catch (e) {
                    console.warn('⚠️ 試験日データが無効:', userData.examDate);
                }
            }

            // 10. ピン固定設定の復元
            if (userData.heatmapPinnedBook && !this.isDeleted('books', userData.heatmapPinnedBook)) {
                this.heatmapPinnedBook = userData.heatmapPinnedBook;
                localStorage.setItem('heatmapPinnedBook', userData.heatmapPinnedBook);
                restoredCount++;
            }

            if (userData.radarPinnedBook && !this.isDeleted('books', userData.radarPinnedBook)) {
                this.radarPinnedBook = userData.radarPinnedBook;
                localStorage.setItem('radarPinnedBook', userData.radarPinnedBook);
                restoredCount++;
            }

            // 11. 分析カード順序の復元
            if (userData.analysisCardOrder && Array.isArray(userData.analysisCardOrder)) {
                this.analysisCardOrder = userData.analysisCardOrder;
                this.saveAnalysisCardOrder();
                restoredCount++;
                console.log(`📊 分析カード順序復元: ${userData.analysisCardOrder.length}件`);
            }

            // 12. 要点確認データの復元（KeyPointsModule対応）
            if (userData.keyPointsData && typeof userData.keyPointsData === 'object') {
                localStorage.setItem('keyPointsData', JSON.stringify(userData.keyPointsData));
                if (window.KeyPointsModule && KeyPointsModule.subjects) {
                    KeyPointsModule.subjects = userData.keyPointsData;
                }
                restoredCount++;
                console.log(`📚 要点確認データ復元: ${Object.keys(userData.keyPointsData).length}科目`);
            }

            console.log(`✅ データ復元完了: ${restoredCount}項目を復元`);

        } catch (error) {
            console.error('❌ データ復元エラー:', error);
        }
    }

    /**
     * Firebaseへの保存（修正版：統一されたコレクション名）
     */
    async saveToFirebase() {
        if (!this.firebaseEnabled || !this.currentUser) {
            if (window.ULTRA_STABLE_USER_ID) {
                this.currentUser = { uid: window.ULTRA_STABLE_USER_ID };
                this.firebaseEnabled = true;
            } else {
                console.warn('🔄 Firebase保存スキップ（固定ID未設定）');
                return false;
            }
        }

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;
            
            // ★修正: permanentUsersコレクションに統一
            const userRef = db.collection('permanentUsers').doc(userId);

            const saveData = {
                userId: userId,
                deviceFingerprint: userId.split('_')[1] || 'unknown',
                lastUpdated: new Date().toISOString(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                },
                
                // 全データを含める
                books: this.books || {},
                bookOrder: this.bookOrder || [],
                allRecords: this.allRecords || [],
                savedQuestionStates: this.savedQuestionStates || {},
                studyPlans: this.studyPlans || [],
                csvTemplates: this.csvTemplates || {},
                qaQuestions: this.qaQuestions || {},
                examDate: this.examDate ? this.examDate.toISOString() : null,
                deletedItems: this.deletedItems || [],
                heatmapPinnedBook: this.heatmapPinnedBook,
                radarPinnedBook: this.radarPinnedBook,
                analysisCardOrder: this.analysisCardOrder || ['chart', 'history', 'heatmap', 'weakness'],
                
                // 要点確認データも含める
                keyPointsData: window.KeyPointsModule ? KeyPointsModule.subjects : {},
                
                // メタデータ
                syncCount: (await this.getCurrentSyncCount()) + 1,
                totalQuestions: this.getTotalQuestionCount(),
                totalRecords: this.allRecords.length
            };

            await userRef.set(saveData, { merge: true });
            
            console.log('✅ Firebase保存完了');
            this.showSaveNotification();
            
            return true;
            
        } catch (error) {
            console.error('❌ Firebase保存エラー:', error);
            return false;
        }
    }

    /**
     * 現在の同期カウントを取得
     */
    async getCurrentSyncCount() {
        try {
            if (!this.firebaseEnabled || !this.currentUser) return 0;
            
            const db = firebase.firestore();
            const userRef = db.collection('permanentUsers').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            return userDoc.exists ? (userDoc.data().syncCount || 0) : 0;
        } catch (error) {
            console.warn('同期カウント取得エラー:', error);
            return 0;
        }
    }

    /**
     * 総問題数を取得
     */
    getTotalQuestionCount() {
        let total = 0;
        Object.values(this.books).forEach(book => {
            total += this.countQuestionsInBook(book);
        });
        return total;
    }

    /**
     * データ復元完了通知
     */
    notifyDataRestored(userData) {
        // UI更新を遅延実行
        setTimeout(() => {
            if (window.App && typeof App.renderBookCards === 'function') {
                App.renderBookCards();
            }
            if (window.UIComponents && typeof UIComponents.updateExamCountdown === 'function') {
                UIComponents.updateExamCountdown();
            }
            if (window.UIComponents && typeof UIComponents.renderCalendar === 'function') {
                UIComponents.renderCalendar();
            }
            if (window.Analytics) {
                if (typeof Analytics.updateHeatmapBookSelect === 'function') {
                    Analytics.updateHeatmapBookSelect();
                }
                if (typeof Analytics.updateRadarBookSelect === 'function') {
                    Analytics.updateRadarBookSelect();
                }
            }
            
            // 復元通知を表示
            this.showRestoreNotification(userData);
        }, 500);
    }

    /**
     * 保存通知表示
     */
    showSaveNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50, #66bb6a);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            z-index: 9999;
            font-weight: 600;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `✅ データ保存完了！`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    /**
     * 復元通知表示
     */
    showRestoreNotification(userData) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #2196f3, #42a5f5);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            z-index: 9999;
            font-weight: 600;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `🔄 データ復元完了！<br>記録: ${userData.totalRecords || 0}件`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    // アニメーションスタイルを追加
    static addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
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
     * 削除済み階層アイテムを除外するフィルタ
     */
    filterDeletedHierarchy(structure, bookId, basePath) {
        if (!structure || typeof structure !== 'object') {
            return {};
        }
        
        const filtered = {};
        
        Object.keys(structure).forEach(name => {
            const currentPath = [...basePath, name];
            const hierarchyId = `${bookId}_${currentPath.join('/')}`;
            
            if (!this.isDeleted('hierarchy', hierarchyId)) {
                const item = { ...structure[name] };
                
                if (item.children && Object.keys(item.children).length > 0) {
                    item.children = this.filterDeletedHierarchy(item.children, bookId, currentPath);
                }
                
                filtered[name] = item;
            }
        });
        
        return filtered;
    }

    /**
     * 一問一答の個別問題が削除済みかチェック
     */
    isDeletedQAQuestion(setName, questionId) {
        return this.deletedItems.some(item => 
            item.type === 'qa' && 
            item.setName === setName && 
            item.questionId === questionId
        );
    }

    /**
     * アイテム削除処理（Firebase統合強化版）
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
        
        // ローカルからも即座に削除
        this.removeFromLocal(type, id, additionalData);
        
        // Firebaseにも保存
        this.saveToFirebase().catch(error => {
            console.warn('Firebase削除保存エラー:', error);
        });
        
        console.log(`✅ ${type}:${id} を削除済みとしてマーク`);
    }

    /**
     * ローカルデータから削除
     */
    removeFromLocal(type, id, additionalData = {}) {
        if (type === 'books') {
            delete this.books[id];
            this.bookOrder = this.bookOrder.filter(bookId => bookId !== id);
            this.saveBooksToStorage();
            this.saveBookOrder();
        } else if (type === 'studyPlans') {
            this.studyPlans = this.studyPlans.filter(plan => plan.id !== id);
            this.saveStudyPlans();
        } else if (type === 'csvTemplates') {
            delete this.csvTemplates[id];
            this.saveCSVTemplates();
        } else if (type === 'qa' && additionalData.setName && additionalData.questionId) {
            if (this.qaQuestions[additionalData.setName]) {
                this.qaQuestions[additionalData.setName] = this.qaQuestions[additionalData.setName]
                    .filter(q => q.id !== additionalData.questionId);
                if (this.qaQuestions[additionalData.setName].length === 0) {
                    delete this.qaQuestions[additionalData.setName];
                }
                this.saveQAQuestions();
            }
        }
    }

    /**
     * 全データの読み込み（削除済みアイテム含む）
     */
    loadAllData() {
        try {
            this.loadDeletedItems(); // 削除済みアイテムを最初に読み込み
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
            console.error('データ読み込みエラー:', error);
        }
    }

    /**
     * 削除済みアイテム一覧の保存
     */
    saveDeletedItems() {
        try {
            localStorage.setItem('deletedItems', JSON.stringify(this.deletedItems));
        } catch (error) {
            console.error('削除済みアイテム保存エラー:', error);
        }
    }

    /**
     * 削除済みアイテム一覧の読み込み
     */
    loadDeletedItems() {
    try {
        const saved = localStorage.getItem('deletedItems');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                this.deletedItems = parsed;
                console.log(`🗑️ 削除済みアイテム読み込み: ${this.deletedItems.length}件`);
            }
        } else {
            this.deletedItems = [];
        }
    } catch (error) {
        console.error('Error loading deleted items:', error);
        this.deletedItems = [];
    }
}

async saveToFirebase() {
    // ★修正: 固定IDが必要
    if (!this.firebaseEnabled || !this.currentUser) {
        // 固定IDを再取得試行
        if (window.ULTRA_STABLE_USER_ID) {
            this.currentUser = { uid: window.ULTRA_STABLE_USER_ID };
        } else {
            console.warn('固定IDが未設定のため保存をスキップ');
            return;
        }
    }

    try {
        const db = firebase.firestore();
        const userId = this.currentUser.uid; // 固定ID
        const userRef = db.collection('users').doc(userId);

        // ★追加: メインドキュメントには最小限のメタデータのみ保存
        await userRef.set({
            bookOrder: this.bookOrder || [],
            examDate: this.examDate ? this.examDate.toISOString() : null,
            deletedItems: this.deletedItems || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            metadata: {
                bookCount: Object.keys(this.books || {}).length,
                recordCount: (this.allRecords || []).length,
                planCount: (this.studyPlans || []).length
            }
        }, { merge: true });

        // ★追加: 問題集を個別にサブコレクションへ保存
        const booksRef = userRef.collection('books');
        const bookPromises = [];
        for (const [bookId, bookData] of Object.entries(this.books || {})) {
            bookPromises.push(
                booksRef.doc(bookId).set({
                    ...bookData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
            );
        }
        await Promise.all(bookPromises);

        // ★追加: 学習記録を500件ごとにチャンク化してサブコレクションへ保存
        const recordsRef = userRef.collection('records');
        const records = this.allRecords || [];
        const chunkSize = 500;
        const recordChunks = [];
        for (let i = 0; i < records.length; i += chunkSize) {
            recordChunks.push(records.slice(i, i + chunkSize));
        }
        
        const recordPromises = [];
        recordChunks.forEach((chunk, index) => {
            recordPromises.push(
                recordsRef.doc(`chunk_${index}`).set({
                    records: chunk,
                    chunkIndex: index,
                    totalChunks: recordChunks.length,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
        });
        await Promise.all(recordPromises);

        // ★追加: 学習計画をサブコレクションへ保存
        const plansRef = userRef.collection('studyPlans');
        const planPromises = [];
        for (const [index, plan] of (this.studyPlans || []).entries()) {
            planPromises.push(
                plansRef.doc(`plan_${index}`).set({
                    ...plan,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
        }
        await Promise.all(planPromises);

        // ★追加: 一問一答をサブコレクションへ保存
        const qaRef = userRef.collection('qaQuestions');
        const qaPromises = [];
        for (const [setId, questions] of Object.entries(this.qaQuestions || {})) {
            qaPromises.push(
                qaRef.doc(setId).set({
                    questions: questions,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
        }
        await Promise.all(qaPromises);

        // ★追加: CSVテンプレートをサブコレクションへ保存
        const templatesRef = userRef.collection('csvTemplates');
        const templatePromises = [];
        for (const [templateId, template] of Object.entries(this.csvTemplates || {})) {
            templatePromises.push(
                templatesRef.doc(templateId).set({
                    ...template,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
        }
        await Promise.all(templatePromises);

        console.log('Data saved to Firebase with subcollections');
    } catch (error) {
        console.warn('Firebase save error (data saved locally):', error);
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
 * 問題集データの保存（階層順序を保持・削除済み除外・Firebase統合強化版）
 */
saveBooksToStorage() {
    try {
        // 削除済みアイテムを除外してから保存
        const filteredBooks = {};
        Object.keys(this.books).forEach(bookId => {
            if (!this.isDeleted('books', bookId)) {
                const book = this.books[bookId];
                const orderedStructure = {};
                
                // 階層の順序を固定化（削除済み階層も除外）
                if (book.structure) {
                    Object.keys(book.structure).sort().forEach(subjectKey => {
                        // 削除済み階層アイテムを除外
                        const filteredStructure = this.filterDeletedHierarchy(
                            { [subjectKey]: book.structure[subjectKey] }, 
                            bookId, 
                            []
                        );
                        
                        if (filteredStructure[subjectKey]) {
                            orderedStructure[subjectKey] = filteredStructure[subjectKey];
                        }
                    });
                }
                
                filteredBooks[bookId] = {
                    ...book,
                    structure: orderedStructure,
                    lastUpdated: new Date().toISOString() // 更新時刻を記録
                };
            }
        });
        
        // LocalStorageに保存
        localStorage.setItem('studyTrackerBooks', JSON.stringify(filteredBooks));
        this.books = filteredBooks; // 内部データも更新
        
        console.log(`💾 問題集保存: ${Object.keys(filteredBooks).length}件（削除済み除外済み）`);
        
        // Firebaseにも保存（統合強化版）
        if (this.firebaseEnabled && window.ULTRA_STABLE_USER_ID) {
            this.saveToFirebase().catch(error => {
                console.warn('Firebase問題集保存エラー:', error);
                // Firebase保存失敗時の通知
                this.showSaveErrorNotification('問題集データのクラウド保存に失敗しました');
            });
        } else if (window.ULTRA_STABLE_USER_ID) {
            // Firebase未有効でも固定IDがある場合は保存を試行
            this.firebaseEnabled = true;
            this.saveToFirebase().catch(error => {
                console.warn('Firebase再試行保存エラー:', error);
            });
        }
        
        // 保存成功の通知
        this.showSaveSuccessNotification('問題集');
        
        return true;
        
    } catch (error) {
        console.error('問題集保存エラー:', error);
        
        // エラータイプに応じた処理
        if (error.name === 'QuotaExceededError') {
            alert('ストレージ容量が不足しています。古いデータを削除してください。');
            this.showStorageQuotaDialog();
        } else if (error.name === 'SecurityError') {
            alert('プライベートブラウジングモードまたはセキュリティ設定により保存できません。');
        } else {
            alert('問題集データの保存中にエラーが発生しました。');
            console.error('詳細エラー:', error);
        }
        
        return false;
    }
}

/**
 * 保存成功通知の表示
 */
showSaveSuccessNotification(dataType = 'データ') {
    try {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #34d399);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            z-index: 9999;
            font-weight: 600;
            font-size: 13px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.innerHTML = `✅ ${dataType}を保存しました`;
        
        document.body.appendChild(notification);
        
        // アニメーション開始
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 3秒後に削除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
    } catch (notificationError) {
        console.warn('通知表示エラー:', notificationError);
    }
}

/**
 * 保存エラー通知の表示
 */
showSaveErrorNotification(message) {
    try {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #f87171);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            z-index: 9999;
            font-weight: 600;
            font-size: 13px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        notification.innerHTML = `⚠️ ${message}`;
        
        document.body.appendChild(notification);
        
        // アニメーション開始
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 5秒後に削除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
    } catch (notificationError) {
        console.warn('エラー通知表示エラー:', notificationError);
    }
}

/**
 * ストレージ容量不足時の対処ダイアログ
 */
showStorageQuotaDialog() {
    try {
        const shouldClean = confirm(
            'ストレージ容量が不足しています。\n\n' +
            '古い学習記録を自動的に削除して容量を確保しますか？\n' +
            '（最新の500件の記録は保持されます）'
        );
        
        if (shouldClean) {
            // 古い学習記録を削除
            if (this.allRecords && this.allRecords.length > 500) {
                const oldCount = this.allRecords.length;
                this.allRecords = this.allRecords.slice(-500);
                localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
                
                alert(`${oldCount - 500}件の古い記録を削除しました。再度保存を試行してください。`);
                
                // 保存を再試行
                setTimeout(() => {
                    this.saveBooksToStorage();
                }, 1000);
            } else {
                alert('削除可能な古いデータがありません。ブラウザの設定からキャッシュをクリアしてください。');
            }
        }
    } catch (dialogError) {
        console.error('容量不足ダイアログエラー:', dialogError);
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
     * 学習記録の保存（Firebase統合強化版）
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
            
            // Firebaseにも保存
            this.saveToFirebase().catch(error => {
                console.warn('Firebase学習記録保存エラー:', error);
            });
        } catch (error) {
            console.error('学習記録保存エラー:', error);
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
     * 学習計画の保存（Firebase統合強化版）
     */
    saveStudyPlans() {
        try {
            localStorage.setItem('studyPlans', JSON.stringify(this.studyPlans));
            
            // Firebaseにも保存
            this.saveToFirebase().catch(error => {
                console.warn('Firebase学習計画保存エラー:', error);
            });
        } catch (error) {
            console.error('学習計画保存エラー:', error);
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
}

// グローバルに公開（シングルトンインスタンス）
window.DataManager = new DataManagerClass();

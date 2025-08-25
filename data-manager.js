/**
 * DataManager - データ管理・LocalStorage操作モジュール
 * 完全修正版（重複削除・コレクション名統一）
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
     * 初期化処理
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
            this.initialized = true;
            return true;
        }
    }

    /**
     * 固定IDの取得を待つ
     */
    async waitForStableUserId(maxWaitSeconds = 10) {
        const maxAttempts = maxWaitSeconds * 10;
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
        } else {
            console.warn('⚠️ 固定ID取得タイムアウト');
        }
    }

    /**
     * Firebase初期化
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
     * Firebaseとの同期
     */
    async syncWithFirebase() {
        if (!this.firebaseEnabled || !this.currentUser || this.syncInProgress) return;

        this.syncInProgress = true;
        
        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;
            
            // ★重要: usersコレクションに統一
            const userRef = db.collection('users').doc(userId);
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
     * Firebaseからの完全データ復元
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
                        filteredQA[setName] = userData.qaQuestions[setName];
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
     * Firebaseへの保存（統一版）
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
            
            // ★重要: usersコレクションに統一
            const userRef = db.collection('users').doc(userId);

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
            const userRef = db.collection('users').doc(this.currentUser.uid);
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

    /**
     * 削除済みアイテムの読み込み
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

    /**
     * 削除済みアイテムの保存
     */
    saveDeletedItems() {
        try {
            localStorage.setItem('deletedItems', JSON.stringify(this.deletedItems));
        } catch (error) {
            console.error('Error saving deleted items:', error);
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
     * アイテムを削除済みとしてマーク
     */
    markAsDeleted(type, id, metadata = {}) {
        const deletedItem = {
            type: type,
            id: id,
            deletedAt: new Date().toISOString(),
            ...metadata
        };
        
        this.deletedItems.push(deletedItem);
        
        // 最大500件に制限
        if (this.deletedItems.length > 500) {
            this.deletedItems = this.deletedItems.slice(-500);
        }
        
        this.saveDeletedItems();
        
        // Firebaseに即座に同期
        if (window.ULTRA_STABLE_USER_ID && typeof this.saveToFirestore === 'function') {
            this.saveToFirestore({
                type: 'deletion',
                action: 'markDeleted',
                deletedType: type,
                deletedId: id
            });
        }
        
        console.log(`🗑️ ${type}:${id} を削除済みとしてマーク`);
    }

    /**
     * 削除済み階層アイテムを除外するフィルタ
     */
    filterDeletedHierarchy(structure, bookId, basePath) {
        if (!structure || typeof structure !== 'object') {
            return structure;
        }
        
        const filtered = {};
        Object.keys(structure).forEach(key => {
            const path = [...basePath, key].join('/');
            const hierarchyId = `${bookId}_${path}`;
            
            if (!this.isDeleted('hierarchy', hierarchyId)) {
                filtered[key] = {
                    ...structure[key]
                };
                
                if (structure[key].children) {
                    filtered[key].children = this.filterDeletedHierarchy(
                        structure[key].children,
                        bookId,
                        [...basePath, key]
                    );
                }
            }
        });
        
        return filtered;
    }

    /**
     * 削除済みアイテムをフィルタ
     */
    filterDeletedItems(items, type) {
        if (Array.isArray(items)) {
            return items.filter(item => {
                if (item && typeof item === 'object' && item.id) {
                    return !this.isDeleted(type, item.id);
                }
                return true;
            });
        } else if (typeof items === 'object' && items !== null) {
            const filtered = {};
            Object.keys(items).forEach(key => {
                if (!this.isDeleted(type, key)) {
                    filtered[key] = items[key];
                }
            });
            return filtered;
        }
        return items;
    }

    /**
     * 全データの読み込み
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
            console.error('Error loading data:', error);
        }
    }

    /**
     * 問題集データの読み込み
     */
    loadBooksFromStorage() {
        try {
            const stored = localStorage.getItem('studyTrackerBooks');
            if (stored) {
                const parsedData = JSON.parse(stored);
                if (typeof parsedData === 'object') {
                    const filteredBooks = {};
                    Object.keys(parsedData).forEach(bookId => {
                        if (!this.isDeleted('books', bookId)) {
                            const book = parsedData[bookId];
                            if (book.structure) {
                                book.structure = this.filterDeletedHierarchy(
                                    book.structure,
                                    bookId,
                                    []
                                );
                            }
                            filteredBooks[bookId] = book;
                        }
                    });
                    this.books = filteredBooks;
                } else {
                    this.books = {};
                }
            } else {
                this.books = {};
            }
        } catch (error) {
            console.error('Error loading books:', error);
            this.books = {};
        }
    }

    /**
     * 問題集データの保存
     */
    saveBooksToStorage() {
        try {
            const booksToSave = {};
            Object.keys(this.books).forEach(bookId => {
                if (!this.isDeleted('books', bookId)) {
                    booksToSave[bookId] = this.books[bookId];
                }
            });
            
            localStorage.setItem('studyTrackerBooks', JSON.stringify(booksToSave));
            console.log(`💾 問題集保存: ${Object.keys(booksToSave).length}件`);
        } catch (error) {
            console.error('Error saving books:', error);
        }
    }

    /**
     * 問題集順序の読み込み
     */
    loadBookOrder() {
        try {
            const saved = localStorage.getItem('bookOrder');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.bookOrder = parsed.filter(id => !this.isDeleted('books', id));
                } else {
                    this.bookOrder = [];
                }
            } else {
                this.bookOrder = [];
            }
        } catch (error) {
            console.error('Error loading book order:', error);
            this.bookOrder = [];
        }
    }

    /**
     * 問題集順序の保存
     */
    saveBookOrder() {
        try {
            const orderToSave = this.bookOrder.filter(id => !this.isDeleted('books', id));
            localStorage.setItem('bookOrder', JSON.stringify(orderToSave));
        } catch (error) {
            console.error('Error saving book order:', error);
        }
    }

    /**
     * 学習記録の読み込み
     */
    loadAllRecords() {
        try {
            const saved = localStorage.getItem('studyHistory');
            if (saved) {
                const parsed = JSON.parse(saved);
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
            
            if (this.allRecords.length > 1000) {
                this.allRecords = this.allRecords.slice(-1000);
            }
            
            localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
            
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
     * 問題状態の読み込み
     */
    loadSavedQuestionStates() {
        try {
            const saved = localStorage.getItem('savedQuestionStates');
            if (saved) {
                this.savedQuestionStates = JSON.parse(saved);
            } else {
                this.savedQuestionStates = {};
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
     * 学習計画の読み込み
     */
    loadStudyPlans() {
        try {
            const saved = localStorage.getItem('studyPlans');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.studyPlans = parsed.filter(plan => !this.isDeleted('studyPlans', plan.id));
                } else {
                    this.studyPlans = [];
                }
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
            const plansToSave = this.studyPlans.filter(plan => !this.isDeleted('studyPlans', plan.id));
            localStorage.setItem('studyPlans', JSON.stringify(plansToSave));
            
            if (window.ULTRA_STABLE_USER_ID && typeof this.saveToFirestore === 'function') {
                this.saveToFirestore({
                    type: 'studyPlans',
                    action: 'save',
                    planCount: plansToSave.length
                });
            }
        } catch (error) {
            console.error('Error saving study plans:', error);
        }
    }

    /**
     * CSVテンプレートの読み込み
     */
    loadCSVTemplates() {
        try {
            const saved = localStorage.getItem('csvTemplates');
            if (saved) {
                const parsed = JSON.parse(saved);
                const filtered = {};
                Object.keys(parsed).forEach(templateId => {
                    if (!this.isDeleted('csvTemplates', templateId)) {
                        filtered[templateId] = parsed[templateId];
                    }
                });
                this.csvTemplates = filtered;
            } else {
                this.csvTemplates = {};
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
            const templatesToSave = {};
            Object.keys(this.csvTemplates).forEach(templateId => {
                if (!this.isDeleted('csvTemplates', templateId)) {
                    templatesToSave[templateId] = this.csvTemplates[templateId];
                }
            });
            
            localStorage.setItem('csvTemplates', JSON.stringify(templatesToSave));
            
            if (window.ULTRA_STABLE_USER_ID && typeof this.saveToFirestore === 'function') {
                this.saveToFirestore({
                    type: 'csvTemplates',
                    action: 'save',
                    templateCount: Object.keys(templatesToSave).length
                });
            }
        } catch (error) {
            console.error('Error saving CSV templates:', error);
        }
    }

    /**
     * 一問一答の読み込み
     */
    loadQAQuestions() {
        try {
            const saved = localStorage.getItem('qaQuestions');
            if (saved) {
                const parsed = JSON.parse(saved);
                const filtered = {};
                Object.keys(parsed).forEach(setId => {
                    if (!this.isDeleted('qaQuestions', setId)) {
                        filtered[setId] = parsed[setId];
                    }
                });
                this.qaQuestions = filtered;
            } else {
                this.qaQuestions = {};
            }
        } catch (error) {
            console.error('Error loading QA questions:', error);
            this.qaQuestions = {};
        }
    }

    /**
     * 一問一答の保存
     */
    saveQAQuestions() {
        try {
            const questionsToSave = {};
            Object.keys(this.qaQuestions).forEach(setId => {
                if (!this.isDeleted('qaQuestions', setId)) {
                    questionsToSave[setId] = this.qaQuestions[setId];
                }
            });
            
            localStorage.setItem('qaQuestions', JSON.stringify(questionsToSave));
            
            if (window.ULTRA_STABLE_USER_ID && typeof this.saveToFirestore === 'function') {
                this.saveToFirestore({
                    type: 'qaQuestions',
                    action: 'save',
                    setCount: Object.keys(questionsToSave).length
                });
            }
        } catch (error) {
            console.error('Error saving QA questions:', error);
        }
    }

    /**
     * 試験日の読み込み
     */
    loadExamDate() {
        try {
            const saved = localStorage.getItem('examDate');
            if (saved) {
                const date = new Date(saved);
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
     * 試験日の保存
     */
    saveExamDate(date) {
        try {
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
     * 問題集内の問題数カウント
     */
    countQuestionsInBook(book) {
        let count = 0;
        
        const countInStructure = (structure) => {
            if (!structure) return;
            Object.values(structure).forEach(item => {
                if (item.questions && Array.isArray(item.questions)) {
                    count += item.questions.length;
                }
                if (item.children) {
                    countInStructure(item.children);
                }
            });
        };
        
        countInStructure(book.structure);
        return count;
    }

    /**
     * CSVインポート
     */
    importCSV(bookName, csvData, numberingType = 'reset') {
        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) return false;
            
            const bookId = 'book_' + Date.now();
            const book = {
                id: bookId,
                name: bookName,
                examType: 'gyousei',
                numberingType: numberingType,
                structure: {},
                createdAt: new Date().toISOString()
            };
            
            // CSVパース処理
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());
                if (parts.length < 6) continue;
                
                const [subject, chapter, section, subsection, start, end] = parts;
                
                if (subject) {
                    if (!book.structure[subject]) {
                        book.structure[subject] = {
                            type: 'subject',
                            children: {}
                        };
                    }
                    
                    let currentLevel = book.structure[subject];
                    
                    if (chapter) {
                        if (!currentLevel.children[chapter]) {
                            currentLevel.children[chapter] = {
                                type: 'chapter',
                                children: {}
                            };
                        }
                        currentLevel = currentLevel.children[chapter];
                        
                        if (section) {
                            if (!currentLevel.children[section]) {
                                currentLevel.children[section] = {
                                    type: 'section',
                                    children: {}
                                };
                            }
                            currentLevel = currentLevel.children[section];
                            
                            if (subsection) {
                                if (!currentLevel.children[subsection]) {
                                    currentLevel.children[subsection] = {
                                        type: 'subsection'
                                    };
                                }
                                currentLevel = currentLevel.children[subsection];
                            }
                        }
                    }
                    
                    const startNum = parseInt(start);
                    const endNum = parseInt(end);
                    if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
                        currentLevel.questions = [];
                        for (let q = startNum; q <= endNum; q++) {
                            currentLevel.questions.push(q);
                        }
                    }
                }
            }
            
            this.books[bookId] = book;
            this.bookOrder.push(bookId);
            this.saveBooksToStorage();
            this.saveBookOrder();
            
            return true;
        } catch (error) {
            console.error('CSV import error:', error);
            return false;
        }
    }

    /**
     * 連続日数の更新
     */
    updateDailyStreak() {
        try {
            const today = new Date().toDateString();
            const lastStudyDate = localStorage.getItem('lastStudyDate');
            const streakDays = parseInt(localStorage.getItem('streakDays') || '0');
            
            if (lastStudyDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastStudyDate === yesterday.toDateString()) {
                    localStorage.setItem('streakDays', (streakDays + 1).toString());
                } else {
                    localStorage.setItem('streakDays', '1');
                }
                localStorage.setItem('lastStudyDate', today);
            }
        } catch (error) {
            console.error('Error updating daily streak:', error);
        }
    }

    /**
     * サンプルデータの初期化
     */
    initializeSampleData() {
        const sampleBookId = 'book_sample_' + Date.now();
        this.books[sampleBookId] = {
            id: sampleBookId,
            name: 'サンプル問題集',
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
                                    questions: [6, 7, 8]
                                }
                            }
                        }
                    }
                }
            },
            createdAt: new Date().toISOString()
        };
        
        this.bookOrder = [sampleBookId];
        this.saveBooksToStorage();
        this.saveBookOrder();
    }

    /**
     * 全データクリア
     */
    clearAllData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            if (confirm('本当に削除してもよろしいですか？')) {
                localStorage.clear();
                location.reload();
            }
        }
    }
}

// グローバルに公開
window.DataManager = new DataManagerClass();

// 自動初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await DataManager.initialize();
        console.log('DataManager auto-initialized');
    } catch (error) {
        console.error('DataManager auto-initialization failed:', error);
    }
});

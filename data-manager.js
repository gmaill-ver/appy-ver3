/**
 * DataManager - データ管理モジュール（修正版）
 * カレンダー表示、削除復活、チェック状態の問題を解決
 */
class DataManagerClass {
    constructor() {
        // 既存のプロパティ
        this.books = {};
        this.bookOrder = [];
        this.allRecords = [];
        this.studyPlans = [];
        this.qaQuestions = {};
        this.csvTemplates = {};
        this.savedQuestionStates = {}; // ←重要：チェック状態
        this.deletedItems = [];
        this.examDate = null;
        this.analysisCardOrder = [];
        this.heatmapPinnedBook = null;
        this.radarPinnedBook = null;
        this.firebaseEnabled = false;
        this.currentUser = null;
        this.initialized = false;
    }

    /**
     * 🔧 修正1: 問題状態の保存（Firebase同期追加）
     */
    saveQuestionStates(bookId, path, states) {
        try {
            const key = `${bookId}_${path.join('/')}`;
            this.savedQuestionStates[key] = states;
            localStorage.setItem('savedQuestionStates', JSON.stringify(this.savedQuestionStates));
            
            // 🆕 Firebase同期を追加
            if (this.firebaseEnabled && window.ULTRA_STABLE_USER_ID) {
                this.saveToFirestore({
                    type: "questionStates",
                    action: "save",
                    bookId: bookId,
                    path: path.join('/'),
                    statesCount: Object.keys(states).length,
                    message: "問題チェック状態を保存しました"
                });
            }
            
            console.log(`✅ 問題状態保存: ${key} (${Object.keys(states).length}問)`);
        } catch (error) {
            console.error('Error saving question states:', error);
        }
    }

    /**
     * 🔧 修正2: 削除処理の改善（即座にUI更新）
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
        
        // 🆕 即座にFirebase同期
        if (window.ULTRA_STABLE_USER_ID && this.saveToFirestore) {
            this.saveToFirestore({
                type: 'itemDeleted',
                deletedType: type,
                deletedId: id,
                timestamp: deletedItem.deletedAt,
                message: `${type}:${id}を削除しました`,
                ...additionalData
            }).then(() => {
                console.log(`🔥 Firebase削除同期完了: ${type}:${id}`);
            }).catch(error => {
                console.warn('Firebase削除同期エラー:', error);
            });
        }
        
        // 🆕 UI即時更新（重要！）
        this.triggerUIUpdate(type);
        
        console.log(`✅ ${type}:${id} を削除済みとしてマーク`);
    }

    /**
     * 🆕 修正3: UI更新トリガー（削除後の表示を即座に更新）
     */
    triggerUIUpdate(deletedType) {
        setTimeout(() => {
            try {
                // カレンダー更新
                if (deletedType === 'studyPlans' && window.UIComponents) {
                    console.log('🔄 カレンダー再描画実行');
                    UIComponents.renderCalendar();
                }
                
                // 問題集カード更新
                if (deletedType === 'books' && window.App) {
                    console.log('🔄 問題集カード再描画実行');
                    App.renderBookCards();
                }
                
                // 分析画面更新
                if (window.Analytics) {
                    console.log('🔄 分析画面更新実行');
                    Analytics.updateHistoryContent();
                }
                
                console.log(`✅ UI更新完了: ${deletedType}`);
            } catch (error) {
                console.error('⚠️ UI更新エラー:', error);
            }
        }, 100); // 少し遅延させて確実に実行
    }

    /**
     * 🔧 修正4: Firebase同期の改善（全データ対応）
     */
    async saveToFirebase() {
        if (!this.firebaseEnabled || !this.currentUser) return;

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;

            // 🆕 チェック状態も含めて同期
            const syncData = {
                books: this.books || {},
                bookOrder: this.bookOrder || [],
                records: (this.allRecords || []).slice(-1000),
                studyPlans: this.studyPlans || [],
                qaQuestions: this.qaQuestions || {},
                csvTemplates: this.csvTemplates || {},
                savedQuestionStates: this.savedQuestionStates || {}, // ←追加！
                examDate: this.examDate ? this.examDate.toISOString() : null,
                deletedItems: this.deletedItems || [], // ←削除マークも同期
                analysisCardOrder: this.analysisCardOrder || [],
                heatmapPinnedBook: this.heatmapPinnedBook || null,
                radarPinnedBook: this.radarPinnedBook || null,
                lastUpdated: new Date().toISOString(),
                syncCount: (await this.getSyncCount()) + 1
            };

            await db.collection('users').doc(userId).set(syncData, { merge: true });
            console.log('🔥 Firebase完全同期完了');
        } catch (error) {
            console.error('❌ Firebase同期エラー:', error);
            throw error;
        }
    }

    /**
     * 🔧 修正5: Firebase復元の改善（チェック状態も復元）
     */
    async syncWithFirebase() {
        if (!this.firebaseEnabled || !this.currentUser) return;

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;

            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                
                // 既存データの復元
                if (data.books && typeof data.books === 'object') {
                    this.books = this.filterDeletedItems(data.books, 'books');
                }
                if (data.bookOrder && Array.isArray(data.bookOrder)) {
                    this.bookOrder = data.bookOrder.filter(id => !this.isDeleted('books', id));
                }
                if (data.records && Array.isArray(data.records)) {
                    this.allRecords = data.records;
                }
                if (data.studyPlans && Array.isArray(data.studyPlans)) {
                    this.studyPlans = this.filterDeletedItems(data.studyPlans, 'studyPlans');
                }
                if (data.qaQuestions && typeof data.qaQuestions === 'object') {
                    this.qaQuestions = this.filterDeletedItems(data.qaQuestions, 'qaQuestions');
                }
                if (data.csvTemplates && typeof data.csvTemplates === 'object') {
                    this.csvTemplates = this.filterDeletedItems(data.csvTemplates, 'csvTemplates');
                }
                
                // 🆕 チェック状態の復元
                if (data.savedQuestionStates && typeof data.savedQuestionStates === 'object') {
                    this.savedQuestionStates = data.savedQuestionStates;
                    localStorage.setItem('savedQuestionStates', JSON.stringify(this.savedQuestionStates));
                    console.log('✅ 問題チェック状態復元完了');
                }
                
                // 🆕 削除マークの復元
                if (data.deletedItems && Array.isArray(data.deletedItems)) {
                    this.deletedItems = data.deletedItems;
                    localStorage.setItem('deletedItems', JSON.stringify(this.deletedItems));
                    console.log('✅ 削除マーク復元完了');
                }
                
                if (data.examDate) {
                    try {
                        this.examDate = new Date(data.examDate);
                    } catch (e) {
                        console.warn('Invalid exam date from Firebase');
                    }
                }
                
                // その他設定
                if (data.analysisCardOrder) this.analysisCardOrder = data.analysisCardOrder;
                if (data.heatmapPinnedBook) this.heatmapPinnedBook = data.heatmapPinnedBook;
                if (data.radarPinnedBook) this.radarPinnedBook = data.radarPinnedBook;
                
                // ローカルにも保存
                this.saveAllData();
                
                // 🆕 全UI更新
                this.triggerCompleteUIUpdate();
                
                console.log('🔥 Firebase完全復元完了');
            } else {
                // 新規ユーザーの場合、現在のデータをFirebaseに保存
                await this.saveToFirebase();
            }
        } catch (error) {
            console.error('Firebase sync error:', error);
        }
    }

    /**
     * 🆕 修正6: 完全UI更新（復元後の表示を確実に更新）
     */
    triggerCompleteUIUpdate() {
        setTimeout(() => {
            try {
                // カレンダー更新
                if (window.UIComponents && typeof UIComponents.renderCalendar === 'function') {
                    UIComponents.renderCalendar();
                    console.log('🔄 カレンダー完全更新');
                }
                
                // 問題集カード更新
                if (window.App && typeof App.renderBookCards === 'function') {
                    App.renderBookCards();
                    console.log('🔄 問題集カード完全更新');
                }
                
                // 分析画面更新
                if (window.Analytics) {
                    if (typeof Analytics.updateHistoryContent === 'function') {
                        Analytics.updateHistoryContent();
                    }
                    if (typeof Analytics.updateHeatmapBookSelect === 'function') {
                        Analytics.updateHeatmapBookSelect();
                    }
                    if (typeof Analytics.updateRadarBookSelect === 'function') {
                        Analytics.updateRadarBookSelect();
                    }
                    console.log('🔄 分析画面完全更新');
                }
                
                // 試験日カウントダウン更新
                if (window.UIComponents && typeof UIComponents.updateExamCountdown === 'function') {
                    UIComponents.updateExamCountdown();
                    console.log('🔄 試験日カウントダウン更新');
                }
                
                console.log('✅ 全UI完全更新完了');
            } catch (error) {
                console.error('⚠️ 完全UI更新エラー:', error);
            }
        }, 200);
    }

    /**
     * 🔧 修正7: 学習計画保存の改善（カレンダー即時更新）
     */
    saveStudyPlans() {
        try {
            localStorage.setItem('studyPlans', JSON.stringify(this.studyPlans));
            
            // 🆕 カレンダー即時更新
            if (window.UIComponents && typeof UIComponents.renderCalendar === 'function') {
                setTimeout(() => {
                    UIComponents.renderCalendar();
                    console.log('🔄 学習計画保存後カレンダー更新');
                }, 50);
            }
            
            if (this.firebaseEnabled) {
                this.saveToFirebase().catch(error => {
                    console.warn('Firebase save failed:', error);
                });
            }
        } catch (error) {
            console.error('Error saving study plans:', error);
        }
    }

    // 🔧 修正8: 同期カウント取得
    async getSyncCount() {
        try {
            if (!this.firebaseEnabled || !this.currentUser) return 0;
            
            const db = firebase.firestore();
            const doc = await db.collection('users').doc(this.currentUser.uid).get();
            return doc.exists ? (doc.data().syncCount || 0) : 0;
        } catch (error) {
            return 0;
        }
    }

    // 既存のメソッドはそのまま維持...
    isDeleted(type, id) {
        return this.deletedItems.some(item => 
            item.type === type && item.id === id
        );
    }

    filterDeletedItems(data, type) {
        if (Array.isArray(data)) {
            return data.filter(item => !this.isDeleted(type, item.id));
        } else if (typeof data === 'object') {
            const filtered = {};
            Object.keys(data).forEach(key => {
                if (!this.isDeleted(type, key)) {
                    filtered[key] = data[key];
                }
            });
            return filtered;
        }
        return data;
    }

    saveDeletedItems() {
        try {
            localStorage.setItem('deletedItems', JSON.stringify(this.deletedItems));
        } catch (error) {
            console.error('Error saving deleted items:', error);
        }
    }

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

    // 🆕 チェック状態の初期化も改善
    loadSavedQuestionStates() {
        try {
            const saved = localStorage.getItem('savedQuestionStates');
            if (saved) {
                this.savedQuestionStates = JSON.parse(saved);
                console.log('✅ 問題チェック状態読み込み完了');
            }
        } catch (error) {
            console.error('Error loading question states:', error);
            this.savedQuestionStates = {};
        }
    }
}

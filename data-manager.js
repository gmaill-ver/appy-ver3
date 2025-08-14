/**
 * DataManager - データ管理・LocalStorage操作モジュール
 * Firebase対応版
 */
class DataManager {
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
    }

    /**
     * 初期化処理
     */
    async initialize() {
        try {
            // Firebaseの初期化確認
            if (typeof firebase !== 'undefined' && firebase.auth) {
                this.firebaseEnabled = true;
                await this.initializeFirebase();
            }
            
            // ローカルストレージからデータ読み込み
            this.loadAllData();
            
            // サンプルデータの初期化
            if (Object.keys(this.books).length === 0) {
                this.initializeSampleData();
            }
            
            return true;
        } catch (error) {
            console.error('DataManager initialization error:', error);
            return false;
        }
    }

    /**
     * Firebase初期化
     */
    async initializeFirebase() {
        try {
            // 認証状態の監視
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('Firebase user logged in:', user.email);
                    this.syncWithFirebase();
                }
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.firebaseEnabled = false;
        }
    }

    /**
     * Firebaseとの同期
     */
    async syncWithFirebase() {
        if (!this.firebaseEnabled || !this.currentUser) return;

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;

            // ユーザーデータを取得
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                // Firebaseからデータを復元
                if (data.books) this.books = data.books;
                if (data.bookOrder) this.bookOrder = data.bookOrder;
                if (data.records) this.allRecords = data.records;
                if (data.studyPlans) this.studyPlans = data.studyPlans;
                if (data.qaQuestions) this.qaQuestions = data.qaQuestions;
                if (data.examDate) this.examDate = new Date(data.examDate);
                
                // ローカルにも保存
                this.saveAllData();
            } else {
                // 新規ユーザーの場合、現在のデータをFirebaseに保存
                await this.saveToFirebase();
            }
        } catch (error) {
            console.error('Firebase sync error:', error);
        }
    }

    /**
     * Firebaseにデータを保存
     */
    async saveToFirebase() {
        if (!this.firebaseEnabled || !this.currentUser) return;

        try {
            const db = firebase.firestore();
            const userId = this.currentUser.uid;

            await db.collection('users').doc(userId).set({
                books: this.books,
                bookOrder: this.bookOrder,
                records: this.allRecords.slice(-1000), // 最新1000件のみ
                studyPlans: this.studyPlans,
                qaQuestions: this.qaQuestions,
                examDate: this.examDate ? this.examDate.toISOString() : null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('Data saved to Firebase');
        } catch (error) {
            console.error('Firebase save error:', error);
        }
    }

    /**
     * 全データの読み込み
     */
    loadAllData() {
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
    }

    /**
     * 全データの保存
     */
    saveAllData() {
        this.saveBooksToStorage();
        this.saveBookOrder();
        this.saveStudyPlans();
        this.saveCSVTemplates();
        this.saveQAQuestions();
        
        // Firebaseにも保存
        if (this.firebaseEnabled) {
            this.saveToFirebase();
        }
    }

    /**
     * 問題集データの読み込み
     */
    loadBooksFromStorage() {
        try {
            const stored = localStorage.getItem('studyTrackerBooks');
            if (stored) {
                this.books = JSON.parse(stored);
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
            localStorage.setItem('studyTrackerBooks', JSON.stringify(this.books));
        } catch (error) {
            console.error('Error saving books:', error);
            if (error.name === 'QuotaExceededError') {
                alert('ストレージ容量が不足しています。古いデータを削除してください。');
            }
        }
    }

    /**
     * 問題集順序の読み込み
     */
    loadBookOrder() {
        try {
            const saved = localStorage.getItem('bookOrder');
            if (saved) {
                this.bookOrder = JSON.parse(saved);
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
            localStorage.setItem('bookOrder', JSON.stringify(this.bookOrder));
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
                this.allRecords = JSON.parse(history);
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
            this.allRecords.push(record);
            
            // 最大1000件に制限
            if (this.allRecords.length > 1000) {
                this.allRecords = this.allRecords.slice(-1000);
            }
            
            localStorage.setItem('studyHistory', JSON.stringify(this.allRecords));
            
            // Firebaseにも保存
            if (this.firebaseEnabled) {
                this.saveToFirebase();
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
     * 学習計画の読み込み
     */
    loadStudyPlans() {
        try {
            const saved = localStorage.getItem('studyPlans');
            if (saved) {
                this.studyPlans = JSON.parse(saved);
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
                this.saveToFirebase();
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
                this.csvTemplates = JSON.parse(saved);
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
     * 一問一答問題の読み込み
     */
    loadQAQuestions() {
        try {
            const saved = localStorage.getItem('qaQuestions');
            if (saved) {
                this.qaQuestions = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading QA questions:', error);
            this.qaQuestions = {};
        }
    }

    /**
     * 一問一答問題の保存
     */
    saveQAQuestions() {
        try {
            localStorage.setItem('qaQuestions', JSON.stringify(this.qaQuestions));
            if (this.firebaseEnabled) {
                this.saveToFirebase();
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
                this.examDate = new Date(saved);
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
            this.examDate = date;
            localStorage.setItem('examDate', date.toISOString());
            if (this.firebaseEnabled) {
                this.saveToFirebase();
            }
        } catch (error) {
            console.error('Error saving exam date:', error);
        }
    }

    /**
     * 分析カード順序の読み込み
     */
    loadAnalysisCardOrder() {
        try {
            const saved = localStorage.getItem('analysisCardOrder');
            if (saved) {
                this.analysisCardOrder = JSON.parse(saved);
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
            if (heatmapPinned) {
                this.heatmapPinnedBook = heatmapPinned;
            }
            
            const radarPinned = localStorage.getItem('radarPinnedBook');
            if (radarPinned) {
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
            if (bookId) {
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
            if (bookId) {
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
        
        function traverse(structure, path = []) {
            Object.entries(structure).forEach(([name, item]) => {
                const newPath = [...path, name];
                
                if (item.questions) {
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
                
                if (item.children) {
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
        let count = 0;
        
        function traverse(structure) {
            Object.values(structure).forEach(item => {
                if (item.questions) {
                    count += item.questions.length;
                }
                if (item.children) {
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
                localStorage.clear();
                
                // Firebaseからも削除
                if (this.firebaseEnabled && this.currentUser) {
                    const db = firebase.firestore();
                    db.collection('users').doc(this.currentUser.uid).delete();
                }
                
                location.reload();
            }
        }
    }

    /**
     * CSVインポート処理
     */
    importCSV(bookName, csvData, numberingType) {
        try {
            const lines = csvData.trim().split('\n');
            
            // 既存の問題集を探す
            let bookId = null;
            let book = null;
            
            for (let id in this.books) {
                if (this.books[id].name === bookName) {
                    bookId = id;
                    book = this.books[id];
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
                    numberingType: numberingType,
                    structure: {},
                    createdAt: new Date().toISOString()
                };
                this.books[bookId] = book;
                this.bookOrder.push(bookId);
            }
            
            // ヘッダー行をスキップ
            let startIndex = 0;
            if (lines[0].includes('科目') || lines[0].includes('章')) {
                startIndex = 1;
            }
            
            for (let i = startIndex; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());
                const [subject, chapter, section, subsection, startNum, endNum] = parts;
                
                if (!subject) continue;
                
                // 科目を追加
                if (!book.structure[subject]) {
                    book.structure[subject] = {
                        type: 'subject',
                        children: {}
                    };
                }
                
                if (chapter) {
                    // 章を追加
                    if (!book.structure[subject].children[chapter]) {
                        book.structure[subject].children[chapter] = {
                            type: 'chapter',
                            children: {}
                        };
                    }
                    
                    if (section) {
                        // 節を追加
                        if (!book.structure[subject].children[chapter].children[section]) {
                            book.structure[subject].children[chapter].children[section] = {
                                type: 'section',
                                children: {}
                            };
                        }
                        
                        if (subsection) {
                            // 項を追加
                            if (!book.structure[subject].children[chapter].children[section].children[subsection]) {
                                book.structure[subject].children[chapter].children[section].children[subsection] = {
                                    type: 'subsection'
                                };
                            }
                            
                            // 項に問題を追加
                            if (startNum && endNum) {
                                const questions = [];
                                for (let j = parseInt(startNum); j <= parseInt(endNum); j++) {
                                    questions.push(j);
                                }
                                book.structure[subject].children[chapter].children[section].children[subsection].questions = questions;
                            }
                        } else {
                            // 節に問題を追加
                            if (startNum && endNum) {
                                const questions = [];
                                for (let j = parseInt(startNum); j <= parseInt(endNum); j++) {
                                    questions.push(j);
                                }
                                book.structure[subject].children[chapter].children[section].questions = questions;
                            }
                        }
                    } else {
                        // 章に問題を追加
                        if (startNum && endNum) {
                            const questions = [];
                            for (let j = parseInt(startNum); j <= parseInt(endNum); j++) {
                                questions.push(j);
                            }
                            book.structure[subject].children[chapter].questions = questions;
                        }
                    }
                }
            }
            
            this.saveBooksToStorage();
            this.saveBookOrder();
            
            return true;
        } catch (error) {
            console.error('CSV import error:', error);
            return false;
        }
    }
}

// グローバルに公開
window.DataManager = new DataManager();

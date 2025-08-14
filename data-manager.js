/**
 * データ管理モジュール
 * LocalStorage操作とデータ構造の管理を担当
 */
const DataManager = {
    // データストレージ
    books: {},
    bookOrder: [],
    allRecords: [],
    savedQuestionStates: {},
    studyPlans: [],
    examDate: null,
    csvTemplates: {},
    expandedNodes: new Set(),
    analysisCardOrder: ['chart', 'history', 'heatmap', 'weakness'],
    heatmapPinnedBook: null,
    radarPinnedBook: null,

    // 初期化
    init() {
        this.loadBooksFromStorage();
        this.loadBookOrder();
        this.loadAnalysisCardOrder();
        this.loadCSVTemplates();
        this.loadAllRecords();
        this.loadSavedQuestionStates();
        this.loadStudyPlans();
        this.loadExamDate();
        this.loadPinnedSettings();
        
        // 初期データがない場合はサンプルを作成
        if (Object.keys(this.books).length === 0) {
            this.initializeSampleData();
        }
    },

    // サンプルデータ初期化
    initializeSampleData() {
        // サンプル1: 肢別過去問集（階層構造）
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
    },

    // 問題集データ管理
    loadBooksFromStorage() {
        const stored = localStorage.getItem('studyTrackerBooks');
        if (stored) {
            this.books = JSON.parse(stored);
        }
    },

    saveBooksToStorage() {
        localStorage.setItem('studyTrackerBooks', JSON.stringify(this.books));
    },

    // 問題集順序管理
    loadBookOrder() {
        const saved = localStorage.getItem('bookOrder');
        if (saved) {
            this.bookOrder = JSON.parse(saved);
        } else {
            this.bookOrder = Object.keys(this.books);
        }
    },

    saveBookOrder() {
        localStorage.setItem('bookOrder', JSON.stringify(this.bookOrder));
    },

    // 分析カード順序管理
    loadAnalysisCardOrder() {
        const saved = localStorage.getItem('analysisCardOrder');
        if (saved) {
            this.analysisCardOrder = JSON.parse(saved);
        }
    },

    saveAnalysisCardOrder() {
        localStorage.setItem('analysisCardOrder', JSON.stringify(this.analysisCardOrder));
    },

    // 学習記録管理
    loadAllRecords() {
        const history = localStorage.getItem('studyHistory');
        if (history) {
            this.allRecords = JSON.parse(history);
        }
    },

    saveToHistory(record) {
        let history = localStorage.getItem('studyHistory');
        history = history ? JSON.parse(history) : [];
        history.push(record);
        
        if (history.length > 1000) {
            history = history.slice(-1000);
        }
        
        localStorage.setItem('studyHistory', JSON.stringify(history));
        this.allRecords = history;
    },

    // 問題状態管理
    loadSavedQuestionStates() {
        const saved = localStorage.getItem('savedQuestionStates');
        if (saved) {
            this.savedQuestionStates = JSON.parse(saved);
        }
    },

    saveQuestionStatesForPath(bookId, path, states) {
        const key = `${bookId}_${path.join('/')}`;
        this.savedQuestionStates[key] = states;
        localStorage.setItem('savedQuestionStates', JSON.stringify(this.savedQuestionStates));
    },

    loadQuestionStatesForPath(bookId, path) {
        const key = `${bookId}_${path.join('/')}`;
        return this.savedQuestionStates[key] || null;
    },

    // 学習計画管理
    loadStudyPlans() {
        const saved = localStorage.getItem('studyPlans');
        if (saved) {
            this.studyPlans = JSON.parse(saved);
        }
    },

    saveStudyPlans() {
        localStorage.setItem('studyPlans', JSON.stringify(this.studyPlans));
    },

    // 試験日管理
    loadExamDate() {
        const saved = localStorage.getItem('examDate');
        if (saved) {
            this.examDate = new Date(saved);
        }
    },

    saveExamDate(date) {
        this.examDate = date;
        localStorage.setItem('examDate', date.toISOString());
    },

    // CSVテンプレート管理
    loadCSVTemplates() {
        const saved = localStorage.getItem('csvTemplates');
        if (saved) {
            this.csvTemplates = JSON.parse(saved);
        }
    },

    saveCSVTemplates() {
        localStorage.setItem('csvTemplates', JSON.stringify(this.csvTemplates));
    },

    // ピン固定設定管理
    loadPinnedSettings() {
        const heatmapPinned = localStorage.getItem('heatmapPinnedBook');
        if (heatmapPinned) {
            this.heatmapPinnedBook = heatmapPinned;
        }
        
        const radarPinned = localStorage.getItem('radarPinnedBook');
        if (radarPinned) {
            this.radarPinnedBook = radarPinned;
        }
    },

    savePinnedSettings() {
        if (this.heatmapPinnedBook) {
            localStorage.setItem('heatmapPinnedBook', this.heatmapPinnedBook);
        } else {
            localStorage.removeItem('heatmapPinnedBook');
        }
        
        if (this.radarPinnedBook) {
            localStorage.setItem('radarPinnedBook', this.radarPinnedBook);
        } else {
            localStorage.removeItem('radarPinnedBook');
        }
    },

    // 連続学習日数更新
    updateDailyStreak() {
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
    },

    // 問題集の作成
    createBook(name, numberingType) {
        const bookId = 'book_' + Date.now();
        const book = {
            id: bookId,
            name: name,
            examType: 'gyousei',
            numberingType: numberingType,
            structure: {},
            createdAt: new Date().toISOString()
        };
        
        this.books[bookId] = book;
        this.bookOrder.push(bookId);
        this.saveBooksToStorage();
        this.saveBookOrder();
        
        return bookId;
    },

    // 問題集の更新
    updateBook(bookId, updates) {
        if (this.books[bookId]) {
            Object.assign(this.books[bookId], updates);
            this.saveBooksToStorage();
            return true;
        }
        return false;
    },

    // 問題集の削除
    deleteBook(bookId) {
        delete this.books[bookId];
        this.bookOrder = this.bookOrder.filter(id => id !== bookId);
        this.saveBooksToStorage();
        this.saveBookOrder();
    },

    // 階層の追加
    addHierarchy(bookId, parentPath, type, name, questions = null) {
        const book = this.books[bookId];
        if (!book) return false;
        
        let target = book.structure;
        
        if (parentPath) {
            const pathArray = parentPath.split('/');
            pathArray.forEach(p => {
                if (target[p]) {
                    if (!target[p].children) {
                        target[p].children = {};
                    }
                    target = target[p].children;
                }
            });
        }
        
        if (questions) {
            target[name] = {
                type: type,
                questions: questions
            };
            if (type === 'chapter' || type === 'section') {
                target[name].children = {};
            }
        } else {
            target[name] = {
                type: type,
                children: {}
            };
        }
        
        this.saveBooksToStorage();
        return true;
    },

    // 階層の編集
    editHierarchy(bookId, path, newName, newQuestions = null) {
        const book = this.books[bookId];
        if (!book) return false;
        
        const pathArray = path.split('/');
        let current = book.structure;
        let parent = null;
        let lastKey = pathArray[pathArray.length - 1];
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            parent = current;
            current = current[pathArray[i]].children || {};
        }
        
        const item = current[lastKey];
        if (!item) return false;
        
        // 名前の変更
        if (newName !== lastKey) {
            current[newName] = current[lastKey];
            delete current[lastKey];
        }
        
        // 問題番号の更新
        if (newQuestions !== null) {
            current[newName].questions = newQuestions;
        }
        
        this.saveBooksToStorage();
        return true;
    },

    // 階層の削除
    deleteHierarchy(bookId, path) {
        const book = this.books[bookId];
        if (!book) return false;
        
        const pathArray = path.split('/');
        
        if (pathArray.length === 1) {
            delete book.structure[pathArray[0]];
        } else {
            let target = book.structure;
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (target[pathArray[i]]) {
                    if (i === pathArray.length - 2) {
                        delete target[pathArray[i]].children[pathArray[pathArray.length - 1]];
                    } else {
                        target = target[pathArray[i]].children || {};
                    }
                }
            }
        }
        
        this.saveBooksToStorage();
        return true;
    },

    // 問題数カウント
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
    },

    // 全データクリア
    clearAllData() {
        localStorage.clear();
    }
};

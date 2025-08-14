/**
 * 一問一答モジュール
 * 問題管理、出題、結果表示などの一問一答機能を独立して管理
 */
const QAModule = {
    // データ
    questions: {},
    currentSet: [],
    currentIndex: 0,
    answerShown: false,
    stats: { total: 0, correct: 0, wrong: 0 },
    
    // 初期化
    init() {
        this.loadQuestions();
        
        // サンプルデータがない場合は追加
        if (Object.keys(this.questions).length === 0) {
            this.initializeSampleData();
        }
    },
    
    // サンプルデータ初期化
    initializeSampleData() {
        this.questions = {
            '憲法': [
                {
                    id: 1,
                    question: '日本国憲法が保障する基本的人権の中で、最も重要とされる権利は何か？',
                    answer: '個人の尊厳（憲法13条）。すべての基本的人権の根底にある権利とされる。',
                    category: '基本的人権',
                    difficulty: 2,
                    tags: ['憲法', '基本的人権', '13条']
                },
                {
                    id: 2,
                    question: '憲法14条が定める「法の下の平等」の例外として認められる合理的区別の基準は？',
                    answer: '合理的な理由がある区別は許される。性別、年齢、職業などによる区別が、目的に照らして合理的な範囲内であれば憲法違反とならない。',
                    category: '平等権',
                    difficulty: 3,
                    tags: ['憲法', '平等権', '14条']
                }
            ],
            '行政法': [
                {
                    id: 3,
                    question: '行政行為の効力のうち、公定力とは何か？',
                    answer: '行政行為が違法であっても、権限ある機関により取り消されるまでは有効として扱われる効力。',
                    category: '行政行為',
                    difficulty: 2,
                    tags: ['行政法', '行政行為', '公定力']
                },
                {
                    id: 4,
                    question: '行政不服審査法における審査請求の期間は？',
                    answer: '処分があったことを知った日の翌日から起算して3か月以内。',
                    category: '行政救済',
                    difficulty: 2,
                    tags: ['行政法', '行政不服審査', '期間']
                }
            ],
            '民法': [
                {
                    id: 5,
                    question: '民法における意思能力とは何か？',
                    answer: '自己の行為の結果を判断することができる精神的能力。意思能力を欠く状態でした法律行為は無効となる。',
                    category: '総則',
                    difficulty: 1,
                    tags: ['民法', '総則', '意思能力']
                }
            ]
        };
        this.saveQuestions();
    },
    
    // データ管理
    loadQuestions() {
        const saved = localStorage.getItem('qaQuestions');
        if (saved) {
            this.questions = JSON.parse(saved);
        }
    },
    
    saveQuestions() {
        localStorage.setItem('qaQuestions', JSON.stringify(this.questions));
    },
    
    // 問題追加
    addQuestion(setName, question, answer, options = {}) {
        if (!this.questions[setName]) {
            this.questions[setName] = [];
        }
        
        const newQuestion = {
            id: Date.now(),
            question: question,
            answer: answer,
            category: options.category || '',
            difficulty: options.difficulty || 2,
            tags: options.tags || [],
            createdAt: new Date().toISOString()
        };
        
        this.questions[setName].push(newQuestion);
        this.saveQuestions();
        
        return newQuestion.id;
    },
    
    // 問題編集
    editQuestion(setName, questionId, updates) {
        if (!this.questions[setName]) return false;
        
        const index = this.questions[setName].findIndex(q => q.id === questionId);
        if (index === -1) return false;
        
        Object.assign(this.questions[setName][index], updates);
        this.saveQuestions();
        
        return true;
    },
    
    // 問題削除
    deleteQuestion(setName, questionId) {
        if (!this.questions[setName]) return false;
        
        this.questions[setName] = this.questions[setName].filter(q => q.id !== questionId);
        
        if (this.questions[setName].length === 0) {
            delete this.questions[setName];
        }
        
        this.saveQuestions();
        return true;
    },
    
    // 問題セット削除
    deleteSet(setName) {
        if (this.questions[setName]) {
            delete this.questions[setName];
            this.saveQuestions();
            return true;
        }
        return false;
    },
    
    // 問題セット名変更
    renameSet(oldName, newName) {
        if (this.questions[oldName] && !this.questions[newName]) {
            this.questions[newName] = this.questions[oldName];
            delete this.questions[oldName];
            this.saveQuestions();
            return true;
        }
        return false;
    },
    
    // 出題開始
    startSession(setName, options = {}) {
        if (!this.questions[setName]) return false;
        
        // 問題をコピーして配列を作成
        this.currentSet = [...this.questions[setName]];
        
        // オプション処理
        if (options.shuffle) {
            this.shuffleArray(this.currentSet);
        }
        
        if (options.limit && options.limit < this.currentSet.length) {
            this.currentSet = this.currentSet.slice(0, options.limit);
        }
        
        if (options.difficulty) {
            this.currentSet = this.currentSet.filter(q => q.difficulty === options.difficulty);
        }
        
        if (options.category) {
            this.currentSet = this.currentSet.filter(q => q.category === options.category);
        }
        
        if (options.tags && options.tags.length > 0) {
            this.currentSet = this.currentSet.filter(q => 
                options.tags.some(tag => q.tags && q.tags.includes(tag))
            );
        }
        
        // セッション初期化
        this.currentIndex = 0;
        this.answerShown = false;
        this.stats = {
            total: this.currentSet.length,
            correct: 0,
            wrong: 0,
            startTime: new Date(),
            answers: []
        };
        
        return true;
    },
    
    // 現在の問題取得
    getCurrentQuestion() {
        if (this.currentIndex >= this.currentSet.length) {
            return null;
        }
        return this.currentSet[this.currentIndex];
    },
    
    // 答え表示
    showAnswer() {
        this.answerShown = true;
    },
    
    // 正解マーク
    markCorrect() {
        if (this.currentIndex < this.currentSet.length) {
            this.stats.correct++;
            this.stats.answers.push({
                questionId: this.currentSet[this.currentIndex].id,
                result: 'correct',
                timestamp: new Date()
            });
            this.nextQuestion();
        }
    },
    
    // 不正解マーク
    markWrong() {
        if (this.currentIndex < this.currentSet.length) {
            this.stats.wrong++;
            this.stats.answers.push({
                questionId: this.currentSet[this.currentIndex].id,
                result: 'wrong',
                timestamp: new Date()
            });
            this.nextQuestion();
        }
    },
    
    // 次の問題へ
    nextQuestion() {
        this.currentIndex++;
        this.answerShown = false;
        
        if (this.currentIndex >= this.currentSet.length) {
            this.endSession();
        }
    },
    
    // セッション終了
    endSession() {
        this.stats.endTime = new Date();
        this.stats.duration = this.stats.endTime - this.stats.startTime;
        this.stats.rate = Math.round((this.stats.correct / this.stats.total) * 100);
        
        // 履歴保存
        this.saveSessionHistory(this.stats);
        
        return this.stats;
    },
    
    // セッション履歴保存
    saveSessionHistory(stats) {
        let history = localStorage.getItem('qaHistory');
        history = history ? JSON.parse(history) : [];
        
        history.push({
            ...stats,
            id: Date.now(),
            date: new Date().toISOString()
        });
        
        // 最新100件のみ保持
        if (history.length > 100) {
            history = history.slice(-100);
        }
        
        localStorage.setItem('qaHistory', JSON.stringify(history));
    },
    
    // 履歴取得
    getHistory(limit = 20) {
        const history = localStorage.getItem('qaHistory');
        if (!history) return [];
        
        const parsed = JSON.parse(history);
        return parsed.slice(-limit).reverse();
    },
    
    // 統計取得
    getStatistics() {
        const history = this.getHistory(100);
        
        if (history.length === 0) {
            return {
                totalSessions: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                averageRate: 0,
                bestRate: 0,
                worstRate: 100,
                recentTrend: []
            };
        }
        
        const totalSessions = history.length;
        const totalQuestions = history.reduce((sum, h) => sum + h.total, 0);
        const totalCorrect = history.reduce((sum, h) => sum + h.correct, 0);
        const averageRate = Math.round((totalCorrect / totalQuestions) * 100);
        const bestRate = Math.max(...history.map(h => h.rate || 0));
        const worstRate = Math.min(...history.map(h => h.rate || 0));
        
        // 最近7回の傾向
        const recentTrend = history.slice(0, 7).map(h => h.rate || 0);
        
        return {
            totalSessions,
            totalQuestions,
            totalCorrect,
            averageRate,
            bestRate,
            worstRate,
            recentTrend
        };
    },
    
    // CSVインポート
    importFromCSV(setName, csvData) {
        try {
            const lines = csvData.trim().split('\n');
            const questions = [];
            
            // ヘッダー行をスキップ
            let startIndex = 0;
            if (lines[0].includes('問題') || lines[0].includes('答え')) {
                startIndex = 1;
            }
            
            for (let i = startIndex; i < lines.length; i++) {
                // カンマを含む可能性があるため、正規表現で分割
                const match = lines[i].match(/^"([^"]+)","([^"]+)"(?:,"([^"]*)")?(?:,(\d))?(?:,"([^"]*)")?$|^([^,]+),([^,]+)(?:,([^,]*))?(?:,(\d))?(?:,(.*))?$/);
                
                if (match) {
                    const question = match[1] || match[6];
                    const answer = match[2] || match[7];
                    const category = match[3] || match[8] || '';
                    const difficulty = parseInt(match[4] || match[9]) || 2;
                    const tags = (match[5] || match[10] || '').split(',').filter(t => t);
                    
                    if (question && answer) {
                        questions.push({
                            id: Date.now() + i,
                            question: question.trim(),
                            answer: answer.trim(),
                            category: category.trim(),
                            difficulty: difficulty,
                            tags: tags.map(t => t.trim()),
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
            
            if (questions.length > 0) {
                if (!this.questions[setName]) {
                    this.questions[setName] = [];
                }
                this.questions[setName].push(...questions);
                this.saveQuestions();
                
                return questions.length;
            }
            
            return 0;
        } catch (error) {
            console.error('CSV import error:', error);
            return -1;
        }
    },
    
    // CSVエクスポート
    exportToCSV(setName) {
        if (!this.questions[setName]) return '';
        
        let csv = '問題,答え,カテゴリ,難易度,タグ\n';
        
        this.questions[setName].forEach(q => {
            const question = `"${q.question.replace(/"/g, '""')}"`;
            const answer = `"${q.answer.replace(/"/g, '""')}"`;
            const category = `"${(q.category || '').replace(/"/g, '""')}"`;
            const difficulty = q.difficulty || 2;
            const tags = `"${(q.tags || []).join(',').replace(/"/g, '""')}"`;
            
            csv += `${question},${answer},${category},${difficulty},${tags}\n`;
        });
        
        return csv;
    },
    
    // ユーティリティ
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },
    
    // UI生成メソッド
    renderContent() {
        return `
            <div class="qa-card">
                <div class="qa-selector">
                    <select id="qaSetSelect" onchange="QAModule.selectSet(this.value)">
                        <option value="">問題集を選択</option>
                        ${Object.keys(this.questions).map(setName => 
                            `<option value="${setName}">${setName} (${this.questions[setName].length}問)</option>`
                        ).join('')}
                    </select>
                    <button onclick="QAModule.showStartOptions()">開始</button>
                    <button onclick="QAModule.showManageDialog()">管理</button>
                </div>
                
                <div class="qa-progress" id="qaProgress" style="display: none;">
                    <span class="qa-progress-text">問題 <span id="qaCurrentNum">0</span> / <span id="qaTotalNum">0</span></span>
                    <div class="qa-stats">
                        <span class="qa-stat">正解: <span class="qa-stat-value" id="qaCorrectCount">0</span></span>
                        <span class="qa-stat">不正解: <span class="qa-stat-value" id="qaWrongCount">0</span></span>
                    </div>
                </div>
                
                <div id="qaContent"></div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h4>学習統計</h4>
                <div id="qaStatistics"></div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h4>学習履歴</h4>
                <div id="qaHistoryList"></div>
            </div>
        `;
    },
    
    // 問題表示UI更新
    updateQuestionDisplay() {
        const question = this.getCurrentQuestion();
        const content = document.getElementById('qaContent');
        
        if (!question) {
            this.showResult();
            return;
        }
        
        document.getElementById('qaCurrentNum').textContent = this.currentIndex + 1;
        document.getElementById('qaTotalNum').textContent = this.currentSet.length;
        document.getElementById('qaCorrectCount').textContent = this.stats.correct;
        document.getElementById('qaWrongCount').textContent = this.stats.wrong;
        
        content.innerHTML = `
            <div class="qa-question">${question.question}</div>
            ${question.category ? `<div class="qa-category">カテゴリ: ${question.category}</div>` : ''}
            ${question.difficulty ? `<div class="qa-difficulty">難易度: ${'★'.repeat(question.difficulty)}</div>` : ''}
            <div class="qa-answer ${this.answerShown ? 'show' : ''}" id="qaAnswer">${question.answer}</div>
            <div class="qa-controls">
                ${!this.answerShown ? 
                    `<button class="qa-btn show-answer" onclick="QAModule.showAnswerAndUpdate()">答えを見る</button>` :
                    `<button class="qa-btn correct" onclick="QAModule.markCorrectAndUpdate()">正解</button>
                     <button class="qa-btn wrong" onclick="QAModule.markWrongAndUpdate()">不正解</button>`
                }
            </div>
        `;
        
        document.getElementById('qaProgress').style.display = 'flex';
    },
    
    // 結果表示
    showResult() {
        const content = document.getElementById('qaContent');
        const stats = this.endSession();
        
        content.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3>学習結果</h3>
                <div class="stats-grid" style="margin: 20px 0;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.correct}</div>
                        <div class="stat-label">正解</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.wrong}</div>
                        <div class="stat-label">不正解</div>
                    </div>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: var(--primary);">正答率: ${stats.rate}%</div>
                <div style="margin-top: 10px; color: var(--gray);">
                    学習時間: ${Math.round(stats.duration / 1000 / 60)}分${Math.round((stats.duration / 1000) % 60)}秒
                </div>
                <button class="save-button" style="margin-top: 20px;" onclick="QAModule.resetSession()">もう一度</button>
            </div>
        `;
        
        this.updateStatistics();
        this.updateHistoryList();
    },
    
    // 統計更新
    updateStatistics() {
        const container = document.getElementById('qaStatistics');
        if (!container) return;
        
        const stats = this.getStatistics();
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalSessions}</div>
                    <div class="stat-label">総セッション数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalQuestions}</div>
                    <div class="stat-label">総問題数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.averageRate}%</div>
                    <div class="stat-label">平均正答率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.bestRate}%</div>
                    <div class="stat-label">最高正答率</div>
                </div>
            </div>
        `;
    },
    
    // 履歴リスト更新
    updateHistoryList() {
        const container = document.getElementById('qaHistoryList');
        if (!container) return;
        
        const history = this.getHistory(10);
        
        if (history.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">履歴がありません</p>';
            return;
        }
        
        container.innerHTML = history.map(h => {
            const date = new Date(h.date);
            return `
                <div style="padding: 10px; border-bottom: 1px solid var(--light);">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <span style="font-weight: 600;">${h.total}問</span>
                            <span style="color: var(--gray); margin-left: 10px;">
                                ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                        </div>
                        <div>
                            <span style="color: var(--success);">正解: ${h.correct}</span>
                            <span style="color: var(--danger); margin-left: 10px;">不正解: ${h.wrong}</span>
                            <span style="font-weight: 700; margin-left: 10px;">${h.rate}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // UI連携メソッド
    showAnswerAndUpdate() {
        this.showAnswer();
        this.updateQuestionDisplay();
    },
    
    markCorrectAndUpdate() {
        this.markCorrect();
        this.updateQuestionDisplay();
    },
    
    markWrongAndUpdate() {
        this.markWrong();
        this.updateQuestionDisplay();
    },
    
    resetSession() {
        document.getElementById('qaProgress').style.display = 'none';
        document.getElementById('qaContent').innerHTML = '';
    }
};

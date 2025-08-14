/**
 * メインアプリケーションロジック
 * アプリケーション全体の制御と初期化を管理
 */
const App = {
    // 状態管理
    currentBook: null,
    currentPath: [],
    questionStates: {},
    bookmarkMode: false,
    selectedBookCard: null,
    sortMode: false,
    
    // 初期化
    init() {
        // データマネージャー初期化
        DataManager.init();
        
        // UI初期化
        this.renderBookCards();
        UIComponents.renderCalendar();
        UIComponents.updateExamCountdown();
        
        // 分析初期化
        Analytics.updateChartBars();
        Analytics.updateHistoryContent();
        this.updateHeatmapBookSelect();
        this.updateRadarBookSelect();
        
        // ピン固定設定適用
        if (DataManager.heatmapPinnedBook && DataManager.books[DataManager.heatmapPinnedBook]) {
            const select = document.getElementById('heatmapBookSelect');
            if (select) {
                select.value = DataManager.heatmapPinnedBook;
                document.getElementById('heatmapToggleBtn').classList.add('active');
                Analytics.updateHeatmap();
            }
        }
        
        if (DataManager.radarPinnedBook && DataManager.books[DataManager.radarPinnedBook]) {
            const select = document.getElementById('radarBookSelect');
            if (select) {
                select.value = DataManager.radarPinnedBook;
                document.getElementById('radarToggleBtn').classList.add('active');
                Analytics.drawRadarChart();
            }
        }
        
        // 一問一答初期化
        QAModule.init();
    },
    
    // 問題集カード表示
    renderBookCards() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;
        
        let html = '';
        
        const orderedBooks = DataManager.bookOrder
            .filter(id => DataManager.books[id])
            .map(id => DataManager.books[id]);
        
        Object.values(DataManager.books).forEach(book => {
            if (!DataManager.bookOrder.includes(book.id)) {
                orderedBooks.push(book);
                DataManager.bookOrder.push(book.id);
            }
        });
        
        orderedBooks.forEach(book => {
            const questionCount = DataManager.countQuestionsInBook(book);
            const sortClass = this.sortMode ? 'sortable' : '';
            html += `
                <div class="book-card ${sortClass}" id="book-card-${book.id}" 
                     onclick="${this.sortMode ? '' : `App.toggleBookCard('${book.id}')`}">
                    <span class="book-card-drag-handle">☰</span>
                    <div class="book-card-title">📚 ${book.name}</div>
                    <div class="book-card-meta">
                        ${Object.keys(book.structure).length}科目 | ${questionCount}問
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // 問題集カード選択
    toggleBookCard(bookId) {
        const card = document.getElementById(`book-card-${bookId}`);
        
        if (this.selectedBookCard === bookId) {
            card.classList.remove('selected');
            this.selectedBookCard = null;
            this.currentBook = null;
            this.currentPath = [];
            document.getElementById('breadcrumb').style.display = 'none';
            document.getElementById('recordHierarchyContainer').style.display = 'none';
            document.getElementById('questionSection').style.display = 'none';
        } else {
            document.querySelectorAll('.book-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            card.classList.add('selected');
            this.selectedBookCard = bookId;
            this.selectBook(bookId);
        }
    },
    
    selectBook(bookId) {
        this.currentBook = DataManager.books[bookId];
        this.currentPath = [];
        
        document.getElementById('breadcrumb').style.display = 'flex';
        document.getElementById('questionSection').style.display = 'none';
        UIComponents.updateBreadcrumb(this.currentBook.name, this.currentPath);
        this.renderRecordHierarchy();
    },
    
    // 記録用階層表示
    renderRecordHierarchy() {
        const container = document.getElementById('recordHierarchyContainer');
        if (!container || !this.currentBook) return;
        
        container.style.display = 'block';
        
        let structure = this.currentBook.structure;
        if (this.currentPath.length > 0) {
            for (let i = 0; i < this.currentPath.length; i++) {
                if (structure[this.currentPath[i]]) {
                    structure = structure[this.currentPath[i]].children || {};
                }
            }
        }
        
        let html = '<div class="hierarchy-list">';
        html += this.renderRecordLevel(structure, this.currentPath);
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    renderRecordLevel(structure, basePath) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const currentPath = [...basePath, name];
            const pathStr = currentPath.join('/');
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = DataManager.expandedNodes.has(pathStr);
            
            html += `<div class="hierarchy-item">`;
            
            if (item.questions) {
                html += `
                    <div class="hierarchy-row" onclick="App.showQuestions('${pathStr}')">
                        <span style="width: 28px;"></span>
                        <span class="hierarchy-icon">${this.getHierarchyIcon(item.type)}</span>
                        <span class="hierarchy-label">${name}</span>
                        <span class="hierarchy-meta">${item.questions.length}問</span>
                    </div>
                `;
                
                if (hasChildren) {
                    html += `
                        <div class="hierarchy-children ${isExpanded ? 'expanded' : ''}">
                            ${this.renderRecordLevel(item.children, currentPath)}
                        </div>
                    `;
                }
            } else if (hasChildren) {
                html += `
                    <div class="hierarchy-row" onclick="App.toggleRecordNode('${pathStr}', event)">
                        <span class="hierarchy-toggle ${isExpanded ? 'expanded' : ''}">▶</span>
                        <span class="hierarchy-icon">${this.getHierarchyIcon(item.type)}</span>
                        <span class="hierarchy-label">${name}</span>
                    </div>
                    <div class="hierarchy-children ${isExpanded ? 'expanded' : ''}">
                        ${this.renderRecordLevel(item.children, currentPath)}
                    </div>
                `;
            }
            
            html += '</div>';
        });
        
        return html;
    },
    
    toggleRecordNode(path, event) {
        event.stopPropagation();
        
        if (DataManager.expandedNodes.has(path)) {
            DataManager.expandedNodes.delete(path);
        } else {
            DataManager.expandedNodes.add(path);
        }
        
        this.renderRecordHierarchy();
    },
    
    getHierarchyIcon(type) {
        const icons = {
            'subject': '📂',
            'chapter': '📄',
            'section': '📑',
            'subsection': ''
        };
        return icons[type] || '📄';
    },
    
    // 問題表示
    showQuestions(pathStr) {
        const pathArray = pathStr.split('/');
        this.currentPath = pathArray;
        UIComponents.updateBreadcrumb(this.currentBook.name, this.currentPath);
        
        let current = this.currentBook.structure;
        for (let i = 0; i < pathArray.length; i++) {
            if (current[pathArray[i]]) {
                if (current[pathArray[i]].questions) {
                    const item = current[pathArray[i]];
                    document.getElementById('recordHierarchyContainer').style.display = 'none';
                    document.getElementById('questionSection').style.display = 'block';
                    
                    const grid = document.getElementById('questionGrid');
                    grid.innerHTML = '';
                    this.questionStates = {};
                    
                    if (item.type === 'chapter' && item.questions.length > 50) {
                        const note = document.createElement('div');
                        note.style.cssText = 'grid-column: 1 / -1; font-size: 11px; color: var(--gray); padding: 5px;';
                        note.textContent = `※ ${item.questions.length}問 - 年度別過去問`;
                        grid.appendChild(note);
                    }
                    
                    item.questions.forEach(num => {
                        const cell = document.createElement('div');
                        cell.className = 'question-cell';
                        cell.textContent = num;
                        cell.dataset.number = num;
                        cell.onclick = () => this.toggleQuestion(num);
                        
                        grid.appendChild(cell);
                        
                        this.questionStates[num] = {
                            state: null,
                            bookmarked: false
                        };
                    });
                    
                    this.loadQuestionStatesForPath();
                    return;
                }
                current = current[pathArray[i]].children || {};
            }
        }
    },
    
    loadQuestionStatesForPath() {
        if (this.currentBook && this.currentPath.length > 0) {
            const states = DataManager.loadQuestionStatesForPath(this.currentBook.id, this.currentPath);
            if (states) {
                this.questionStates = states;
                this.applyQuestionStates();
            }
        }
    },
    
    applyQuestionStates() {
        Object.entries(this.questionStates).forEach(([num, state]) => {
            const cell = document.querySelector(`[data-number="${num}"]`);
            if (cell) {
                cell.classList.remove('correct', 'wrong', 'bookmarked');
                if (state.state === 'correct') {
                    cell.classList.add('correct');
                } else if (state.state === 'wrong') {
                    cell.classList.add('wrong');
                }
                if (state.bookmarked) {
                    cell.classList.add('bookmarked');
                }
            }
        });
        this.updateStats();
    },
    
    // パンくずナビゲーション
    navigateTo(index) {
        if (index === -1) {
            this.currentPath = [];
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        } else {
            this.currentPath = this.currentPath.slice(0, index);
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        }
        UIComponents.updateBreadcrumb(this.currentBook.name, this.currentPath);
    },
    
    // 問題操作
    toggleBookmarkMode() {
        this.bookmarkMode = !this.bookmarkMode;
        const btn = document.getElementById('bookmarkBtn');
        btn.classList.toggle('active');
    },
    
    toggleQuestion(num) {
        if (this.bookmarkMode) {
            this.questionStates[num].bookmarked = !this.questionStates[num].bookmarked;
            const cell = document.querySelector(`[data-number="${num}"]`);
            cell.classList.toggle('bookmarked');
        } else {
            const cell = document.querySelector(`[data-number="${num}"]`);
            const state = this.questionStates[num];
            
            if (state.state === null) {
                state.state = 'correct';
                cell.classList.add('correct');
            } else if (state.state === 'correct') {
                state.state = 'wrong';
                cell.classList.remove('correct');
                cell.classList.add('wrong');
            } else {
                state.state = null;
                cell.classList.remove('wrong');
            }
        }
        
        this.saveQuestionStatesForPath();
        this.updateStats();
    },
    
    markCorrect() {
        Object.keys(this.questionStates).forEach(num => {
            if (this.questionStates[num].state === null) {
                this.questionStates[num].state = 'correct';
                const cell = document.querySelector(`[data-number="${num}"]`);
                if (cell) {
                    cell.classList.add('correct');
                }
            }
        });
        this.saveQuestionStatesForPath();
        this.updateStats();
    },
    
    markWrong() {
        Object.keys(this.questionStates).forEach(num => {
            if (this.questionStates[num].state === null) {
                this.questionStates[num].state = 'wrong';
                const cell = document.querySelector(`[data-number="${num}"]`);
                if (cell) {
                    cell.classList.add('wrong');
                }
            }
        });
        this.saveQuestionStatesForPath();
        this.updateStats();
    },
    
    saveQuestionStatesForPath() {
        if (this.currentBook && this.currentPath.length > 0) {
            DataManager.saveQuestionStatesForPath(this.currentBook.id, this.currentPath, this.questionStates);
        }
    },
    
    updateStats() {
        let total = 0;
        let correct = 0;
        let wrong = 0;
        
        Object.values(this.questionStates).forEach(state => {
            if (state.state !== null) {
                total++;
                if (state.state === 'correct') {
                    correct++;
                } else {
                    wrong++;
                }
            }
        });
        
        const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('correctCount').textContent = correct;
        document.getElementById('wrongCount').textContent = wrong;
        document.getElementById('correctRate').textContent = rate + '%';
    },
    
    saveRecord() {
        const record = {
            bookId: this.currentBook.id,
            bookName: this.currentBook.name,
            path: this.currentPath,
            questions: this.questionStates,
            timestamp: new Date().toISOString(),
            stats: {
                total: parseInt(document.getElementById('totalCount').textContent),
                correct: parseInt(document.getElementById('correctCount').textContent),
                wrong: parseInt(document.getElementById('wrongCount').textContent),
                rate: document.getElementById('correctRate').textContent
            }
        };
        
        DataManager.saveToHistory(record);
        DataManager.updateDailyStreak();
        
        alert('保存しました！');
        
        // 分析画面を更新
        Analytics.updateChartBars();
        Analytics.updateHistoryContent();
    },
    
    // メインタブ切り替え
    switchMainTab(tabName, event) {
        document.querySelectorAll('.main-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + '-tab').classList.add('active');
        
        if (tabName === 'analysis') {
            Analytics.updateChartBars();
            Analytics.updateHeatmap();
            Analytics.updateWeaknessAnalysis();
            Analytics.updateHistoryContent();
        } else if (tabName === 'progress') {
            Analytics.updateProgressContent();
            Analytics.drawRadarChart();
        }
    },
    
    // フッタータブ処理
    switchFooterTab(tabName, event) {
        const modal = document.getElementById('footerModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        const titles = {
            'register': '📝 問題集登録',
            'qa': '❓ 一問一答',
            'results': '🏆 獲得バッジ',
            'settings': '⚙️ 設定'
        };
        
        modalTitle.textContent = titles[tabName];
        
        switch(tabName) {
            case 'register':
                modalBody.innerHTML = this.getRegisterContent();
                setTimeout(() => this.renderRegisterHierarchy(), 100);
                break;
            case 'qa':
                modalBody.innerHTML = QAModule.renderContent();
                setTimeout(() => {
                    QAModule.updateStatistics();
                    QAModule.updateHistoryList();
                }, 100);
                break;
            case 'results':
                modalBody.innerHTML = this.getResultsContent();
                break;
            case 'settings':
                modalBody.innerHTML = this.getSettingsContent();
                setTimeout(() => this.renderCSVTemplateList(), 100);
                break;
        }
        
        modal.classList.add('active');
    },
    
    closeFooterModal() {
        document.getElementById('footerModal').classList.remove('active');
    },
    
    // 登録画面コンテンツ
    getRegisterContent() {
        return `
            <div class="save-button" style="margin: 10px;" onclick="App.showNewBookDialog()">新規作成</div>
            <div class="save-button" style="margin: 10px; background: var(--secondary);" onclick="App.showBookListDialog()">問題集一覧</div>
            <div style="margin-top: 20px;">
                <h4 style="padding: 0 10px;">登録済み問題集</h4>
                <div id="registerHierarchy"></div>
            </div>
        `;
    },
    
    // 実績画面コンテンツ
    getResultsContent() {
        const stats = Analytics.calculateOverallProgress();
        const streakDays = localStorage.getItem('streakDays') || '0';
        
        const badges = [
            { 
                icon: '🎯', 
                label: '初学習', 
                unlocked: DataManager.allRecords.length > 0,
                value: DataManager.allRecords.length > 0 ? '達成' : '未達成'
            },
            { 
                icon: '📚', 
                label: '100問', 
                unlocked: stats.totalAnswered >= 100,
                value: `${stats.totalAnswered}問`
            },
            { 
                icon: '🔥', 
                label: '7日連続', 
                unlocked: parseInt(streakDays) >= 7,
                value: `${streakDays}日`
            },
            { 
                icon: '⭐', 
                label: '正答90%', 
                unlocked: stats.overallRate >= 90,
                value: `${stats.overallRate}%`
            },
            { 
                icon: '🏆', 
                label: '1000問', 
                unlocked: stats.totalAnswered >= 1000,
                value: stats.totalAnswered >= 1000 ? '達成' : `${stats.totalAnswered}問`
            },
            { 
                icon: '🚀', 
                label: '全科目', 
                unlocked: Object.keys(Analytics.calculateSubjectStats()).length >= 4,
                value: `${Object.keys(Analytics.calculateSubjectStats()).length}科目`
            },
            { 
                icon: '💎', 
                label: '30日継続', 
                unlocked: parseInt(streakDays) >= 30,
                value: `${streakDays}日`
            },
            { 
                icon: '👑', 
                label: 'マスター', 
                unlocked: stats.totalAnswered >= 5000 && stats.overallRate >= 85,
                value: stats.totalAnswered >= 5000 ? '達成' : '未達成'
            }
        ];
        
        return `
            <div class="card" style="margin: 10px;">
                <h4 style="text-align: center; margin-bottom: 20px;">獲得バッジ</h4>
                <div class="achievement-grid">
                    ${badges.map(badge => `
                        <div class="achievement-card">
                            <div class="achievement-icon ${!badge.unlocked ? 'disabled' : ''}">${badge.icon}</div>
                            <div class="achievement-label">${badge.label}</div>
                            <div class="achievement-value">${badge.value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // 設定画面コンテンツ
    getSettingsContent() {
        const currentExamDate = DataManager.examDate ? DataManager.examDate.toISOString().split('T')[0] : '';
        
        return `
            <div class="card" style="margin: 10px;">
                <h4>📅 試験日設定</h4>
                <div class="form-group">
                    <label class="form-label">試験日</label>
                    <input type="date" class="form-control" id="examDateInput" value="${currentExamDate}">
                    <button class="save-button" style="margin-top: 10px;" onclick="App.saveExamDate()">試験日を設定</button>
                </div>
            </div>
            
            <div class="card" style="margin: 10px;">
                <h4>📥 問題集CSVインポート</h4>
                <div class="import-section">
                    <label class="form-label">問題集名</label>
                    <input type="text" class="form-control" id="importBookName" placeholder="問題集名を入力">
                    
                    <label class="form-label" style="margin-top: 15px;">番号タイプ</label>
                    <div class="numbering-type">
                        <label>
                            <input type="radio" name="importNumberingType" value="reset" checked>
                            <span>項目ごとリセット</span>
                        </label>
                        <label>
                            <input type="radio" name="importNumberingType" value="continuous">
                            <span>連番</span>
                        </label>
                    </div>
                    
                    <label class="form-label" style="margin-top: 15px;">CSV形式の階層データ</label>
                    <textarea class="import-textarea" id="importCsvData" placeholder="CSV形式のデータを貼り付けてください"></textarea>
                    
                    <div class="import-help">
                        <strong>CSV形式の例：</strong><br>
                        科目,章,節,項,開始番号,終了番号<br>
                        民法,総則,権利能力,,1,5<br>
                        民法,総則,意思能力,,6,8
                    </div>
                    
                    <button class="save-button" style="margin-top: 15px;" onclick="App.saveCSVTemplate()">テンプレートとして保存</button>
                    <button class="save-button" style="margin-top: 10px; background: var(--success);" onclick="App.importCSV()">CSVを問題集に適用</button>
                    
                    <h5 style="margin-top: 20px;">保存済みテンプレート</h5>
                    <div class="csv-list" id="csvTemplateList"></div>
                </div>
            </div>
            
            <div class="card" style="margin: 10px;">
                <button class="save-button" style="background: var(--danger);" onclick="App.clearAllData()">すべてのデータを削除</button>
            </div>
        `;
    },
    
    // ヒートマップ・レーダーチャート選択更新
    updateHeatmapBookSelect() {
        const select = document.getElementById('heatmapBookSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">問題集を選択</option>';
        
        Object.values(DataManager.books).forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.name;
            select.appendChild(option);
        });
    },
    
    updateRadarBookSelect() {
        const select = document.getElementById('radarBookSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">問題集を選択</option>';
        
        Object.values(DataManager.books).forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.name;
            select.appendChild(option);
        });
    },
    
    // その他のメソッド実装...
    saveExamDate() {
        const input = document.getElementById('examDateInput');
        if (input && input.value) {
            DataManager.saveExamDate(new Date(input.value));
            UIComponents.updateExamCountdown();
            alert('試験日を設定しました');
            this.closeFooterModal();
        }
    },
    
    clearAllData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            DataManager.clearAllData();
            location.reload();
        }
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

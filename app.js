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
        console.log('App initializing...');
        
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
        
        console.log('App initialized');
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
        console.log('Switching to tab:', tabName);
        
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
        console.log('Opening footer tab:', tabName);
        
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
        
        let html = `
            <div class="card" style="margin: 10px;">
                <h4 style="text-align: center; margin-bottom: 20px;">獲得バッジ</h4>
                <div class="achievement-grid">
        `;
        
        badges.forEach(badge => {
            html += `
                <div class="achievement-card">
                    <div class="achievement-icon ${!badge.unlocked ? 'disabled' : ''}">${badge.icon}</div>
                    <div class="achievement-label">${badge.label}</div>
                    <div class="achievement-value">${badge.value}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
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
    
    // 各種メソッド
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
    },
    
    // 登録階層表示（続き）
    renderRegisterHierarchy() {
        const container = document.getElementById('registerHierarchy');
        if (!container) return;
        
        let html = '<div class="hierarchy-list">';
        
        Object.values(DataManager.books).forEach(book => {
            const nodeId = `book_${book.id}`;
            const isExpanded = DataManager.expandedNodes.has(nodeId);
            
            html += `
                <div class="hierarchy-item">
                    <div class="hierarchy-row" onclick="App.toggleRegisterNode('${nodeId}', event)">
                        <span class="hierarchy-toggle ${isExpanded ? 'expanded' : ''}">▶</span>
                        <span class="hierarchy-icon">📚</span>
                        <span class="hierarchy-label">${book.name}</span>
                        <div class="hierarchy-actions">
                            <button class="hierarchy-action" onclick="App.addHierarchy('${book.id}', null, 'subject', event)" title="科目追加">+</button>
                            <button class="hierarchy-action delete" onclick="App.deleteBook('${book.id}', event)" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="hierarchy-children ${isExpanded ? 'expanded' : ''}">
                        ${this.renderRegisterLevel(book.structure, book.id, [])}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    renderRegisterLevel(structure, bookId, path) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const currentPath = [...path, name];
            const nodeId = `${bookId}_${currentPath.join('_')}`;
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = DataManager.expandedNodes.has(nodeId);
            
            html += `
                <div class="hierarchy-item">
                    <div class="hierarchy-row" ${hasChildren ? `onclick="App.toggleRegisterNode('${nodeId}', event)"` : ''}>
                        ${hasChildren ? `<span class="hierarchy-toggle ${isExpanded ? 'expanded' : ''}">▶</span>` : '<span style="width: 28px; display: inline-block;"></span>'}
                        <span class="hierarchy-icon">${this.getHierarchyIcon(item.type)}</span>
                        <span class="hierarchy-label">${name}</span>
            `;
            
            if (item.questions) {
                html += `<span class="hierarchy-meta">${item.questions.length}問</span>`;
            }
            
            html += '<div class="hierarchy-actions">';
            html += `<button class="hierarchy-action edit" onclick="App.editHierarchy('${bookId}', '${currentPath.join('/')}', event)" title="編集">✏️</button>`;
            
            if (item.type === 'subject') {
                html += `<button class="hierarchy-action" onclick="App.addHierarchy('${bookId}', '${currentPath.join('/')}', 'chapter', event)" title="章追加">+</button>`;
            } else if (item.type === 'chapter') {
                html += `<button class="hierarchy-action" onclick="App.addHierarchy('${bookId}', '${currentPath.join('/')}', 'section', event)" title="節追加">+</button>`;
            } else if (item.type === 'section') {
                html += `<button class="hierarchy-action" onclick="App.addHierarchy('${bookId}', '${currentPath.join('/')}', 'subsection', event)" title="項追加">+</button>`;
            }
            
            html += `<button class="hierarchy-action delete" onclick="App.deleteHierarchy('${bookId}', '${currentPath.join('/')}', event)" title="削除">🗑️</button>`;
            html += '</div></div>';
            
            if (hasChildren) {
                html += `
                    <div class="hierarchy-children ${isExpanded ? 'expanded' : ''}">
                        ${this.renderRegisterLevel(item.children, bookId, currentPath)}
                    </div>
                `;
            }
            
            html += '</div>';
        });
        
        return html;
    },
    
    toggleRegisterNode(nodeId, event) {
        event.stopPropagation();
        
        if (DataManager.expandedNodes.has(nodeId)) {
            DataManager.expandedNodes.delete(nodeId);
        } else {
            DataManager.expandedNodes.add(nodeId);
        }
        
        this.renderRegisterHierarchy();
    },
    
    // CSVテンプレートリスト表示
    renderCSVTemplateList() {
        const container = document.getElementById('csvTemplateList');
        if (!container) return;
        
        if (Object.keys(DataManager.csvTemplates).length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">保存済みテンプレートはありません</p>';
            return;
        }
        
        let html = '';
        Object.values(DataManager.csvTemplates).forEach(template => {
            const date = new Date(template.createdAt);
            const lines = template.data.trim().split('\n').length - 1;
            
            html += `
                <div class="csv-item">
                    <div class="csv-item-info">
                        <div class="csv-item-name">${template.name}</div>
                        <div class="csv-item-meta">
                            ${date.toLocaleDateString('ja-JP')} | ${lines}行
                        </div>
                    </div>
                    <div class="csv-item-actions">
                        <button class="csv-btn edit" onclick="App.editCSVTemplate('${template.id}')">編集</button>
                        <button class="csv-btn apply" onclick="App.applyCSVTemplate('${template.id}')">適用</button>
                        <button class="csv-btn delete" onclick="App.deleteCSVTemplate('${template.id}')">削除</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // ダイアログ表示関連
    showNewBookDialog() {
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">問題集名</label>
                <input type="text" class="form-control" id="newBookName" placeholder="問題集名を入力">
            </div>
            <div class="form-group">
                <label class="form-label">問題番号タイプ</label>
                <div class="numbering-type">
                    <label>
                        <input type="radio" name="numberingType" value="reset" checked>
                        <span>項目ごとリセット</span>
                    </label>
                    <label>
                        <input type="radio" name="numberingType" value="continuous">
                        <span>連番</span>
                    </label>
                </div>
            </div>
        `;
        
        UIComponents.showDialog('新規問題集作成', dialogBody, () => {
            const name = document.getElementById('newBookName').value;
            const numberingType = document.querySelector('input[name="numberingType"]:checked').value;
            
            if (!name) {
                alert('問題集名を入力してください');
                return;
            }
            
            DataManager.createBook(name, numberingType);
            this.renderBookCards();
            this.renderRegisterHierarchy();
            this.updateHeatmapBookSelect();
            this.updateRadarBookSelect();
            UIComponents.closeDialog();
            alert('作成しました');
        });
    },
    
    showBookListDialog() {
        let dialogBody = `
            <div style="max-height: 400px; overflow-y: auto;">
        `;
        
        Object.values(DataManager.books).forEach(book => {
            const questionCount = DataManager.countQuestionsInBook(book);
            const numberingText = book.numberingType === 'continuous' ? '連番' : 'リセット';
            dialogBody += `
                <div style="padding: 10px; border-bottom: 1px solid var(--light);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${book.name}</div>
                            <div style="font-size: 12px; color: var(--gray);">
                                ${Object.keys(book.structure).length}科目 | ${questionCount}問 | ${numberingText}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="hierarchy-action edit" onclick="App.editBookProperties('${book.id}')" title="編集">✏️</button>
                            <button class="hierarchy-action delete" onclick="App.deleteBookFromList('${book.id}')" title="削除">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        dialogBody += '</div>';
        
        UIComponents.showDialog('問題集一覧', dialogBody, () => {
            UIComponents.closeDialog();
        });
    },
    
    editBookProperties(bookId) {
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">問題集名</label>
                <input type="text" class="form-control" id="editBookName" value="${book.name}">
            </div>
            <div class="form-group">
                <label class="form-label">問題番号タイプ</label>
                <div class="numbering-type">
                    <label>
                        <input type="radio" name="editNumberingType" value="reset" ${book.numberingType === 'reset' ? 'checked' : ''}>
                        <span>項目ごとリセット</span>
                    </label>
                    <label>
                        <input type="radio" name="editNumberingType" value="continuous" ${book.numberingType === 'continuous' ? 'checked' : ''}>
                        <span>連番</span>
                    </label>
                </div>
            </div>
        `;
        
        UIComponents.showDialog('問題集を編集', dialogBody, () => {
            const newName = document.getElementById('editBookName').value;
            const newNumberingType = document.querySelector('input[name="editNumberingType"]:checked').value;
            
            if (newName) {
                DataManager.updateBook(bookId, {
                    name: newName,
                    numberingType: newNumberingType
                });
                this.renderBookCards();
                this.updateHeatmapBookSelect();
                this.updateRadarBookSelect();
                UIComponents.closeDialog();
                this.showBookListDialog();
            }
        });
    },
    
    deleteBookFromList(bookId) {
        if (!confirm('この問題集を削除しますか？')) return;
        DataManager.deleteBook(bookId);
        this.renderBookCards();
        this.updateHeatmapBookSelect();
        this.updateRadarBookSelect();
        UIComponents.closeDialog();
        this.showBookListDialog();
    },
    
    // 階層操作メソッド
    addHierarchy(bookId, parentPath, type, event) {
        event.stopPropagation();
        
        const labels = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        
        let dialogBody = `
            <div class="form-group">
                <label class="form-label">${labels[type]}の名前</label>
                <input type="text" class="form-control" id="hierarchyName" placeholder="名前を入力">
            </div>
        `;
        
        if (type === 'chapter' || type === 'section' || type === 'subsection') {
            dialogBody += `
                <div class="form-group">
                    <label class="form-label">問題番号範囲（任意）</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" class="form-control" id="questionStart" min="1" placeholder="開始番号" style="width: 100px;">
                        <span>〜</span>
                        <input type="number" class="form-control" id="questionEnd" min="1" placeholder="終了番号" style="width: 100px;">
                    </div>
                </div>
            `;
        }
        
        UIComponents.showDialog(`${labels[type]}を追加`, dialogBody, () => {
            const name = document.getElementById('hierarchyName').value;
            if (!name) {
                alert('名前を入力してください');
                return;
            }
            
            let questions = null;
            if (type === 'chapter' || type === 'section' || type === 'subsection') {
                const start = parseInt(document.getElementById('questionStart').value);
                const end = parseInt(document.getElementById('questionEnd').value);
                
                if (start && end && start <= end) {
                    questions = [];
                    for (let i = start; i <= end; i++) {
                        questions.push(i);
                    }
                }
            }
            
            DataManager.addHierarchy(bookId, parentPath, type, name, questions);
            this.renderBookCards();
            this.renderRegisterHierarchy();
            UIComponents.closeDialog();
        });
    },
    
    editHierarchy(bookId, path, event) {
        event.stopPropagation();
        
        const book = DataManager.books[bookId];
        const pathArray = path.split('/');
        let current = book.structure;
        let lastKey = pathArray[pathArray.length - 1];
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            current = current[pathArray[i]].children || {};
        }
        
        const item = current[lastKey];
        if (!item) return;
        
        let dialogBody = `
            <div class="form-group">
                <label class="form-label">名称</label>
                <input type="text" class="form-control" id="editName" value="${lastKey}">
            </div>
        `;
        
        if (item.type === 'chapter' || item.type === 'section' || item.type === 'subsection') {
            const start = item.questions ? Math.min(...item.questions) : '';
            const end = item.questions ? Math.max(...item.questions) : '';
            
            dialogBody += `
                <div class="form-group">
                    <label class="form-label">問題番号範囲</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" class="form-control" id="editQuestionStart" value="${start}" min="1" placeholder="開始番号" style="width: 100px;">
                        <span>〜</span>
                        <input type="number" class="form-control" id="editQuestionEnd" value="${end}" min="1" placeholder="終了番号" style="width: 100px;">
                    </div>
                </div>
            `;
        }
        
        UIComponents.showDialog('編集', dialogBody, () => {
            const newName = document.getElementById('editName').value;
            if (!newName) {
                alert('名前を入力してください');
                return;
            }
            
            let newQuestions = null;
            if (item.type === 'chapter' || item.type === 'section' || item.type === 'subsection') {
                const start = parseInt(document.getElementById('editQuestionStart').value);
                const end = parseInt(document.getElementById('editQuestionEnd').value);
                
                if (start && end && start <= end) {
                    newQuestions = [];
                    for (let i = start; i <= end; i++) {
                        newQuestions.push(i);
                    }
                }
            }
            
            DataManager.editHierarchy(bookId, path, newName, newQuestions);
            this.renderBookCards();
            this.renderRegisterHierarchy();
            UIComponents.closeDialog();
        });
    },
    
    deleteHierarchy(bookId, path, event) {
        event.stopPropagation();
        if (!confirm('この項目を削除しますか？')) return;
        DataManager.deleteHierarchy(bookId, path);
        this.renderBookCards();
        this.renderRegisterHierarchy();
    },
    
    deleteBook(bookId, event) {
        event.stopPropagation();
        if (!confirm('この問題集を削除しますか？')) return;
        DataManager.deleteBook(bookId);
        this.renderBookCards();
        this.renderRegisterHierarchy();
        this.updateHeatmapBookSelect();
        this.updateRadarBookSelect();
    },
    
    // CSV関連
    saveCSVTemplate() {
        const csvData = document.getElementById('importCsvData').value;
        const bookName = document.getElementById('importBookName').value || '未命名テンプレート';
        
        if (!csvData) {
            alert('CSVデータを入力してください');
            return;
        }
        
        const templateId = 'template_' + Date.now();
        DataManager.csvTemplates[templateId] = {
            id: templateId,
            name: bookName,
            data: csvData,
            createdAt: new Date().toISOString()
        };
        
        DataManager.saveCSVTemplates();
        this.renderCSVTemplateList();
        alert('テンプレートを保存しました');
    },
    
    editCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;
        
        document.getElementById('importBookName').value = template.name;
        document.getElementById('importCsvData').value = template.data;
    },
    
    applyCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;
        
        const bookName = prompt('問題集名を入力してください', template.name);
        if (!bookName) return;
        
        const numberingType = confirm('連番モードにしますか？（OKで連番、キャンセルでリセット）') ? 'continuous' : 'reset';
        
        document.getElementById('importBookName').value = bookName;
        document.querySelector(`input[name="importNumberingType"][value="${numberingType}"]`).checked = true;
        document.getElementById('importCsvData').value = template.data;
        
        this.importCSV();
    },
    
    deleteCSVTemplate(templateId) {
        if (confirm('このテンプレートを削除しますか？')) {
            delete DataManager.csvTemplates[templateId];
            DataManager.saveCSVTemplates();
            this.renderCSVTemplateList();
        }
    },
    
    importCSV() {
        const bookName = document.getElementById('importBookName').value;
        const csvData = document.getElementById('importCsvData').value;
        const numberingType = document.querySelector('input[name="importNumberingType"]:checked').value;
        
        if (!bookName || !csvData) {
            alert('問題集名とCSVデータを入力してください');
            return;
        }
        
        try {
            const lines = csvData.trim().split('\n');
            const bookId = DataManager.createBook(bookName, numberingType);
            const book = DataManager.books[bookId];
            
            let startIndex = 0;
            if (lines[0].includes('科目') || lines[0].includes('章')) {
                startIndex = 1;
            }
            
            for (let i = startIndex; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());
                const [subject, chapter, section, subsection, startNum, endNum] = parts;
                
                if (!subject) continue;
                
                // 階層構造を構築
                if (!book.structure[subject]) {
                    book.structure[subject] = {
                        type: 'subject',
                        children: {}
                    };
                }
                
                if (chapter) {
                    if (!book.structure[subject].children[chapter]) {
                        book.structure[subject].children[chapter] = {
                            type: 'chapter',
                            children: {}
                        };
                    }
                    
                    if (section) {
                        if (!book.structure[subject].children[chapter].children[section]) {
                            book.structure[subject].children[chapter].children[section] = {
                                type: 'section',
                                children: {}
                            };
                        }
                        
                        if (subsection) {
                            if (!book.structure[subject].children[chapter].children[section].children[subsection]) {
                                book.structure[subject].children[chapter].children[section].children[subsection] = {
                                    type: 'subsection'
                                };
                            }
                            
                            if (startNum && endNum) {
                                const questions = [];
                                for (let j = parseInt(startNum); j <= parseInt(endNum); j++) {
                                    questions.push(j);
                                }
                                book.structure[subject].children[chapter].children[section].children[subsection].questions = questions;
                            }
                        } else {
                            if (startNum && endNum) {
                                const questions = [];
                                for (let j = parseInt(startNum); j <= parseInt(endNum); j++) {
                                    questions.push(j);
                                }
                                book.structure[subject].children[chapter].children[section].questions = questions;
                            }
                        }
                    } else {
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
            
            DataManager.saveBooksToStorage();
            this.renderBookCards();
            this.updateHeatmapBookSelect();
            this.updateRadarBookSelect();
            
            alert('CSVデータをインポートしました');
            this.closeFooterModal();
        } catch (error) {
            alert('CSVの解析に失敗しました。形式を確認してください。');
            console.error(error);
        }
    }
};

// グローバルに公開
window.App = App;

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    App.init();
});

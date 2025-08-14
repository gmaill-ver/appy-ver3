/**
 * App - メインアプリケーションロジック
 */
class Application {
    constructor() {
        this.currentBook = null;
        this.currentPath = [];
        this.questionStates = {};
        this.bookmarkMode = false;
        this.expandedNodes = new Set();
        this.selectedBookCard = null;
        this.sortMode = false;
        this.analysisSortMode = false;
    }

    /**
     * アプリケーション初期化
     */
    async initialize() {
        try {
            // DataManagerの初期化を待つ
            await DataManager.initialize();
            
            // 初期描画
            this.renderBookCards();
            this.initializeSampleDataIfNeeded();
            
            // 他のモジュールの初期化は各モジュールのDOMContentLoadedで実行される
            
            console.log('Application initialized successfully');
            return true;
        } catch (error) {
            console.error('Application initialization error:', error);
            return false;
        }
    }

    /**
     * サンプルデータの初期化（必要な場合）
     */
    initializeSampleDataIfNeeded() {
        if (Object.keys(DataManager.books).length === 0) {
            DataManager.initializeSampleData();
            this.renderBookCards();
        }
    }

    /**
     * メインタブ切り替え
     */
    switchMainTab(tabName, event) {
        // タブボタンの状態更新
        document.querySelectorAll('.main-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        // タブコンテンツの切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabName + '-tab');
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // タブ別の初期化処理
        if (tabName === 'analysis') {
            Analytics.updateChartBars();
            Analytics.updateHeatmap();
            Analytics.updateWeaknessAnalysis();
            Analytics.updateHistoryContent();
        } else if (tabName === 'progress') {
            Analytics.updateProgressContent();
            Analytics.drawRadarChart();
        }
    }

    /**
     * フッタータブ切り替え
     */
    switchFooterTab(tabName, event) {
        const modal = document.getElementById('footerModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;

        const titles = {
            'register': '📝 問題集登録',
            'qa': '❓ 一問一答',
            'results': '🏆 獲得バッジ',
            'settings': '⚙️ 設定'
        };
        
        modalTitle.textContent = titles[tabName] || 'タイトル';
        
        switch(tabName) {
            case 'register':
                modalBody.innerHTML = this.getRegisterContent();
                setTimeout(() => this.renderRegisterHierarchy(), 100);
                break;
            case 'qa':
                modalBody.innerHTML = QAModule.renderQAContent();
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
    }

    /**
     * フッターモーダルを閉じる
     */
    closeFooterModal() {
        const modal = document.getElementById('footerModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 問題集カード表示
     */
    renderBookCards() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;

        let html = '';
        
        // 順序に従って表示
        const orderedBooks = DataManager.bookOrder
            .filter(id => DataManager.books[id])
            .map(id => DataManager.books[id]);
        
        // 順序に含まれない新しい本を追加
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
    }

    /**
     * 問題集カードの開閉
     */
    toggleBookCard(bookId) {
        const card = document.getElementById(`book-card-${bookId}`);
        if (!card) return;

        // 既に選択されているカードをクリックしたら閉じる
        if (this.selectedBookCard === bookId) {
            card.classList.remove('selected');
            this.selectedBookCard = null;
            this.currentBook = null;
            this.currentPath = [];
            
            const breadcrumb = document.getElementById('breadcrumb');
            const hierarchyContainer = document.getElementById('recordHierarchyContainer');
            const questionSection = document.getElementById('questionSection');
            
            if (breadcrumb) breadcrumb.style.display = 'none';
            if (hierarchyContainer) hierarchyContainer.style.display = 'none';
            if (questionSection) questionSection.style.display = 'none';
        } else {
            // 他のカードの選択を解除
            document.querySelectorAll('.book-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // 新しいカードを選択
            card.classList.add('selected');
            this.selectedBookCard = bookId;
            this.selectBook(bookId);
        }
    }

    /**
     * 問題集選択
     */
    selectBook(bookId) {
        this.currentBook = DataManager.books[bookId];
        this.currentPath = [];
        
        const breadcrumb = document.getElementById('breadcrumb');
        const questionSection = document.getElementById('questionSection');
        
        if (breadcrumb) breadcrumb.style.display = 'flex';
        if (questionSection) questionSection.style.display = 'none';
        
        this.updateBreadcrumb();
        this.renderRecordHierarchy();
    }

    /**
     * パンくずリスト更新
     */
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb || !this.currentBook) return;

        const items = [this.currentBook.name, ...this.currentPath];
        
        let html = '';
        items.forEach((item, index) => {
            if (index > 0) html += '<span class="breadcrumb-separator">›</span>';
            html += `<span class="breadcrumb-item ${index === items.length - 1 ? 'active' : ''}" 
                     onclick="App.navigateTo(${index - 1})">${item}</span>`;
        });
        
        breadcrumb.innerHTML = html;
    }

    /**
     * パンくずナビゲーション
     */
    navigateTo(index) {
        if (index === -1) {
            // 問題集レベルに戻る
            this.currentPath = [];
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        } else if (index >= 0 && index < this.currentPath.length) {
            // 指定パスに移動
            this.currentPath = this.currentPath.slice(0, index);
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        }
        this.updateBreadcrumb();
    }

    /**
     * 記録用階層表示
     */
    renderRecordHierarchy() {
        const container = document.getElementById('recordHierarchyContainer');
        if (!container || !this.currentBook) return;

        container.style.display = 'block';
        
        let structure = this.currentBook.structure;
        // パスがある場合は該当箇所まで移動
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
    }

    /**
     * 記録用階層レベル表示
     */
    renderRecordLevel(structure, basePath) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const currentPath = [...basePath, name];
            const pathStr = currentPath.join('/');
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = this.expandedNodes.has(pathStr);
            
            html += `<div class="hierarchy-item">`;
            
            if (item.questions) {
                // 問題がある場合はクリック可能
                html += `
                    <div class="hierarchy-row" onclick="App.showQuestions('${pathStr}')">
                        <span style="width: 28px;"></span>
                        <span class="hierarchy-icon">${this.getHierarchyIcon(item.type)}</span>
                        <span class="hierarchy-label">${name}</span>
                        <span class="hierarchy-meta">${item.questions.length}問</span>
                    </div>
                `;
                
                // 子要素があれば展開可能
                if (hasChildren) {
                    html += `
                        <div class="hierarchy-children ${isExpanded ? 'expanded' : ''}">
                            ${this.renderRecordLevel(item.children, currentPath)}
                        </div>
                    `;
                }
            } else if (hasChildren) {
                // 子要素がある場合
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
    }

    /**
     * 記録ノード展開/折りたたみ
     */
    toggleRecordNode(path, event) {
        event.stopPropagation();
        
        if (this.expandedNodes.has(path)) {
            this.expandedNodes.delete(path);
        } else {
            this.expandedNodes.add(path);
        }
        
        this.renderRecordHierarchy();
    }

    /**
     * 問題表示
     */
    showQuestions(pathStr) {
        const pathArray = pathStr.split('/');
        this.currentPath = pathArray;
        this.updateBreadcrumb();
        
        let current = this.currentBook.structure;
        for (let i = 0; i < pathArray.length; i++) {
            if (current[pathArray[i]]) {
                if (current[pathArray[i]].questions) {
                    const item = current[pathArray[i]];
                    
                    const hierarchyContainer = document.getElementById('recordHierarchyContainer');
                    const questionSection = document.getElementById('questionSection');
                    
                    if (hierarchyContainer) hierarchyContainer.style.display = 'none';
                    if (questionSection) questionSection.style.display = 'block';
                    
                    const grid = document.getElementById('questionGrid');
                    if (!grid) return;
                    
                    grid.innerHTML = '';
                    this.questionStates = {};
                    
                    // 章レベルで問題が多い場合の注記
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
                    
                    // 保存された状態を読み込み
                    this.loadQuestionStatesForPath();
                    return;
                }
                current = current[pathArray[i]].children || {};
            }
        }
    }

    /**
     * 問題状態の読み込み
     */
    loadQuestionStatesForPath() {
        if (!this.currentBook || this.currentPath.length === 0) return;

        const states = DataManager.getQuestionStates(this.currentBook.id, this.currentPath);
        if (states && Object.keys(states).length > 0) {
            this.questionStates = states;
            this.applyQuestionStates();
        }
    }

    /**
     * 問題状態の適用
     */
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
    }

    /**
     * 問題選択
     */
    toggleQuestion(num) {
        if (this.bookmarkMode) {
            this.questionStates[num].bookmarked = !this.questionStates[num].bookmarked;
            const cell = document.querySelector(`[data-number="${num}"]`);
            if (cell) {
                cell.classList.toggle('bookmarked');
            }
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
    }

    /**
     * 問題状態の保存
     */
    saveQuestionStatesForPath() {
        if (this.currentBook && this.currentPath.length > 0) {
            DataManager.saveQuestionStates(this.currentBook.id, this.currentPath, this.questionStates);
        }
    }

    /**
     * 正解マーク
     */
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
    }

    /**
     * 不正解マーク
     */
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
    }

    /**
     * ブックマークモード切り替え
     */
    toggleBookmarkMode() {
        this.bookmarkMode = !this.bookmarkMode;
        const btn = document.getElementById('bookmarkBtn');
        if (btn) {
            btn.classList.toggle('active');
        }
    }

    /**
     * 統計更新
     */
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
        
        const totalEl = document.getElementById('totalCount');
        const correctEl = document.getElementById('correctCount');
        const wrongEl = document.getElementById('wrongCount');
        const rateEl = document.getElementById('correctRate');
        
        if (totalEl) totalEl.textContent = total;
        if (correctEl) correctEl.textContent = correct;
        if (wrongEl) wrongEl.textContent = wrong;
        if (rateEl) rateEl.textContent = rate + '%';
    }

    /**
     * 記録保存
     */
    saveRecord() {
        if (!this.currentBook || this.currentPath.length === 0) {
            alert('問題を選択してください');
            return;
        }

        const total = parseInt(document.getElementById('totalCount')?.textContent || '0');
        if (total === 0) {
            alert('解答してください');
            return;
        }

        const record = {
            bookId: this.currentBook.id,
            bookName: this.currentBook.name,
            path: this.currentPath,
            questions: this.questionStates,
            timestamp: new Date().toISOString(),
            stats: {
                total: total,
                correct: parseInt(document.getElementById('correctCount')?.textContent || '0'),
                wrong: parseInt(document.getElementById('wrongCount')?.textContent || '0'),
                rate: document.getElementById('correctRate')?.textContent || '0%'
            }
        };
        
        DataManager.saveToHistory(record);
        DataManager.updateDailyStreak();
        
        alert('保存しました！');
    }

    /**
     * 問題集並び替えモード切り替え
     */
    toggleBookSort() {
        this.sortMode = !this.sortMode;
        this.renderBookCards();
        
        if (this.sortMode) {
            this.enableBookDragAndDrop();
        }
    }

    /**
     * 問題集ドラッグ&ドロップ有効化
     */
    enableBookDragAndDrop() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;

        let draggedElement = null;
        
        const cards = container.querySelectorAll('.book-card');
        cards.forEach(card => {
            card.draggable = true;
            
            card.addEventListener('dragstart', function(e) {
                draggedElement = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            card.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            card.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                
                const draggingCard = container.querySelector('.dragging');
                const afterElement = getDragAfterElement(container, e.clientY);
                
                if (afterElement == null) {
                    container.appendChild(draggingCard);
                } else {
                    container.insertBefore(draggingCard, afterElement);
                }
            });
            
            card.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                
                // 新しい順序を保存
                const newOrder = [];
                container.querySelectorAll('.book-card').forEach(c => {
                    const bookId = c.id.replace('book-card-', '');
                    newOrder.push(bookId);
                });
                DataManager.bookOrder = newOrder;
                DataManager.saveBookOrder();
                
                return false;
            });
        });
        
        // ドラッグ位置計算用のヘルパー関数
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.book-card:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }

    /**
     * 分析カード並び替えモード切り替え
     */
    toggleAnalysisSort() {
        this.analysisSortMode = !this.analysisSortMode;
        
        if (this.analysisSortMode) {
            this.enableAnalysisDragAndDrop();
        }
    }

    /**
     * 分析カードドラッグ&ドロップ有効化
     */
    enableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        let draggedElement = null;
        
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            card.draggable = true;
            card.classList.add('sortable-card');
            
            card.addEventListener('dragstart', function(e) {
                draggedElement = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            card.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            card.addEventListener('dragover', function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                
                const draggingCard = container.querySelector('.dragging');
                const afterElement = getDragAfterElement(container, e.clientY);
                
                if (afterElement == null) {
                    container.appendChild(draggingCard);
                } else {
                    container.insertBefore(draggingCard, afterElement);
                }
            });
            
            card.addEventListener('drop', function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                
                // 新しい順序を保存
                const newOrder = [];
                container.querySelectorAll('.card').forEach(c => {
                    const cardId = c.dataset.cardId;
                    if (cardId) newOrder.push(cardId);
                });
                DataManager.analysisCardOrder = newOrder;
                DataManager.saveAnalysisCardOrder();
                
                return false;
            });
        });
        
        // ドラッグ位置計算用のヘルパー関数
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }

    /**
     * アコーディオン開閉
     */
    toggleAccordion(header) {
        header.classList.toggle('active');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.toggle('active');
        }
    }

    /**
     * タイマーモーダルを開く
     */
    openTimerModal() {
        TimerModule.openModal();
    }

    /**
     * ダイアログ表示
     */
    showDialog(title, body, onConfirm) {
        const titleEl = document.getElementById('dialogTitle');
        const bodyEl = document.getElementById('dialogBody');
        const confirmBtn = document.getElementById('dialogConfirmBtn');
        const overlay = document.getElementById('dialogOverlay');
        const dialog = document.getElementById('inputDialog');
        
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = body;
        if (confirmBtn) confirmBtn.onclick = onConfirm;
        if (overlay) overlay.style.display = 'block';
        if (dialog) dialog.style.display = 'block';
    }

    /**
     * ダイアログを閉じる
     */
    closeDialog() {
        const overlay = document.getElementById('dialogOverlay');
        const dialog = document.getElementById('inputDialog');
        
        if (overlay) overlay.style.display = 'none';
        if (dialog) dialog.style.display = 'none';
    }

    /**
     * 階層アイコン取得
     */
    getHierarchyIcon(type) {
        const icons = {
            'subject': '📂',
            'chapter': '📄',
            'section': '📑',
            'subsection': ''
        };
        return icons[type] || '📄';
    }

    /**
     * 登録コンテンツ生成
     */
    getRegisterContent() {
        return `
            <div class="save-button" style="margin: 10px;" onclick="App.showNewBookDialog()">新規作成</div>
            <div class="save-button" style="margin: 10px; background: var(--secondary);" onclick="App.showBookListDialog()">問題集一覧</div>
            <div style="margin-top: 20px;">
                <h4 style="padding: 0 10px;">登録済み問題集</h4>
                <div id="registerHierarchy"></div>
            </div>
        `;
    }

    /**
     * 登録階層表示
     */
    renderRegisterHierarchy() {
        const container = document.getElementById('registerHierarchy');
        if (!container) return;

        let html = '<div class="hierarchy-list">';
        
        Object.values(DataManager.books).forEach(book => {
            const nodeId = `book_${book.id}`;
            const isExpanded = this.expandedNodes.has(nodeId);
            
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
    }

    /**
     * 登録階層レベル表示
     */
    renderRegisterLevel(structure, bookId, path) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const currentPath = [...path, name];
            const nodeId = `${bookId}_${currentPath.join('_')}`;
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = this.expandedNodes.has(nodeId);
            
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
    }

    /**
     * 登録ノード展開/折りたたみ
     */
    toggleRegisterNode(nodeId, event) {
        event.stopPropagation();
        
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        this.renderRegisterHierarchy();
    }

    /**
     * 新規問題集作成ダイアログ
     */
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
        
        this.showDialog('新規問題集作成', dialogBody, () => {
            const name = document.getElementById('newBookName')?.value;
            const numberingType = document.querySelector('input[name="numberingType"]:checked')?.value;
            
            if (!name) {
                alert('問題集名を入力してください');
                return;
            }
            
            const bookId = 'book_' + Date.now();
            DataManager.books[bookId] = {
                id: bookId,
                name: name,
                examType: 'gyousei',
                numberingType: numberingType || 'reset',
                structure: {},
                createdAt: new Date().toISOString()
            };
            
            DataManager.bookOrder.push(bookId);
            DataManager.saveBooksToStorage();
            DataManager.saveBookOrder();
            
            this.renderBookCards();
            this.renderRegisterHierarchy();
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
            
            this.closeDialog();
            alert('作成しました');
        });
    }

    /**
     * 問題集一覧ダイアログ
     */
    showBookListDialog() {
        let dialogBody = '<div style="max-height: 400px; overflow-y: auto;">';
        
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
                            <button class="hierarchy-action delete" onclick="App.deleteBook('${book.id}', event)" title="削除">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        dialogBody += '</div>';
        
        this.showDialog('問題集一覧', dialogBody, () => {
            this.closeDialog();
        });
    }

    /**
     * 問題集プロパティ編集
     */
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
        
        this.showDialog('問題集を編集', dialogBody, () => {
            const newName = document.getElementById('editBookName')?.value;
            const newNumberingType = document.querySelector('input[name="editNumberingType"]:checked')?.value;
            
            if (newName) {
                book.name = newName;
                book.numberingType = newNumberingType || 'reset';
                DataManager.saveBooksToStorage();
                this.renderBookCards();
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
                this.closeDialog();
                this.showBookListDialog();
            }
        });
    }

    /**
     * 階層追加
     */
    addHierarchy(bookId, parentPath, type, event) {
        event.stopPropagation();
        
        const book = DataManager.books[bookId];
        if (!book) return;

        let dialogBody = `
            <div class="form-group">
                <label class="form-label">${this.getTypeLabel(type)}の名前</label>
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
            
            if (book.numberingType === 'continuous') {
                dialogBody += `
                    <div style="font-size: 12px; color: var(--gray); margin-top: -10px; margin-bottom: 10px;">
                        ※ 連番モード：全体を通した番号を入力
                    </div>
                `;
            } else {
                dialogBody += `
                    <div style="font-size: 12px; color: var(--gray); margin-top: -10px; margin-bottom: 10px;">
                        ※ リセットモード：この項目内での番号を入力
                    </div>
                `;
            }
        }
        
        this.showDialog(`${this.getTypeLabel(type)}を追加`, dialogBody, () => {
            const name = document.getElementById('hierarchyName')?.value;
            if (!name) {
                alert('名前を入力してください');
                return;
            }
            
            let questions = null;
            if (type === 'chapter' || type === 'section' || type === 'subsection') {
                const start = parseInt(document.getElementById('questionStart')?.value || '0');
                const end = parseInt(document.getElementById('questionEnd')?.value || '0');
                
                if (start && end && start <= end) {
                    questions = [];
                    for (let i = start; i <= end; i++) {
                        questions.push(i);
                    }
                }
            }
            
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
            
            DataManager.saveBooksToStorage();
            this.renderBookCards();
            this.renderRegisterHierarchy();
            this.closeDialog();
        });
    }

    /**
     * 階層編集
     */
    editHierarchy(bookId, path, event) {
        event.stopPropagation();
        
        const book = DataManager.books[bookId];
        if (!book) return;

        const pathArray = path.split('/');
        let current = book.structure;
        let parent = null;
        let lastKey = pathArray[pathArray.length - 1];
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            parent = current;
            current = current[pathArray[i]].children || {};
        }
        
        const item = current[lastKey] || (parent ? parent[lastKey] : null);
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
        
        this.showDialog('編集', dialogBody, () => {
            const newName = document.getElementById('editName')?.value;
            if (!newName) {
                alert('名前を入力してください');
                return;
            }
            
            // 名前の変更
            if (newName !== lastKey) {
                current[newName] = current[lastKey];
                delete current[lastKey];
            }
            
            // 問題番号の変更
            if (item.type === 'chapter' || item.type === 'section' || item.type === 'subsection') {
                const start = parseInt(document.getElementById('editQuestionStart')?.value || '0');
                const end = parseInt(document.getElementById('editQuestionEnd')?.value || '0');
                
                if (start && end && start <= end) {
                    const questions = [];
                    for (let i = start; i <= end; i++) {
                        questions.push(i);
                    }
                    current[newName].questions = questions;
                } else {
                    delete current[newName].questions;
                }
            }
            
            DataManager.saveBooksToStorage();
            this.renderBookCards();
            this.renderRegisterHierarchy();
            this.closeDialog();
        });
    }

    /**
     * 階層削除
     */
    deleteHierarchy(bookId, path, event) {
        event.stopPropagation();
        
        if (!confirm('この項目を削除しますか？')) return;

        const book = DataManager.books[bookId];
        if (!book) return;

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
        
        DataManager.saveBooksToStorage();
        this.renderBookCards();
        this.renderRegisterHierarchy();
    }

    /**
     * 問題集削除
     */
    deleteBook(bookId, event) {
        event.stopPropagation();
        
        if (!confirm('この問題集を削除しますか？')) return;

        delete DataManager.books[bookId];
        DataManager.bookOrder = DataManager.bookOrder.filter(id => id !== bookId);
        DataManager.saveBooksToStorage();
        DataManager.saveBookOrder();
        
        this.renderBookCards();
        this.renderRegisterHierarchy();
        Analytics.updateHeatmapBookSelect();
        Analytics.updateRadarBookSelect();
    }

    /**
     * タイプラベル取得
     */
    getTypeLabel(type) {
        const labels = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        return labels[type] || type;
    }

    /**
     * 実績コンテンツ生成
     */
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
    }

    /**
     * 設定コンテンツ生成
     */
    getSettingsContent() {
        const currentExamDate = DataManager.examDate 
            ? DataManager.examDate.toISOString().split('T')[0] 
            : '';
        
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
                        民法,総則,意思能力,,6,8<br>
                        民法,物権,物権変動,対抗要件,1,10<br>
                        行政法,行政主体,,,1,20<br>
                        <br>
                        ※ 空欄は省略可能です<br>
                        ※ 連番モードでは全体の通し番号を入力<br>
                        ※ リセットモードでは各項目内での番号を入力
                    </div>
                    
                    <button class="save-button" style="margin-top: 15px;" onclick="App.saveCSVTemplate()">テンプレートとして保存</button>
                    <button class="save-button" style="margin-top: 10px; background: var(--success);" onclick="App.importCSV()">CSVを問題集に適用</button>
                    
                    <h5 style="margin-top: 20px;">保存済みテンプレート</h5>
                    <div class="csv-list" id="csvTemplateList"></div>
                </div>
            </div>
            
            <div class="card" style="margin: 10px;">
                <h4>📥 一問一答CSVインポート</h4>
                <div class="import-section">
                    <label class="form-label">問題集名</label>
                    <input type="text" class="form-control" id="importQASetName" placeholder="問題集名を入力">
                    
                    <label class="form-label" style="margin-top: 15px;">CSV形式の問題データ</label>
                    <textarea class="import-textarea" id="importQACsvData" placeholder="CSV形式のデータを貼り付けてください"></textarea>
                    
                    <div class="import-help">
                        <strong>CSV形式の例：</strong><br>
                        問題,答え<br>
                        "日本国憲法が保障する基本的人権の中で、最も重要とされる権利は何か？","個人の尊厳（憲法13条）"<br>
                        "行政行為の効力のうち、公定力とは何か？","行政行為が違法であっても、権限ある機関により取り消されるまでは有効として扱われる効力"
                    </div>
                    
                    <button class="save-button" style="margin-top: 15px;" onclick="App.importQACSV()">一問一答をインポート</button>
                </div>
            </div>
            
            <div class="card" style="margin: 10px;">
                <button class="save-button" style="background: var(--danger);" onclick="DataManager.clearAllData()">すべてのデータを削除</button>
            </div>
        `;
    }

    /**
     * CSVテンプレートリスト表示
     */
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
    }

    /**
     * CSVテンプレート保存
     */
    saveCSVTemplate() {
        const csvData = document.getElementById('importCsvData')?.value;
        const bookName = document.getElementById('importBookName')?.value || '未命名テンプレート';
        
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
    }

    /**
     * CSVテンプレート編集
     */
    editCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;

        const nameEl = document.getElementById('importBookName');
        const dataEl = document.getElementById('importCsvData');
        
        if (nameEl) nameEl.value = template.name;
        if (dataEl) dataEl.value = template.data;
    }

    /**
     * CSVテンプレート適用
     */
    applyCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;

        const bookName = prompt('問題集名を入力してください', template.name);
        if (!bookName) return;

        const numberingType = confirm('連番モードにしますか？（OKで連番、キャンセルでリセット）') 
            ? 'continuous' 
            : 'reset';
        
        if (DataManager.importCSV(bookName, template.data, numberingType)) {
            this.renderBookCards();
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
            alert('CSVデータをインポートしました');
        } else {
            alert('インポートに失敗しました');
        }
    }

    /**
     * CSVテンプレート削除
     */
    deleteCSVTemplate(templateId) {
        if (confirm('このテンプレートを削除しますか？')) {
            delete DataManager.csvTemplates[templateId];
            DataManager.saveCSVTemplates();
            this.renderCSVTemplateList();
        }
    }

    /**
     * CSVインポート
     */
    importCSV() {
        const bookName = document.getElementById('importBookName')?.value;
        const csvData = document.getElementById('importCsvData')?.value;
        const numberingType = document.querySelector('input[name="importNumberingType"]:checked')?.value;
        
        if (!bookName || !csvData) {
            alert('問題集名とCSVデータを入力してください');
            return;
        }
        
        if (DataManager.importCSV(bookName, csvData, numberingType || 'reset')) {
            this.renderBookCards();
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
            alert('CSVデータをインポートしました');
            this.closeFooterModal();
        } else {
            alert('CSVの解析に失敗しました。形式を確認してください。');
        }
    }

    /**
     * 一問一答CSVインポート
     */
    importQACSV() {
        const setName = document.getElementById('importQASetName')?.value;
        const csvData = document.getElementById('importQACsvData')?.value;
        
        if (!setName || !csvData) {
            alert('問題集名とCSVデータを入力してください');
            return;
        }
        
        if (QAModule.importFromCSV(setName, csvData)) {
            this.closeFooterModal();
        }
    }

    /**
     * 試験日保存
     */
    saveExamDate() {
        const input = document.getElementById('examDateInput');
        if (input && input.value) {
            const examDate = new Date(input.value);
            DataManager.saveExamDate(examDate);
            UIComponents.updateExamCountdown();
            alert('試験日を設定しました');
            this.closeFooterModal();
        }
    }
}

// グローバルに公開
window.App = new Application();

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', async () => {
    await App.initialize();
});

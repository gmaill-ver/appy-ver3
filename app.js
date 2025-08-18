/**
 * Application - メインアプリケーションクラス（完全版）
 * 階層順序固定・問題セル自動保存・全機能対応版
 */
class Application {
    constructor() {
        this.currentBook = null;
        this.currentPath = [];
        this.questionStates = {};
        this.expandedNodes = new Set();
        this.bookmarkMode = false;
        this.sortMode = false;
        this.hierarchySortMode = {};
        this.analysisSortMode = false;
        this.draggedElement = null;
        this.currentQuestionIndex = 0;
        this.questionsPerPage = 50;
    }

    async initialize() {
        try {
            await DataManager.initialize();
            this.renderBookCards();
            this.initializeSampleDataIfNeeded();
            await this.waitForModules();
        } catch (error) {
            console.error('Application initialization failed:', error);
        }
    }

    async waitForModules() {
        let attempts = 0;
        while (attempts < 10) {
            if (window.Analytics && window.UIComponents && window.TimerModule) {
                console.log('All modules loaded');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('Some modules may not be loaded');
        return false;
    }

    initializeSampleDataIfNeeded() {
        if (Object.keys(DataManager.books).length === 0) {
            DataManager.initializeSampleData();
            this.renderBookCards();
        }
    }

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
        
        // タブ別の初期化処理（Analyticsが初期化されているか確認）
        if (tabName === 'analysis' && window.Analytics) {
            // 分析タブ：最新データで更新
            setTimeout(() => {
                Analytics.updateChartBars();
                Analytics.updateHeatmap();
                Analytics.updateWeaknessAnalysis();
                Analytics.updateHistoryContent();
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
            }, 100);
        } else if (tabName === 'progress' && window.Analytics) {
            // 進捗タブ：最新データで強制更新
            setTimeout(() => {
                Analytics.updateProgressContent();
                Analytics.drawRadarChart();
                Analytics.updateRadarBookSelect();
                Analytics.updateHeatmapBookSelect();
            }, 100);
        }
    }

    renderBookCards() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;

        if (!DataManager.books || Object.keys(DataManager.books).length === 0) {
            container.innerHTML = '<p class="empty-state">問題集がありません</p>';
            return;
        }

        let html = '<div class="cards-grid">';
        
        // ★修正: bookOrderを使用して順序を保持
        DataManager.bookOrder.forEach(bookId => {
            const book = DataManager.books[bookId];
            if (!book || DataManager.isDeleted('books', bookId)) return;
            
            const questionCount = DataManager.countQuestionsInBook(book);
            
            html += `
                <div class="book-card${this.sortMode ? ' sortable' : ''}" id="book-card-${book.id}" onclick="App.selectBook('${book.id}')">
                    <div class="book-icon">${this.getBookIcon(book.examType)}</div>
                    <h3 class="book-title">${book.name}</h3>
                    <p class="book-info">
                        問題数: ${questionCount}問<br>
                        番号: ${book.numberingType === 'reset' ? '項目ごとリセット' : '連番'}
                    </p>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    getBookIcon(examType) {
        const icons = {
            'gyousei': '📋',
            'shihousyoshi': '⚖️',
            'other': '📚'
        };
        return icons[examType] || '📚';
    }

    selectBook(bookId) {
        this.currentBook = DataManager.books[bookId];
        if (!this.currentBook) return;

        this.currentPath = [];
        
        document.getElementById('homeView').style.display = 'none';
        document.getElementById('studyView').style.display = 'block';
        
        this.updateBreadcrumb();
        this.renderRecordHierarchy();
    }

    goHome() {
        document.getElementById('studyView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        this.currentBook = null;
        this.currentPath = [];
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb || !this.currentBook) return;

        let html = `<span class="breadcrumb-item" onclick="App.goHome()">📚 ホーム</span>`;
        html += ` &gt; <span class="breadcrumb-item" onclick="App.goToBookRoot()">${this.currentBook.name}</span>`;
        
        this.currentPath.forEach((item, index) => {
            const path = this.currentPath.slice(0, index + 1);
            html += ` &gt; <span class="breadcrumb-item" onclick="App.goToPath('${path.join('/')}')">${item}</span>`;
        });

        breadcrumb.innerHTML = html;
    }

    goToBookRoot() {
        this.currentPath = [];
        this.updateBreadcrumb();
        this.renderRecordHierarchy();
        
        const hierarchyContainer = document.getElementById('recordHierarchyContainer');
        const questionSection = document.getElementById('questionSection');
        
        if (hierarchyContainer) hierarchyContainer.style.display = 'block';
        if (questionSection) questionSection.style.display = 'none';
    }

    goToPath(pathStr) {
        this.currentPath = pathStr.split('/');
        this.updateBreadcrumb();
        this.renderRecordHierarchy();
        
        const hierarchyContainer = document.getElementById('recordHierarchyContainer');
        const questionSection = document.getElementById('questionSection');
        
        if (hierarchyContainer) hierarchyContainer.style.display = 'block';
        if (questionSection) questionSection.style.display = 'none';
    }

    renderRecordHierarchy() {
        const container = document.getElementById('recordHierarchy');
        if (!container || !this.currentBook) return;

        let current = this.currentBook.structure;
        for (const segment of this.currentPath) {
            if (current[segment] && current[segment].children) {
                current = current[segment].children;
            } else {
                container.innerHTML = '<p>階層が見つかりません</p>';
                return;
            }
        }

        container.innerHTML = this.renderRecordLevel(current, this.currentPath);
    }

    renderRecordLevel(structure, parentPath) {
        if (!structure || Object.keys(structure).length === 0) {
            return '<p style="color: var(--gray); text-align: center;">項目がありません</p>';
        }

        let html = '';
        
        // ★修正: キーをソートして順序を固定
        const sortedKeys = Object.keys(structure).sort();
        sortedKeys.forEach(name => {
            const item = structure[name];
            const currentPath = [...parentPath, name];
            const pathStr = currentPath.join('/');
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const hasQuestions = item.questions && item.questions.length > 0;
            const isExpanded = this.expandedNodes.has(pathStr);
            
            html += '<div class="hierarchy-item">';
            
            if (hasQuestions) {
                html += `
                    <div class="hierarchy-row clickable" onclick="App.showQuestions('${pathStr}')">
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
    }

    toggleRecordNode(path, event) {
        event.stopPropagation();
        
        if (this.expandedNodes.has(path)) {
            this.expandedNodes.delete(path);
        } else {
            this.expandedNodes.add(path);
        }
        
        this.renderRecordHierarchy();
    }

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
                    
                    this.renderQuestionGrid(item.questions);
                    this.loadQuestionStatesForPath();
                    return;
                }
                current = current[pathArray[i]].children || {};
            }
        }
    }

    renderQuestionGrid(questions) {
        const grid = document.getElementById('questionGrid');
        if (!grid) return;

        grid.innerHTML = '';
        this.questionStates = {};
        this.currentQuestionIndex = 0;

        // 年度別過去問の場合の注記
        if (questions.length > 50) {
            const note = document.createElement('div');
            note.style.cssText = 'grid-column: 1 / -1; font-size: 11px; color: var(--gray); padding: 5px;';
            note.textContent = `※ ${questions.length}問 - 年度別過去問`;
            grid.appendChild(note);
        }

        // ページネーション対応
        const startIndex = this.currentQuestionIndex;
        const endIndex = Math.min(startIndex + this.questionsPerPage, questions.length);
        const visibleQuestions = questions.slice(startIndex, endIndex);

        visibleQuestions.forEach((num, index) => {
            const cell = document.createElement('div');
            cell.className = 'question-cell';
            cell.textContent = num;
            cell.dataset.number = num;
            cell.onclick = () => this.selectQuestionCell(num);
            
            grid.appendChild(cell);
            
            this.questionStates[num] = {
                state: null,
                bookmarked: false
            };
        });

        // ページネーション情報更新
        this.updatePaginationInfo(questions.length);
    }

    updatePaginationInfo(totalQuestions) {
        const currentPage = Math.floor(this.currentQuestionIndex / this.questionsPerPage) + 1;
        const totalPages = Math.ceil(totalQuestions / this.questionsPerPage);
        
        // ページ情報を表示
        const pageInfo = document.createElement('div');
        pageInfo.style.cssText = 'text-align: center; margin: 10px 0; font-size: 14px; color: var(--gray);';
        pageInfo.textContent = `${currentPage} / ${totalPages} ページ (${totalQuestions}問中 ${this.currentQuestionIndex + 1}-${Math.min(this.currentQuestionIndex + this.questionsPerPage, totalQuestions)}問を表示)`;
        
        const grid = document.getElementById('questionGrid');
        if (grid) {
            grid.appendChild(pageInfo);
        }
    }

    navigateQuestion(direction) {
        if (!this.currentBook || this.currentPath.length === 0) return;

        // 現在の問題集の全問題数を取得
        let current = this.currentBook.structure;
        for (const segment of this.currentPath) {
            current = current[segment];
        }
        
        if (!current || !current.questions) return;

        const totalQuestions = current.questions.length;
        const newIndex = this.currentQuestionIndex + (direction * this.questionsPerPage);

        if (newIndex >= 0 && newIndex < totalQuestions) {
            this.currentQuestionIndex = newIndex;
            this.renderQuestionGrid(current.questions);
            this.loadQuestionStatesForPath();
        }
    }

    selectQuestionCell(number) {
        if (this.bookmarkMode) {
            this.toggleQuestionBookmark(number);
        } else {
            this.toggleQuestionState(number);
        }
        // ★追加: 自動保存
        this.saveQuestionStatesForPath();
    }

    toggleQuestionState(number) {
        const cell = document.querySelector(`[data-number="${number}"]`);
        if (!cell) return;
        
        const state = this.questionStates[number];
        
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
        
        this.updateStats();
        // ★追加: 変更時に即座に保存
        DataManager.saveQuestionStates(this.currentBook.id, this.currentPath, this.questionStates);
    }

    toggleQuestionBookmark(number) {
        const cell = document.querySelector(`[data-number="${number}"]`);
        if (!cell) return;
        
        this.questionStates[number].bookmarked = !this.questionStates[number].bookmarked;
        cell.classList.toggle('bookmarked');
        
        this.saveQuestionStatesForPath();
    }

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

    loadQuestionStatesForPath() {
        if (!this.currentBook || this.currentPath.length === 0) return;

        const states = DataManager.getQuestionStates(this.currentBook.id, this.currentPath);
        if (states && Object.keys(states).length > 0) {
            // 現在表示中の問題のみ状態を復元
            Object.keys(this.questionStates).forEach(num => {
                if (states[num]) {
                    this.questionStates[num] = states[num];
                }
            });
            this.applyQuestionStates();
        }
    }

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

    saveQuestionStatesForPath() {
        if (this.currentBook && this.currentPath.length > 0) {
            DataManager.saveQuestionStates(this.currentBook.id, this.currentPath, this.questionStates);
        }
    }

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

    toggleBookmarkMode() {
        this.bookmarkMode = !this.bookmarkMode;
        const btn = document.getElementById('bookmarkBtn');
        if (btn) {
            btn.classList.toggle('active');
        }
    }

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

    toggleBookSort() {
        this.sortMode = !this.sortMode;
        const btn = document.querySelector('.book-order-btn');
        if (btn) {
            btn.textContent = this.sortMode ? '完了' : '並替え';
            btn.style.background = this.sortMode ? 'var(--success)' : 'var(--primary)';
        }
        
        this.renderBookCards();
        
        if (this.sortMode) {
            this.enableBookDragAndDrop();
        }
    }

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

    toggleAnalysisSort() {
        this.analysisSortMode = !this.analysisSortMode;
        
        // ボタンのテキストと色を更新
        const btn = document.querySelector('.card-sort-btn');
        if (btn) {
            btn.textContent = this.analysisSortMode ? '完了' : '並替え';
            btn.style.background = this.analysisSortMode ? '#27ae60' : '';
        }
        
        if (this.analysisSortMode) {
            this.enableAnalysisDragAndDrop();
        } else {
            this.disableAnalysisDragAndDrop();
            // 順序を保存
            DataManager.saveAnalysisCardOrder();
        }
    }

    enableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        const cards = container.querySelectorAll('.accordion');
        cards.forEach(card => {
            card.draggable = true;
            card.classList.add('sortable');
            
            card.addEventListener('dragstart', function(e) {
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            card.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            card.addEventListener('dragover', function(e) {
                e.preventDefault();
                const draggingCard = container.querySelector('.dragging');
                const afterElement = getDragAfterElement(container, e.clientY);
                
                if (afterElement == null) {
                    container.appendChild(draggingCard);
                } else {
                    container.insertBefore(draggingCard, afterElement);
                }
            });
        });
        
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.accordion:not(.dragging)')];
            
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

    disableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        const cards = container.querySelectorAll('.accordion');
        cards.forEach(card => {
            card.draggable = false;
            card.classList.remove('sortable', 'dragging');
            
            // イベントリスナーをクローンして削除
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
    }

    toggleAccordion(header) {
        // 並び替えモードの時はアコーディオンを開閉しない
        if (this.analysisSortMode) {
            return;
        }
        
        header.classList.toggle('active');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.toggle('active');
        }
    }

    openTimerModal() {
        if (window.TimerModule && typeof TimerModule.openModal === 'function') {
            TimerModule.openModal();
        }
    }

    switchFooterTab(tabName, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // アクティブタブの切り替え
        document.querySelectorAll('.footer-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.closest('.footer-tab').classList.add('active');
        
        // モーダルの表示
        const modal = document.getElementById('footerModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = modal.querySelector('.modal-footer');
        
        if (!modal || !modalTitle || !modalBody) return;

        const titles = {
            'register': '📝 問題集登録',
            'qa': '❓ 一問一答',
            'keypoints': '📚 要点確認',
            'results': '🏆 獲得バッジ',
            'settings': '⚙️ 設定'
        };
        
        modalTitle.textContent = titles[tabName] || 'タイトル';
        
        // モーダルヘッダーを動的に再構築（要点確認以外の場合のみ）
        const modalHeader = modal.querySelector('.modal-header');
        if (modalHeader && tabName !== 'keypoints') {
            // 要点確認以外の場合：通常ヘッダー
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">${titles[tabName]}</h3>
                <button class="modal-close" style="width: 30px; height: 30px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="App.closeFooterModal()">×</button>
            `;
        } else if (modalHeader && tabName === 'keypoints') {
            // 要点確認の場合：初期状態は通常ヘッダー（重要語句ボタンはコンテンツ表示時のみ追加）
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">${titles[tabName]}</h3>
                <button class="modal-close" style="width: 30px; height: 30px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="App.closeFooterModal()">×</button>
            `;
        }
        
        // モーダルフッターを動的に再構築
        if (modalFooter) {
            if (tabName === 'keypoints') {
                // 要点確認の場合：戻るボタン + 閉じるボタン
                modalFooter.innerHTML = `
                    <div style="display: flex; gap: 10px;">
                        <button id="modalBackBtn" style="background: var(--gray); color: white; border: none; border-radius: 10px; padding: 15px 20px; cursor: pointer; font-size: 16px; font-weight: 600;" onclick="KeyPointsModule.backToSubjectList()">↩️ 戻る</button>
                        <button class="modal-close-bottom" style="flex: 1;" onclick="App.closeFooterModal()">閉じる</button>
                    </div>
                `;
            } else {
                // その他の場合：閉じるボタンのみ
                modalFooter.innerHTML = `
                    <button class="modal-close-bottom" onclick="App.closeFooterModal()">閉じる</button>
                `;
            }
        }
        
        switch(tabName) {
            case 'register':
                modalBody.innerHTML = this.getRegisterContent();
                setTimeout(() => this.renderRegisterHierarchy(), 100);
                break;
            case 'qa':
                if (window.QAModule && typeof QAModule.renderQAContent === 'function') {
                    modalBody.innerHTML = QAModule.renderQAContent();
                } else {
                    modalBody.innerHTML = '<p>一問一答モジュールを読み込み中...</p>';
                }
                break;
            case 'keypoints':
                if (window.KeyPointsModule && typeof KeyPointsModule.renderKeyPointsContent === 'function') {
                    modalBody.innerHTML = KeyPointsModule.renderKeyPointsContent();
                    // KeyPointsModuleにヘッダー制御を委ねるため、ここでは重要語句ボタンを追加しない
                } else {
                    modalBody.innerHTML = '<p>要点確認モジュールを読み込み中...</p>';
                }
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

    closeFooterModal() {
        const modal = document.getElementById('footerModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // アクティブタブをリセット
        document.querySelectorAll('.footer-tab').forEach(tab => {
            tab.classList.remove('active');
        });
    }

    getHierarchyIcon(type) {
        const icons = {
            'subject': '📂',
            'chapter': '📄',
            'section': '📑',
            'subsection': ''
        };
        return icons[type] || '📄';
    }

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

    renderRegisterHierarchy() {
        const container = document.getElementById('registerHierarchy');
        if (!container) {
            console.warn('registerHierarchy element not found');
            return;
        }

        if (!DataManager.books || Object.keys(DataManager.books).length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 20px;">問題集がありません</p>';
            return;
        }

        let html = '<div class="hierarchy-list">';
        
        Object.values(DataManager.books).forEach(book => {
            // 削除済みの問題集は表示しない
            if (DataManager.isDeleted('books', book.id)) {
                return;
            }
            
            const nodeId = `book_${book.id}`;
            const isExpanded = this.expandedNodes.has(nodeId);
            
            html += `
                <div class="hierarchy-item">
                    <div class="hierarchy-row" onclick="App.toggleRegisterNode('${nodeId}', event)">
                        <span class="hierarchy-toggle ${isExpanded ? 'expanded' : ''}">▶</span>
                        <span class="hierarchy-icon">📚</span>
                        <span class="hierarchy-label">${book.name}</span>
                        <div class="hierarchy-actions">
                            <button class="hierarchy-action sort" onclick="App.toggleHierarchySort('${book.id}', event)" title="並び替え">並替え</button>
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

    renderRegisterLevel(structure, bookId, parentPath = []) {
        if (!structure || Object.keys(structure).length === 0) {
            return '';
        }
        
        let html = '<div class="hierarchy-children-list">';
        
        // ★追加: キーをソートして順序を固定
        const sortedKeys = Object.keys(structure).sort();
        sortedKeys.forEach(name => {
            const item = structure[name];
            const currentPath = [...parentPath, name];
            const nodeId = `register_${bookId}_${currentPath.join('_')}`;
            const isExpanded = this.expandedNodes.has(nodeId);
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            
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
        
        html += '</div>';
        return html;
    }

    toggleRegisterNode(nodeId, event) {
        event.stopPropagation();
        
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        this.renderRegisterHierarchy();
    }

    toggleHierarchySort(bookId, event) {
        event.stopPropagation();
        
        const book = DataManager.books[bookId];
        if (!book) return;
        
        // 並び替えモードフラグ
        if (!this.hierarchySortMode) {
            this.hierarchySortMode = {};
        }
        
        this.hierarchySortMode[bookId] = !this.hierarchySortMode[bookId];
        
        if (this.hierarchySortMode[bookId]) {
            this.enableHierarchyDragAndDrop(bookId);
        } else {
            this.disableHierarchyDragAndDrop(bookId);
            DataManager.saveBooksToStorage();
            alert('並び替えを保存しました');
        }
        
        // ボタンのテキストを更新
        const btn = event.target;
        if (btn) {
            btn.textContent = this.hierarchySortMode[bookId] ? '完了' : '並替え';
            btn.style.background = this.hierarchySortMode[bookId] ? '#27ae60' : '';
        }
    }

    enableHierarchyDragAndDrop(bookId) {
        const book = DataManager.books[bookId];
        if (!book) return;
        
        // 科目レベルで並び替え
        const container = document.querySelector(`#book_${bookId}`).closest('.hierarchy-item');
        if (!container) return;
        
        const subjects = container.querySelectorAll('.hierarchy-children > .hierarchy-item');
        
        subjects.forEach(subject => {
            subject.draggable = true;
            subject.style.cursor = 'move';
            
            subject.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedElement = subject;
                subject.style.opacity = '0.5';
            });
            
            subject.addEventListener('dragend', (e) => {
                e.stopPropagation();
                subject.style.opacity = '';
            });
            
            subject.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            subject.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (this.draggedElement && this.draggedElement !== subject) {
                    const parent = subject.parentNode;
                    const draggedIndex = Array.from(parent.children).indexOf(this.draggedElement);
                    const targetIndex = Array.from(parent.children).indexOf(subject);
                    
                    if (draggedIndex < targetIndex) {
                        parent.insertBefore(this.draggedElement, subject.nextSibling);
                    } else {
                        parent.insertBefore(this.draggedElement, subject);
                    }
                    
                    // データ構造を更新
                    this.updateBookStructureOrder(bookId);
                }
            });
        });
    }

    disableHierarchyDragAndDrop(bookId) {
        const container = document.querySelector(`#book_${bookId}`).closest('.hierarchy-item');
        if (!container) return;
        
        const subjects = container.querySelectorAll('.hierarchy-children > .hierarchy-item');
        subjects.forEach(subject => {
            subject.draggable = false;
            subject.style.cursor = '';
            // イベントリスナーは残しておく（再度有効化する場合のため）
        });
    }

    updateBookStructureOrder(bookId) {
        // DOM順序に基づいて書籍構造を更新
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const container = document.querySelector(`#book_${bookId}`).closest('.hierarchy-item');
        if (!container) return;
        
        const newStructure = {};
        const subjects = container.querySelectorAll('.hierarchy-children > .hierarchy-item');
        
        subjects.forEach(subject => {
            const label = subject.querySelector('.hierarchy-label').textContent;
            if (book.structure[label]) {
                newStructure[label] = book.structure[label];
            }
        });
        
        book.structure = newStructure;
    }

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
            
            // Analyticsが存在する場合のみ更新
            if (window.Analytics) {
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
            }
            
            this.closeDialog();
            alert('作成しました');
        });
    }

    showBookListDialog() {
        let dialogBody = '<div style="max-height: 400px; overflow-y: auto;">';
        
        Object.values(DataManager.books).forEach(book => {
            // 削除済みの問題集は表示しない
            if (DataManager.isDeleted('books', book.id)) {
                return;
            }
            
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
        
        this.showDialog('問題集編集', dialogBody, () => {
            const newName = document.getElementById('editBookName')?.value;
            const newNumberingType = document.querySelector('input[name="editNumberingType"]:checked')?.value;
            
            if (!newName) {
                alert('問題集名を入力してください');
                return;
            }
            
            book.name = newName;
            book.numberingType = newNumberingType || 'reset';
            
            DataManager.saveBooksToStorage();
            this.renderBookCards();
            this.renderRegisterHierarchy();
            this.closeDialog();
            
            alert('更新しました');
        });
    }

    addHierarchy(bookId, parentPath, type, event) {
        event.stopPropagation();
        
        const typeNames = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">${typeNames[type]}名</label>
                <input type="text" class="form-control" id="hierarchyName" placeholder="${typeNames[type]}名を入力">
            </div>
            ${type === 'subsection' || type === 'section' || type === 'chapter' ? `
                <div class="form-group">
                    <label class="form-label">問題番号</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" class="form-control" id="startNum" placeholder="開始" min="1" style="flex: 1;">
                        <span>〜</span>
                        <input type="number" class="form-control" id="endNum" placeholder="終了" min="1" style="flex: 1;">
                    </div>
                </div>
            ` : ''}
        `;
        
        this.showDialog(`${typeNames[type]}追加`, dialogBody, () => {
            const name = document.getElementById('hierarchyName')?.value;
            if (!name) {
                alert(`${typeNames[type]}名を入力してください`);
                return;
            }
            
            const book = DataManager.books[bookId];
            if (!book) return;
            
            let target;
            if (!parentPath) {
                target = book.structure;
            } else {
                target = book.structure;
                const pathArray = parentPath.split('/');
                for (const segment of pathArray) {
                    if (!target[segment]) return;
                    if (!target[segment].children) {
                        target[segment].children = {};
                    }
                    target = target[segment].children;
                }
            }
            
            target[name] = {
                type: type,
                children: {}
            };
            
            if (type === 'subsection' || type === 'section' || type === 'chapter') {
                const startNum = parseInt(document.getElementById('startNum')?.value);
                const endNum = parseInt(document.getElementById('endNum')?.value);
                
                if (startNum && endNum && startNum <= endNum) {
                    const questions = [];
                    for (let i = startNum; i <= endNum; i++) {
                        questions.push(i);
                    }
                    target[name].questions = questions;
                } else {
                    delete target[name].questions;
                }
            }
            
            DataManager.saveBooksToStorage();
            this.renderBookCards();
            this.renderRegisterHierarchy();
            this.closeDialog();
        });
    }

    editHierarchy(bookId, path, event) {
        event.stopPropagation();
        
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const pathArray = path.split('/');
        let current = book.structure;
        for (let i = 0; i < pathArray.length - 1; i++) {
            current = current[pathArray[i]].children || {};
        }
        
        const item = current[pathArray[pathArray.length - 1]];
        if (!item) return;
        
        const typeNames = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">${typeNames[item.type]}名</label>
                <input type="text" class="form-control" id="editHierarchyName" value="${pathArray[pathArray.length - 1]}" placeholder="${typeNames[item.type]}名を入力">
            </div>
            ${item.type === 'subsection' || item.type === 'section' || item.type === 'chapter' ? `
                <div class="form-group">
                    <label class="form-label">問題番号</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" class="form-control" id="editStartNum" placeholder="開始" min="1" style="flex: 1;" value="${item.questions && item.questions.length > 0 ? Math.min(...item.questions) : ''}">
                        <span>〜</span>
                        <input type="number" class="form-control" id="editEndNum" placeholder="終了" min="1" style="flex: 1;" value="${item.questions && item.questions.length > 0 ? Math.max(...item.questions) : ''}">
                    </div>
                </div>
            ` : ''}
        `;
        
        this.showDialog(`${typeNames[item.type]}編集`, dialogBody, () => {
            const newName = document.getElementById('editHierarchyName')?.value;
            if (!newName) {
                alert(`${typeNames[item.type]}名を入力してください`);
                return;
            }
            
            const oldName = pathArray[pathArray.length - 1];
            if (newName !== oldName) {
                current[newName] = current[oldName];
                delete current[oldName];
            }
            
            if (item.type === 'subsection' || item.type === 'section' || item.type === 'chapter') {
                const startNum = parseInt(document.getElementById('editStartNum')?.value);
                const endNum = parseInt(document.getElementById('editEndNum')?.value);
                
                if (startNum && endNum && startNum <= endNum) {
                    const questions = [];
                    for (let i = startNum; i <= endNum; i++) {
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

    deleteBook(bookId, event) {
        event.stopPropagation();
        
        if (!confirm('この問題集を削除しますか？')) return;

        const book = DataManager.books[bookId];
        if (!book) return;

        // 削除済みアイテムとしてマーク（Firebase統合）
        DataManager.markAsDeleted('books', bookId, {
            bookName: book.name,
            bookType: book.examType,
            questionCount: DataManager.countQuestionsInBook(book)
        });

        this.renderBookCards();
        this.renderRegisterHierarchy();
        
        // Analyticsが存在する場合のみ更新
        if (window.Analytics) {
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
        }
        
        alert('問題集を削除しました');
    }

    showDialog(title, body, confirmCallback = null) {
        const overlay = document.getElementById('dialogOverlay');
        const dialog = document.getElementById('inputDialog');
        const titleEl = document.getElementById('dialogTitle');
        const bodyEl = document.getElementById('dialogBody');
        const confirmBtn = document.getElementById('dialogConfirmBtn');
        
        if (!overlay || !dialog || !titleEl || !bodyEl || !confirmBtn) return;
        
        titleEl.textContent = title;
        bodyEl.innerHTML = body;
        
        confirmBtn.onclick = confirmCallback;
        
        overlay.style.display = 'block';
        dialog.style.display = 'block';
    }

    closeDialog() {
        const overlay = document.getElementById('dialogOverlay');
        const dialog = document.getElementById('inputDialog');
        
        if (overlay) overlay.style.display = 'none';
        if (dialog) dialog.style.display = 'none';
    }

    saveExamDate() {
        const input = document.getElementById('examDateInput');
        if (!input || !input.value) {
            alert('試験日を入力してください');
            return;
        }

        try {
            const examDate = new Date(input.value);
            // DataManager.saveExamDateの戻り値をチェック
            const success = DataManager.saveExamDate(examDate);
            
            if (success) {
                // UIComponentsが存在する場合のみ実行
                if (window.UIComponents && typeof UIComponents.updateDashboard === 'function') {
                    UIComponents.updateDashboard();
                }
                alert('試験日を保存しました');
            } else {
                alert('試験日の保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving exam date:', error);
            alert('無効な日付です');
        }
    }

    getResultsContent() {
        return `
            <div class="results-grid">
                <div class="result-card">
                    <div class="result-icon">🎯</div>
                    <h4>総学習時間</h4>
                    <p class="result-value">- 時間</p>
                </div>
                <div class="result-card">
                    <div class="result-icon">📈</div>
                    <h4>正答率</h4>
                    <p class="result-value">-</p>
                </div>
                <div class="result-card">
                    <div class="result-icon">🔥</div>
                    <h4>連続学習日数</h4>
                    <p class="result-value">${localStorage.getItem('streakDays') || 0}日</p>
                </div>
                <div class="result-card">
                    <div class="result-icon">📚</div>
                    <h4>学習問題数</h4>
                    <p class="result-value">- 問</p>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="settings-section">
                <h4>試験日設定</h4>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="date" id="examDateInput" class="form-control" style="flex: 1;" 
                           value="${DataManager.examDate ? DataManager.examDate.toISOString().split('T')[0] : ''}">
                    <button class="save-button" onclick="App.saveExamDate()">保存</button>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>CSVテンプレート</h4>
                <div class="form-group">
                    <label class="form-label">テンプレート名</label>
                    <input type="text" class="form-control" id="csvTemplateName" placeholder="テンプレート名">
                </div>
                <div class="form-group">
                    <label class="form-label">CSVデータ</label>
                    <textarea class="form-control" id="csvTemplateData" rows="5" 
                              placeholder="科目,章,節,項,開始番号,終了番号"></textarea>
                </div>
                <button class="save-button" onclick="App.saveCSVTemplate()">テンプレート保存</button>
                
                <div style="margin-top: 20px;">
                    <h5>保存済みテンプレート</h5>
                    <div id="csvTemplateList"></div>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>CSVインポート</h4>
                <div class="form-group">
                    <label class="form-label">問題集名</label>
                    <input type="text" class="form-control" id="importBookName" placeholder="問題集名">
                </div>
                <div class="form-group">
                    <label class="form-label">問題番号タイプ</label>
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
                </div>
                <div class="form-group">
                    <label class="form-label">CSVデータ</label>
                    <textarea class="form-control" id="importCsvData" rows="8" 
                              placeholder="科目,章,節,項,開始番号,終了番号&#10;民法,総則,権利能力,,1,5&#10;民法,総則,意思能力,,1,5"></textarea>
                </div>
                <button class="save-button" onclick="App.importCSV()">CSVインポート</button>
            </div>
            
            <div class="settings-section">
                <h4>一問一答CSVインポート</h4>
                <div class="form-group">
                    <label class="form-label">問題集名</label>
                    <input type="text" class="form-control" id="importQASetName" placeholder="問題集名">
                </div>
                <div class="form-group">
                    <label class="form-label">CSVデータ</label>
                    <textarea class="form-control" id="importQACsvData" rows="5" 
                              placeholder="問題文,答え&#10;日本の首都は？,東京"></textarea>
                </div>
                <button class="save-button" onclick="App.importQACSV()">一問一答インポート</button>
            </div>
            
            <div class="settings-section">
                <h4>データ管理</h4>
                <button class="save-button" style="background: var(--danger);" onclick="DataManager.clearAllData()">
                    全データ削除
                </button>
            </div>
        `;
    }

    saveCSVTemplate() {
        const name = document.getElementById('csvTemplateName')?.value;
        const data = document.getElementById('csvTemplateData')?.value;
        
        if (!name || !data) {
            alert('テンプレート名とCSVデータを入力してください');
            return;
        }
        
        const templateId = 'template_' + Date.now();
        DataManager.csvTemplates[templateId] = {
            id: templateId,
            name: name,
            data: data,
            createdAt: new Date().toISOString()
        };
        
        DataManager.saveCSVTemplates();
        this.renderCSVTemplateList();
        
        // フォームをクリア
        document.getElementById('csvTemplateName').value = '';
        document.getElementById('csvTemplateData').value = '';
        
        alert('テンプレートを保存しました');
    }

    renderCSVTemplateList() {
        const container = document.getElementById('csvTemplateList');
        if (!container) return;
        
        let html = '';
        Object.values(DataManager.csvTemplates || {}).forEach(template => {
            html += `
                <div class="template-item">
                    <div>
                        <div style="font-weight: 600;">${template.name}</div>
                        <div style="font-size: 12px; color: var(--gray);">
                            ${template.data.split('\n').length}行
                        </div>
                    </div>
                    <div>
                        <button class="template-btn" onclick="App.useCSVTemplate('${template.id}')">使用</button>
                        <button class="delete-btn" onclick="App.deleteCSVTemplate('${template.id}')">削除</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="color: var(--gray); text-align: center;">テンプレートがありません</p>';
    }

    useCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;
        
        const nameInput = document.getElementById('importBookName');
        const dataInput = document.getElementById('importCsvData');
        
        if (nameInput) nameInput.value = template.name + ' (テンプレート)';
        if (dataInput) dataInput.value = template.data;
    }

    deleteCSVTemplate(templateId) {
        if (confirm('このテンプレートを削除しますか？')) {
            // Firebaseにも削除記録
            if (window.ULTRA_STABLE_USER_ID && DataManager.saveToFirestore) {
                DataManager.saveToFirestore({
                    type: 'csvTemplate',
                    action: 'delete',
                    templateId: templateId,
                    message: 'CSVテンプレートを削除しました',
                    deletedCount: DataManager.csvTemplates ? Object.keys(DataManager.csvTemplates).length - 1 : 0,
                    templateData: DataManager.csvTemplates[templateId] ? DataManager.csvTemplates[templateId].data.length : 0
                });
            }
            
            delete DataManager.csvTemplates[templateId];
            DataManager.saveCSVTemplates();
            this.renderCSVTemplateList();
        }
    }

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
            
            // Analyticsが存在する場合のみ更新
            if (window.Analytics) {
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
            }
            
            alert('CSVデータをインポートしました');
            this.closeFooterModal();
        } else {
            alert('CSVの解析に失敗しました。形式を確認してください。');
        }
    }

    importQACSV() {
        const setName = document.getElementById('importQASetName')?.value;
        const csvData = document.getElementById('importQACsvData')?.value;
        
        if (!setName || !csvData) {
            alert('問題集名とCSVデータを入力してください');
            return;
        }
        
        if (window.QAModule && typeof QAModule.importFromCSV === 'function') {
            if (QAModule.importFromCSV(setName, csvData)) {
                this.closeFooterModal();
            }
        } else {
            alert('一問一答モジュールが読み込まれていません');
        }
    }
}

// グローバルに公開
window.App = new Application();

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await App.initialize();
    } catch (error) {
        console.error('Failed to initialize App:', error);
    }
});

/**
 * Application - メインアプリケーションクラス（完全版）
 */
class Application {
    constructor() {
        this.currentBook = null;
        this.currentPath = [];
        this.questionStates = {};
        this.bookmarkMode = false;
        this.expandedNodes = new Set();
        this.sortMode = false;
        this.analysisSortMode = false;
        this.hierarchySortMode = {};
        
        // ページネーション用のプロパティを追加
        this.currentQuestionIndex = 0;
        this.currentQuestionRange = [];
    }

    /**
     * アプリケーション初期化
     */
    async initialize() {
        console.log('Initializing Application...');
        
        // DataManager初期化を待つ
        await this.waitForDataManager();
        
        // 他のモジュールの初期化を待つ
        await this.waitForModules();
        
        // UI初期化
        this.renderBookCards();
        this.initializeSampleDataIfNeeded();
        
        // UIComponents初期化
        if (window.UIComponents) {
            UIComponents.renderCalendar();
            UIComponents.updateExamCountdown();
        }
        
        // Analytics初期化
        if (window.Analytics) {
            Analytics.initialize();
        }
        
        console.log('Application initialized');
    }

    /**
     * DataManagerの初期化を待つ
     */
    async waitForDataManager() {
        let attempts = 0;
        while (attempts < 50) {
            if (window.DataManager) {
                console.log('DataManager loaded');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        console.error('DataManager not loaded');
        return false;
    }

    /**
     * 他のモジュールの初期化を待つ
     */
    async waitForModules() {
        const modules = ['UIComponents', 'Analytics', 'QAModule', 'KeyPointsModule', 'TimerModule'];
        let attempts = 0;
        
        while (attempts < 50) {
            const allLoaded = modules.every(module => window[module]);
            if (allLoaded) {
                console.log('All modules loaded');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('Some modules may not be loaded');
        return false;
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
        if (tabName === 'analysis' && window.Analytics) {
            setTimeout(() => {
                Analytics.updateChartBars();
                Analytics.updateHeatmap();
                Analytics.updateWeaknessAnalysis();
                Analytics.updateHistoryContent();
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
            }, 100);
        } else if (tabName === 'progress' && window.Analytics) {
            setTimeout(() => {
                Analytics.updateProgressContent();
                Analytics.drawRadarChart();
                Analytics.updateRadarBookSelect();
                Analytics.updateHeatmapBookSelect();
            }, 100);
        }
    }

    /**
     * フッタータブ切り替え
     */
    switchFooterTab(tabName, event) {
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
        
        // モーダルヘッダーを動的に再構築
        const modalHeader = modal.querySelector('.modal-header');
        if (modalHeader && tabName !== 'keypoints') {
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">${titles[tabName]}</h3>
                <button class="modal-close" style="width: 30px; height: 30px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="App.closeFooterModal()">×</button>
            `;
        } else if (modalHeader && tabName === 'keypoints') {
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">${titles[tabName]}</h3>
                <button class="modal-close" style="width: 30px; height: 30px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="App.closeFooterModal()">×</button>
            `;
        }
        
        // モーダルフッターを動的に再構築
        if (modalFooter) {
            if (tabName === 'keypoints') {
                modalFooter.innerHTML = `
                    <div style="display: flex; gap: 10px;">
                        <button id="modalBackBtn" style="background: var(--gray); color: white; border: none; border-radius: 10px; padding: 15px 20px; cursor: pointer; font-size: 16px; font-weight: 600;" onclick="KeyPointsModule.backToSubjectList()">↩️ 戻る</button>
                        <button class="modal-close-bottom" style="flex: 1;" onclick="App.closeFooterModal()">閉じる</button>
                    </div>
                `;
            } else {
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

    /**
     * 問題集選択
     */
    selectBook(bookId) {
        if (this.sortMode) return;
        
        const book = DataManager.books[bookId];
        if (!book) return;
        
        this.currentBook = book;
        this.currentPath = [];
        
        document.querySelectorAll('.book-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.getElementById(`book-card-${bookId}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        document.getElementById('recordHierarchyContainer').style.display = 'block';
        document.getElementById('questionSection').style.display = 'none';
        document.getElementById('breadcrumb').style.display = 'block';
        
        this.renderRecordHierarchy();
        this.updateBreadcrumb();
    }

    /**
     * 問題表示（ページネーション機能付き）
     */
    showQuestions(path) {
        if (!this.currentBook) return;
        
        const pathArray = path.split('/');
        let target = this.currentBook.structure;
        
        for (let i = 0; i < pathArray.length; i++) {
            if (target[pathArray[i]]) {
                target = target[pathArray[i]];
                if (target.children && i < pathArray.length - 1) {
                    target = target.children;
                }
            }
        }
        
        if (!target || !target.questions) return;
        
        this.currentPath = pathArray;
        this.currentQuestionRange = target.questions;
        this.currentQuestionIndex = 0; // 最初の問題から開始
        
        // 問題番号チェック状態を読み込み
        const savedStates = DataManager.getSavedQuestionStates(this.currentBook.id, path);
        this.questionStates = {};
        
        target.questions.forEach(num => {
            this.questionStates[num] = savedStates[num] || { state: null, bookmarked: false };
        });
        
        document.getElementById('recordHierarchyContainer').style.display = 'none';
        document.getElementById('questionSection').style.display = 'block';
        
        this.updateBreadcrumb();
        this.renderQuestionGrid();
        this.updateStats();
        this.updateNavigationButtons();
    }

    /**
     * ページネーションボタンの状態を更新
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentQuestionIndex >= this.currentQuestionRange.length - 1;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }

    /**
     * 前の問題へ
     */
    navigateToPrevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestionGrid();
            this.updateNavigationButtons();
        }
    }

    /**
     * 次の問題へ
     */
    navigateToNextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestionRange.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestionGrid();
            this.updateNavigationButtons();
        }
    }

    /**
     * 問題グリッドの描画（ページネーション版）
     */
    renderQuestionGrid() {
        const grid = document.getElementById('questionGrid');
        if (!grid || !this.currentQuestionRange || this.currentQuestionRange.length === 0) return;
        
        // 現在の問題番号を取得
        const currentQuestionNum = this.currentQuestionRange[this.currentQuestionIndex];
        
        // ページネーションコントロールを追加
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px;">
                <button id="prevQuestionBtn" class="nav-btn" onclick="App.navigateToPrevQuestion()" 
                        style="font-size: 24px; padding: 10px 20px; border-radius: 10px;">
                    ◀
                </button>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: var(--primary);">問題 ${currentQuestionNum}</div>
                    <div style="font-size: 16px; color: var(--gray); margin-top: 5px;">
                        ${this.currentQuestionIndex + 1} / ${this.currentQuestionRange.length}
                    </div>
                </div>
                <button id="nextQuestionBtn" class="nav-btn" onclick="App.navigateToNextQuestion()" 
                        style="font-size: 24px; padding: 10px 20px; border-radius: 10px;">
                    ▶
                </button>
            </div>
        `;
        
        // 現在の問題の状態を表示
        const state = this.questionStates[currentQuestionNum];
        const cellClass = state.state === 'correct' ? 'correct' : 
                         state.state === 'wrong' ? 'wrong' : '';
        const bookmarkClass = state.bookmarked ? 'bookmarked' : '';
        
        html += `
            <div class="question-display" style="text-align: center; padding: 30px;">
                <div class="question-cell ${cellClass} ${bookmarkClass}" 
                     data-number="${currentQuestionNum}"
                     onclick="App.toggleQuestion(${currentQuestionNum})"
                     style="display: inline-block; width: 120px; height: 120px; line-height: 120px; 
                            font-size: 36px; cursor: pointer; position: relative;">
                    ${currentQuestionNum}
                    ${state.bookmarked ? '<span style="position: absolute; top: -10px; right: -10px; font-size: 24px;">⭐</span>' : ''}
                </div>
            </div>
        `;
        
        grid.innerHTML = html;
        this.updateNavigationButtons();
    }

    /**
     * 問題の状態をトグル
     */
    toggleQuestion(number) {
        if (!this.questionStates[number]) {
            this.questionStates[number] = { state: null, bookmarked: false };
        }
        
        if (this.bookmarkMode) {
            this.questionStates[number].bookmarked = !this.questionStates[number].bookmarked;
        } else {
            // 状態を循環: null -> correct -> wrong -> null
            if (this.questionStates[number].state === null) {
                this.questionStates[number].state = 'correct';
            } else if (this.questionStates[number].state === 'correct') {
                this.questionStates[number].state = 'wrong';
            } else {
                this.questionStates[number].state = null;
            }
        }
        
        this.renderQuestionGrid();
        this.updateStats();
        this.saveQuestionStatesForPath();
    }

    /**
     * 現在のパスの問題状態を保存
     */
    saveQuestionStatesForPath() {
        if (this.currentBook && this.currentPath.length > 0) {
            const pathStr = this.currentPath.join('/');
            DataManager.saveQuestionStates(this.currentBook.id, pathStr, this.questionStates);
        }
    }

    /**
     * 全問正解マーク
     */
    markCorrect() {
        Object.keys(this.questionStates).forEach(num => {
            if (this.questionStates[num].state === null) {
                this.questionStates[num].state = 'correct';
            }
        });
        this.saveQuestionStatesForPath();
        this.renderQuestionGrid();
        this.updateStats();
    }

    /**
     * 全問不正解マーク
     */
    markWrong() {
        Object.keys(this.questionStates).forEach(num => {
            if (this.questionStates[num].state === null) {
                this.questionStates[num].state = 'wrong';
            }
        });
        this.saveQuestionStatesForPath();
        this.renderQuestionGrid();
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
     * 統計情報更新
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
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('correctCount').textContent = correct;
        document.getElementById('wrongCount').textContent = wrong;
        document.getElementById('correctRate').textContent = rate + '%';
    }

    /**
     * 学習記録を保存
     */
    saveRecord() {
        if (!this.currentBook || this.currentPath.length === 0) {
            alert('問題を選択してください');
            return;
        }
        
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
        
        if (total === 0) {
            alert('解答を入力してください');
            return;
        }
        
        const record = {
            date: new Date().toISOString(),
            bookId: this.currentBook.id,
            bookName: this.currentBook.name,
            path: this.currentPath.join(' > '),
            total: total,
            correct: correct,
            wrong: wrong,
            rate: Math.round((correct / total) * 100)
        };
        
        DataManager.allRecords.push(record);
        DataManager.saveAllRecords();
        
        alert('学習記録を保存しました');
        
        // UIをリセット
        this.questionStates = {};
        this.currentPath = [];
        document.getElementById('questionSection').style.display = 'none';
        document.getElementById('recordHierarchyContainer').style.display = 'block';
        this.renderRecordHierarchy();
        this.updateBreadcrumb();
        
        // カレンダーと分析を更新
        if (window.UIComponents) {
            UIComponents.renderCalendar();
        }
        if (window.Analytics) {
            Analytics.updateChartBars();
            Analytics.updateHistoryContent();
        }
    }

    /**
     * パンくずリスト更新
     */
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        if (this.currentBook) {
            let html = `<span class="breadcrumb-item" onclick="App.navigateTo(-1)">📚 ${this.currentBook.name}</span>`;
            
            this.currentPath.forEach((item, index) => {
                html += ` > <span class="breadcrumb-item ${index === this.currentPath.length - 1 ? 'active' : ''}" 
                         onclick="App.navigateTo(${index})">${item}</span>`;
            });
            
            breadcrumb.innerHTML = html;
        } else {
            breadcrumb.style.display = 'none';
        }
    }

    /**
     * パンくずリストから指定位置へ移動
     */
    navigateTo(index) {
        if (index === -1) {
            this.currentPath = [];
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        } else if (index >= 0 && index < this.currentPath.length) {
            this.currentPath = this.currentPath.slice(0, index);
            document.getElementById('recordHierarchyContainer').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            this.renderRecordHierarchy();
        }
        this.updateBreadcrumb();
    }

    /**
     * 階層の順序を保持する関数
     */
    getOrderedStructure(structure) {
        if (!structure) return [];
        
        const items = Object.entries(structure);
        
        // orderプロパティでソート
        return items.sort((a, b) => {
            const orderA = a[1].order !== undefined ? a[1].order : 999;
            const orderB = b[1].order !== undefined ? b[1].order : 999;
            return orderA - orderB;
        });
    }

    /**
     * 記録入力階層を描画
     */
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
    }

    /**
     * 記録入力階層レベルを描画（順序保持）
     */
    renderRecordLevel(structure, basePath) {
        let html = '';
        
        // 順序を保持して取得
        const orderedItems = this.getOrderedStructure(structure);
        
        orderedItems.forEach(([name, item]) => {
            const currentPath = [...basePath, name];
            const pathStr = currentPath.join('/');
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = this.expandedNodes.has(pathStr);
            
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
                        <div class="hierarchy-children ${isExpanded ? 'show' : ''}">
                            ${this.renderRecordLevel(item.children, currentPath)}
                        </div>
                    `;
                }
            } else {
                html += `
                    <div class="hierarchy-row" ${hasChildren ? `onclick="App.toggleNode('${pathStr}', event)"` : ''}>
                        ${hasChildren ? `<span class="hierarchy-toggle ${isExpanded ? 'expanded' : ''}">▶</span>` : '<span style="width: 28px;"></span>'}
                        <span class="hierarchy-icon">${this.getHierarchyIcon(item.type)}</span>
                        <span class="hierarchy-label">${name}</span>
                    </div>
                `;
                
                if (hasChildren) {
                    html += `
                        <div class="hierarchy-children ${isExpanded ? 'show' : ''}">
                            ${this.renderRecordLevel(item.children, currentPath)}
                        </div>
                    `;
                }
            }
            
            html += `</div>`;
        });
        
        return html;
    }

    /**
     * ノードの展開/折りたたみ
     */
    toggleNode(nodeId, event) {
        if (event) event.stopPropagation();
        
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        this.renderRecordHierarchy();
    }

    /**
     * 問題集カード描画（削除済み除外）
     */
    renderBookCards() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;

        let html = '';
        
        // 削除済みを除外してレンダリング
        const orderedBooks = DataManager.bookOrder
            .filter(id => DataManager.books[id] && !DataManager.isDeleted('books', id))
            .map(id => DataManager.books[id]);
        
        // orderに含まれていない問題集も追加（削除済みは除外）
        Object.values(DataManager.books).forEach(book => {
            if (!DataManager.bookOrder.includes(book.id) && !DataManager.isDeleted('books', book.id)) {
                orderedBooks.push(book);
                DataManager.bookOrder.push(book.id);
            }
        });
        
        orderedBooks.forEach(book => {
            const questionCount = DataManager.countQuestionsInBook(book);
            const sortClass = this.sortMode ? 'sortable' : '';
            html += `
                <div class="book-card ${sortClass}" id="book-card-${book.id}" 
                     onclick="${this.sortMode ? '' : `App.selectBook('${book.id}')`}"
                     data-book-id="${book.id}">
                    ${this.sortMode ? '<span class="book-card-drag-handle">☰</span>' : ''}
                    <div class="book-card-title">${book.name}</div>
                    <div class="book-card-meta">${questionCount}問</div>
                </div>
            `;
        });
        
        if (orderedBooks.length === 0) {
            html = '<p style="color: var(--gray); text-align: center; padding: 20px;">問題集がありません</p>';
        }
        
        container.innerHTML = html;
        
        if (this.sortMode) {
            this.enableDragAndDrop();
        }
    }

    // Part 1からの続き...

    /**
     * 問題集並び替えモード切り替え
     */
    toggleBookSort() {
        this.sortMode = !this.sortMode;
        
        const btn = document.querySelector('.book-order-btn');
        if (btn) {
            btn.textContent = this.sortMode ? '完了' : '並替え';
            btn.style.background = this.sortMode ? 'var(--success)' : 'var(--primary)';
        }
        
        this.renderBookCards();
    }

    /**
     * ドラッグアンドドロップ有効化
     */
    enableDragAndDrop() {
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

    /**
     * 分析タブ並び替えモード切り替え
     */
    toggleAnalysisSort() {
        this.analysisSortMode = !this.analysisSortMode;
        
        const btn = document.querySelector('.card-sort-btn');
        if (btn) {
            btn.textContent = this.analysisSortMode ? '完了' : '並替え';
            btn.style.background = this.analysisSortMode ? 'var(--success)' : 'var(--primary)';
        }
        
        if (this.analysisSortMode) {
            this.enableAnalysisDragAndDrop();
        } else {
            this.disableAnalysisDragAndDrop();
        }
    }

    /**
     * 分析カードのドラッグアンドドロップ有効化
     */
    enableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        let draggedElement = null;
        
        const cards = container.querySelectorAll('.accordion');
        cards.forEach(card => {
            card.draggable = true;
            card.classList.add('sortable');
            
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
                if (!draggingCard) return;
                
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
                container.querySelectorAll('.accordion').forEach(c => {
                    const cardId = c.getAttribute('data-card-id');
                    if (cardId) {
                        newOrder.push(cardId);
                    }
                });
                DataManager.analysisCardOrder = newOrder;
                DataManager.saveAnalysisCardOrder();
                
                return false;
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

    /**
     * 分析カードのドラッグアンドドロップ無効化
     */
    disableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        const cards = container.querySelectorAll('.accordion');
        cards.forEach(card => {
            card.draggable = false;
            card.classList.remove('sortable', 'dragging');
            
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
    }

    /**
     * アコーディオンの開閉
     */
    toggleAccordion(header) {
        if (this.analysisSortMode) {
            return;
        }
        
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
        if (window.TimerModule && typeof TimerModule.openModal === 'function') {
            TimerModule.openModal();
        }
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
     * フッターモーダルを閉じる
     */
    closeFooterModal() {
        const modal = document.getElementById('footerModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 階層アイコンを取得
     */
    getHierarchyIcon(type) {
        const icons = {
            'subject': '📂',
            'chapter': '📄',
            'section': '📑',
            'subsection': '📌'
        };
        return icons[type] || '📄';
    }

    /**
     * タイプのラベルを取得
     */
    getTypeLabel(type) {
        const labels = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        return labels[type] || 'アイテム';
    }

    /**
     * 登録タブのコンテンツを取得
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
     * 登録済み問題集階層を描画
     */
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
                            <button class="hierarchy-action sort" onclick="App.toggleHierarchySort('${book.id}')" title="並び替え">並替え</button>
                            <button class="hierarchy-action" onclick="App.addHierarchy('${book.id}', null, 'subject', event)" title="科目追加">+</button>
                            <button class="hierarchy-action delete" onclick="App.deleteBook('${book.id}', event)" title="削除">🗑️</button>
                        </div>
                    </div>
                    <div class="hierarchy-children ${isExpanded ? 'show' : ''}">
                        ${this.renderRegisterLevel(book.structure, book.id, [])}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * 登録階層レベルを描画（順序保持）
     */
    renderRegisterLevel(structure, bookId, path) {
        let html = '';
        
        // 順序を保持して取得
        const orderedItems = this.getOrderedStructure(structure);
        
        orderedItems.forEach(([name, item], index) => {
            const currentPath = [...path, name];
            const nodeId = `${bookId}_${currentPath.join('_')}`;
            const hasChildren = item.children && Object.keys(item.children).length > 0;
            const isExpanded = this.expandedNodes.has(nodeId);
            
            // orderプロパティを設定
            if (item.order === undefined) {
                item.order = index;
            }
            
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
                    <div class="hierarchy-children ${isExpanded ? 'show' : ''}">
                        ${this.renderRegisterLevel(item.children, bookId, currentPath)}
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        return html;
    }

    /**
     * 登録ノードの展開/折りたたみ
     */
    toggleRegisterNode(nodeId, event) {
        if (event) event.stopPropagation();
        
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        this.renderRegisterHierarchy();
    }

    /**
     * 新規問題集ダイアログ
     */
    showNewBookDialog() {
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">問題集名</label>
                <input type="text" class="form-control" id="newBookName" placeholder="問題集の名前を入力">
            </div>
            <div class="form-group">
                <label class="form-label">試験種別</label>
                <select class="form-control" id="newBookType">
                    <option value="gyousei">行政書士</option>
                    <option value="other">その他</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">問題番号の管理方法</label>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label>
                        <input type="radio" name="numberingType" value="reset" checked>
                        <span>項目ごとリセット（節や項ごとに1から開始）</span>
                    </label>
                    <label>
                        <input type="radio" name="numberingType" value="continuous">
                        <span>連番（全体を通した連番）</span>
                    </label>
                </div>
            </div>
        `;
        
        this.showDialog('新規問題集を作成', dialogBody, () => {
            const name = document.getElementById('newBookName')?.value;
            const type = document.getElementById('newBookType')?.value;
            const numberingType = document.querySelector('input[name="numberingType"]:checked')?.value;
            
            if (name) {
                const bookId = 'book_' + Date.now();
                DataManager.books[bookId] = {
                    id: bookId,
                    name: name,
                    examType: type || 'gyousei',
                    numberingType: numberingType || 'reset',
                    structure: {},
                    createdAt: new Date().toISOString()
                };
                
                DataManager.bookOrder.push(bookId);
                DataManager.saveBooksToStorage();
                DataManager.saveBookOrder();
                
                this.renderBookCards();
                this.renderRegisterHierarchy();
                
                if (window.Analytics) {
                    Analytics.updateHeatmapBookSelect();
                    Analytics.updateRadarBookSelect();
                }
                
                this.closeDialog();
            }
        });
    }

    /**
     * 問題集一覧ダイアログ
     */
    showBookListDialog() {
        let dialogBody = '<div style="max-height: 400px; overflow-y: auto;">';
        
        if (!DataManager.books || Object.keys(DataManager.books).length === 0) {
            dialogBody += '<p style="text-align: center; color: var(--gray);">問題集がありません</p>';
        } else {
            Object.values(DataManager.books).forEach(book => {
                if (DataManager.isDeleted('books', book.id)) {
                    return;
                }
                
                const questionCount = DataManager.countQuestionsInBook(book);
                dialogBody += `
                    <div style="padding: 10px; border-bottom: 1px solid var(--light); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${book.name}</div>
                            <div style="font-size: 12px; color: var(--gray);">${questionCount}問</div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="edit-btn" onclick="App.editBook('${book.id}')">編集</button>
                            <button class="delete-btn" onclick="App.deleteBook('${book.id}', event)">削除</button>
                        </div>
                    </div>
                `;
            });
        }
        
        dialogBody += '</div>';
        
        this.showDialog('問題集一覧', dialogBody, null);
    }

    /**
     * 問題集編集
     */
    editBook(bookId) {
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const dialogBody = `
            <div class="form-group">
                <label class="form-label">問題集名</label>
                <input type="text" class="form-control" id="editBookName" value="${book.name}">
            </div>
            <div class="form-group">
                <label class="form-label">問題番号の管理方法</label>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label>
                        <input type="radio" name="editNumberingType" value="reset" ${book.numberingType !== 'continuous' ? 'checked' : ''}>
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
                
                if (window.Analytics) {
                    Analytics.updateHeatmapBookSelect();
                    Analytics.updateRadarBookSelect();
                }
                
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
            
            // orderプロパティを設定
            const existingCount = Object.keys(target).length;
            
            if (questions) {
                target[name] = {
                    type: type,
                    questions: questions,
                    order: existingCount
                };
                if (type === 'chapter' || type === 'section') {
                    target[name].children = {};
                }
            } else {
                target[name] = {
                    type: type,
                    children: {},
                    order: existingCount
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
                        <input type="number" class="form-control" id="editQuestionStart" value="${start}" min="1" style="width: 100px;">
                        <span>〜</span>
                        <input type="number" class="form-control" id="editQuestionEnd" value="${end}" min="1" style="width: 100px;">
                    </div>
                </div>
            `;
        }
        
        this.showDialog('項目を編集', dialogBody, () => {
            const newName = document.getElementById('editName')?.value;
            const start = parseInt(document.getElementById('editQuestionStart')?.value || '0');
            const end = parseInt(document.getElementById('editQuestionEnd')?.value || '0');
            
            if (newName && newName !== lastKey) {
                current[newName] = current[lastKey];
                delete current[lastKey];
                
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
     * 問題集削除（削除済みマーク）
     */
    deleteBook(bookId, event) {
        event.stopPropagation();
        
        if (!confirm('この問題集を削除しますか？')) return;

        const book = DataManager.books[bookId];
        if (!book) return;

        // 削除済みアイテムとしてマーク
        DataManager.markAsDeleted('books', bookId, {
            bookName: book.name,
            bookType: book.examType,
            questionCount: DataManager.countQuestionsInBook(book)
        });

        // ローカルから削除
        delete DataManager.books[bookId];
        DataManager.bookOrder = DataManager.bookOrder.filter(id => id !== bookId);
        DataManager.saveBooksToStorage();
        DataManager.saveBookOrder();
        DataManager.saveDeletedItems();
        
        // ピン固定設定もクリア
        if (DataManager.heatmapPinnedBook === bookId) {
            DataManager.saveHeatmapPinned(null);
        }
        if (DataManager.radarPinnedBook === bookId) {
            DataManager.saveRadarPinned(null);
        }
        
        this.renderBookCards();
        this.renderRegisterHierarchy();
        
        if (window.Analytics) {
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
        }
        
        alert('問題集を削除しました');
    }

    /**
     * 結果コンテンツを取得
     */
    getResultsContent() {
        const stats = DataManager.calculateStats();
        const streakDays = DataManager.getStreakDays();
        const subjectCount = Object.keys(DataManager.getSubjectStats()).length;
        
        const badges = [
            { 
                icon: '🔰', 
                label: '初心者', 
                unlocked: stats.totalAnswered >= 100,
                value: stats.totalAnswered >= 100 ? '達成' : `${stats.totalAnswered}/100`
            },
            { 
                icon: '🔥', 
                label: '連続学習', 
                unlocked: parseInt(streakDays) >= 7,
                value: `${streakDays}日`
            },
            { 
                icon: '⭐', 
                label: '正答率80%', 
                unlocked: stats.overallRate >= 80,
                value: `${stats.overallRate}%`
            },
            { 
                icon: '🎯', 
                label: '1000問達成', 
                unlocked: stats.totalAnswered >= 1000,
                value: stats.totalAnswered >= 1000 ? '達成' : `${stats.totalAnswered}問`
            },
            { 
                icon: '🚀', 
                label: '全科目', 
                unlocked: subjectCount >= 4,
                value: `${subjectCount}科目`
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
     * 設定コンテンツを取得
     */
    getSettingsContent() {
        return `
            <div style="padding: 10px;">
                <div class="card">
                    <h4>試験日設定</h4>
                    <div class="form-group">
                        <label class="form-label">試験日</label>
                        <input type="date" class="form-control" id="examDateInput" 
                               value="${DataManager.examDate ? DataManager.examDate.toISOString().split('T')[0] : ''}">
                    </div>
                    <button class="save-button" onclick="App.saveExamDate()">保存</button>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>CSVインポート（問題集）</h4>
                    <div class="form-group">
                        <label class="form-label">問題集名</label>
                        <input type="text" class="form-control" id="importBookName" placeholder="問題集の名前">
                    </div>
                    <div class="form-group">
                        <label class="form-label">問題番号の管理方法</label>
                        <div>
                            <label>
                                <input type="radio" name="importNumberingType" value="reset" checked>
                                <span>項目ごとリセット</span>
                            </label>
                            <label style="margin-left: 20px;">
                                <input type="radio" name="importNumberingType" value="continuous">
                                <span>連番</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">CSVデータ</label>
                        <textarea class="import-textarea" id="importCsvData" 
                                  placeholder="科目,章,節,項,開始番号,終了番号
憲法,基本原理,,,,
憲法,基本原理,国民主権,,,
憲法,基本原理,国民主権,第1条,1,5"></textarea>
                    </div>
                    <button class="save-button" onclick="App.importCSV()">インポート</button>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>CSVインポート（一問一答）</h4>
                    <div class="form-group">
                        <label class="form-label">問題集名</label>
                        <input type="text" class="form-control" id="importQASetName" placeholder="問題集の名前">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CSVデータ</label>
                        <textarea class="import-textarea" id="importQACsvData" 
                                  placeholder="問題,答え
日本の首都は？,東京
富士山の高さは？,3776メートル"></textarea>
                    </div>
                    <button class="save-button" onclick="App.importQACSV()">インポート</button>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>CSVテンプレート管理</h4>
                    <div id="csvTemplateList"></div>
                </div>
            </div>
        `;
    }

    /**
     * 試験日保存
     */
    saveExamDate() {
        const input = document.getElementById('examDateInput');
        if (!input || !input.value) {
            alert('試験日を入力してください');
            return;
        }

        try {
            const examDate = new Date(input.value);
            const success = DataManager.saveExamDate(examDate);
            
            if (success) {
                if (window.UIComponents && typeof UIComponents.updateExamCountdown === 'function') {
                    UIComponents.updateExamCountdown();
                }
                alert('試験日を保存しました');
            } else {
                alert('試験日の保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving exam date:', error);
            alert('試験日の保存に失敗しました');
        }
    }

    /**
     * CSVテンプレートリストを描画
     */
    renderCSVTemplateList() {
        const container = document.getElementById('csvTemplateList');
        if (!container) return;

        if (!DataManager.csvTemplates || Object.keys(DataManager.csvTemplates).length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">テンプレートがありません</p>';
            return;
        }

        let html = '';
        Object.entries(DataManager.csvTemplates).forEach(([id, template]) => {
            html += `
                <div class="delete-list-item">
                    <div>
                        <div style="font-weight: 600;">${template.name}</div>
                        <div style="font-size: 12px; color: var(--gray);">
                            ${template.type === 'book' ? '問題集' : '一問一答'} - ${template.data.length}行
                        </div>
                    </div>
                    <button class="delete-btn" onclick="App.deleteCSVTemplate('${id}')">削除</button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * CSVテンプレート削除
     */
    deleteCSVTemplate(templateId) {
        if (confirm('このテンプレートを削除しますか？')) {
            // 削除済みマーク（必要に応じて）
            if (DataManager.csvTemplates[templateId]) {
                DataManager.markAsDeleted('csvTemplate', templateId, {
                    templateName: DataManager.csvTemplates[templateId].name,
                    templateType: DataManager.csvTemplates[templateId].type,
                    dataCount: DataManager.csvTemplates[templateId].data ? DataManager.csvTemplates[templateId].data.length : 0
                });
            }
            
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
        
        if (window.QAModule && typeof QAModule.importFromCSV === 'function') {
            if (QAModule.importFromCSV(setName, csvData)) {
                this.closeFooterModal();
            }
        } else {
            alert('一問一答モジュールが読み込まれていません');
        }
    }

    /**
     * 階層並び替えモード切り替え
     */
    toggleHierarchySort(bookId) {
        const book = DataManager.books[bookId];
        if (!book) return;
        
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
        
        const btn = event.target;
        if (btn) {
            btn.textContent = this.hierarchySortMode[bookId] ? '完了' : '並替え';
            btn.style.background = this.hierarchySortMode[bookId] ? 'var(--success)' : 'var(--primary)';
        }
    }

    /**
     * 階層のドラッグアンドドロップ有効化
     */
    enableHierarchyDragAndDrop(bookId) {
        // 実装省略（必要に応じて実装）
        console.log('Hierarchy drag and drop enabled for book:', bookId);
    }

    /**
     * 階層のドラッグアンドドロップ無効化
     */
    disableHierarchyDragAndDrop(bookId) {
        // 実装省略（必要に応じて実装）
        console.log('Hierarchy drag and drop disabled for book:', bookId);
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

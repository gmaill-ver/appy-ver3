/**
 * App - メインアプリケーションロジック（Firebase統合強化版）
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
        this.initialized = false;
    }

    /**
     * アプリケーション初期化
     */
    async initialize() {
        // 二重初期化を防ぐ
        if (this.initialized) {
            console.log('App already initialized');
            return true;
        }

        try {
            console.log('Starting App initialization...');
            
            // DataManagerの初期化を待つ（最大5秒）
            const maxWait = 50;
            let attempts = 0;
            while (!window.DataManager && attempts < maxWait) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.DataManager) {
                console.error('DataManager not found after waiting');
                return false;
            }

            // DataManagerの初期化
            const dataInitialized = await DataManager.initialize();
            if (!dataInitialized) {
                console.error('DataManager initialization failed');
                return false;
            }
            
            // 他のモジュールの存在確認（初期化は各モジュール内で行う）
            await this.waitForModules();
            
            // 初期描画
            this.renderBookCards();
            this.initializeSampleDataIfNeeded();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            return true;
        } catch (error) {
            console.error('Application initialization error:', error);
            return false;
        }
    }

    /**
     * モジュールの存在確認を待つ
     */
    async waitForModules() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            // モジュールの存在のみ確認（初期化は各モジュール内で行う）
            if (window.UIComponents && window.Analytics && window.QAModule && window.TimerModule) {
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
     * メインタブ切り替え（進捗タブデータ更新強化）
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

    /**
     * フッタータブ切り替え（カレンダー予定保存強化版）
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

    /**
     * 試験日保存（修正版）
     */
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
                // UIComponentsが存在する場合のみ更新
                if (window.UIComponents && typeof UIComponents.updateExamCountdown === 'function') {
                    UIComponents.updateExamCountdown();
                }
                
                // Firebase保存強化
                if (window.ULTRA_STABLE_USER_ID && DataManager.saveToFirestore) {
                    DataManager.saveToFirestore({
                        type: 'examDate',
                        action: 'save',
                        examDate: examDate.toISOString(),
                        message: '試験日を設定しました'
                    });
                }
                
                alert('試験日を設定しました');
                // モーダルを閉じる
                setTimeout(() => this.closeFooterModal(), 100);
            } else {
                alert('試験日の設定に失敗しました。有効な日付を入力してください。');
            }
        } catch (error) {
            console.error('Error saving exam date:', error);
            alert('試験日の設定に失敗しました');
        }
    }

    /**
     * 実績コンテンツ生成（Analytics依存を安全に）
     */
    getResultsContent() {
        // デフォルト値
        let stats = {
            totalAnswered: 0,
            overallRate: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            uniqueAnsweredCount: 0,
            progressPercentage: 0
        };
        
        let subjectCount = 0;
        
        try {
            // Analyticsが利用可能な場合のみ統計を取得
            if (window.Analytics && typeof Analytics.calculateOverallProgress === 'function') {
                stats = Analytics.calculateOverallProgress();
            }
            if (window.Analytics && typeof Analytics.calculateSubjectStats === 'function') {
                const subjectStats = Analytics.calculateSubjectStats();
                subjectCount = Object.keys(subjectStats).length;
            }
        } catch (error) {
            console.error('Error calculating stats:', error);
        }
        
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

    closeFooterModal() {
        const modal = document.getElementById('footerModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    renderBookCards() {
        const container = document.getElementById('bookCardsContainer');
        if (!container) return;

        let html = '';
        
        const orderedBooks = DataManager.bookOrder
            .filter(id => DataManager.books[id] && !DataManager.isDeleted('books', id))
            .map(id => DataManager.books[id]);
        
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

    toggleBookCard(bookId) {
        const card = document.getElementById(`book-card-${bookId}`);
        if (!card) return;

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
            document.querySelectorAll('.book-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            card.classList.add('selected');
            this.selectedBookCard = bookId;
            this.selectBook(bookId);
        }
    }

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

    renderRecordLevel(structure, basePath) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
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
                    
                    const grid = document.getElementById('questionGrid');
                    if (!grid) return;
                    
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
    }

    loadQuestionStatesForPath() {
        if (!this.currentBook || this.currentPath.length === 0) return;

        const states = DataManager.getQuestionStates(this.currentBook.id, this.currentPath);
        if (states && Object.keys(states).length > 0) {
            this.questionStates = states;
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

    /**
     * 分析タブ並び替え機能（記録入力と同じデザイン・挙動に修正）
     */
    toggleAnalysisSort() {
        this.analysisSortMode = !this.analysisSortMode;
        
        // ボタンのテキストと色を更新
        const btn = document.querySelector('.card-sort-btn');
        if (btn) {
            btn.textContent = this.analysisSortMode ? '完了' : '並替え';
            btn.style.background = this.analysisSortMode ? 'var(--success)' : 'var(--primary)';
        }
        
        if (this.analysisSortMode) {
            this.enableAnalysisDragAndDrop();
        } else {
            // 並び替えモード終了時にドラッグ機能を無効化
            this.disableAnalysisDragAndDrop();
        }
    }

    /**
     * 分析カードのドラッグアンドドロップ機能（記録入力と同じ挙動に修正）
     */
    enableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
        if (!container) return;

        let draggedElement = null;
        
        // アコーディオンカードに並び替えクラスを追加
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
                
                // 新しい順序を保存
                const newOrder = [];
                container.querySelectorAll('.accordion').forEach(c => {
                    const cardId = c.dataset.cardId;
                    if (cardId) newOrder.push(cardId);
                });
                
                if (newOrder.length > 0) {
                    DataManager.analysisCardOrder = newOrder;
                    DataManager.saveAnalysisCardOrder();
                    
                    // Firebase保存強化
                    if (window.ULTRA_STABLE_USER_ID && DataManager.saveToFirestore) {
                        DataManager.saveToFirestore({
                            type: 'analysisCardOrder',
                            action: 'save',
                            order: newOrder,
                            message: '分析カード順序を保存しました'
                        });
                    }
                }
                
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
     * 分析カードのドラッグアンドドロップ機能を無効化
     */
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

    closeDialog() {
        const overlay = document.getElementById('dialogOverlay');
        const dialog = document.getElementById('inputDialog');
        
        if (overlay) overlay.style.display = 'none';
        if (dialog) dialog.style.display = 'none';
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
                        　　 <button class="hierarchy-action sort" onclick="App.toggleHierarchySort('${book.id}')" title="並び替え">並替え</button>
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

    toggleRegisterNode(nodeId, event) {
        event.stopPropagation();
        
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        
        this.renderRegisterHierarchy();
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
        
        this.showDialog('問題集を編集', dialogBody, () => {
            const newName = document.getElementById('editBookName')?.value;
            const newNumberingType = document.querySelector('input[name="editNumberingType"]:checked')?.value;
            
            if (newName) {
                book.name = newName;
                book.numberingType = newNumberingType || 'reset';
                DataManager.saveBooksToStorage();
                this.renderBookCards();
                
                // Analyticsが存在する場合のみ更新
                if (window.Analytics) {
                    Analytics.updateHeatmapBookSelect();
                    Analytics.updateRadarBookSelect();
                }
                
                this.closeDialog();
                this.showBookListDialog();
            }
        });
    }

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
            
            if (newName !== lastKey) {
                current[newName] = current[lastKey];
                delete current[lastKey];
            }
            
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
     * 問題集削除（Firebase統合強化版）
     */
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

        // ローカルから削除
        delete DataManager.books[bookId];
        DataManager.bookOrder = DataManager.bookOrder.filter(id => id !== bookId);
        DataManager.saveBooksToStorage();
        DataManager.saveBookOrder();
        
        // ピン固定設定もクリア
        if (DataManager.heatmapPinnedBook === bookId) {
            DataManager.saveHeatmapPinned(null);
        }
        if (DataManager.radarPinnedBook === bookId) {
            DataManager.saveRadarPinned(null);
        }
        
        this.renderBookCards();
        this.renderRegisterHierarchy();
        
        // Analyticsが存在する場合のみ更新
        if (window.Analytics) {
            Analytics.updateHeatmapBookSelect();
            Analytics.updateRadarBookSelect();
        }
        
        alert('問題集を削除しました');
    }

    /**
     * 階層並び替えモードの切り替え（新規追加）
     */
    toggleHierarchySort(bookId) {
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

    /**
     * 階層ドラッグ&ドロップ有効化（新規追加）
     */
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

    /**
     * ドラッグ&ドロップ無効化（新規追加）
     */
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

    /**
     * DOM順序に基づいて構造を更新（新規追加）
     */
    updateBookStructureOrder(bookId) {
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const container = document.querySelector(`#book_${bookId}`).closest('.hierarchy-item');
        if (!container) return;
        
        const childrenContainer = container.querySelector('.hierarchy-children');
        if (!childrenContainer) return;
        
        const newStructure = {};
        const subjectElements = childrenContainer.querySelectorAll(':scope > .hierarchy-item');
        
        subjectElements.forEach(elem => {
            const label = elem.querySelector('.hierarchy-label');
            if (label) {
                const subjectName = label.textContent.trim();
                if (book.structure[subjectName]) {
                    newStructure[subjectName] = book.structure[subjectName];
                }
            }
        });
        
        book.structure = newStructure;
    }

    getTypeLabel(type) {
        const labels = {
            'subject': '科目',
            'chapter': '章',
            'section': '節',
            'subsection': '項'
        };
        return labels[type] || type;
    }

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

    renderCSVTemplateList() {
        const container = document.getElementById('csvTemplateList');
        if (!container) return;

        if (Object.keys(DataManager.csvTemplates).length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">保存済みテンプレートはありません</p>';
            return;
        }
        
        let html = '';
        Object.values(DataManager.csvTemplates).forEach(template => {
            // 削除済みテンプレートは表示しない
            if (DataManager.isDeleted('csvTemplates', template.id)) {
                return;
            }
            
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

    editCSVTemplate(templateId) {
        const template = DataManager.csvTemplates[templateId];
        if (!template) return;

        const nameEl = document.getElementById('importBookName');
        const dataEl = document.getElementById('importCsvData');
        
        if (nameEl) nameEl.value = template.name;
        if (dataEl) dataEl.value = template.data;
    }

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
            
            // Analyticsが存在する場合のみ更新
            if (window.Analytics) {
                Analytics.updateHeatmapBookSelect();
                Analytics.updateRadarBookSelect();
            }
            
            alert('CSVデータをインポートしました');
        } else {
            alert('インポートに失敗しました');
        }
    }

    /**
     * CSVテンプレート削除（Firebase統合強化版）
     */
    deleteCSVTemplate(templateId) {
        if (confirm('このテンプレートを削除しますか？')) {
            const template = DataManager.csvTemplates[templateId];
            
            // 削除済みアイテムとしてマーク（Firebase統合）
            if (template) {
                DataManager.markAsDeleted('csvTemplates', templateId, {
                    templateName: template.name,
                    dataLength: template.data ? template.data.length : 0
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

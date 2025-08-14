/**
 * UIコンポーネントモジュール
 * カレンダー、タイマー、モーダルなどのUI部品を管理
 */
const UIComponents = {
    // カレンダー関連
    currentDate: new Date(),
    selectedDate: null,
    selectedPlanColor: '#3498db',
    
    // カレンダー描画
    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('calendarMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthDisplay.textContent = `${year}年${month + 1}月`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        // 月曜スタートに調整
        let firstDayOfWeek = firstDay.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        const lastDate = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        let html = '';
        
        // 曜日ヘッダー（月曜スタート）
        const weekdays = ['月', '火', '水', '木', '金', '土', '日'];
        weekdays.forEach((day, index) => {
            const isWeekend = index >= 5;
            html += `<div class="calendar-weekday ${isWeekend ? 'weekend' : ''}">${day}</div>`;
        });
        
        // 前月の日付
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${prevLastDate - i}</div>`;
        }
        
        // 当月の日付
        const today = new Date();
        for (let date = 1; date <= lastDate; date++) {
            const currentDay = new Date(year, month, date);
            const dayOfWeek = currentDay.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = currentDay.toDateString() === today.toDateString();
            const plans = this.getPlansForDate(currentDay);
            
            let classes = 'calendar-day';
            if (isWeekend) classes += ' weekend';
            if (isToday) classes += ' today';
            if (plans.length > 0) classes += ' has-plan';
            
            let planTexts = '';
            if (plans.length > 0) {
                planTexts = '<div class="calendar-day-plans">';
                plans.forEach(plan => {
                    const displayText = plan.displayType === 'bullet' ? '・' : plan.title.substring(0, 8);
                    planTexts += `<div class="calendar-plan-text" style="color: ${plan.color};">${displayText}</div>`;
                });
                planTexts += '</div>';
            }
            
            html += `<div class="${classes}" onclick="UIComponents.selectDate(${year}, ${month}, ${date})">
                <div class="calendar-day-number">${date}</div>
                ${planTexts}
            </div>`;
        }
        
        // 次月の日付
        const remainingDays = 42 - (firstDayOfWeek + lastDate);
        for (let date = 1; date <= remainingDays; date++) {
            html += `<div class="calendar-day other-month">${date}</div>`;
        }
        
        grid.innerHTML = html;
    },
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    },
    
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    },
    
    selectDate(year, month, date) {
        this.selectedDate = new Date(year, month, date);
        this.openPlanModalForDate(this.selectedDate);
    },
    
    getPlansForDate(date) {
        return DataManager.studyPlans.filter(plan => {
            const start = new Date(plan.startDate);
            const end = new Date(plan.endDate);
            const checkDate = new Date(date);
            
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            checkDate.setHours(0, 0, 0, 0);
            
            return checkDate >= start && checkDate <= end;
        });
    },
    
    // 学習計画モーダル
    openPlanModal() {
        const modal = document.getElementById('planModal');
        modal.classList.add('active');
        this.renderPlanModal(false);
    },
    
    openPlanModalForDate(date) {
        const modal = document.getElementById('planModal');
        modal.classList.add('active');
        this.renderPlanModal(true, date);
    },
    
    viewPlans() {
        const modal = document.getElementById('planModal');
        modal.classList.add('active');
        this.renderPlanModalList();
    },
    
    renderPlanModal(forDate = false, date = null) {
        const modal = document.getElementById('planModal');
        const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        modal.innerHTML = `
            <div class="plan-modal-content">
                <div class="modal-header">
                    <h3>📅 学習計画を追加</h3>
                    <button class="modal-close" onclick="UIComponents.closePlanModal()">×</button>
                </div>
                
                <div class="plan-form-group">
                    <label class="plan-form-label">計画タイトル</label>
                    <input type="text" class="plan-form-control" id="planTitle" placeholder="例：民法総則の復習">
                </div>
                
                <div class="plan-form-group">
                    <label class="plan-form-label">計画内容</label>
                    <textarea class="plan-form-control" id="planContent" rows="3" placeholder="学習内容の詳細を入力"></textarea>
                </div>
                
                <div class="plan-form-group">
                    <label class="plan-form-label">表示形式</label>
                    <div class="plan-display-type">
                        <label>
                            <input type="radio" name="displayType" value="bullet" checked>
                            <span>・</span>
                        </label>
                        <label>
                            <input type="radio" name="displayType" value="text">
                            <span>通常表示</span>
                        </label>
                    </div>
                </div>
                
                <div class="plan-form-group">
                    <label class="plan-form-label">日付範囲</label>
                    <div class="date-range-inputs">
                        <input type="date" class="plan-form-control" id="planStartDate" value="${dateStr}">
                        <span>〜</span>
                        <input type="date" class="plan-form-control" id="planEndDate" value="${dateStr}">
                    </div>
                </div>
                
                <div class="plan-form-group">
                    <label class="plan-form-label">色設定</label>
                    <div class="color-picker">
                        <div class="color-option selected" style="background: #3498db;" data-color="#3498db" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #10b981;" data-color="#10b981" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #f59e0b;" data-color="#f59e0b" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #ef4444;" data-color="#ef4444" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #8b5cf6;" data-color="#8b5cf6" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #ec4899;" data-color="#ec4899" onclick="UIComponents.selectPlanColor(this)"></div>
                        <div class="color-option" style="background: #6b7280;" data-color="#6b7280" onclick="UIComponents.selectPlanColor(this)"></div>
                    </div>
                </div>
                
                <input type="hidden" id="editPlanId" value="">
                <button class="save-button" onclick="UIComponents.savePlan()">計画を保存</button>
            </div>
        `;
    },
    
    renderPlanModalList() {
        const modal = document.getElementById('planModal');
        
        modal.innerHTML = `
            <div class="plan-modal-content">
                <div class="modal-header">
                    <h3>📋 計画一覧</h3>
                    <button class="modal-close" onclick="UIComponents.closePlanModal()">×</button>
                </div>
                
                <div class="plan-list" id="planListContent">
                    ${this.renderPlanList()}
                </div>
            </div>
        `;
    },
    
    renderPlanList() {
        if (DataManager.studyPlans.length === 0) {
            return '<p style="color: var(--gray); text-align: center;">計画がありません</p>';
        }
        
        return DataManager.studyPlans.map(plan => `
            <div class="plan-item">
                <div style="display: flex; align-items: center;">
                    <div class="plan-item-color" style="background: ${plan.color};"></div>
                    <div class="plan-item-content">
                        <div class="plan-item-title">${plan.title}</div>
                        <div class="plan-item-date">${plan.startDate} 〜 ${plan.endDate}</div>
                    </div>
                </div>
                <div class="plan-item-actions">
                    <button class="plan-item-edit" onclick="UIComponents.editPlan(${plan.id})">✏️</button>
                    <button class="plan-item-delete" onclick="UIComponents.deletePlan(${plan.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    },
    
    selectPlanColor(element) {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedPlanColor = element.dataset.color;
    },
    
    savePlan() {
        const title = document.getElementById('planTitle').value;
        const content = document.getElementById('planContent').value;
        const startDate = document.getElementById('planStartDate').value;
        const endDate = document.getElementById('planEndDate').value;
        const displayType = document.querySelector('input[name="displayType"]:checked').value;
        const editId = document.getElementById('editPlanId').value;
        
        if (!title || !startDate || !endDate) {
            alert('必須項目を入力してください');
            return;
        }
        
        if (editId) {
            const index = DataManager.studyPlans.findIndex(p => p.id === parseInt(editId));
            if (index !== -1) {
                DataManager.studyPlans[index] = {
                    ...DataManager.studyPlans[index],
                    title,
                    content,
                    startDate,
                    endDate,
                    color: this.selectedPlanColor,
                    displayType
                };
            }
        } else {
            const plan = {
                id: Date.now(),
                title,
                content,
                startDate,
                endDate,
                color: this.selectedPlanColor,
                displayType
            };
            DataManager.studyPlans.push(plan);
        }
        
        DataManager.saveStudyPlans();
        this.renderCalendar();
        alert('学習計画を保存しました');
        this.closePlanModal();
    },
    
    editPlan(planId) {
        const plan = DataManager.studyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        this.renderPlanModal();
        
        document.getElementById('planTitle').value = plan.title;
        document.getElementById('planContent').value = plan.content || '';
        document.getElementById('planStartDate').value = plan.startDate;
        document.getElementById('planEndDate').value = plan.endDate;
        document.getElementById('editPlanId').value = plan.id;
        
        document.querySelector(`input[name="displayType"][value="${plan.displayType || 'text'}"]`).checked = true;
        
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        const colorOption = document.querySelector(`.color-option[data-color="${plan.color}"]`);
        if (colorOption) {
            colorOption.classList.add('selected');
            this.selectedPlanColor = plan.color;
        }
    },
    
    deletePlan(planId) {
        if (confirm('この計画を削除しますか？')) {
            DataManager.studyPlans = DataManager.studyPlans.filter(p => p.id !== planId);
            DataManager.saveStudyPlans();
            this.renderCalendar();
            this.renderPlanModalList();
        }
    },
    
    closePlanModal() {
        document.getElementById('planModal').classList.remove('active');
    },
    
    // パンくずリスト
    updateBreadcrumb(bookName, path) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!bookName) return;
        
        const items = [bookName, ...path];
        
        let html = '';
        items.forEach((item, index) => {
            if (index > 0) html += '<span class="breadcrumb-separator">›</span>';
            html += `<span class="breadcrumb-item ${index === items.length - 1 ? 'active' : ''}" 
                     onclick="App.navigateTo(${index - 1})">${item}</span>`;
        });
        
        breadcrumb.innerHTML = html;
    },
    
    // アコーディオン
    toggleAccordion(header) {
        header.classList.toggle('active');
        const content = header.nextElementSibling;
        content.classList.toggle('active');
    },
    
    // ダイアログ
    showDialog(title, body, onConfirm) {
        document.getElementById('dialogTitle').textContent = title;
        document.getElementById('dialogBody').innerHTML = body;
        document.getElementById('dialogConfirmBtn').onclick = onConfirm;
        document.getElementById('dialogOverlay').style.display = 'block';
        document.getElementById('inputDialog').style.display = 'block';
    },
    
    closeDialog() {
        document.getElementById('dialogOverlay').style.display = 'none';
        document.getElementById('inputDialog').style.display = 'none';
    },
    
    // 問題集カード並び替え
    toggleBookSort() {
        App.sortMode = !App.sortMode;
        App.renderBookCards();
        
        if (App.sortMode) {
            this.enableBookDragAndDrop();
        }
    },
    
    enableBookDragAndDrop() {
        const container = document.getElementById('bookCardsContainer');
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
                const afterElement = UIComponents.getDragAfterElement(container, e.clientY);
                
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
    },
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.book-card:not(.dragging),.card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    
    // 試験日カウントダウン更新
    updateExamCountdown() {
        const countdown = document.getElementById('examCountdown');
        if (DataManager.examDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const exam = new Date(DataManager.examDate);
            exam.setHours(0, 0, 0, 0);
            const diffTime = exam - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                countdown.innerHTML = `試験日まで <span class="days">${diffDays}</span> 日`;
            } else if (diffDays === 0) {
                countdown.innerHTML = `<span class="days">試験当日！</span>`;
            } else {
                countdown.innerHTML = `試験終了`;
            }
        } else {
            countdown.innerHTML = `試験日を設定してください`;
        }
    }
};

/**
 * タイマーモジュール
 */
const TimerModule = {
    timerInterval: null,
    stopwatchTime: 0,
    countdownTime: 0,
    intervalTime: 0,
    currentIntervalSet: 0,
    isWorkTime: true,
    timerMode: 'stopwatch',
    
    openModal() {
        const modal = document.getElementById('timerModal');
        modal.classList.add('active');
        this.renderModal();
    },
    
    closeModal() {
        document.getElementById('timerModal').classList.remove('active');
    },
    
    renderModal() {
        const modal = document.getElementById('timerModal');
        modal.innerHTML = `
            <div class="timer-modal-content">
                <div class="modal-header">
                    <h3>⏰ タイマー</h3>
                    <button class="modal-close" onclick="TimerModule.closeModal()">×</button>
                </div>
                
                <div class="timer-tabs">
                    <button class="timer-tab active" onclick="TimerModule.switchTab('stopwatch', this)">ストップウォッチ</button>
                    <button class="timer-tab" onclick="TimerModule.switchTab('countdown', this)">タイマー</button>
                    <button class="timer-tab" onclick="TimerModule.switchTab('interval', this)">インターバル</button>
                </div>
                
                <div id="stopwatchTab" class="timer-tab-content">
                    <div class="timer-display-large" id="stopwatchDisplay">00:00:00</div>
                    <div class="timer-controls">
                        <button class="timer-btn start" onclick="TimerModule.startStopwatch()">開始</button>
                        <button class="timer-btn pause" onclick="TimerModule.pauseStopwatch()">一時停止</button>
                        <button class="timer-btn reset" onclick="TimerModule.resetStopwatch()">リセット</button>
                    </div>
                </div>
                
                <div id="countdownTab" class="timer-tab-content" style="display: none;">
                    <div class="timer-input-group">
                        <label class="timer-input-label">タイマー設定</label>
                        <div class="timer-input-row">
                            <input type="number" class="timer-input" id="countdownHours" placeholder="時" min="0" max="23">
                            <span>時間</span>
                            <input type="number" class="timer-input" id="countdownMinutes" placeholder="分" min="0" max="59">
                            <span>分</span>
                            <input type="number" class="timer-input" id="countdownSeconds" placeholder="秒" min="0" max="59">
                            <span>秒</span>
                        </div>
                    </div>
                    <div class="timer-display-large" id="countdownDisplay">00:00:00</div>
                    <div class="timer-controls">
                        <button class="timer-btn start" onclick="TimerModule.startCountdown()">開始</button>
                        <button class="timer-btn pause" onclick="TimerModule.pauseCountdown()">一時停止</button>
                        <button class="timer-btn reset" onclick="TimerModule.resetCountdown()">リセット</button>
                    </div>
                </div>
                
                <div id="intervalTab" class="timer-tab-content" style="display: none;">
                    <div class="timer-input-group">
                        <label class="timer-input-label">作業時間</label>
                        <div class="timer-input-row">
                            <input type="number" class="timer-input" id="workMinutes" value="25" min="1">
                            <span>分</span>
                        </div>
                    </div>
                    <div class="timer-input-group">
                        <label class="timer-input-label">休憩時間</label>
                        <div class="timer-input-row">
                            <input type="number" class="timer-input" id="breakMinutes" value="5" min="1">
                            <span>分</span>
                        </div>
                    </div>
                    <div class="timer-input-group">
                        <label class="timer-input-label">セット数</label>
                        <div class="timer-input-row">
                            <input type="number" class="timer-input" id="intervalSets" value="4" min="1">
                            <span>セット</span>
                        </div>
                    </div>
                    <div class="timer-display-large" id="intervalDisplay">00:00</div>
                    <div style="text-align: center; margin: 10px 0;">
                        <span id="intervalStatus">待機中</span> | 
                        <span id="intervalSetCount">0/0 セット</span>
                    </div>
                    <div class="timer-controls">
                        <button class="timer-btn start" onclick="TimerModule.startInterval()">開始</button>
                        <button class="timer-btn pause" onclick="TimerModule.pauseInterval()">一時停止</button>
                        <button class="timer-btn reset" onclick="TimerModule.resetInterval()">リセット</button>
                    </div>
                </div>
            </div>
        `;
        
        this.updateDisplay();
    },
    
    switchTab(tab, btn) {
        document.querySelectorAll('.timer-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.timer-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        document.getElementById(tab + 'Tab').style.display = 'block';
        this.timerMode = tab;
    },
    
    // ストップウォッチ機能
    startStopwatch() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            this.stopwatchTime++;
            this.updateStopwatchDisplay();
            this.updateHeaderDisplay();
        }, 1000);
        
        document.getElementById('timerDisplay').classList.add('active');
    },
    
    pauseStopwatch() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    },
    
    resetStopwatch() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
        document.getElementById('timerDisplay').classList.remove('active');
    },
    
    updateStopwatchDisplay() {
        const hours = Math.floor(this.stopwatchTime / 3600);
        const minutes = Math.floor((this.stopwatchTime % 3600) / 60);
        const seconds = this.stopwatchTime % 60;
        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const el = document.getElementById('stopwatchDisplay');
        if (el) el.textContent = display;
        
        if (this.timerMode === 'stopwatch') {
            document.getElementById('timerDisplay').textContent = display;
        }
    },
    
    // カウントダウン機能
    startCountdown() {
        if (this.timerInterval) return;
        
        const hours = parseInt(document.getElementById('countdownHours').value) || 0;
        const minutes = parseInt(document.getElementById('countdownMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('countdownSeconds').value) || 0;
        
        if (this.countdownTime === 0) {
            this.countdownTime = hours * 3600 + minutes * 60 + seconds;
        }
        
        if (this.countdownTime === 0) {
            alert('時間を設定してください');
            return;
        }
        
        this.timerInterval = setInterval(() => {
            this.countdownTime--;
            this.updateCountdownDisplay();
            this.updateHeaderDisplay();
            
            if (this.countdownTime <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                alert('タイマー終了！');
                this.resetCountdown();
            }
        }, 1000);
        
        document.getElementById('timerDisplay').classList.add('active');
    },
    
    pauseCountdown() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    },
    
    resetCountdown() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.countdownTime = 0;
        this.updateCountdownDisplay();
        document.getElementById('timerDisplay').classList.remove('active');
    },
    
    updateCountdownDisplay() {
        const hours = Math.floor(this.countdownTime / 3600);
        const minutes = Math.floor((this.countdownTime % 3600) / 60);
        const seconds = this.countdownTime % 60;
        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const el = document.getElementById('countdownDisplay');
        if (el) el.textContent = display;
        
        if (this.timerMode === 'countdown') {
            document.getElementById('timerDisplay').textContent = display;
        }
    },
    
    // インターバル機能
    startInterval() {
        if (this.timerInterval) return;
        
        const workMinutes = parseInt(document.getElementById('workMinutes').value) || 25;
        const breakMinutes = parseInt(document.getElementById('breakMinutes').value) || 5;
        const totalSets = parseInt(document.getElementById('intervalSets').value) || 4;
        
        if (this.intervalTime === 0) {
            this.currentIntervalSet = 1;
            this.isWorkTime = true;
            this.intervalTime = workMinutes * 60;
        }
        
        this.updateIntervalStatus(totalSets);
        
        this.timerInterval = setInterval(() => {
            this.intervalTime--;
            this.updateIntervalDisplay();
            this.updateHeaderDisplay();
            
            if (this.intervalTime <= 0) {
                if (this.isWorkTime) {
                    this.isWorkTime = false;
                    this.intervalTime = breakMinutes * 60;
                    alert('休憩時間です！');
                } else {
                    if (this.currentIntervalSet >= totalSets) {
                        clearInterval(this.timerInterval);
                        this.timerInterval = null;
                        alert('インターバル完了！');
                        this.resetInterval();
                        return;
                    }
                    this.currentIntervalSet++;
                    this.isWorkTime = true;
                    this.intervalTime = workMinutes * 60;
                    alert('作業時間です！');
                }
                this.updateIntervalStatus(totalSets);
            }
        }, 1000);
        
        document.getElementById('timerDisplay').classList.add('active');
    },
    
    pauseInterval() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    },
    
    resetInterval() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.intervalTime = 0;
        this.currentIntervalSet = 0;
        this.isWorkTime = true;
        this.updateIntervalDisplay();
        this.updateIntervalStatus(0);
        document.getElementById('timerDisplay').classList.remove('active');
    },
    
    updateIntervalDisplay() {
        const minutes = Math.floor(this.intervalTime / 60);
        const seconds = this.intervalTime % 60;
        const display = `${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const el = document.getElementById('intervalDisplay');
        if (el) el.textContent = display;
        
        if (this.timerMode === 'interval') {
            document.getElementById('timerDisplay').textContent = display;
        }
    },
    
    updateIntervalStatus(totalSets) {
        const statusEl = document.getElementById('intervalStatus');
        const countEl = document.getElementById('intervalSetCount');
        
        if (statusEl) statusEl.textContent = this.isWorkTime ? '作業中' : '休憩中';
        if (countEl) countEl.textContent = `${this.currentIntervalSet}/${totalSets} セット`;
    },
    
    updateHeaderDisplay() {
        if (this.timerMode === 'stopwatch') {
            this.updateStopwatchDisplay();
        } else if (this.timerMode === 'countdown') {
            this.updateCountdownDisplay();
        } else if (this.timerMode === 'interval') {
            this.updateIntervalDisplay();
        }
    },
    
    updateDisplay() {
        this.updateStopwatchDisplay();
        this.updateCountdownDisplay();
        this.updateIntervalDisplay();
    },
    
    pad(num) {
        return num.toString().padStart(2, '0');
    }

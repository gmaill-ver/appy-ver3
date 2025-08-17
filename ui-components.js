/**
 * UIComponents - UIコンポーネント管理モジュール
 */
class UIComponentsClass {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedPlanColor = '#3498db';
        this.colorPickerInitialized = false;
    }

    /**
     * 初期化
     */
    initialize() {
        // DataManagerが初期化されるまで待つ
        if (!window.DataManager) {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        this.renderCalendar();
        this.initializeColorPicker();
        this.updateExamCountdown();
    }

    /**
     * カレンダー描画
     */
    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('calendarMonth');
        
        if (!grid || !monthDisplay) return;

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
        
        // 曜日ヘッダー
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
    }

    /**
     * 月を変更
     */
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    /**
     * 今日に移動
     */
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    /**
     * 日付選択
     */
    selectDate(year, month, date) {
        this.selectedDate = new Date(year, month, date);
        this.openPlanModalForDate(this.selectedDate);
    }

    /**
     * 日付の計画を取得
     */
    getPlansForDate(date) {
        if (!DataManager.studyPlans) {
            return [];
        }

        return DataManager.studyPlans.filter(plan => {
            const start = new Date(plan.startDate);
            const end = new Date(plan.endDate);
            const checkDate = new Date(date);
            
            // 時間をリセット
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            checkDate.setHours(0, 0, 0, 0);
            
            return checkDate >= start && checkDate <= end;
        });
    }

    /**
     * 計画モーダルを開く
     */
    openPlanModal() {
        const modal = document.getElementById('planModal');
        if (!modal) return;

        modal.classList.add('active');
        document.getElementById('planModalTitle').textContent = '📅 学習計画を追加';
        document.getElementById('planFormSection').style.display = 'block';
        document.getElementById('planListSection').style.display = 'none';
        
        // 今日の日付を初期値に設定
        const today = new Date().toISOString().split('T')[0];
        const startDateEl = document.getElementById('planStartDate');
        const endDateEl = document.getElementById('planEndDate');
        
        if (startDateEl) startDateEl.value = today;
        if (endDateEl) endDateEl.value = today;
        
        // フォームをクリア
        const titleEl = document.getElementById('planTitle');
        const contentEl = document.getElementById('planContent');
        const editIdEl = document.getElementById('editPlanId');
        
        if (titleEl) titleEl.value = '';
        if (contentEl) contentEl.value = '';
        if (editIdEl) editIdEl.value = '';
        
        // 表示形式をリセット
        const bulletRadio = document.querySelector('input[name="displayType"][value="bullet"]');
        if (bulletRadio) bulletRadio.checked = true;
    }

    /**
     * 日付指定で計画モーダルを開く
     */
    openPlanModalForDate(date) {
        this.openPlanModal();
        
        // 選択した日付を初期値に設定
        const dateStr = date.toISOString().split('T')[0];
        const startDateEl = document.getElementById('planStartDate');
        const endDateEl = document.getElementById('planEndDate');
        
        if (startDateEl) startDateEl.value = dateStr;
        if (endDateEl) endDateEl.value = dateStr;
    }

    /**
     * 計画モーダルを閉じる
     */
    closePlanModal() {
        const modal = document.getElementById('planModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 計画一覧を表示
     */
    viewPlans() {
        const modal = document.getElementById('planModal');
        if (!modal) return;

        modal.classList.add('active');
        
        const titleEl = document.getElementById('planModalTitle');
        if (titleEl) titleEl.textContent = '📋 計画一覧';
        
        const formSection = document.getElementById('planFormSection');
        const listSection = document.getElementById('planListSection');
        
        if (formSection) formSection.style.display = 'none';
        if (listSection) listSection.style.display = 'block';
        
        this.renderPlanList();
    }

    /**
     * 計画リストを描画
     */
    renderPlanList() {
        const container = document.getElementById('planListContent');
        if (!container) return;

        if (!DataManager.studyPlans || DataManager.studyPlans.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">計画がありません</p>';
            return;
        }
        
        let html = '';
        DataManager.studyPlans.forEach(plan => {
            html += `
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
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * 計画を保存
     */
    savePlan() {
        const title = document.getElementById('planTitle')?.value;
        const content = document.getElementById('planContent')?.value;
        const startDate = document.getElementById('planStartDate')?.value;
        const endDate = document.getElementById('planEndDate')?.value;
        const displayType = document.querySelector('input[name="displayType"]:checked')?.value;
        const editId = document.getElementById('editPlanId')?.value;
        
        if (!title || !startDate || !endDate) {
            alert('必須項目を入力してください');
            return;
        }
        
        if (editId) {
            // 編集モード
            const index = DataManager.studyPlans.findIndex(p => p.id === parseInt(editId));
            if (index !== -1) {
                DataManager.studyPlans[index] = {
                    ...DataManager.studyPlans[index],
                    title,
                    content,
                    startDate,
                    endDate,
                    color: this.selectedPlanColor,
                    displayType: displayType || 'text'
                };
            }
        } else {
            // 新規追加
            const plan = {
                id: Date.now(),
                title,
                content,
                startDate,
                endDate,
                color: this.selectedPlanColor,
                displayType: displayType || 'text'
            };
            DataManager.studyPlans.push(plan);
        }
        
        DataManager.saveStudyPlans();
        this.renderCalendar();
        
        // フォームクリア
        document.getElementById('planTitle').value = '';
        document.getElementById('planContent').value = '';
        document.getElementById('editPlanId').value = '';
        
        alert('学習計画を保存しました');
        this.closePlanModal();
    }

    /**
     * 計画を編集
     */
    editPlan(planId) {
        const plan = DataManager.studyPlans.find(p => p.id === planId);
        if (!plan) return;
        
        this.openPlanModal();
        
        // フォームに値を設定
        const titleEl = document.getElementById('planTitle');
        const contentEl = document.getElementById('planContent');
        const startDateEl = document.getElementById('planStartDate');
        const endDateEl = document.getElementById('planEndDate');
        const editIdEl = document.getElementById('editPlanId');
        
        if (titleEl) titleEl.value = plan.title;
        if (contentEl) contentEl.value = plan.content || '';
        if (startDateEl) startDateEl.value = plan.startDate;
        if (endDateEl) endDateEl.value = plan.endDate;
        if (editIdEl) editIdEl.value = plan.id;
        
        // 表示形式を設定
        const displayRadio = document.querySelector(`input[name="displayType"][value="${plan.displayType || 'text'}"]`);
        if (displayRadio) displayRadio.checked = true;
        
        // 色を設定
        this.setSelectedColor(plan.color);
    }

    /**
     * 計画を削除
     */
    deletePlan(planId) {
        if (confirm('この計画を削除しますか？')) {
            const planIndex = DataManager.studyPlans.findIndex(p => p.id === planId);
            
            if (planIndex !== -1) {
                const plan = DataManager.studyPlans[planIndex];
                
                // 削除済みアイテムとしてマーク
                DataManager.markAsDeleted('studyPlan', planId, {
                    title: plan.title,
                    startDate: plan.startDate,
                    endDate: plan.endDate
                });
                
                // 配列から削除
                DataManager.studyPlans.splice(planIndex, 1);
                DataManager.saveStudyPlans();
                
                this.renderCalendar();
                this.renderPlanList();
            }
        }
    }

    /**
     * カラーピッカー初期化
     */
    initializeColorPicker() {
        if (this.colorPickerInitialized) return;

        const colorPicker = document.getElementById('colorPicker');
        if (!colorPicker) return;

        const colorOptions = colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.setSelectedColor(e.target.dataset.color);
            });
        });

        this.colorPickerInitialized = true;
    }

    /**
     * 選択色を設定
     */
    setSelectedColor(color) {
        this.selectedPlanColor = color;
        
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === color) {
                option.classList.add('selected');
            }
        });
    }

    /**
     * 試験日カウントダウン更新
     */
    updateExamCountdown() {
        const countdown = document.getElementById('examCountdown');
        if (!countdown) return;

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
}

// グローバルに公開
window.UIComponents = new UIComponentsClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    UIComponents.initialize();
});

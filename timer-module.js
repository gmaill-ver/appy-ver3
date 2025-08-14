/**
 * TimerModule - タイマー機能モジュール
 */
class TimerModuleClass {
    constructor() {
        this.timerInterval = null;
        this.stopwatchTime = 0;
        this.countdownTime = 0;
        this.intervalTime = 0;
        this.currentIntervalSet = 0;
        this.isWorkTime = true;
        this.timerMode = 'stopwatch';
        this.totalSets = 4;
    }

    /**
     * モーダルを開く
     */
    openModal() {
        const modal = document.getElementById('timerModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * モーダルを閉じる
     */
    closeModal() {
        const modal = document.getElementById('timerModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * タブ切り替え
     */
    switchTab(tab, btn) {
        // タブボタンの状態を更新
        document.querySelectorAll('.timer-tab').forEach(t => {
            t.classList.remove('active');
        });
        if (btn) {
            btn.classList.add('active');
        }

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.timer-tab-content').forEach(content => {
            content.style.display = 'none';
        });

        const tabContent = document.getElementById(tab + 'Tab');
        if (tabContent) {
            tabContent.style.display = 'block';
        }

        this.timerMode = tab;
    }

    /**
     * ストップウォッチ開始
     */
    startStopwatch() {
        if (this.timerInterval) return;

        this.timerInterval = setInterval(() => {
            this.stopwatchTime++;
            this.updateStopwatchDisplay();
            this.updateHeaderDisplay();
        }, 1000);

        this.showHeaderTimer();
    }

    /**
     * ストップウォッチ一時停止
     */
    pauseStopwatch() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * ストップウォッチリセット
     */
    resetStopwatch() {
        this.pauseStopwatch();
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
        this.hideHeaderTimer();
    }

    /**
     * ストップウォッチ表示更新
     */
    updateStopwatchDisplay() {
        const hours = Math.floor(this.stopwatchTime / 3600);
        const minutes = Math.floor((this.stopwatchTime % 3600) / 60);
        const seconds = this.stopwatchTime % 60;
        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const stopwatchDisplay = document.getElementById('stopwatchDisplay');
        if (stopwatchDisplay) {
            stopwatchDisplay.textContent = display;
        }

        if (this.timerMode === 'stopwatch') {
            this.updateHeaderDisplay(display);
        }
    }

    /**
     * カウントダウン開始
     */
    startCountdown() {
        if (this.timerInterval) return;

        const hours = parseInt(document.getElementById('countdownHours')?.value || 0);
        const minutes = parseInt(document.getElementById('countdownMinutes')?.value || 0);
        const seconds = parseInt(document.getElementById('countdownSeconds')?.value || 0);

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

            if (this.countdownTime <= 0) {
                this.pauseCountdown();
                this.playSound();
                alert('タイマー終了！');
                this.resetCountdown();
            }
        }, 1000);

        this.showHeaderTimer();
    }

    /**
     * カウントダウン一時停止
     */
    pauseCountdown() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * カウントダウンリセット
     */
    resetCountdown() {
        this.pauseCountdown();
        this.countdownTime = 0;
        this.updateCountdownDisplay();
        this.hideHeaderTimer();
    }

    /**
     * カウントダウン表示更新
     */
    updateCountdownDisplay() {
        const hours = Math.floor(this.countdownTime / 3600);
        const minutes = Math.floor((this.countdownTime % 3600) / 60);
        const seconds = this.countdownTime % 60;
        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const countdownDisplay = document.getElementById('countdownDisplay');
        if (countdownDisplay) {
            countdownDisplay.textContent = display;
        }

        if (this.timerMode === 'countdown') {
            this.updateHeaderDisplay(display);
        }
    }

    /**
     * インターバル開始
     */
    startInterval() {
        if (this.timerInterval) return;

        const workMinutes = parseInt(document.getElementById('workMinutes')?.value || 25);
        const breakMinutes = parseInt(document.getElementById('breakMinutes')?.value || 5);
        this.totalSets = parseInt(document.getElementById('intervalSets')?.value || 4);

        if (this.intervalTime === 0) {
            this.currentIntervalSet = 1;
            this.isWorkTime = true;
            this.intervalTime = workMinutes * 60;
        }

        this.updateIntervalStatus();

        this.timerInterval = setInterval(() => {
            this.intervalTime--;
            this.updateIntervalDisplay();

            if (this.intervalTime <= 0) {
                this.playSound();
                
                if (this.isWorkTime) {
                    this.isWorkTime = false;
                    this.intervalTime = breakMinutes * 60;
                    alert('休憩時間です！');
                } else {
                    if (this.currentIntervalSet >= this.totalSets) {
                        this.pauseInterval();
                        alert('インターバル完了！');
                        this.resetInterval();
                        return;
                    }
                    this.currentIntervalSet++;
                    this.isWorkTime = true;
                    this.intervalTime = workMinutes * 60;
                    alert('作業時間です！');
                }
                this.updateIntervalStatus();
            }
        }, 1000);

        this.showHeaderTimer();
    }

    /**
     * インターバル一時停止
     */
    pauseInterval() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * インターバルリセット
     */
    resetInterval() {
        this.pauseInterval();
        this.intervalTime = 0;
        this.currentIntervalSet = 0;
        this.isWorkTime = true;
        this.updateIntervalDisplay();
        this.updateIntervalStatus();
        this.hideHeaderTimer();
    }

    /**
     * インターバル表示更新
     */
    updateIntervalDisplay() {
        const minutes = Math.floor(this.intervalTime / 60);
        const seconds = this.intervalTime % 60;
        const display = `${this.pad(minutes)}:${this.pad(seconds)}`;
        
        const intervalDisplay = document.getElementById('intervalDisplay');
        if (intervalDisplay) {
            intervalDisplay.textContent = display;
        }

        if (this.timerMode === 'interval') {
            this.updateHeaderDisplay(display);
        }
    }

    /**
     * インターバルステータス更新
     */
    updateIntervalStatus() {
        const statusEl = document.getElementById('intervalStatus');
        const countEl = document.getElementById('intervalSetCount');
        
        if (statusEl) {
            statusEl.textContent = this.isWorkTime ? '作業中' : '休憩中';
        }
        
        if (countEl) {
            countEl.textContent = `${this.currentIntervalSet}/${this.totalSets} セット`;
        }
    }

    /**
     * ヘッダータイマー表示更新
     */
    updateHeaderDisplay(display) {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            if (display) {
                timerDisplay.textContent = display;
            } else {
                // 現在のモードに応じて表示を更新
                if (this.timerMode === 'stopwatch') {
                    this.updateStopwatchDisplay();
                } else if (this.timerMode === 'countdown') {
                    this.updateCountdownDisplay();
                } else if (this.timerMode === 'interval') {
                    this.updateIntervalDisplay();
                }
            }
        }
    }

    /**
     * ヘッダータイマー表示
     */
    showHeaderTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.classList.add('active');
        }
    }

    /**
     * ヘッダータイマー非表示
     */
    hideHeaderTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.classList.remove('active');
        }
    }

    /**
     * 数値パディング
     */
    pad(num) {
        return num.toString().padStart(2, '0');
    }

    /**
     * 音を鳴らす（ブラウザのNotification APIを使用）
     */
    playSound() {
        // ビープ音の代わりに振動やNotificationを使用
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
        
        // Notification APIが使用可能な場合
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('タイマー通知', {
                body: this.timerMode === 'interval' 
                    ? (this.isWorkTime ? '休憩時間です' : '作業時間です')
                    : 'タイマーが終了しました',
                icon: '⏰'
            });
        }
    }

    /**
     * 通知許可をリクエスト
     */
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }
}

// グローバルに公開
window.TimerModule = new TimerModuleClass();

// 初期化時に通知許可をリクエスト
document.addEventListener('DOMContentLoaded', () => {
    TimerModule.requestNotificationPermission();
});

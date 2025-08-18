/**
 * QAModule - 一問一答専用モジュール（完全版）
 */
class QAModuleClass {
    constructor() {
        this.currentSet = [];
        this.currentIndex = 0;
        this.answerShown = false;
        this.stats = {
            total: 0,
            correct: 0,
            wrong: 0
        };
        this.sessionActive = false;
        this.currentSetName = '';
        this.addQuestionExpanded = false; // アコーディオンの状態
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
    }

    /**
     * UIコンテンツを生成（問題開始エリアが上、手動追加がアコーディオン）
     */
    renderQAContent() {
        const sets = this.getSetList();
        
        let html = '<div style="padding: 10px;">';
        
        // === 1. 問題開始エリア（上部に配置） ===
        html += `
            <div class="card">
                <div class="card-header">
                    <span class="card-icon">🎯</span>
                    <span class="card-title">学習開始</span>
                </div>
                
                <div class="form-group">
                    <label class="form-label">問題集を選択</label>
                    <select class="form-control" id="qaSetSelect" onchange="QAModule.selectSet(this.value)">
                        <option value="">問題集を選択してください</option>
        `;
        
        sets.forEach(name => {
            const count = this.getQuestions(name).length;
            html += `<option value="${name}">${name} (${count}問)</option>`;
        });
        
        html += `
                    </select>
                </div>
                
                <div id="qaProgress" style="display: none; justify-content: space-around; margin: 15px 0;">
                    <div class="qa-stat">
                        <span class="qa-stat-label">進捗</span>
                        <span class="qa-stat-value"><span id="qaCurrentNum">0</span>/<span id="qaTotalNum">0</span></span>
                    </div>
                    <div class="qa-stat">
                        <span class="qa-stat-label">正解</span>
                        <span class="qa-stat-value" id="qaCorrectCount">0</span>
                    </div>
                    <div class="qa-stat">
                        <span class="qa-stat-label">不正解</span>
                        <span class="qa-stat-value" id="qaWrongCount">0</span>
                    </div>
                </div>
                
                <div id="qaContent" style="min-height: 200px;">
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: var(--gray);">問題集を選択して開始ボタンを押してください</p>
                        <button class="save-button" style="margin-top: 20px;" onclick="QAModule.handleStart()">
                            学習開始
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // === 2. 問題手動追加エリア（アコーディオン化） ===
        html += `
            <div class="accordion" style="margin-top: 20px;">
                <div class="accordion-header ${this.addQuestionExpanded ? 'active' : ''}" 
                     onclick="QAModule.toggleAddQuestionAccordion(this)">
                    <span>➕ 問題を手動追加</span>
                    <span class="accordion-arrow">${this.addQuestionExpanded ? '▲' : '▼'}</span>
                </div>
                <div class="accordion-content ${this.addQuestionExpanded ? 'active' : ''}">
                    <div class="form-group">
                        <label class="form-label">問題集名（任意）</label>
                        <input type="text" class="form-control" id="qaNewSetName" 
                               placeholder="未入力の場合は「その他」に追加されます">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">問題文</label>
                        <textarea class="form-control" id="qaNewQuestion" 
                                  rows="3" placeholder="問題文を入力"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">答え</label>
                        <textarea class="form-control" id="qaNewAnswer" 
                                  rows="3" placeholder="答えを入力"></textarea>
                    </div>
                    
                    <button class="save-button" onclick="QAModule.handleAddQuestion()">
                        問題を追加
                    </button>
                </div>
            </div>
        `;
        
        // === 3. 登録済み問題リスト ===
        html += `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <span class="card-icon">📋</span>
                    <span class="card-title">登録済み問題</span>
                </div>
                <div id="qaListContent">${this.renderQAList()}</div>
            </div>
        `;
        
        html += '</div>';
        
        return html;
    }

    /**
     * アコーディオンの開閉
     */
    toggleAddQuestionAccordion(header) {
        this.addQuestionExpanded = !this.addQuestionExpanded;
        header.classList.toggle('active');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.toggle('active');
        }
        
        // アローアイコンの更新
        const arrow = header.querySelector('.accordion-arrow');
        if (arrow) {
            arrow.textContent = this.addQuestionExpanded ? '▲' : '▼';
        }
    }

    /**
     * 問題リストを生成
     */
    renderQAList() {
        let html = '';
        
        Object.entries(DataManager.qaQuestions || {}).forEach(([setName, questions]) => {
            if (questions.length === 0) return;
            
            html += `
                <div style="margin-bottom: 20px;">
                    <h5 style="color: var(--primary); margin-bottom: 10px;">${setName} (${questions.length}問)</h5>
            `;
            
            questions.forEach(q => {
                html += `
                    <div class="delete-list-item">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
                                Q: ${q.question}
                            </div>
                            <div style="font-size: 13px; color: var(--gray);">
                                A: ${q.answer}
                            </div>
                        </div>
                        <button class="delete-btn" 
                                onclick="QAModule.deleteQuestion('${setName}', ${q.id})"
                                style="min-width: 60px;">
                            削除
                        </button>
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        if (!html) {
            html = '<p style="color: var(--gray); text-align: center; padding: 20px;">問題がありません</p>';
        }
        
        return html;
    }

    /**
     * セット選択
     */
    selectSet(setName) {
        this.currentSetName = setName;
        const select = document.getElementById('qaSetSelect');
        if (select) {
            select.value = setName;
        }
    }

    /**
     * スタートオプション表示
     */
    showStartOptions() {
        const content = document.getElementById('qaContent');
        if (!content) return;
        
        content.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3>学習を開始</h3>
                <p>問題集を選択して開始ボタンを押してください</p>
                <button class="save-button" style="margin-top: 20px;" onclick="QAModule.handleStart()">
                    学習開始
                </button>
            </div>
        `;
    }

    /**
     * 管理ダイアログ表示
     */
    showManageDialog() {
        // 管理画面は親コンポーネントで表示されるため、ここでは何もしない
        console.log('Manage dialog requested');
    }

    /**
     * 開始ボタンのハンドラ
     */
    handleStart() {
        const select = document.getElementById('qaSetSelect');
        if (!select || !select.value) {
            alert('問題集を選択してください');
            return;
        }
        
        // DataManager.qaQuestionsが初期化されているか確認
        if (!DataManager.qaQuestions || Object.keys(DataManager.qaQuestions).length === 0) {
            alert('問題が登録されていません。先に問題を追加してください。');
            return;
        }
        
        if (!DataManager.qaQuestions[select.value]) {
            alert('選択した問題集に問題がありません。');
            return;
        }
        
        this.startSession(select.value);
    }

    /**
     * 一問一答開始
     */
    startSession(setName) {
        if (!setName || !DataManager.qaQuestions[setName]) {
            alert('問題集を選択してください');
            return false;
        }

        this.currentSet = [...DataManager.qaQuestions[setName]];
        this.currentIndex = 0;
        this.answerShown = false;
        this.stats = {
            total: this.currentSet.length,
            correct: 0,
            wrong: 0
        };
        this.sessionActive = true;

        this.updateProgress();
        this.showQuestion();
        return true;
    }

    /**
     * 現在の問題を表示
     */
    showQuestion() {
        if (!this.sessionActive || this.currentIndex >= this.currentSet.length) {
            this.endSession();
            return;
        }

        const question = this.currentSet[this.currentIndex];
        const content = document.getElementById('qaContent');
        
        if (!content) return;

        let html = `
            <div class="qa-question">${question.question}</div>
            <div class="qa-answer ${this.answerShown ? 'show' : ''}" id="qaAnswer">
                ${question.answer}
            </div>
            <div class="qa-controls">
        `;

        if (!this.answerShown) {
            html += `<button class="qa-btn show-answer" onclick="QAModule.showAnswer()">答えを見る</button>`;
        } else {
            html += `
                <button class="qa-btn correct" onclick="QAModule.markCorrect()">正解</button>
                <button class="qa-btn wrong" onclick="QAModule.markWrong()">不正解</button>
            `;
        }

        html += '</div>';
        content.innerHTML = html;
    }

    /**
     * 答えを表示
     */
    showAnswer() {
        this.answerShown = true;
        const answerEl = document.getElementById('qaAnswer');
        if (answerEl) {
            answerEl.classList.add('show');
        }
        this.showQuestion();
    }

    /**
     * 正解としてマーク
     */
    markCorrect() {
        this.stats.correct++;
        this.nextQuestion();
    }

    /**
     * 不正解としてマーク
     */
    markWrong() {
        this.stats.wrong++;
        this.nextQuestion();
    }

    /**
     * 次の問題へ
     */
    nextQuestion() {
        this.currentIndex++;
        this.answerShown = false;
        this.updateProgress();
        
        if (this.currentIndex >= this.currentSet.length) {
            this.endSession();
        } else {
            this.showQuestion();
        }
    }

    /**
     * 進捗を更新
     */
    updateProgress() {
        const currentNum = document.getElementById('qaCurrentNum');
        const totalNum = document.getElementById('qaTotalNum');
        const correctCount = document.getElementById('qaCorrectCount');
        const wrongCount = document.getElementById('qaWrongCount');
        const progress = document.getElementById('qaProgress');

        if (currentNum) currentNum.textContent = this.currentIndex + 1;
        if (totalNum) totalNum.textContent = this.stats.total;
        if (correctCount) correctCount.textContent = this.stats.correct;
        if (wrongCount) wrongCount.textContent = this.stats.wrong;
        
        if (progress && this.sessionActive) {
            progress.style.display = 'flex';
        }
    }

    /**
     * セッション終了
     */
    endSession() {
        this.sessionActive = false;
        const content = document.getElementById('qaContent');
        
        if (!content) return;

        const rate = this.stats.total > 0 
            ? Math.round((this.stats.correct / this.stats.total) * 100) 
            : 0;

        content.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3>学習完了！</h3>
                <div style="margin: 20px 0;">
                    <div style="font-size: 48px; font-weight: bold; color: var(--primary);">
                        ${rate}%
                    </div>
                    <div style="font-size: 18px; color: var(--gray);">正答率</div>
                </div>
                <div style="display: flex; justify-content: space-around; margin: 20px 0;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${this.stats.correct}</div>
                        <div style="color: var(--success);">正解</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${this.stats.wrong}</div>
                        <div style="color: var(--danger);">不正解</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold;">${this.stats.total}</div>
                        <div style="color: var(--gray);">総問題数</div>
                    </div>
                </div>
                <button class="save-button" onclick="QAModule.resetSession()">
                    別の問題集を選択
                </button>
            </div>
        `;

        // 学習記録を保存
        this.saveSessionRecord();
    }

    /**
     * セッションをリセット
     */
    resetSession() {
        this.sessionActive = false;
        this.currentSet = [];
        this.currentIndex = 0;
        this.answerShown = false;
        this.stats = {
            total: 0,
            correct: 0,
            wrong: 0
        };
        
        const content = document.getElementById('qaContent');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: var(--gray);">問題集を選択して開始ボタンを押してください</p>
                    <button class="save-button" style="margin-top: 20px;" onclick="QAModule.handleStart()">
                        学習開始
                    </button>
                </div>
            `;
        }
        
        const progress = document.getElementById('qaProgress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    /**
     * セッション記録を保存
     */
    saveSessionRecord() {
        if (this.stats.total === 0) return;

        const record = {
            type: 'qa',
            setName: this.currentSetName,
            date: new Date().toISOString(),
            stats: { ...this.stats },
            rate: Math.round((this.stats.correct / this.stats.total) * 100)
        };

        // DataManagerに記録を追加
        if (window.DataManager && DataManager.allRecords) {
            DataManager.allRecords.push(record);
            DataManager.saveAllRecords();
        }
    }

    /**
     * 問題追加のハンドラ
     */
    handleAddQuestion() {
        const setNameEl = document.getElementById('qaNewSetName');
        const questionEl = document.getElementById('qaNewQuestion');
        const answerEl = document.getElementById('qaNewAnswer');
        
        if (!setNameEl || !questionEl || !answerEl) {
            console.error('Required elements not found');
            return;
        }
        
        const setName = setNameEl.value.trim() || 'その他';
        const question = questionEl.value.trim();
        const answer = answerEl.value.trim();
        
        if (!question || !answer) {
            alert('問題文と答えを入力してください');
            return;
        }
        
        // DataManager.qaQuestionsが初期化されているか確認
        if (!DataManager.qaQuestions) {
            DataManager.qaQuestions = {};
        }
        
        if (this.addQuestion(setName, question, answer)) {
            // フォームをクリア
            questionEl.value = '';
            answerEl.value = '';
            // セット名は残しておく（連続入力しやすいように）
            
            // リストを更新
            const listContent = document.getElementById('qaListContent');
            if (listContent) {
                listContent.innerHTML = this.renderQAList();
            }
            
            // セレクトボックスも更新
            const select = document.getElementById('qaSetSelect');
            if (select) {
                const currentValue = select.value;
                const sets = this.getSetList();
                
                select.innerHTML = '<option value="">問題集を選択してください</option>';
                sets.forEach(name => {
                    const count = this.getQuestions(name).length;
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = `${name} (${count}問)`;
                    select.appendChild(option);
                });
                
                // 元の選択を復元
                if (currentValue) {
                    select.value = currentValue;
                }
            }
            
            // 成功メッセージ
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--success);
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 9999;
                font-weight: 600;
            `;
            successMsg.textContent = '✅ 問題を追加しました';
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 1500);
        }
    }

    /**
     * 問題を追加
     */
    addQuestion(setName, question, answer) {
        if (!setName || !question || !answer) return false;
        
        if (!DataManager.qaQuestions[setName]) {
            DataManager.qaQuestions[setName] = [];
        }
        
        DataManager.qaQuestions[setName].push({
            id: Date.now(),
            question: question,
            answer: answer
        });
        
        DataManager.saveQAQuestions();
        return true;
    }

    /**
     * 問題を削除
     */
    deleteQuestion(setName, questionId) {
        if (!confirm('この問題を削除しますか？')) return;
        
        if (!DataManager.qaQuestions[setName]) return;
        
        // ★追加: 削除済みアイテムリストに追加
        if (!DataManager.deletedItems) {
            DataManager.deletedItems = [];
        }
        DataManager.deletedItems.push({
            type: 'qa',
            setName: setName,
            questionId: questionId,
            deletedAt: new Date().toISOString()
        });
        
        DataManager.qaQuestions[setName] = DataManager.qaQuestions[setName]
            .filter(q => q.id !== questionId);
        }
        
        DataManager.saveQAQuestions();
        
        // UIを更新
        const listContent = document.getElementById('qaListContent');
        if (listContent) {
            listContent.innerHTML = this.renderQAList();
        }
        
        // セレクトボックスも更新
        const select = document.getElementById('qaSetSelect');
        if (select) {
            const currentValue = select.value;
            const sets = this.getSetList();
            
            select.innerHTML = '<option value="">問題集を選択してください</option>';
            sets.forEach(name => {
                const count = this.getQuestions(name).length;
                const option = document.createElement('option');
                option.value = name;
                option.textContent = `${name} (${count}問)`;
                select.appendChild(option);
            });
            
            // 削除したセットが選択されていた場合はリセット
            if (currentValue === setName && !DataManager.qaQuestions[setName]) {
                select.value = '';
            } else if (currentValue) {
                select.value = currentValue;
            }
        }
        
        return true;
    }

    /**
     * CSVからインポート
     */
    importFromCSV(setName, csvData) {
        if (!setName || !csvData) {
            alert('問題集名とCSVデータを入力してください');
            return false;
        }

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
                const match = lines[i].match(/^"([^"]+)","([^"]+)"$|^([^,]+),(.+)$/);
                if (match) {
                    const question = (match[1] || match[3] || '').trim();
                    const answer = (match[2] || match[4] || '').trim();
                    
                    if (question && answer) {
                        questions.push({
                            id: Date.now() + i,
                            question: question,
                            answer: answer
                        });
                    }
                }
            }
            
            if (questions.length > 0) {
                if (!DataManager.qaQuestions[setName]) {
                    DataManager.qaQuestions[setName] = [];
                }
                DataManager.qaQuestions[setName].push(...questions);
                DataManager.saveQAQuestions();
                
                alert(`${questions.length}問の問題をインポートしました`);
                return true;
            } else {
                alert('有効な問題が見つかりませんでした');
                return false;
            }
        } catch (error) {
            console.error('QA CSV import error:', error);
            alert('CSVの解析に失敗しました。形式を確認してください。');
            return false;
        }
    }

    /**
     * 問題集リストを取得
     */
    getSetList() {
        return Object.keys(DataManager.qaQuestions || {});
    }

    /**
     * 問題集の問題を取得
     */
    getQuestions(setName) {
        return DataManager.qaQuestions[setName] || [];
    }
}

// グローバルに公開
window.QAModule = new QAModuleClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    QAModule.initialize();
});

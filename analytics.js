/**
 * 分析・統計モジュール
 * グラフ、ヒートマップ、レーダーチャート、統計計算を管理
 */
const Analytics = {
    currentChartView: 'day',
    radarChartMode: 'subject',
    analysisSortMode: false,
    
    // 分析カード並び替え
    toggleAnalysisSort() {
        this.analysisSortMode = !this.analysisSortMode;
        const container = document.getElementById('analysisCardsContainer');
        
        if (this.analysisSortMode) {
            container.classList.add('sortable-container');
            this.enableAnalysisDragAndDrop();
        } else {
            container.classList.remove('sortable-container');
        }
    },
    
    enableAnalysisDragAndDrop() {
        const container = document.getElementById('analysisCardsContainer');
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
                container.querySelectorAll('.card').forEach(c => {
                    const cardId = c.dataset.cardId;
                    if (cardId) newOrder.push(cardId);
                });
                DataManager.analysisCardOrder = newOrder;
                DataManager.saveAnalysisCardOrder();
                
                return false;
            });
        });
    },
    
    // チャート機能
    switchChartView(view, btn) {
        this.currentChartView = view;
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateChartBars();
    },
    
    updateChartBars() {
        const container = document.getElementById('chartBars');
        if (!container) return;
        
        let data = [];
        let labels = [];
        const today = new Date();
        
        if (this.currentChartView === 'day') {
            // 過去7日間
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const count = this.getQuestionCountByDate(date);
                data.push(count);
                labels.push(date.getDate() + '日');
            }
        } else if (this.currentChartView === 'week') {
            // 週間（月〜日）
            const days = ['月', '火', '水', '木', '金', '土', '日'];
            const weekData = this.getWeekData();
            data = weekData;
            labels = days;
        } else if (this.currentChartView === 'month') {
            // 月間（4週分）
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(today.getDate() - (i * 7 + 6));
                const weekEnd = new Date();
                weekEnd.setDate(today.getDate() - (i * 7));
                const count = this.getQuestionCountByDateRange(weekStart, weekEnd);
                data.push(count);
                labels.push(`第${4-i}週`);
            }
        }
        
        const maxValue = Math.max(...data, 1);
        
        let html = '';
        data.forEach((value, index) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isToday = this.currentChartView === 'day' && index === data.length - 1;
            
            html += `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar-value">${value}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar ${isToday ? 'today' : ''}" style="height: ${height}%;"></div>
                    </div>
                    <div class="chart-bar-label">${labels[index]}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    getQuestionCountByDate(date) {
        let count = 0;
        const dateStr = date.toDateString();
        
        DataManager.allRecords.forEach(record => {
            const recordDate = new Date(record.timestamp);
            if (recordDate.toDateString() === dateStr) {
                count += record.stats.total || 0;
            }
        });
        
        return count;
    },
    
    getQuestionCountByDateRange(startDate, endDate) {
        let count = 0;
        
        DataManager.allRecords.forEach(record => {
            const recordDate = new Date(record.timestamp);
            if (recordDate >= startDate && recordDate <= endDate) {
                count += record.stats.total || 0;
            }
        });
        
        return count;
    },
    
    getWeekData() {
        const weekData = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const startOfWeek = new Date(today);
        const todayDay = today.getDay();
        const diff = todayDay === 0 ? 6 : todayDay - 1;
        startOfWeek.setDate(today.getDate() - diff);
        
        DataManager.allRecords.forEach(record => {
            const recordDate = new Date(record.timestamp);
            if (recordDate >= startOfWeek) {
                let dayIndex = recordDate.getDay();
                dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                if (dayIndex >= 0 && dayIndex < 7) {
                    weekData[dayIndex] += record.stats.total || 0;
                }
            }
        });
        
        return weekData;
    },
    
    // ヒートマップ
    updateHeatmap() {
        const container = document.getElementById('heatmapGrid');
        const select = document.getElementById('heatmapBookSelect');
        if (!container || !select) return;
        
        const bookId = select.value;
        if (!bookId) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">問題集を選択してください</p>';
            return;
        }
        
        const book = DataManager.books[bookId];
        if (!book) return;
        
        let html = '';
        const allQuestions = this.getAllQuestionsFromBook(book);
        let currentLabel = '';
        
        allQuestions.forEach(q => {
            const label = `${q.subject} › ${q.chapter}${q.section ? ' › ' + q.section : ''}${q.subsection ? ' › ' + q.subsection : ''}`;
            if (label !== currentLabel) {
                currentLabel = label;
                html += `<div class="heatmap-label">${label}</div>`;
            }
            
            const state = this.getQuestionStateFromRecords(book.id, q);
            let cellClass = '';
            
            if (state.wrong) cellClass = 'wrong';
            else if (state.correct) cellClass = 'correct';
            
            if (state.bookmarked) {
                cellClass += ' bookmarked';
            }
            
            html += `<div class="heatmap-cell ${cellClass}" 
                     onclick="Analytics.toggleHeatmapQuestion('${book.id}', '${q.path.join('/')}', '${q.number}')">${q.number}</div>`;
        });
        
        container.innerHTML = html || '<p style="color: var(--gray); text-align: center;">データがありません</p>';
    },
    
    toggleHeatmapQuestion(bookId, pathStr, questionNum) {
        const pathArray = pathStr.split('/');
        
        let existingRecordIndex = -1;
        for (let i = DataManager.allRecords.length - 1; i >= 0; i--) {
            if (DataManager.allRecords[i].bookId === bookId && 
                DataManager.allRecords[i].path.join('/') === pathStr) {
                existingRecordIndex = i;
                break;
            }
        }
        
        let record;
        if (existingRecordIndex !== -1) {
            record = DataManager.allRecords[existingRecordIndex];
        } else {
            record = {
                bookId: bookId,
                bookName: DataManager.books[bookId].name,
                path: pathArray,
                questions: {},
                timestamp: new Date().toISOString(),
                stats: { total: 0, correct: 0, wrong: 0, rate: '0%' }
            };
            DataManager.allRecords.push(record);
        }
        
        if (!record.questions[questionNum]) {
            record.questions[questionNum] = { state: 'correct', bookmarked: false };
        } else if (record.questions[questionNum].state === 'correct') {
            record.questions[questionNum].state = 'wrong';
        } else if (record.questions[questionNum].state === 'wrong') {
            record.questions[questionNum].state = null;
            delete record.questions[questionNum];
        } else {
            record.questions[questionNum].state = 'correct';
        }
        
        let total = 0, correct = 0, wrong = 0;
        Object.values(record.questions).forEach(q => {
            if (q.state) {
                total++;
                if (q.state === 'correct') correct++;
                else if (q.state === 'wrong') wrong++;
            }
        });
        
        record.stats = {
            total,
            correct,
            wrong,
            rate: total > 0 ? Math.round((correct / total) * 100) + '%' : '0%'
        };
        
        localStorage.setItem('studyHistory', JSON.stringify(DataManager.allRecords));
        this.updateHeatmap();
    },
    
    toggleHeatmapPinned() {
        const select = document.getElementById('heatmapBookSelect');
        const btn = document.getElementById('heatmapToggleBtn');
        
        if (DataManager.heatmapPinnedBook) {
            DataManager.heatmapPinnedBook = null;
            localStorage.removeItem('heatmapPinnedBook');
            btn.classList.remove('active');
        } else {
            if (select.value) {
                DataManager.heatmapPinnedBook = select.value;
                localStorage.setItem('heatmapPinnedBook', DataManager.heatmapPinnedBook);
                btn.classList.add('active');
            } else {
                alert('固定する問題集を選択してください');
            }
        }
    },
    
    // レーダーチャート
    setRadarMode(mode, btn) {
        this.radarChartMode = mode;
        document.querySelectorAll('#radarModeSubject, #radarModeCompare').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const select = document.getElementById('radarBookSelect');
        const toggleBtn = document.getElementById('radarToggleBtn');
        
        if (mode === 'compare') {
            select.style.display = 'none';
            toggleBtn.style.display = 'none';
            this.drawRadarChartCompare();
        } else {
            select.style.display = 'block';
            toggleBtn.style.display = 'block';
            this.drawRadarChart();
        }
    },
    
    drawRadarChart() {
        if (this.radarChartMode === 'compare') {
            this.drawRadarChartCompare();
            return;
        }
        
        const canvas = document.getElementById('radarChart');
        const select = document.getElementById('radarBookSelect');
        if (!canvas || !select) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        
        const bookId = select.value;
        if (!bookId) {
            ctx.clearRect(0, 0, 300, 300);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('問題集を選択してください', centerX, centerY);
            return;
        }
        
        const book = DataManager.books[bookId];
        if (!book) return;
        
        const subjectStats = this.calculateBookSubjectStats(bookId);
        const subjects = Object.keys(book.structure);
        const displaySubjects = subjects.slice(0, 6);
        
        if (displaySubjects.length === 0) {
            ctx.clearRect(0, 0, 300, 300);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('データがありません', centerX, centerY);
            return;
        }
        
        const angleStep = (Math.PI * 2) / displaySubjects.length;
        
        ctx.clearRect(0, 0, 300, 300);
        
        // グリッド描画
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            for (let j = 0; j < displaySubjects.length; j++) {
                const angle = j * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (radius * i / 5);
                const y = centerY + Math.sin(angle) * (radius * i / 5);
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // 中心から線を描画
        for (let i = 0; i < displaySubjects.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        
        // データ描画
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        displaySubjects.forEach((subject, i) => {
            const stats = subjectStats[subject] || { total: 0, correct: 0, wrong: 0 };
            const percentage = stats.total > 0 ? (stats.correct / stats.total) : 0;
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius * percentage);
            const y = centerY + Math.sin(angle) * (radius * percentage);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // ラベル描画
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        displaySubjects.forEach((subject, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius + 20);
            const y = centerY + Math.sin(angle) * (radius + 20);
            
            const shortName = subject.length > 6 ? subject.substring(0, 6) + '...' : subject;
            ctx.fillText(shortName, x, y);
            
            const stats = subjectStats[subject] || { total: 0, correct: 0, wrong: 0 };
            const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`${rate}%`, x, y + 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#1f2937';
        });
    },
    
    drawRadarChartCompare() {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        
        const mainSubjects = ['基礎法学', '憲法', '行政法', '民法', '商法', '一般知識'];
        const allSubjectStats = {};
        
        mainSubjects.forEach(subject => {
            allSubjectStats[subject] = { total: 0, correct: 0, wrong: 0 };
        });
        
        DataManager.allRecords.forEach(record => {
            if (record.path && record.path.length > 0) {
                const subject = record.path[0];
                if (mainSubjects.includes(subject)) {
                    if (record.questions) {
                        Object.values(record.questions).forEach(q => {
                            if (q.state === 'correct') {
                                allSubjectStats[subject].correct++;
                                allSubjectStats[subject].total++;
                            } else if (q.state === 'wrong') {
                                allSubjectStats[subject].wrong++;
                                allSubjectStats[subject].total++;
                            }
                        });
                    }
                }
            }
        });
        
        const angleStep = (Math.PI * 2) / mainSubjects.length;
        
        ctx.clearRect(0, 0, 300, 300);
        
        // グリッド描画
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            for (let j = 0; j < mainSubjects.length; j++) {
                const angle = j * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (radius * i / 5);
                const y = centerY + Math.sin(angle) * (radius * i / 5);
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // 中心から線を描画
        for (let i = 0; i < mainSubjects.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        
        // データ描画
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        mainSubjects.forEach((subject, i) => {
            const stats = allSubjectStats[subject];
            const percentage = stats.total > 0 ? (stats.correct / stats.total) : 0;
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius * percentage);
            const y = centerY + Math.sin(angle) * (radius * percentage);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // ラベル描画
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        mainSubjects.forEach((subject, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius + 20);
            const y = centerY + Math.sin(angle) * (radius + 20);
            
            ctx.fillText(subject, x, y);
            
            const stats = allSubjectStats[subject];
            const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`${rate}%`, x, y + 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#1f2937';
        });
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('全問題集の統合データ', centerX, 20);
    },
    
    toggleRadarPinned() {
        const select = document.getElementById('radarBookSelect');
        const btn = document.getElementById('radarToggleBtn');
        
        if (DataManager.radarPinnedBook) {
            DataManager.radarPinnedBook = null;
            localStorage.removeItem('radarPinnedBook');
            btn.classList.remove('active');
        } else {
            if (select.value) {
                DataManager.radarPinnedBook = select.value;
                localStorage.setItem('radarPinnedBook', DataManager.radarPinnedBook);
                btn.classList.add('active');
            } else {
                alert('固定する問題集を選択してください');
            }
        }
    },
    
    // 統計計算
    calculateOverallProgress() {
        let totalQuestions = 0;
        let uniqueAnswered = new Set();
        let totalAnswered = 0;
        let totalCorrect = 0;
        
        Object.values(DataManager.books).forEach(book => {
            totalQuestions += DataManager.countQuestionsInBook(book);
        });
        
        DataManager.allRecords.forEach(record => {
            totalAnswered += record.stats.total || 0;
            totalCorrect += record.stats.correct || 0;
            
            Object.entries(record.questions).forEach(([num, state]) => {
                if (state.state !== null) {
                    const key = `${record.bookId}_${record.path.join('/')}_${num}`;
                    uniqueAnswered.add(key);
                }
            });
        });
        
        const uniqueAnsweredCount = uniqueAnswered.size;
        const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
        const progressPercentage = totalQuestions > 0 ? Math.min(100, Math.round((uniqueAnsweredCount / totalQuestions) * 100)) : 0;
        
        return {
            totalQuestions,
            totalAnswered,
            totalCorrect,
            uniqueAnsweredCount,
            overallRate,
            progressPercentage
        };
    },
    
    calculateSubjectStats() {
        const subjectStats = {};
        
        DataManager.allRecords.forEach(record => {
            const subject = record.path[0];
            if (!subject) return;
            
            if (!subjectStats[subject]) {
                subjectStats[subject] = {
                    total: 0,
                    correct: 0,
                    wrong: 0
                };
            }
            
            subjectStats[subject].total += record.stats.total || 0;
            subjectStats[subject].correct += record.stats.correct || 0;
            subjectStats[subject].wrong += record.stats.wrong || 0;
        });
        
        return subjectStats;
    },
    
    calculateBookSubjectStats(bookId) {
        const subjectStats = {};
        const book = DataManager.books[bookId];
        
        Object.keys(book.structure).forEach(subject => {
            subjectStats[subject] = {
                total: 0,
                correct: 0,
                wrong: 0
            };
        });
        
        DataManager.allRecords.forEach(record => {
            if (record.bookId === bookId && record.path && record.path.length > 0) {
                const subject = record.path[0];
                if (subject && subjectStats[subject]) {
                    if (record.questions) {
                        Object.values(record.questions).forEach(q => {
                            if (q.state === 'correct') {
                                subjectStats[subject].correct++;
                                subjectStats[subject].total++;
                            } else if (q.state === 'wrong') {
                                subjectStats[subject].wrong++;
                                subjectStats[subject].total++;
                            }
                        });
                    }
                }
            }
        });
        
        return subjectStats;
    },
    
    // ヘルパー関数
    getAllQuestionsFromBook(book) {
        const questions = [];
        
        function traverse(structure, path = []) {
            Object.entries(structure).forEach(([name, item]) => {
                const newPath = [...path, name];
                
                if (item.questions) {
                    item.questions.forEach(num => {
                        questions.push({
                            number: num,
                            subject: newPath[0],
                            chapter: newPath[1],
                            section: newPath[2],
                            subsection: newPath[3],
                            path: newPath
                        });
                    });
                }
                
                if (item.children) {
                    traverse(item.children, newPath);
                }
            });
        }
        
        traverse(book.structure);
        return questions;
    },
    
    getQuestionStateFromRecords(bookId, question) {
        let state = { correct: false, wrong: false, bookmarked: false };
        
        DataManager.allRecords.forEach(record => {
            if (record.bookId === bookId) {
                const pathMatch = record.path.join('/') === question.path.join('/');
                if (pathMatch && record.questions[question.number]) {
                    const qState = record.questions[question.number];
                    if (qState.state === 'correct') state.correct = true;
                    if (qState.state === 'wrong') state.wrong = true;
                    if (qState.bookmarked) state.bookmarked = true;
                }
            }
        });
        
        return state;
    },
    
    // 弱点分析
    updateWeaknessAnalysis() {
        const container = document.getElementById('weaknessAnalysis');
        if (!container) return;
        
        const subjectStats = this.calculateSubjectStats();
        const weaknesses = [];
        
        Object.entries(subjectStats).forEach(([subject, stats]) => {
            if (stats.total > 0) {
                const percentage = Math.round((stats.correct / stats.total) * 100);
                if (percentage < 70) {
                    weaknesses.push({
                        subject,
                        percentage,
                        wrong: stats.wrong
                    });
                }
            }
        });
        
        weaknesses.sort((a, b) => a.percentage - b.percentage);
        
        if (weaknesses.length === 0) {
            container.innerHTML = '<p style="color: var(--gray);">弱点分野はありません</p>';
        } else {
            container.innerHTML = weaknesses.map(w => `
                <div style="padding: 10px; background: #fef2f2; border-left: 3px solid var(--danger); border-radius: 5px; margin-bottom: 10px;">
                    <div style="font-weight: 600; color: var(--danger);">${w.subject}</div>
                    <div style="font-size: 14px;">正答率: ${w.percentage}% | 間違い: ${w.wrong}問</div>
                </div>
            `).join('');
        }
    },
    
    // 学習履歴
    updateHistoryContent() {
        const container = document.getElementById('historyContent');
        if (!container) return;
        
        const recentRecords = DataManager.allRecords.slice(-20).reverse();
        
        if (recentRecords.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">履歴がありません</p>';
            return;
        }
        
        container.innerHTML = recentRecords.map(record => {
            const date = new Date(record.timestamp);
            return `
                <div style="padding: 10px; border-bottom: 1px solid var(--light);">
                    <div style="font-weight: 600;">${record.path.join(' › ')}</div>
                    <div style="font-size: 12px; color: var(--gray);">
                        ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}
                        | 正答率: ${record.stats.rate}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 進捗更新
    updateProgressContent() {
        const overallContainer = document.getElementById('overallProgress');
        if (!overallContainer) return;
        
        const stats = this.calculateOverallProgress();
        
        overallContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalQuestions}</div>
                    <div class="stat-label">総問題数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalAnswered}</div>
                    <div class="stat-label">解答済み</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCorrect}</div>
                    <div class="stat-label">正解数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.overallRate}%</div>
                    <div class="stat-label">正答率</div>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${stats.progressPercentage}%;"></div>
            </div>
            <p style="text-align: center; margin-top: 10px;">進捗率: ${stats.progressPercentage}%</p>
        `;
    }
};

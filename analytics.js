/**
 * 分析・統計機能クラス
 */
class AnalyticsClass {
    constructor() {
        this.currentChart = null;
        this.radarChartMode = 'subject';
        this.pinnedSettings = {
            heatmap: null,
            radar: null
        };
    }

    /**
     * 初期化
     */
    initialize() {
        console.log('📊 Analytics初期化');
        this.updateHeatmapBookSelect();
        this.updateRadarBookSelect();
        this.restorePinnedSettings();
    }

    /**
     * ピン留め設定の復元
     */
    restorePinnedSettings() {
        if (DataManager.heatmapPinnedBook) {
            const heatmapSelect = document.getElementById('heatmapBookSelect');
            const heatmapBtn = document.getElementById('heatmapToggleBtn');
            if (heatmapSelect && heatmapBtn) {
                heatmapSelect.value = DataManager.heatmapPinnedBook;
                heatmapBtn.classList.add('active');
                this.updateHeatmap();
            }
        }

        if (DataManager.radarPinnedBook) {
            const radarSelect = document.getElementById('radarBookSelect');
            const radarBtn = document.getElementById('radarToggleBtn');
            if (radarSelect && radarBtn) {
                radarSelect.value = DataManager.radarPinnedBook;
                radarBtn.classList.add('active');
                this.drawRadarChart();
            }
        }
    }

    /**
     * ヒートマップ用問題集選択を更新
     */
    updateHeatmapBookSelect() {
        const select = document.getElementById('heatmapBookSelect');
        if (!select) return;

        select.innerHTML = '<option value="">問題集を選択</option>';
        
        if (DataManager && DataManager.books) {
            Object.values(DataManager.books || {}).forEach(book => {
                if (DataManager.isDeleted('books', book.id)) {
                    return;
                }
                
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = book.name;
                select.appendChild(option);
            });
        }
    }

    /**
     * レーダーチャート用問題集選択を更新
     */
    updateRadarBookSelect() {
        const select = document.getElementById('radarBookSelect');
        if (!select) return;

        select.innerHTML = '<option value="">問題集を選択</option>';
        
        if (DataManager && DataManager.books) {
            Object.values(DataManager.books || {}).forEach(book => {
        // 削除済みチェックを追加
        if (DataManager.isDeleted('books', book.id)) {
            return; // 削除済みはスキップ
        }
        
        const option = document.createElement('option');
        option.value = book.id;
                option.textContent = book.name;
                select.appendChild(option);
            });
        }
    }

    /**
     * ヒートマップ更新
     */
    updateHeatmap() {
        const select = document.getElementById('heatmapBookSelect');
        const container = document.getElementById('heatmapContainer');
        
        if (!select || !container) return;

        const bookId = select.value;
        if (!bookId) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">問題集を選択してください</p>';
            return;
        }

        const book = DataManager.books[bookId];
        if (!book) return;

        const subjects = Object.keys(book.structure);
        if (subjects.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">データがありません</p>';
            return;
        }

        let html = '<div class="heatmap-legend">正答率: <span class="legend-low">0%</span> → <span class="legend-high">100%</span></div>';
        html += '<div class="heatmap-grid">';

        subjects.forEach(subject => {
            if (book.structure[subject] && book.structure[subject].children) {
                Object.keys(book.structure[subject].children).forEach(chapter => {
                    const chapterData = book.structure[subject].children[chapter];
                    
                    if (chapterData.children) {
                        Object.keys(chapterData.children).forEach(section => {
                            const sectionData = chapterData.children[section];
                            let rate = this.calculateRateForPath(bookId, [subject, chapter, section]);
                            
                            html += `
                                <div class="heatmap-cell" data-rate="${rate}" title="${subject} > ${chapter} > ${section}: ${rate}%">
                                    <div class="heatmap-label">${section.substring(0, 8)}${section.length > 8 ? '...' : ''}</div>
                                    <div class="heatmap-rate">${rate}%</div>
                                </div>
                            `;
                        });
                    } else if (chapterData.questions) {
                        let rate = this.calculateRateForPath(bookId, [subject, chapter]);
                        
                        html += `
                            <div class="heatmap-cell" data-rate="${rate}" title="${subject} > ${chapter}: ${rate}%">
                                <div class="heatmap-label">${chapter.substring(0, 8)}${chapter.length > 8 ? '...' : ''}</div>
                                <div class="heatmap-rate">${rate}%</div>
                            </div>
                        `;
                    }
                });
            }
        });

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * 特定パスの正答率計算
     */
    calculateRateForPath(bookId, path) {
        let total = 0;
        let correct = 0;

        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                if (record.bookId === bookId && this.pathMatches(record.path, path)) {
                    if (record.questions) {
                        Object.values(record.questions).forEach(q => {
                            if (q.state === 'correct') {
                                correct++;
                                total++;
                            } else if (q.state === 'wrong') {
                                total++;
                            }
                        });
                    }
                }
            });
        }

        return total > 0 ? Math.round((correct / total) * 100) : 0;
    }

    /**
     * パス一致判定
     */
    pathMatches(recordPath, targetPath) {
        if (!recordPath || !targetPath) return false;
        if (targetPath.length > recordPath.length) return false;
        
        for (let i = 0; i < targetPath.length; i++) {
            if (recordPath[i] !== targetPath[i]) return false;
        }
        
        return true;
    }

    /**
     * チャートバー更新
     */
    updateChartBars() {
        const container = document.getElementById('studyChart');
        if (!container) return;

        const ctx = document.getElementById('chartCanvas')?.getContext('2d');
        if (!ctx) return;

        const canvas = ctx.canvas;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        if (!DataManager || !DataManager.allRecords || DataManager.allRecords.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('学習データがありません', width / 2, height / 2);
            return;
        }

        const dailyStats = this.calculateDailyStats();
        const dates = Object.keys(dailyStats).sort().slice(-7);
        
        if (dates.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('学習データがありません', width / 2, height / 2);
            return;
        }

        const maxQuestions = Math.max(...dates.map(date => dailyStats[date].total));
        const barWidth = (width - 60) / dates.length;
        const chartHeight = height - 60;

        dates.forEach((date, index) => {
            const stats = dailyStats[date];
            const barHeight = maxQuestions > 0 ? (stats.total / maxQuestions) * chartHeight : 0;
            const x = 40 + index * barWidth + barWidth * 0.1;
            const barWidthActual = barWidth * 0.8;

            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, height - 40 - barHeight, barWidthActual, barHeight);

            ctx.fillStyle = '#1f2937';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(stats.total.toString(), x + barWidthActual / 2, height - 45 - barHeight);

            const dateObj = new Date(date);
            const dayLabel = dateObj.getDate().toString();
            ctx.fillText(dayLabel, x + barWidthActual / 2, height - 5);
        });
    }

    /**
     * 日別統計計算
     */
    calculateDailyStats() {
        const dailyStats = {};
        
        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                const date = new Date(record.timestamp).toDateString();
                if (!dailyStats[date]) {
                    dailyStats[date] = { total: 0, correct: 0, wrong: 0 };
                }
                
                dailyStats[date].total += record.stats?.total || 0;
                dailyStats[date].correct += record.stats?.correct || 0;
                dailyStats[date].wrong += record.stats?.wrong || 0;
            });
        }
        
        return dailyStats;
    }

    /**
     * 弱点分析更新
     */
    updateWeaknessAnalysis() {
        const container = document.getElementById('weaknessAnalysis');
        if (!container) return;

        const subjectStats = this.calculateSubjectStats();
        const subjects = Object.keys(subjectStats);

        if (subjects.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">分析データがありません</p>';
            return;
        }

        const weakSubjects = subjects
            .map(subject => ({
                subject,
                ...subjectStats[subject],
                rate: subjectStats[subject].total > 0 ? Math.round((subjectStats[subject].correct / subjectStats[subject].total) * 100) : 0
            }))
            .filter(s => s.total >= 5)
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 5);

        if (weakSubjects.length === 0) {
            container.innerHTML = '<p style="color: var(--gray); text-align: center;">十分な解答数がある科目がありません（各科目5問以上必要）</p>';
            return;
        }

        let html = '<div class="weakness-list">';
        weakSubjects.forEach(subject => {
            html += `
                <div class="weakness-item">
                    <div class="weakness-subject">${subject.subject}</div>
                    <div class="weakness-stats">
                        <span class="weakness-rate ${subject.rate < 60 ? 'low' : subject.rate < 80 ? 'medium' : 'high'}">${subject.rate}%</span>
                        <span class="weakness-count">${subject.correct}/${subject.total}問正解</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * 科目別統計計算
     */
    calculateSubjectStats() {
        const subjectStats = {};
        
        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                if (record.path && record.path.length > 0) {
                    const subject = record.path[0];
                    if (!subjectStats[subject]) {
                        subjectStats[subject] = {
                            total: 0,
                            correct: 0,
                            wrong: 0
                        };
                    }
                    
                    subjectStats[subject].total += record.stats?.total || 0;
                    subjectStats[subject].correct += record.stats?.correct || 0;
                    subjectStats[subject].wrong += record.stats?.wrong || 0;
                }
            });
        }
        
        return subjectStats;
    }

    /**
     * 全体進捗計算（修正版）
     */
    calculateOverallProgress() {
        let totalQuestions = 0;
        let uniqueAnswered = new Set();
        let totalAnswered = 0;
        let totalCorrect = 0;
        
        // ★追加: デバッグログ
        console.log('🔍 進捗計算開始');
        console.log('📚 DataManager.books:', DataManager?.books);
        console.log('📜 DataManager.allRecords:', DataManager?.allRecords);
        
        // 全問題数をカウント（DataManagerが存在するか確認）
        if (DataManager && DataManager.books) {
            Object.values(DataManager.books).forEach(book => {
                // ★追加: 削除済み問題集をスキップ
                if (DataManager.isDeleted('books', book.id)) {
                    console.log(`⏭️ 削除済み問題集スキップ: ${book.name}`);
                    return;
                }
                
                const questionCount = DataManager.countQuestionsInBook(book);
                totalQuestions += questionCount;
                console.log(`📖 ${book.name}: ${questionCount}問`); // ★追加: デバッグログ
            });
        }
        
        // ★追加: 全問題数のログ
        console.log(`📊 全問題数合計: ${totalQuestions}問`);
        
        // 解答済み問題を集計
        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                totalAnswered += record.stats?.total || 0;
                totalCorrect += record.stats?.correct || 0;
                
                if (record.questions) {
                    Object.entries(record.questions).forEach(([num, state]) => {
                        if (state.state !== null) {
                            const key = `${record.bookId}_${record.path.join('/')}_${num}`;
                            uniqueAnswered.add(key);
                        }
                    });
                }
            });
        }
        
        const uniqueAnsweredCount = uniqueAnswered.size;
        const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
        const progressPercentage = totalQuestions > 0 
            ? Math.min(100, Math.round((uniqueAnsweredCount / totalQuestions) * 100)) 
            : 0;
        
        // ★追加: 結果ログ
        console.log(`✅ 進捗計算結果:`, {
            totalQuestions,
            totalAnswered,
            totalCorrect,
            uniqueAnsweredCount,
            overallRate,
            progressPercentage
        });
        
        return {
            totalQuestions,
            totalAnswered,
            totalCorrect,
            uniqueAnsweredCount,
            overallRate,
            progressPercentage
        };
    }

    /**
     * 進捗コンテンツ更新
     */
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

    /**
     * 履歴コンテンツ更新
     */
    updateHistoryContent() {
        const container = document.getElementById('historyContent');
        if (!container) return;

        let html = '';
        
        if (DataManager && DataManager.allRecords && DataManager.allRecords.length > 0) {
            const recentRecords = DataManager.allRecords.slice(-20).reverse();
            recentRecords.forEach(record => {
                const date = new Date(record.timestamp);
                html += `
                    <div style="padding: 10px; border-bottom: 1px solid var(--light);">
                        <div style="font-weight: 600;">${record.path.join(' › ')}</div>
                        <div style="font-size: 12px; color: var(--gray);">
                            ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}
                            | 正答率: ${record.stats?.rate || '0%'}
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html || '<p style="color: var(--gray); text-align: center;">学習履歴がありません</p>';
    }

    /**
     * ヒートマップピン留めの切り替え
     */
    toggleHeatmapPinned() {
        const select = document.getElementById('heatmapBookSelect');
        const btn = document.getElementById('heatmapToggleBtn');
        
        if (!select || !btn) return;

        if (DataManager.heatmapPinnedBook) {
            DataManager.saveHeatmapPinned(null);
            btn.classList.remove('active');
        } else {
            if (select.value) {
                DataManager.saveHeatmapPinned(select.value);
                btn.classList.add('active');
            } else {
                alert('固定する問題集を選択してください');
            }
        }
    }

    /**
     * レーダーチャートピン留めの切り替え
     */
    toggleRadarPinned() {
        const select = document.getElementById('radarBookSelect');
        const btn = document.getElementById('radarToggleBtn');
        
        if (!select || !btn) return;

        if (DataManager.radarPinnedBook) {
            DataManager.saveRadarPinned(null);
            btn.classList.remove('active');
        } else {
            if (select.value) {
                DataManager.saveRadarPinned(select.value);
                btn.classList.add('active');
            } else {
                alert('固定する問題集を選択してください');
            }
        }
    }

    /**
     * レーダーチャートモード設定
     */
    setRadarMode(mode, btn) {
        this.radarChartMode = mode;
        
        document.querySelectorAll('#radarModeSubject, #radarModeCompare').forEach(b => {
            b.classList.remove('active');
        });
        if (btn) {
            btn.classList.add('active');
        }
        
        const select = document.getElementById('radarBookSelect');
        const toggleBtn = document.getElementById('radarToggleBtn');
        
        if (mode === 'compare') {
            if (select) select.style.display = 'none';
            if (toggleBtn) toggleBtn.style.display = 'none';
            this.drawRadarChartCompare();
        } else {
            if (select) select.style.display = 'block';
            if (toggleBtn) toggleBtn.style.display = 'block';
            this.drawRadarChart();
        }
    }

    /**
     * レーダーチャート描画（科目別）
     */
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
        const displaySubjects = subjects.slice(0, 8);

        if (displaySubjects.length === 0) {
            ctx.clearRect(0, 0, 300, 300);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('科目データがありません', centerX, centerY);
            return;
        }

        const angleStep = (Math.PI * 2) / displaySubjects.length;
        
        ctx.clearRect(0, 0, 300, 300);
        
        // 背景円を描画
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 軸線を描画
        displaySubjects.forEach((subject, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        
        // データを描画
        if (Object.keys(subjectStats).length > 0) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            
            displaySubjects.forEach((subject, index) => {
                const stats = subjectStats[subject] || { total: 0, correct: 0, wrong: 0 };
                const rate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                const value = (rate / 100) * radius;
                
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * value;
                const y = centerY + Math.sin(angle) * value;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // ラベルを描画
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        displaySubjects.forEach((subject, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 25;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius + 4;
            
            const shortName = subject.length > 6 ? subject.substring(0, 6) + '...' : (subject || '');
            ctx.fillText(shortName, x, y);
            
            const stats = subjectStats[subject] || { total: 0, correct: 0, wrong: 0 };
            const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`${rate}%`, x, y + 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#1f2937';
        });
    }

    /**
     * レーダーチャート描画（問題集比較）- 修正版
     */
    drawRadarChartCompare() {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        
        // ★修正: 実際の問題集から科目を動的に取得
        const actualSubjects = new Set();
        
        // 全問題集から科目名を収集
        if (DataManager && DataManager.books) {
            Object.values(DataManager.books).forEach(book => {
                if (DataManager.isDeleted('books', book.id)) return; // 削除済みスキップ
                
                if (book.structure) {
                    Object.keys(book.structure).forEach(subject => {
                        actualSubjects.add(subject);
                    });
                }
            });
        }
        
        // 学習記録からも科目名を収集（記録があるのに問題集が削除されている場合対応）
        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                if (record.path && record.path.length > 0) {
                    actualSubjects.add(record.path[0]);
                }
            });
        }
        
        // ★修正: 動的科目リストに変更
        const mainSubjects = Array.from(actualSubjects).sort();
        console.log('📈 レーダーチャート科目:', mainSubjects); // ★追加: デバッグログ
        
        // 空の場合はデフォルト科目を使用
        if (mainSubjects.length === 0) {
            mainSubjects.push('基礎法学', '憲法', '行政法', '民法', '商法', '一般知識');
            console.log('⚠️ 科目が見つからないため、デフォルト科目を使用');
        }
        
        const allSubjectStats = {};
        mainSubjects.forEach(subject => {
            allSubjectStats[subject] = { total: 0, correct: 0, wrong: 0 };
        });
        
        if (DataManager && DataManager.allRecords) {
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
        }
        
        const angleStep = (Math.PI * 2) / mainSubjects.length;
        
        ctx.clearRect(0, 0, 300, 300);
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            for (let j = 0; j < mainSubjects.length; j++) {
                const angle = j * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * ((radius / 5) * i);
                const y = centerY + Math.sin(angle) * ((radius / 5) * i);
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        mainSubjects.forEach((subject, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        
        const hasData = Object.values(allSubjectStats).some(stats => stats.total > 0);
        
        if (hasData) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            
            mainSubjects.forEach((subject, index) => {
                const stats = allSubjectStats[subject];
                const rate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                const value = (rate / 100) * radius;
                
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * value;
                const y = centerY + Math.sin(angle) * value;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        
        mainSubjects.forEach((subject, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius + 3;
            
            const shortName = subject.length > 4 ? subject.substring(0, 4) + '..' : subject;
            ctx.fillText(shortName, x, y);
            
            const stats = allSubjectStats[subject];
            const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(`${rate}%`, x, y + 10);
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#1f2937';
        });
    }

    /**
     * 問題集別科目統計計算
     */
    calculateBookSubjectStats(bookId) {
        const subjectStats = {};
        
        if (DataManager && DataManager.allRecords) {
            DataManager.allRecords.forEach(record => {
                if (record.bookId === bookId && record.path && record.path.length > 0) {
                    const subject = record.path[0];
                    if (!subjectStats[subject]) {
                        subjectStats[subject] = {
                            total: 0,
                            correct: 0,
                            wrong: 0
                        };
                    }
                    
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
            });
        }
        
        return subjectStats;
    }
}

// グローバルに公開
window.Analytics = new AnalyticsClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延させてDataManagerの初期化を待つ
    setTimeout(() => {
        // ★追加: 初期化実行のログ
        console.log('🚀 Analytics初期化開始...');
        Analytics.initialize();
    }, 100);
});

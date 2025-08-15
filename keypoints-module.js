/**
 * KeyPointsModule - 要点確認専用モジュール（階層構造対応版）
 */
class KeyPointsModuleClass {
    constructor() {
        this.subjects = {
            'constitution': { 
                name: '憲法', 
                chapters: {},
                items: [] 
            },
            'administrative': { 
                name: '行政法', 
                chapters: {},
                items: [] 
            },
            'civil': { 
                name: '民法', 
                chapters: {
                    '第1編 総則': {
                        sections: {
                            '第1節 権利の主体・客体': [
                                { title: '権利能力', url: '/minpou/kenri-nouryoku/', difficulty: 'B' },
                                { title: '意思能力', url: '/minpou/ishi-nouryoku/', difficulty: 'B' },
                                { title: '行為能力', url: '/minpou/koui-nouryoku/', difficulty: 'A' },
                                { title: '法人', url: '/minpou/houjin/', difficulty: 'C' },
                                { title: '物', url: '/minpou/mono/', difficulty: 'C' }
                            ],
                            '第2節 意思表示': [
                                { title: '法律行為', url: '/minpou/houtei-koui/', difficulty: 'B' },
                                { title: '意思表示', url: '/minpou/ishi-hyouji/', difficulty: 'A' }
                            ],
                            '第3節 代理': [
                                { title: '代理とは何か', url: '/minpou/dairi-towa/', difficulty: 'B' },
                                { title: '代理の成立要件', url: '/minpou/dairi-seirtitu/', difficulty: 'A' },
                                { title: '復代理', url: '/minpou/hukudairi/', difficulty: 'B' },
                                { title: '無権代理', url: '/minpou/muken-dairi/', difficulty: 'A' },
                                { title: '表見代理', url: '/minpou/hyoken-dairi/', difficulty: 'A' },
                                { title: '代理と使者', url: '/minpou/dairi-to-jihatsu/', difficulty: 'A' }
                            ],
                            '第4節 無効・取消し': [
                                { title: '無効', url: '/minpou/mukou/', difficulty: 'B' },
                                { title: '取消し', url: '/minpou/torikeshi/', difficulty: 'B' }
                            ],
                            '第5節 条件・期限': [
                                { title: '条件', url: '/minpou/jouken/', difficulty: 'C' },
                                { title: '期限', url: '/minpou/kigen/', difficulty: 'C' }
                            ],
                            '第6節 時効': [
                                { title: '時効とは何か', url: '/minpou/jikou-towa/', difficulty: 'A' },
                                { title: '時効の効力', url: '/minpou/jikou-kouryoku/', difficulty: 'A' },
                                { title: '時効の完成猶予・更新', url: '/minpou/jikou-kansei/', difficulty: 'A' },
                                { title: '取得時効', url: '/minpou/shutoku-jikou/', difficulty: 'A' },
                                { title: '消滅時効', url: '/minpou/shometsu-jikou/', difficulty: 'A' }
                            ]
                        }
                    },
                    '第2編 物権': {
                        sections: {
                            '第1節 物権総論': [
                                { title: '物権とは何か', url: '/minpou/bukken-towa/', difficulty: 'B' },
                                { title: '物権的請求権', url: '/minpou/bukken-seikyu/', difficulty: 'B' },
                                { title: '物権変動', url: '/minpou/bukken-hendou/', difficulty: 'C' },
                                { title: '不動産物権変動①－177条の第三者', url: '/minpou/fudousan-bukken-hendou1/', difficulty: 'A' },
                                { title: '不動産物権変動②－登記と対抗要件とする物権変動', url: '/minpou/fudousan-bukken-hendou2/', difficulty: 'A' },
                                { title: '動産物権変動①－対抗要件', url: '/minpou/dousann-bukken-hendou1/', difficulty: 'B' },
                                { title: '動産物権変動②－即時取得', url: '/minpou/dousann-bukken-hendou2/', difficulty: 'A' },
                                { title: '混同', url: '/minpou/kondo/', difficulty: 'B' }
                            ],
                            '第2節 占有権': [
                                { title: '占有権とは何か', url: '/minpou/senyuu-towa/', difficulty: 'B' },
                                { title: '占有の取得', url: '/minpou/senyuu-shutoku/', difficulty: 'B' },
                                { title: '占有の効力', url: '/minpou/senyuu-kouryoku/', difficulty: 'B' },
                                { title: '占有の訴え', url: '/minpou/senyuu-sosho/', difficulty: 'A' }
                            ],
                            '第3節 所有権': [
                                { title: '相隣関係', url: '/minpou/soyuu-souran/', difficulty: 'B' },
                                { title: '所有権の取得', url: '/minpou/soyuu-shutoku/', difficulty: 'B' },
                                { title: '共有', url: '/minpou/kyoyuu/', difficulty: 'A' },
                                { title: '土地・建物管理命令', url: '/minpou/tochi-kentiku-kanri/', difficulty: 'B' }
                            ],
                            '第4節 用益物権': [
                                { title: '地上権', url: '/minpou/chijou-ken/', difficulty: 'C' },
                                { title: '永小作権', url: '/minpou/eisho-saku/', difficulty: 'C' },
                                { title: '地役権', url: '/minpou/chieki-ken/', difficulty: 'B' }
                            ],
                            '第5節 担保物権': [
                                { title: '担保物権とは何か', url: '/minpou/tanpo-bukken-towa/', difficulty: 'B' },
                                { title: '留置権', url: '/minpou/ryuuchi-ken/', difficulty: 'A' },
                                { title: '先取特権', url: '/minpou/sendori-tokken/', difficulty: 'B' },
                                { title: '質権', url: '/minpou/shichi-ken/', difficulty: 'B' },
                                { title: '抵当権', url: '/minpou/teitou-ken/', difficulty: 'A' },
                                { title: '根抵当権', url: '/minpou/konkyu-tanpo/', difficulty: 'C' }
                            ]
                        }
                    },
                    // 以下、第3編〜第5編も同様に構造化
                    '第3編 債権': {
                        sections: {
                            '第1節 債権の目的': [
                                { title: '債権とは何か', url: '/minpou/saiken-towa/', difficulty: 'C' },
                                { title: '特定物債権と種類債権', url: '/minpou/tokutei-bukken-saiken/', difficulty: 'B' },
                                { title: '選択債権', url: '/minpou/sentaku-saiken/', difficulty: 'C' }
                            ],
                            '第2節 債務不履行': [
                                { title: '債務不履行とは何か', url: '/minpou/saimu-furikou-towa/', difficulty: 'B' },
                                { title: '債務不履行の要件', url: '/minpou/saimu-furikou-youken/', difficulty: 'A' },
                                { title: '債務不履行の効果', url: '/minpou/saimu-furikou-kouryoku/', difficulty: 'A' },
                                { title: '受領遅滞', url: '/minpou/juryou-chisen/', difficulty: 'B' }
                            ]
                        }
                    },
                    '第4編 親族': {
                        sections: {
                            '第1節 夫婦': [
                                { title: '婚姻', url: '/minpou/kon-in/', difficulty: 'A' },
                                { title: '離婚', url: '/minpou/rikon/', difficulty: 'B' }
                            ],
                            '第2節 親子': [
                                { title: '実子', url: '/minpou/jisshi/', difficulty: 'A' },
                                { title: '養子', url: '/minpou/youshi/', difficulty: 'B' },
                                { title: '親権', url: '/minpou/shinken/', difficulty: 'B' }
                            ]
                        }
                    },
                    '第5編 相続': {
                        sections: {
                            '第1節 相続人': [
                                { title: '相続人の種類・順位', url: '/minpou/souzokuninz-shurui/', difficulty: 'A' },
                                { title: '相続欠格の喪失', url: '/minpou/souzoku-ketsuraku/', difficulty: 'B' }
                            ],
                            '第2節 相続の効力': [
                                { title: '相続の効力', url: '/minpou/souzoku-kouryoku/', difficulty: 'B' },
                                { title: '遺産分割', url: '/minpou/isan-bunkatsu/', difficulty: 'B' }
                            ]
                        }
                    }
                },
                items: [] 
            },
            'commercial': { 
                name: '商法', 
                chapters: {},
                items: [] 
            },
            'basic_knowledge': { 
                name: '基礎知識', 
                chapters: {},
                items: [] 
            },
            'basic_law': { 
                name: '基礎法学', 
                chapters: {},
                items: [] 
            }
        };
        this.currentSubject = null;
        this.currentView = 'welcome'; // 'welcome', 'subjects', 'chapters', 'content'
        this.initialized = false;
    }

    /**
     * 初期化
     */
    initialize() {
        if (this.initialized) {
            console.log('KeyPointsModule already initialized');
            return;
        }

        // DataManagerが初期化されるまで待つ
        if (!window.DataManager) {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        // 保存された要点データを読み込み
        this.loadKeyPointsData();
        this.initialized = true;
        console.log('KeyPointsModule initialized successfully');
    }

    /**
     * 要点データの読み込み
     */
    loadKeyPointsData() {
        try {
            const saved = localStorage.getItem('keyPointsData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                if (parsedData && typeof parsedData === 'object') {
                    // 既存のstructureを保持しつつ、保存されたitemsをマージ
                    Object.keys(this.subjects).forEach(key => {
                        if (parsedData[key] && parsedData[key].items) {
                            this.subjects[key].items = parsedData[key].items;
                        }
                        if (parsedData[key] && parsedData[key].chapters) {
                            // カスタム追加された章があれば統合
                            this.subjects[key].chapters = {
                                ...this.subjects[key].chapters,
                                ...parsedData[key].chapters
                            };
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading key points data:', error);
        }
    }

    /**
     * 要点データの保存
     */
    saveKeyPointsData() {
        try {
            localStorage.setItem('keyPointsData', JSON.stringify(this.subjects));
        } catch (error) {
            console.error('Error saving key points data:', error);
        }
    }

    /**
     * 科目一覧の取得
     */
    getSubjectList() {
        return Object.entries(this.subjects).map(([key, data]) => ({
            key,
            name: data.name,
            itemCount: data.items ? data.items.length : 0,
            chapterCount: Object.keys(data.chapters || {}).length
        }));
    }

    /**
     * 要点確認のメインコンテンツを描画
     */
    renderKeyPointsContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-icon">📚</span>
                    <span class="card-title">要点確認</span>
                </div>
                
                <div class="save-button" style="margin: 15px;" onclick="KeyPointsModule.showSubjectList()">
                    📋 要点一覧
                </div>
                
                <div id="keyPointsMainContent">
                    ${this.renderWelcomeContent()}
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h4>要点管理</h4>
                <div class="form-group">
                    <label class="form-label">科目</label>
                    <select class="form-control" id="keyPointSubjectSelect">
                        <option value="">科目を選択</option>
                        ${this.getSubjectList().map(subject => 
                            `<option value="${subject.key}">${subject.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">項目タイトル</label>
                    <input type="text" class="form-control" id="keyPointTitle" 
                           placeholder="例：第1編 総則">
                </div>
                <div class="form-group">
                    <label class="form-label">種類</label>
                    <div style="display: flex; gap: 15px; margin: 10px 0;">
                        <label>
                            <input type="radio" name="keyPointType" value="link" checked>
                            <span>外部リンク</span>
                        </label>
                        <label>
                            <input type="radio" name="keyPointType" value="html">
                            <span>HTML内容</span>
                        </label>
                    </div>
                </div>
                <div class="form-group" id="keyPointUrlGroup">
                    <label class="form-label">URL</label>
                    <input type="url" class="form-control" id="keyPointUrl" 
                           placeholder="https://example.com/minpou/sousoku/">
                </div>
                <div class="form-group" id="keyPointHtmlGroup" style="display: none;">
                    <label class="form-label">HTML内容</label>
                    <textarea class="form-control" id="keyPointHtml" rows="10" 
                              placeholder="HTML形式の要点まとめ内容を入力してください"></textarea>
                </div>
                <button class="save-button" onclick="KeyPointsModule.handleAddItem()">
                    項目を追加
                </button>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h4>登録済み要点</h4>
                <div id="keyPointsList">${this.renderKeyPointsList()}</div>
            </div>
        `;
    }

    /**
     * ウェルカムコンテンツ
     */
    renderWelcomeContent() {
        return `
            <div style="text-align: center; padding: 20px;">
                <h3>📚 要点確認</h3>
                <p>科目別の要点まとめを確認できます</p>
                <p style="color: var(--gray); font-size: 14px;">
                    上の「要点一覧」ボタンから科目を選択してください
                </p>
            </div>
        `;
    }

    /**
     * 科目一覧を表示
     */
    showSubjectList() {
        this.currentView = 'subjects';
        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const subjects = this.getSubjectList();
        let html = `
            <div style="padding: 20px;">
                <h3 style="text-align: center; margin-bottom: 30px;">📋 科目一覧</h3>
                <div class="subject-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        `;

        subjects.forEach(subject => {
            html += `
                <div class="subject-card" style="background: white; border: 2px solid var(--light); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s;" 
                     onclick="KeyPointsModule.selectSubject('${subject.key}')">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                        ${subject.name}
                    </div>
                    <div style="font-size: 14px; color: var(--gray);">
                        ${subject.chapterCount} 章・${subject.itemCount} 項目
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <button class="save-button" onclick="KeyPointsModule.showWelcome()" 
                            style="background: var(--gray);">← 戻る</button>
                </div>
            </div>
        `;

        content.innerHTML = html;
        this.addKeyPointStyles();
    }

    /**
     * 科目選択（章一覧表示）
     */
    selectSubject(subjectKey) {
        this.currentSubject = subjectKey;
        this.currentView = 'chapters';
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        let html = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h3>📚 ${subject.name} 要点まとめ</h3>
                    <button class="save-button" onclick="KeyPointsModule.showSubjectList()" 
                            style="background: var(--gray); padding: 8px 15px; font-size: 14px;">← 一覧に戻る</button>
                </div>
        `;

        const chapters = subject.chapters || {};
        
        if (Object.keys(chapters).length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: var(--gray);">
                    <p>まだ章項目がありません</p>
                    <p style="font-size: 14px;">下の管理画面から項目を追加してください</p>
                </div>
            `;
        } else {
            html += `<div class="table-of-contents" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 30px;">`;
            
            Object.entries(chapters).forEach(([chapterName, chapterData]) => {
                html += `
                    <div class="chapter" style="background: white; border-radius: 6px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div class="chapter-header" style="background: #4a5568; color: white; padding: 15px 20px; font-size: 18px; font-weight: bold;">
                            ${chapterName}
                        </div>
                        <div class="chapter-content" style="padding: 20px;">
                `;
                
                if (chapterData.sections) {
                    Object.entries(chapterData.sections).forEach(([sectionName, topics]) => {
                        html += `
                            <div class="section" style="margin-bottom: 25px;">
                                <div class="section-title" style="font-size: 16px; font-weight: bold; color: #2d3748; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                                    ${sectionName}
                                </div>
                                <ul class="topic-list" style="list-style: none;">
                        `;
                        
                        topics.forEach((topic, index) => {
                            const difficultyClass = `difficulty-${topic.difficulty.toLowerCase()}`;
                            html += `
                                <li class="topic-item" style="margin: 8px 0; display: flex; align-items: center; gap: 10px;">
                                    <a href="${topic.url}" target="_blank" class="topic-link" style="text-decoration: none; color: #2d3748; padding: 12px 16px; background: #f7fafc; border-radius: 6px; border: 1px solid #e2e8f0; flex-grow: 1; transition: all 0.2s ease; display: flex; align-items: center; gap: 12px;">
                                        <span class="topic-number" style="font-size: 12px; color: #718096; min-width: 20px; font-weight: 500;">${index + 1}</span>
                                        <span class="topic-title" style="flex-grow: 1; font-size: 14px; font-weight: 500;">${topic.title}</span>
                                    </a>
                                    <span class="difficulty-badge ${difficultyClass}" style="padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; min-width: 28px; text-align: center; border: 1px solid;">${topic.difficulty}</span>
                                </li>
                            `;
                        });
                        
                        html += `
                                </ul>
                            </div>
                        `;
                    });
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `</div>`;
        content.innerHTML = html;

        // 難易度バッジのスタイルを追加
        this.addDifficultyStyles();
        this.addKeyPointStyles();
    }

    /**
     * ウェルカム画面に戻る
     */
    showWelcome() {
        this.currentView = 'welcome';
        const content = document.getElementById('keyPointsMainContent');
        if (content) {
            content.innerHTML = this.renderWelcomeContent();
        }
    }

    /**
     * 項目追加ハンドラ
     */
    handleAddItem() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        const titleInput = document.getElementById('keyPointTitle');
        const typeRadio = document.querySelector('input[name="keyPointType"]:checked');
        const urlInput = document.getElementById('keyPointUrl');
        const htmlInput = document.getElementById('keyPointHtml');

        if (!subjectSelect || !titleInput || !typeRadio) {
            alert('必要な項目を入力してください');
            return;
        }

        const subjectKey = subjectSelect.value;
        const title = titleInput.value.trim();
        const type = typeRadio.value;
        const url = urlInput.value.trim();
        const htmlContent = htmlInput.value.trim();

        if (!subjectKey || !title) {
            alert('科目とタイトルを入力してください');
            return;
        }

        if (type === 'link' && !url) {
            alert('URLを入力してください');
            return;
        }

        if (type === 'html' && !htmlContent) {
            alert('HTML内容を入力してください');
            return;
        }

        const item = {
            id: Date.now(),
            title,
            type,
            url: type === 'link' ? url : '',
            htmlContent: type === 'html' ? htmlContent : '',
            order: this.subjects[subjectKey].items.length,
            createdAt: new Date().toISOString()
        };

        this.subjects[subjectKey].items.push(item);
        this.saveKeyPointsData();

        // フォームをクリア
        titleInput.value = '';
        urlInput.value = '';
        htmlInput.value = '';
        
        // リストを更新
        const listContainer = document.getElementById('keyPointsList');
        if (listContainer) {
            listContainer.innerHTML = this.renderKeyPointsList();
        }

        alert('項目を追加しました');
    }

    /**
     * 登録済み要点リストを描画
     */
    renderKeyPointsList() {
        let html = '';
        
        Object.entries(this.subjects).forEach(([subjectKey, subject]) => {
            if (subject.items && subject.items.length > 0) {
                html += `<h5>${subject.name} (${subject.items.length}項目)</h5>`;
                
                subject.items.forEach(item => {
                    html += `
                        <div class="delete-list-item">
                            <div>
                                <div style="font-weight: 600; font-size: 14px;">
                                    ${item.title}
                                </div>
                                <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                                    ${item.type === 'link' ? `🔗 ${item.url}` : '📄 HTML内容'}
                                </div>
                            </div>
                            <button class="delete-btn" 
                                    onclick="KeyPointsModule.deleteItem('${subjectKey}', ${item.id})">
                                削除
                            </button>
                        </div>
                    `;
                });
            }
        });
        
        if (!html) {
            html = '<p style="color: var(--gray); text-align: center;">登録済み要点がありません</p>';
        }
        
        return html;
    }

    /**
     * 項目削除
     */
    deleteItem(subjectKey, itemId) {
        if (confirm('この項目を削除しますか？')) {
            this.subjects[subjectKey].items = this.subjects[subjectKey].items.filter(
                item => item.id !== itemId
            );
            this.saveKeyPointsData();
            
            const listContainer = document.getElementById('keyPointsList');
            if (listContainer) {
                listContainer.innerHTML = this.renderKeyPointsList();
            }
            alert('項目を削除しました');
        }
    }

    /**
     * 難易度バッジスタイル追加
     */
    addDifficultyStyles() {
        if (document.getElementById('difficultyStyles')) return;

        const style = document.createElement('style');
        style.id = 'difficultyStyles';
        style.textContent = `
            .difficulty-a {
                background: #fed7d7 !important;
                color: #c53030 !important;
                border-color: #fc8181 !important;
            }
            
            .difficulty-b {
                background: #feebc8 !important;
                color: #dd6b20 !important;
                border-color: #f6ad55 !important;
            }
            
            .difficulty-c {
                background: #c6f6d5 !important;
                color: #38a169 !important;
                border-color: #68d391 !important;
            }

            .topic-link:hover {
                background: #edf2f7 !important;
                border-color: #4a5568 !important;
                transform: translateX(2px) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * スタイル追加
     */
    addKeyPointStyles() {
        if (document.getElementById('keypointsStyles')) return;

        const style = document.createElement('style');
        style.id = 'keypointsStyles';
        style.textContent = `
            .subject-card:hover {
                border-color: var(--secondary) !important;
                box-shadow: var(--shadow-lg) !important;
                transform: translateY(-2px) !important;
            }
            
            .keypoint-item {
                transition: all 0.3s ease !important;
            }
            
            .keypoint-item:hover {
                box-shadow: var(--shadow-lg) !important;
            }
            
            .keypoint-header:hover {
                background: var(--primary-light) !important;
            }

            @media (max-width: 768px) {
                .table-of-contents {
                    grid-template-columns: 1fr !important;
                }
                
                .subject-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 種類変更時の表示切り替え
     */
    handleTypeChange() {
        const urlGroup = document.getElementById('keyPointUrlGroup');
        const htmlGroup = document.getElementById('keyPointHtmlGroup');
        const typeRadio = document.querySelector('input[name="keyPointType"]:checked');
        
        if (!urlGroup || !htmlGroup || !typeRadio) return;

        if (typeRadio.value === 'link') {
            urlGroup.style.display = 'block';
            htmlGroup.style.display = 'none';
        } else {
            urlGroup.style.display = 'none';
            htmlGroup.style.display = 'block';
        }
    }

    /**
     * カスタム章を追加
     */
    addCustomChapter(subjectKey, chapterName, sections) {
        if (!this.subjects[subjectKey]) return false;
        
        if (!this.subjects[subjectKey].chapters) {
            this.subjects[subjectKey].chapters = {};
        }
        
        this.subjects[subjectKey].chapters[chapterName] = {
            sections: sections || {}
        };
        
        this.saveKeyPointsData();
        return true;
    }

    /**
     * 章を削除
     */
    deleteChapter(subjectKey, chapterName) {
        if (!this.subjects[subjectKey] || !this.subjects[subjectKey].chapters) {
            return false;
        }
        
        delete this.subjects[subjectKey].chapters[chapterName];
        this.saveKeyPointsData();
        return true;
    }
}

// グローバルに公開
window.KeyPointsModule = new KeyPointsModuleClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    KeyPointsModule.initialize();
    
    // ラジオボタンの変更イベント
    document.addEventListener('change', (e) => {
        if (e.target.name === 'keyPointType') {
            KeyPointsModule.handleTypeChange();
        }
    });
});

/**
 * KeyPointsModule - 要点確認専用モジュール（階層選択・3列配置対応版）
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
                                { title: '権利能力', url: '/minpou/kenri-nouryoku/', difficulty: 'B', type: 'link' },
                                { title: '意思能力', url: '/minpou/ishi-nouryoku/', difficulty: 'B', type: 'link' },
                                { title: '行為能力', url: '/minpou/koui-nouryoku/', difficulty: 'A', type: 'link' },
                                { title: '法人', url: '/minpou/houjin/', difficulty: 'C', type: 'link' },
                                { title: '物', url: '/minpou/mono/', difficulty: 'C', type: 'link' }
                            ],
                            '第2節 意思表示': [
                                { title: '法律行為', url: '/minpou/houtei-koui/', difficulty: 'B', type: 'link' },
                                { title: '意思表示', url: '/minpou/ishi-hyouji/', difficulty: 'A', type: 'link' }
                            ],
                            '第3節 代理': [
                                { title: '代理とは何か', url: '/minpou/dairi-towa/', difficulty: 'B', type: 'link' },
                                { title: '代理の成立要件', url: '/minpou/dairi-seirtitu/', difficulty: 'A', type: 'link' },
                                { title: '復代理', url: '/minpou/hukudairi/', difficulty: 'B', type: 'link' },
                                { title: '無権代理', url: '/minpou/muken-dairi/', difficulty: 'A', type: 'link' },
                                { title: '表見代理', url: '/minpou/hyoken-dairi/', difficulty: 'A', type: 'link' },
                                { title: '代理と使者', url: '/minpou/dairi-to-jihatsu/', difficulty: 'A', type: 'link' }
                            ],
                            '第4節 無効・取消し': [
                                { title: '無効', url: '/minpou/mukou/', difficulty: 'B', type: 'link' },
                                { title: '取消し', url: '/minpou/torikeshi/', difficulty: 'B', type: 'link' }
                            ],
                            '第5節 条件・期限': [
                                { title: '条件', url: '/minpou/jouken/', difficulty: 'C', type: 'link' },
                                { title: '期限', url: '/minpou/kigen/', difficulty: 'C', type: 'link' }
                            ],
                            '第6節 時効': [
                                { title: '時効とは何か', url: '/minpou/jikou-towa/', difficulty: 'A', type: 'link' },
                                { title: '時効の効力', url: '/minpou/jikou-kouryoku/', difficulty: 'A', type: 'link' },
                                { title: '時効の完成猶予・更新', url: '/minpou/jikou-kansei/', difficulty: 'A', type: 'link' },
                                { title: '取得時効', url: '/minpou/shutoku-jikou/', difficulty: 'A', type: 'link' },
                                { title: '消滅時効', url: '/minpou/shometsu-jikou/', difficulty: 'A', type: 'link' }
                            ]
                        }
                    },
                    '第2編 物権': {
                        sections: {
                            '第1節 物権総論': [
                                { title: '物権とは何か', url: '/minpou/bukken-towa/', difficulty: 'B', type: 'link' },
                                { title: '物権的請求権', url: '/minpou/bukken-seikyu/', difficulty: 'B', type: 'link' },
                                { title: '物権変動', url: '/minpou/bukken-hendou/', difficulty: 'C', type: 'link' },
                                { title: '不動産物権変動①－177条の第三者', url: '/minpou/fudousan-bukken-hendou1/', difficulty: 'A', type: 'link' },
                                { title: '不動産物権変動②－登記と対抗要件とする物権変動', url: '/minpou/fudousan-bukken-hendou2/', difficulty: 'A', type: 'link' },
                                { title: '動産物権変動①－対抗要件', url: '/minpou/dousann-bukken-hendou1/', difficulty: 'B', type: 'link' },
                                { title: '動産物権変動②－即時取得', url: '/minpou/dousann-bukken-hendou2/', difficulty: 'A', type: 'link' },
                                { title: '混同', url: '/minpou/kondo/', difficulty: 'B', type: 'link' }
                            ],
                            '第2節 占有権': [
                                { title: '占有権とは何か', url: '/minpou/senyuu-towa/', difficulty: 'B', type: 'link' },
                                { title: '占有の取得', url: '/minpou/senyuu-shutoku/', difficulty: 'B', type: 'link' },
                                { title: '占有の効力', url: '/minpou/senyuu-kouryoku/', difficulty: 'B', type: 'link' },
                                { title: '占有の訴え', url: '/minpou/senyuu-sosho/', difficulty: 'A', type: 'link' }
                            ],
                            '第3節 所有権': [
                                { title: '相隣関係', url: '/minpou/soyuu-souran/', difficulty: 'B', type: 'link' },
                                { title: '所有権の取得', url: '/minpou/soyuu-shutoku/', difficulty: 'B', type: 'link' },
                                { title: '共有', url: '/minpou/kyoyuu/', difficulty: 'A', type: 'link' },
                                { title: '土地・建物管理命令', url: '/minpou/tochi-kentiku-kanri/', difficulty: 'B', type: 'link' }
                            ],
                            '第4節 用益物権': [
                                { title: '地上権', url: '/minpou/chijou-ken/', difficulty: 'C', type: 'link' },
                                { title: '永小作権', url: '/minpou/eisho-saku/', difficulty: 'C', type: 'link' },
                                { title: '地役権', url: '/minpou/chieki-ken/', difficulty: 'B', type: 'link' }
                            ],
                            '第5節 担保物権': [
                                { title: '担保物権とは何か', url: '/minpou/tanpo-bukken-towa/', difficulty: 'B', type: 'link' },
                                { title: '留置権', url: '/minpou/ryuuchi-ken/', difficulty: 'A', type: 'link' },
                                { title: '先取特権', url: '/minpou/sendori-tokken/', difficulty: 'B', type: 'link' },
                                { title: '質権', url: '/minpou/shichi-ken/', difficulty: 'B', type: 'link' },
                                { title: '抵当権', url: '/minpou/teitou-ken/', difficulty: 'A', type: 'link' },
                                { title: '根抵当権', url: '/minpou/konkyu-tanpo/', difficulty: 'C', type: 'link' }
                            ]
                        }
                    },
                    '第3編 債権': {
                        sections: {
                            '第1節 債権の目的': [
                                { title: '債権とは何か', url: '/minpou/saiken-towa/', difficulty: 'C', type: 'link' },
                                { title: '特定物債権と種類債権', url: '/minpou/tokutei-bukken-saiken/', difficulty: 'B', type: 'link' },
                                { title: '選択債権', url: '/minpou/sentaku-saiken/', difficulty: 'C', type: 'link' }
                            ],
                            '第2節 債務不履行': [
                                { title: '債務不履行とは何か', url: '/minpou/saimu-furikou-towa/', difficulty: 'B', type: 'link' },
                                { title: '債務不履行の要件', url: '/minpou/saimu-furikou-youken/', difficulty: 'A', type: 'link' },
                                { title: '債務不履行の効果', url: '/minpou/saimu-furikou-kouryoku/', difficulty: 'A', type: 'link' },
                                { title: '受領遅滞', url: '/minpou/juryou-chisen/', difficulty: 'B', type: 'link' }
                            ]
                        }
                    },
                    '第4編 親族': {
                        sections: {
                            '第1節 夫婦': [
                                { title: '婚姻', url: '/minpou/kon-in/', difficulty: 'A', type: 'link' },
                                { title: '離婚', url: '/minpou/rikon/', difficulty: 'B', type: 'link' }
                            ],
                            '第2節 親子': [
                                { title: '実子', url: '/minpou/jisshi/', difficulty: 'A', type: 'link' },
                                { title: '養子', url: '/minpou/youshi/', difficulty: 'B', type: 'link' },
                                { title: '親権', url: '/minpou/shinken/', difficulty: 'B', type: 'link' }
                            ]
                        }
                    },
                    '第5編 相続': {
                        sections: {
                            '第1節 相続人': [
                                { title: '相続人の種類・順位', url: '/minpou/souzokuninz-shurui/', difficulty: 'A', type: 'link' },
                                { title: '相続欠格の喪失', url: '/minpou/souzoku-ketsuraku/', difficulty: 'B', type: 'link' }
                            ],
                            '第2節 相続の効力': [
                                { title: '相続の効力', url: '/minpou/souzoku-kouryoku/', difficulty: 'B', type: 'link' },
                                { title: '遺産分割', url: '/minpou/isan-bunkatsu/', difficulty: 'B', type: 'link' }
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
                <h4>要点管理（階層選択式）</h4>
                
                <div class="form-group">
                    <label class="form-label">科目</label>
                    <select class="form-control" id="keyPointSubjectSelect" onchange="KeyPointsModule.onSubjectChange()">
                        <option value="">科目を選択</option>
                        ${this.getSubjectList().map(subject => 
                            `<option value="${subject.key}">${subject.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group" id="chapterSelectGroup" style="display: none;">
                    <label class="form-label">編</label>
                    <select class="form-control" id="keyPointChapterSelect" onchange="KeyPointsModule.onChapterChange()">
                        <option value="">編を選択</option>
                    </select>
                </div>
                
                <div class="form-group" id="sectionSelectGroup" style="display: none;">
                    <label class="form-label">節</label>
                    <select class="form-control" id="keyPointSectionSelect" onchange="KeyPointsModule.onSectionChange()">
                        <option value="">節を選択</option>
                    </select>
                </div>
                
                <div class="form-group" id="topicSelectGroup" style="display: none;">
                    <label class="form-label">項目</label>
                    <select class="form-control" id="keyPointTopicSelect">
                        <option value="">項目を選択</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">要点まとめタイトル</label>
                    <input type="text" class="form-control" id="keyPointTitle" 
                           placeholder="例：権利能力の要点まとめ">
                </div>
                
                <div class="form-group">
                    <label class="form-label">HTML内容</label>
                    <textarea class="form-control" id="keyPointHtml" rows="10" 
                              placeholder="HTML形式の要点まとめ内容を入力してください"></textarea>
                </div>
                
                <button class="save-button" onclick="KeyPointsModule.handleAddHierarchyItem()">
                    階層に要点を登録
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
     * 科目一覧を表示（3列配置）
     */
    showSubjectList() {
        this.currentView = 'subjects';
        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const subjects = this.getSubjectList();
        let html = `
            <div style="padding: 20px;">
                <h3 style="text-align: center; margin-bottom: 30px;">📋 科目一覧</h3>
                <div class="subject-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 600px; margin: 0 auto;">
        `;

        subjects.forEach(subject => {
            html += `
                <div class="subject-card" style="background: white; border: 2px solid var(--light); border-radius: 12px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s;" 
                     onclick="KeyPointsModule.selectSubject('${subject.key}')">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        ${subject.name}
                    </div>
                    <div style="font-size: 12px; color: var(--gray);">
                        ${subject.chapterCount} 章
                    </div>
                    <div style="font-size: 12px; color: var(--gray);">
                        ${subject.itemCount} 項目
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
                            const topicId = `${subjectKey}_${chapterName}_${sectionName}_${index}`;
                            
                            html += `
                                <li class="topic-item" style="margin: 8px 0; display: flex; align-items: center; gap: 10px;">
                                    <a href="#" class="topic-link" style="text-decoration: none; color: #2d3748; padding: 12px 16px; background: #f7fafc; border-radius: 6px; border: 1px solid #e2e8f0; flex-grow: 1; transition: all 0.2s ease; display: flex; align-items: center; gap: 12px;"
                                       onclick="KeyPointsModule.viewTopicContent('${subjectKey}', '${chapterName}', '${sectionName}', ${index}); return false;">
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
     * 項目内容表示
     */
    viewTopicContent(subjectKey, chapterName, sectionName, topicIndex) {
        const subject = this.subjects[subjectKey];
        if (!subject || !subject.chapters[chapterName] || !subject.chapters[chapterName].sections[sectionName]) {
            return;
        }

        const topic = subject.chapters[chapterName].sections[sectionName][topicIndex];
        if (!topic) return;

        // HTMLコンテンツが登録されている場合は表示、そうでなければ外部リンク
        if (topic.type === 'html' && topic.htmlContent) {
            this.showHTMLContent(topic.title, topic.htmlContent);
        } else if (topic.url) {
            window.open(topic.url, '_blank');
        }
    }

    /**
     * HTMLコンテンツ表示
     */
    showHTMLContent(title, htmlContent) {
        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const html = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>📄 ${title}</h3>
                    <button class="save-button" onclick="KeyPointsModule.selectSubject('${this.currentSubject}')" 
                            style="background: var(--gray); padding: 8px 15px; font-size: 14px;">← 戻る</button>
                </div>
                <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                    ${htmlContent}
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    /**
     * 科目選択時のイベント
     */
    onSubjectChange() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        const chapterGroup = document.getElementById('chapterSelectGroup');
        const sectionGroup = document.getElementById('sectionSelectGroup');
        const topicGroup = document.getElementById('topicSelectGroup');
        const chapterSelect = document.getElementById('keyPointChapterSelect');

        if (!subjectSelect || !chapterGroup || !chapterSelect) return;

        const subjectKey = subjectSelect.value;
        
        // 下位の選択をリセット
        sectionGroup.style.display = 'none';
        topicGroup.style.display = 'none';

        if (subjectKey && this.subjects[subjectKey]) {
            chapterGroup.style.display = 'block';
            
            // 章の選択肢を更新
            chapterSelect.innerHTML = '<option value="">編を選択</option>';
            const chapters = this.subjects[subjectKey].chapters || {};
            
            Object.keys(chapters).forEach(chapterName => {
                const option = document.createElement('option');
                option.value = chapterName;
                option.textContent = chapterName;
                chapterSelect.appendChild(option);
            });
        } else {
            chapterGroup.style.display = 'none';
        }
    }

    /**
     * 章選択時のイベント
     */
    onChapterChange() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        const chapterSelect = document.getElementById('keyPointChapterSelect');
        const sectionGroup = document.getElementById('sectionSelectGroup');
        const topicGroup = document.getElementById('topicSelectGroup');
        const sectionSelect = document.getElementById('keyPointSectionSelect');

        if (!subjectSelect || !chapterSelect || !sectionGroup || !sectionSelect) return;

        const subjectKey = subjectSelect.value;
        const chapterName = chapterSelect.value;

        // 下位の選択をリセット
        topicGroup.style.display = 'none';

        if (subjectKey && chapterName && this.subjects[subjectKey] && this.subjects[subjectKey].chapters[chapterName]) {
            sectionGroup.style.display = 'block';
            
            // 節の選択肢を更新
            sectionSelect.innerHTML = '<option value="">節を選択</option>';
            const sections = this.subjects[subjectKey].chapters[chapterName].sections || {};
            
            Object.keys(sections).forEach(sectionName => {
                const option = document.createElement('option');
                option.value = sectionName;
                option.textContent = sectionName;
                sectionSelect.appendChild(option);
            });
        } else {
            sectionGroup.style.display = 'none';
        }
    }

    /**
     * 節選択時のイベント
     */
    onSectionChange() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        const chapterSelect = document.getElementById('keyPointChapterSelect');
        const sectionSelect = document.getElementById('keyPointSectionSelect');
        const topicGroup = document.getElementById('topicSelectGroup');
        const topicSelect = document.getElementById('keyPointTopicSelect');

        if (!subjectSelect || !chapterSelect || !sectionSelect || !topicGroup || !topicSelect) return;

        const subjectKey = subjectSelect.value;
        const chapterName = chapterSelect.value;
        const sectionName = sectionSelect.value;

        if (subjectKey && chapterName && sectionName && 
            this.subjects[subjectKey] && 
            this.subjects[subjectKey].chapters[chapterName] && 
            this.subjects[subjectKey].chapters[chapterName].sections[sectionName]) {
            
            topicGroup.style.display = 'block';
            
            // 項目の選択肢を更新
            topicSelect.innerHTML = '<option value="">項目を選択</option>';
            const topics = this.subjects[subjectKey].chapters[chapterName].sections[sectionName];
            
            topics.forEach((topic, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = topic.title;
                topicSelect.appendChild(option);
            });
        } else {
            topicGroup.style.display = 'none';
        }
    }

    /**
     * 階層選択式の項目追加
     */
    handleAddHierarchyItem() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        const chapterSelect = document.getElementById('keyPointChapterSelect');
        const sectionSelect = document.getElementById('keyPointSectionSelect');
        const topicSelect = document.getElementById('keyPointTopicSelect');
        const titleInput = document.getElementById('keyPointTitle');
        const htmlInput = document.getElementById('keyPointHtml');

        if (!subjectSelect || !chapterSelect || !sectionSelect || !topicSelect || !titleInput || !htmlInput) {
            alert('必要な項目を入力してください');
            return;
        }

        const subjectKey = subjectSelect.value;
        const chapterName = chapterSelect.value;
        const sectionName = sectionSelect.value;
        const topicIndex = parseInt(topicSelect.value);
        const title = titleInput.value.trim();
        const htmlContent = htmlInput.value.trim();

        if (!subjectKey || !chapterName || !sectionName || isNaN(topicIndex) || !title || !htmlContent) {
            alert('すべての項目を選択・入力してください');
            return;
        }

        // 該当する項目を取得して更新
        if (this.subjects[subjectKey] && 
            this.subjects[subjectKey].chapters[chapterName] && 
            this.subjects[subjectKey].chapters[chapterName].sections[sectionName] && 
            this.subjects[subjectKey].chapters[chapterName].sections[sectionName][topicIndex]) {
            
            // 項目をHTMLコンテンツ付きで更新
            this.subjects[subjectKey].chapters[chapterName].sections[sectionName][topicIndex] = {
                ...this.subjects[subjectKey].chapters[chapterName].sections[sectionName][topicIndex],
                title: title,
                htmlContent: htmlContent,
                type: 'html'
            };

            this.saveKeyPointsData();

            // フォームをクリア
            titleInput.value = '';
            htmlInput.value = '';
            
            // 選択をリセット
            subjectSelect.value = '';
            this.onSubjectChange();

            alert('要点まとめを登録しました！該当項目をクリックすると表示されます。');
        } else {
            alert('選択した項目が見つかりません');
        }
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
     * 登録済み要点リストを描画
     */
    renderKeyPointsList() {
        let html = '';
        
        Object.entries(this.subjects).forEach(([subjectKey, subject]) => {
            let hasCustomContent = false;
            let customItems = [];

            // HTMLコンテンツが登録されている項目を検索
            if (subject.chapters) {
                Object.entries(subject.chapters).forEach(([chapterName, chapterData]) => {
                    if (chapterData.sections) {
                        Object.entries(chapterData.sections).forEach(([sectionName, topics]) => {
                            topics.forEach((topic, index) => {
                                if (topic.type === 'html' && topic.htmlContent) {
                                    hasCustomContent = true;
                                    customItems.push({
                                        title: topic.title,
                                        path: `${chapterName} > ${sectionName}`,
                                        subjectKey,
                                        chapterName,
                                        sectionName,
                                        topicIndex: index
                                    });
                                }
                            });
                        });
                    }
                });
            }

            if (hasCustomContent) {
                html += `<h5>${subject.name} (${customItems.length}項目)</h5>`;
                
                customItems.forEach(item => {
                    html += `
                        <div class="delete-list-item">
                            <div>
                                <div style="font-weight: 600; font-size: 14px;">
                                    ${item.title}
                                </div>
                                <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                                    📄 ${item.path}
                                </div>
                            </div>
                            <button class="delete-btn" 
                                    onclick="KeyPointsModule.deleteHierarchyItem('${item.subjectKey}', '${item.chapterName}', '${item.sectionName}', ${item.topicIndex})">
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
     * 階層項目削除
     */
    deleteHierarchyItem(subjectKey, chapterName, sectionName, topicIndex) {
        if (confirm('この要点まとめを削除しますか？')) {
            if (this.subjects[subjectKey] && 
                this.subjects[subjectKey].chapters[chapterName] && 
                this.subjects[subjectKey].chapters[chapterName].sections[sectionName] && 
                this.subjects[subjectKey].chapters[chapterName].sections[sectionName][topicIndex]) {
                
                // HTMLコンテンツを削除して元のリンクタイプに戻す
                const topic = this.subjects[subjectKey].chapters[chapterName].sections[sectionName][topicIndex];
                delete topic.htmlContent;
                topic.type = 'link';

                this.saveKeyPointsData();
                
                const listContainer = document.getElementById('keyPointsList');
                if (listContainer) {
                    listContainer.innerHTML = this.renderKeyPointsList();
                }
                alert('要点まとめを削除しました');
            }
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

            @media (max-width: 480px) {
                .subject-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 種類変更時の表示切り替え（レガシー関数）
     */
    handleTypeChange() {
        // 現在は階層選択式のため使用しないが、互換性のため残す
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
    
    // ラジオボタンの変更イベント（レガシー対応）
    document.addEventListener('change', (e) => {
        if (e.target.name === 'keyPointType') {
            KeyPointsModule.handleTypeChange();
        }
    });
});

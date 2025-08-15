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
        this.keyTermsHidden = false; // 重要語句の表示状態
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
            <div id="keyPointsMainContent">
                ${this.renderSubjectListDirect()}
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
     * 直接科目一覧を表示（カードなし・3列固定）
     */
    renderSubjectListDirect() {
        this.currentView = 'subjects';
        const subjects = this.getSubjectList();
        
        let html = `
            <div style="padding: 15px;">
                <h3 style="text-align: center; margin-bottom: 25px; color: #2d3748;">📋 科目一覧</h3>
                <div class="subject-grid-fixed" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px;">
        `;

        subjects.forEach(subject => {
            html += `
                <div class="subject-card-mobile" style="background: white; border: 2px solid var(--light); border-radius: 10px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.3s; min-height: 80px; display: flex; flex-direction: column; justify-content: center;" 
                     onclick="KeyPointsModule.selectSubject('${subject.key}')">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px; line-height: 1.3;">
                        ${subject.name}
                    </div>
                    <div style="font-size: 11px; color: var(--gray);">
                        ${subject.chapterCount} 章
                    </div>
                    <div style="font-size: 11px; color: var(--gray);">
                        ${subject.itemCount} 項目
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            
            <div style="margin: 20px 15px;">
                <h4 style="margin-bottom: 15px;">要点管理（階層選択式）</h4>
                
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
                    <textarea class="form-control" id="keyPointHtml" rows="8" 
                              placeholder="HTML形式の要点まとめ内容を入力してください"></textarea>
                </div>
                
                <button class="save-button" onclick="KeyPointsModule.handleAddHierarchyItem()">
                    階層に要点を登録
                </button>
            </div>
            
            <div style="margin: 20px 15px;">
                <h4>登録済み要点</h4>
                <div id="keyPointsList">${this.renderKeyPointsList()}</div>
            </div>
        `;

        return html;
    }

    /**
     * 科目一覧を表示（レガシー関数・現在は直接表示のため不使用）
     */
    showSubjectList() {
        // 直接表示されているため、この関数は使用しない
        return;
    }

    /**
     * 科目選択（章一覧表示・折りたたみ機能付き）
     */
    selectSubject(subjectKey) {
        this.currentSubject = subjectKey;
        this.currentView = 'chapters';
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        let html = `
            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0;">📚 ${subject.name} 要点まとめ</h3>
                    <button class="save-button" onclick="KeyPointsModule.backToSubjectList()" 
                            style="background: var(--gray); padding: 8px 12px; font-size: 14px; min-width: auto; width: auto;">↩️</button>
                </div>
        `;

        const chapters = subject.chapters || {};
        
        if (Object.keys(chapters).length === 0) {
            html += `
                <div style="text-align: center; padding: 30px; color: var(--gray);">
                    <p>まだ章項目がありません</p>
                    <p style="font-size: 14px;">下の管理画面から項目を追加してください</p>
                </div>
            `;
        } else {
            // 折りたたみ可能な編構造
            Object.entries(chapters).forEach(([chapterName, chapterData]) => {
                const chapterId = `chapter-${subjectKey}-${chapterName.replace(/\s+/g, '-')}`;
                
                html += `
                    <div class="collapsible-chapter" style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div class="chapter-header-collapsible" style="background: #4a5568; color: white; padding: 12px 15px; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;"
                             onclick="KeyPointsModule.toggleChapter('${chapterId}')">
                            <span style="font-size: 16px; font-weight: bold;">${chapterName}</span>
                            <span class="chapter-arrow" id="arrow-${chapterId}" style="font-size: 12px; transition: transform 0.3s;">▼</span>
                        </div>
                        <div class="chapter-content-collapsible" id="${chapterId}" style="display: block; background: white;">
                            <div style="padding: 15px;">
                `;
                
                if (chapterData.sections) {
                    Object.entries(chapterData.sections).forEach(([sectionName, topics]) => {
                        html += `
                            <div class="section" style="margin-bottom: 20px;">
                                <div class="section-title" style="font-size: 14px; font-weight: bold; color: #2d3748; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0;">
                                    ${sectionName}
                                </div>
                                <ul class="topic-list" style="list-style: none;">
                        `;
                        
                        topics.forEach((topic, index) => {
                            const difficultyClass = `difficulty-${topic.difficulty.toLowerCase()}`;
                            
                            html += `
                                <li class="topic-item" style="margin: 6px 0; display: flex; align-items: center; gap: 8px;">
                                    <a href="#" class="topic-link" style="text-decoration: none; color: #2d3748; padding: 8px 12px; background: #f7fafc; border-radius: 6px; border: 1px solid #e2e8f0; flex-grow: 1; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px;"
                                       onclick="KeyPointsModule.viewTopicContent('${subjectKey}', '${chapterName}', '${sectionName}', ${index}); return false;">
                                        <span class="topic-number" style="font-size: 11px; color: #718096; min-width: 16px; font-weight: 500;">${index + 1}</span>
                                        <span class="topic-title" style="flex-grow: 1; font-size: 13px; font-weight: 500;">${topic.title}</span>
                                    </a>
                                    <span class="difficulty-badge ${difficultyClass}" style="padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; min-width: 24px; text-align: center; border: 1px solid;">${topic.difficulty}</span>
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
                    </div>
                `;
            });
        }

        html += `</div>`;
        content.innerHTML = html;

        // ページトップにスクロール
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }

        // 難易度バッジのスタイルを追加
        this.addDifficultyStyles();
        this.addKeyPointStyles();
    }

    /**
     * 編の折りたたみ切り替え
     */
    toggleChapter(chapterId) {
        const content = document.getElementById(chapterId);
        const arrow = document.getElementById(`arrow-${chapterId}`);
        
        if (!content || !arrow) return;

        if (content.style.display === 'none') {
            content.style.display = 'block';
            arrow.style.transform = 'rotate(0deg)';
            arrow.textContent = '▼';
        } else {
            content.style.display = 'none';
            arrow.style.transform = 'rotate(-90deg)';
            arrow.textContent = '▶';
        }
    }

    /**
     * 科目一覧に戻る
     */
    backToSubjectList() {
        const content = document.getElementById('keyPointsMainContent');
        if (content) {
            content.innerHTML = this.renderSubjectListDirect();
            this.addKeyPointStyles();
        }
        
        // ページトップにスクロール
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
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
            <div style="padding: 0; margin: 0;">
                <!-- ヘッダー部分 -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 15px 10px 15px; background: #f8f9fa; border-bottom: 1px solid #e2e8f0;">
                    <button class="save-button" onclick="KeyPointsModule.selectSubject('${this.currentSubject}')" 
                            style="background: var(--gray); padding: 8px 12px; font-size: 14px; min-width: auto; width: auto; margin-right: auto;">↩️ 戻る</button>
                    <h3 style="margin: 0; color: #2d3748; flex-grow: 1; text-align: center; padding: 0 15px;">📄 ${title}</h3>
                    <!-- 暗記カード機能ボタン -->
                    <button onclick="KeyPointsModule.toggleKeyTerms()" id="keyPointToggleBtn" 
                            style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">重要語句を隠す</button>
                </div>
                
                <!-- コンテンツ部分（横幅いっぱい） -->
                <div style="padding: 20px;" id="keyPointContent">
                    ${htmlContent}
                </div>
            </div>
        `;

        content.innerHTML = html;
        
        // ページトップにスクロール
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        
        // 重要語句機能を初期化
        this.initializeKeyTerms();
    }

    /**
     * 重要語句機能の初期化
     */
    initializeKeyTerms() {
        // 少し遅延させてDOM要素が確実に生成されてから実行
        setTimeout(() => {
            this.keyTermsHidden = false;
            const keyTerms = document.querySelectorAll('.wp-key-term');
            
            // 各用語に個別クリックイベントを追加
            keyTerms.forEach((term) => {
                // 初期状態を設定
                term.dataset.individualState = 'visible';
                
                // 個別クリックイベント
                term.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (term.dataset.individualState === 'visible') {
                        term.classList.add('wp-hidden');
                        term.dataset.individualState = 'hidden';
                    } else {
                        term.classList.remove('wp-hidden');
                        term.dataset.individualState = 'visible';
                    }
                });
            });
            
            console.log(`Initialized ${keyTerms.length} key terms`);
        }, 100);
    }

    /**
     * 重要語句の表示切り替え
     */
    toggleKeyTerms() {
        const keyTerms = document.querySelectorAll('.wp-key-term');
        const btn = document.getElementById('keyPointToggleBtn');
        
        if (!btn || keyTerms.length === 0) {
            console.log('No key terms found or button missing');
            return;
        }
        
        this.keyTermsHidden = !this.keyTermsHidden;
        
        if (this.keyTermsHidden) {
            // 全て隠す
            keyTerms.forEach((term) => {
                term.classList.add('wp-hidden');
                term.dataset.individualState = 'hidden';
            });
            btn.textContent = '重要語句を表示';
            btn.classList.add('wp-active');
        } else {
            // 全て表示
            keyTerms.forEach((term) => {
                term.classList.remove('wp-hidden');
                term.dataset.individualState = 'visible';
            });
            btn.textContent = '重要語句を隠す';
            btn.classList.remove('wp-active');
        }
        
        console.log(`Toggled ${keyTerms.length} key terms to ${this.keyTermsHidden ? 'hidden' : 'visible'}`);
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

            /* 重要語句のスタイル */
            .wp-key-term {
                display: inline !important;
                text-decoration: none !important;
                border: none !important;
                outline: none !important;
                padding: 2px 4px !important;
                margin: 0 !important;
                color: #d32f2f !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border-radius: 3px !important;
                transition: all 0.3s ease !important;
            }
            
            .wp-key-term.wp-hidden {
                background: repeating-linear-gradient(
                    45deg,
                    #e8e8e8,
                    #e8e8e8 1px,
                    #d0d0d0 1px,
                    #d0d0d0 2px
                ) !important;
                color: transparent !important;
                text-shadow: none !important;
                border: none !important;
                position: relative !important;
                box-shadow: none !important;
            }
            
            .wp-key-term.wp-hidden:hover {
                background: repeating-linear-gradient(
                    45deg,
                    #f0f0f0,
                    #f0f0f0 1px,
                    #d8d8d8 1px,
                    #d8d8d8 2px
                ) !important;
                transform: scale(1.01) !important;
            }
            
            #keyPointToggleBtn.wp-active {
                background: #f44336 !important;
                transform: scale(0.98) !important;
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
            .subject-card-mobile:hover {
                border-color: var(--secondary) !important;
                box-shadow: var(--shadow-lg) !important;
                transform: translateY(-1px) !important;
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

            /* 3列固定（モバイルでも） */
            .subject-grid-fixed {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 12px !important;
            }

            @media (max-width: 768px) {
                .table-of-contents {
                    grid-template-columns: 1fr !important;
                }
                
                .subject-grid-fixed {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 10px !important;
                }

                .subject-card-mobile {
                    padding: 10px !important;
                    min-height: 70px !important;
                }

                .subject-card-mobile div:first-child {
                    font-size: 13px !important;
                    line-height: 1.2 !important;
                }

                .subject-card-mobile div:not(:first-child) {
                    font-size: 10px !important;
                }
            }

            @media (max-width: 480px) {
                .subject-grid-fixed {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 8px !important;
                }

                .subject-card-mobile {
                    padding: 8px !important;
                    min-height: 65px !important;
                }

                .subject-card-mobile div:first-child {
                    font-size: 12px !important;
                    margin-bottom: 4px !important;
                }

                .subject-card-mobile div:not(:first-child) {
                    font-size: 9px !important;
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

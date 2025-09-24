/**
 * KeyPointsModule - 要点確認専用モジュール（ケータイ行政書士対応版）
 */
class KeyPointsModuleClass {
    constructor() {
        // 🚀 階層構造データ管理用の変数
        this.structureData = null; // Firestoreから読み込む階層構造データ
        this.userContent = null;   // ユーザーの要点内容
        this.isLoading = false;    // 読み込み状態

        // 🔑 管理者機能
        this.isAdmin = false;      // 管理者フラグ
        this.templateData = null;  // 初期データテンプレート

        // ケータイ行政書士の階層に完全対応（フォールバック兼用）
        this.subjects = {
            'constitution': {
                name: '第1編 憲法',
                order: 1,
                topics: [
                    { title: '憲法と前文', url: '/kenpou/kenpou-zenbun/', difficulty: 'C', type: 'link' },
                    { title: '国民主権と象徴天皇', url: '/kenpou/kokumin-shuken/', difficulty: 'B', type: 'link' },
                    { title: '人権総論', url: '/kenpou/jinken-souron/', difficulty: 'B', type: 'link' },
                    { title: '法の下の平等', url: '/kenpou/hou-no-shita-byoudou/', difficulty: 'A', type: 'link' },
                    { title: '幸福追求権', url: '/kenpou/koufuku-tsuikyuuken/', difficulty: 'A', type: 'link' },
                    { title: '思想・信教の自由', url: '/kenpou/shisou-shinkyou/', difficulty: 'A', type: 'link' },
                    { title: '表現の自由(1)', url: '/kenpou/hyougen-1/', difficulty: 'A', type: 'link' },
                    { title: '表現の自由(2)', url: '/kenpou/hyougen-2/', difficulty: 'A', type: 'link' },
                    { title: '表現の自由(3)', url: '/kenpou/hyougen-3/', difficulty: 'A', type: 'link' },
                    { title: '学問の自由と教育を受ける権利', url: '/kenpou/gakumon-kyouiku/', difficulty: 'B', type: 'link' },
                    { title: '経済的自由・人身の自由', url: '/kenpou/keizaiteki-jinshin/', difficulty: 'A', type: 'link' },
                    { title: '生存権と労働基本権', url: '/kenpou/seizonken-roudou/', difficulty: 'A', type: 'link' },
                    { title: '代表民主制と参政権', url: '/kenpou/daihyou-minshu/', difficulty: 'B', type: 'link' },
                    { title: '国会(1)', url: '/kenpou/kokkai-1/', difficulty: 'B', type: 'link' },
                    { title: '国会(2)', url: '/kenpou/kokkai-2/', difficulty: 'B', type: 'link' },
                    { title: '内閣(1)', url: '/kenpou/naikaku-1/', difficulty: 'B', type: 'link' },
                    { title: '内閣(2)', url: '/kenpou/naikaku-2/', difficulty: 'B', type: 'link' },
                    { title: '司法権', url: '/kenpou/shihouken/', difficulty: 'B', type: 'link' },
                    { title: '裁判官', url: '/kenpou/saibakan/', difficulty: 'B', type: 'link' },
                    { title: '財政', url: '/kenpou/zaisei/', difficulty: 'C', type: 'link' },
                    { title: '地方自治', url: '/kenpou/chihou-jichi/', difficulty: 'B', type: 'link' },
                    { title: '憲法改正', url: '/kenpou/kenpou-kaisei/', difficulty: 'C', type: 'link' }
                ]
            },
            'administrative': {
                name: '第2編 行政法',
                order: 2,
                topics: [
                    { title: '法治行政', url: '/gyousei/houchi-gyousei/', difficulty: 'B', type: 'link' },
                    { title: '行政上の法律関係と民事法', url: '/gyousei/gyousei-houritsu/', difficulty: 'A', type: 'link' },
                    { title: '行政主体と行政機関', url: '/gyousei/gyousei-shutai/', difficulty: 'B', type: 'link' },
                    { title: '国の行政組織', url: '/gyousei/kuni-soshiki/', difficulty: 'B', type: 'link' },
                    { title: '公務員と公物', url: '/gyousei/koumuin-koubutsu/', difficulty: 'B', type: 'link' },
                    { title: '行政立法', url: '/gyousei/gyousei-rippou/', difficulty: 'B', type: 'link' },
                    { title: '行政行為(1)', url: '/gyousei/gyousei-koui-1/', difficulty: 'A', type: 'link' },
                    { title: '行政行為(2)', url: '/gyousei/gyousei-koui-2/', difficulty: 'A', type: 'link' },
                    { title: '行政行為(3)', url: '/gyousei/gyousei-koui-3/', difficulty: 'A', type: 'link' },
                    { title: '行政行為の附款', url: '/gyousei/gyousei-fukan/', difficulty: 'B', type: 'link' },
                    { title: '行政行為の職権取消しと撤回', url: '/gyousei/shokken-torikeshi/', difficulty: 'A', type: 'link' },
                    { title: '行政上の義務の履行確保', url: '/gyousei/gimu-rikou/', difficulty: 'B', type: 'link' },
                    { title: '行政上の義務違反に対する制裁', url: '/gyousei/gimu-ihan-seisai/', difficulty: 'B', type: 'link' },
                    { title: '即時強制と行政調査', url: '/gyousei/sokuji-kyousei/', difficulty: 'B', type: 'link' },
                    { title: '行政契約と行政計画', url: '/gyousei/gyousei-keiyaku/', difficulty: 'C', type: 'link' },
                    { title: '行政手続法(1)', url: '/gyousei/tetsuzuki-1/', difficulty: 'A', type: 'link' },
                    { title: '行政手続法(2)', url: '/gyousei/tetsuzuki-2/', difficulty: 'A', type: 'link' },
                    { title: '行政手続法(3)', url: '/gyousei/tetsuzuki-3/', difficulty: 'A', type: 'link' },
                    { title: '行政手続法(4)', url: '/gyousei/tetsuzuki-4/', difficulty: 'A', type: 'link' },
                    { title: '行政手続法(5)', url: '/gyousei/tetsuzuki-5/', difficulty: 'A', type: 'link' },
                    { title: '行政不服審査法(1)', url: '/gyousei/fufuku-1/', difficulty: 'A', type: 'link' },
                    { title: '行政不服審査法(2)', url: '/gyousei/fufuku-2/', difficulty: 'A', type: 'link' },
                    { title: '行政不服審査法(3)', url: '/gyousei/fufuku-3/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(1)', url: '/gyousei/jiken-soshou-1/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(2)', url: '/gyousei/jiken-soshou-2/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(3)', url: '/gyousei/jiken-soshou-3/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(4)', url: '/gyousei/jiken-soshou-4/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(5)', url: '/gyousei/jiken-soshou-5/', difficulty: 'A', type: 'link' },
                    { title: '行政事件訴訟法(6)', url: '/gyousei/jiken-soshou-6/', difficulty: 'A', type: 'link' },
                    { title: '国家賠償法(1)', url: '/gyousei/kokka-baishou-1/', difficulty: 'A', type: 'link' },
                    { title: '国家賠償法(2)', url: '/gyousei/kokka-baishou-2/', difficulty: 'A', type: 'link' },
                    { title: '国家賠償法(3)', url: '/gyousei/kokka-baishou-3/', difficulty: 'A', type: 'link' },
                    { title: '地方自治法(1)', url: '/gyousei/chihou-jichi-1/', difficulty: 'B', type: 'link' },
                    { title: '地方自治法(2)', url: '/gyousei/chihou-jichi-2/', difficulty: 'B', type: 'link' },
                    { title: '地方自治法(3)', url: '/gyousei/chihou-jichi-3/', difficulty: 'B', type: 'link' },
                    { title: '地方自治法(4)', url: '/gyousei/chihou-jichi-4/', difficulty: 'B', type: 'link' },
                    { title: '地方自治法(5)', url: '/gyousei/chihou-jichi-5/', difficulty: 'B', type: 'link' },
                    { title: '地方自治法(6)', url: '/gyousei/chihou-jichi-6/', difficulty: 'B', type: 'link' }
                ]
            },
            'civil': {
                name: '第3編 民法',
                order: 3,
                topics: [
                    { title: '権利の主体', url: '/minpou/kenri-shutai/', difficulty: 'B', type: 'link' },
                    { title: '制限行為能力者(1)', url: '/minpou/seigen-1/', difficulty: 'A', type: 'link' },
                    { title: '制限行為能力者(2)', url: '/minpou/seigen-2/', difficulty: 'A', type: 'link' },
                    { title: '意思表示(1)', url: '/minpou/ishi-hyouji-1/', difficulty: 'A', type: 'link' },
                    { title: '意思表示(2)', url: '/minpou/ishi-hyouji-2/', difficulty: 'A', type: 'link' },
                    { title: '意思表示(3)', url: '/minpou/ishi-hyouji-3/', difficulty: 'A', type: 'link' },
                    { title: '代理(1)', url: '/minpou/dairi-1/', difficulty: 'A', type: 'link' },
                    { title: '代理(2)', url: '/minpou/dairi-2/', difficulty: 'A', type: 'link' },
                    { title: '代理(3)', url: '/minpou/dairi-3/', difficulty: 'A', type: 'link' },
                    { title: '時効', url: '/minpou/jikou/', difficulty: 'A', type: 'link' },
                    { title: '物権変動(1)', url: '/minpou/bukken-hendou-1/', difficulty: 'A', type: 'link' },
                    { title: '物権変動(2)', url: '/minpou/bukken-hendou-2/', difficulty: 'A', type: 'link' },
                    { title: '所有権', url: '/minpou/shoyuuken/', difficulty: 'B', type: 'link' },
                    { title: '占有権・地役権', url: '/minpou/senyuu-chiyaku/', difficulty: 'C', type: 'link' },
                    { title: '担保物権(1)', url: '/minpou/tanpo-1/', difficulty: 'A', type: 'link' },
                    { title: '担保物権(2)', url: '/minpou/tanpo-2/', difficulty: 'A', type: 'link' },
                    { title: '担保物権(3)', url: '/minpou/tanpo-3/', difficulty: 'A', type: 'link' },
                    { title: '債権(1)', url: '/minpou/saiken-1/', difficulty: 'B', type: 'link' },
                    { title: '債権(2)', url: '/minpou/saiken-2/', difficulty: 'B', type: 'link' },
                    { title: '債務不履行', url: '/minpou/saimu-furikou/', difficulty: 'A', type: 'link' },
                    { title: '責任財産保全', url: '/minpou/sekinin-zaisan/', difficulty: 'B', type: 'link' },
                    { title: '連帯債務', url: '/minpou/rentai-saimu/', difficulty: 'B', type: 'link' },
                    { title: '保証債務', url: '/minpou/hoshou-saimu/', difficulty: 'A', type: 'link' },
                    { title: '契約総論(1)', url: '/minpou/keiyaku-souron-1/', difficulty: 'B', type: 'link' },
                    { title: '契約総論(2)', url: '/minpou/keiyaku-souron-2/', difficulty: 'B', type: 'link' },
                    { title: '所有権を移転する契約(1)', url: '/minpou/shoyuu-iten-1/', difficulty: 'A', type: 'link' },
                    { title: '所有権を移転する契約(2)', url: '/minpou/shoyuu-iten-2/', difficulty: 'A', type: 'link' },
                    { title: '他人の物を使用する契約(1)', url: '/minpou/tanin-shiyou-1/', difficulty: 'B', type: 'link' },
                    { title: '他人の物を使用する契約(2)', url: '/minpou/tanin-shiyou-2/', difficulty: 'B', type: 'link' },
                    { title: '他人の労務を利用する契約', url: '/minpou/tanin-roumu/', difficulty: 'B', type: 'link' },
                    { title: '事務管理・不当利得', url: '/minpou/jimu-kanri/', difficulty: 'B', type: 'link' },
                    { title: '不法行為(1)', url: '/minpou/fuhou-koui-1/', difficulty: 'A', type: 'link' },
                    { title: '不法行為(2)', url: '/minpou/fuhou-koui-2/', difficulty: 'A', type: 'link' },
                    { title: '親族法(1)', url: '/minpou/shinzoku-1/', difficulty: 'B', type: 'link' },
                    { title: '親族法(2)', url: '/minpou/shinzoku-2/', difficulty: 'B', type: 'link' },
                    { title: '相続法(1)', url: '/minpou/souzoku-1/', difficulty: 'A', type: 'link' },
                    { title: '相続法(2)', url: '/minpou/souzoku-2/', difficulty: 'A', type: 'link' }
                ]
            },
            'commercial': {
                name: '第4編 商法・会社法',
                order: 4,
                topics: [
                    { title: '商法総則(1)', url: '/shouhou/sousoku-1/', difficulty: 'B', type: 'link' },
                    { title: '商法総則(2)', url: '/shouhou/sousoku-2/', difficulty: 'B', type: 'link' },
                    { title: '商法総則(3)', url: '/shouhou/sousoku-3/', difficulty: 'B', type: 'link' },
                    { title: '商行為(1)', url: '/shouhou/shou-koui-1/', difficulty: 'B', type: 'link' },
                    { title: '商行為(2)', url: '/shouhou/shou-koui-2/', difficulty: 'B', type: 'link' },
                    { title: '商行為(3)', url: '/shouhou/shou-koui-3/', difficulty: 'B', type: 'link' },
                    { title: '持分会社', url: '/shouhou/mochibun-gaisha/', difficulty: 'C', type: 'link' },
                    { title: '株式会社(1)', url: '/shouhou/kabushiki-1/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(2)', url: '/shouhou/kabushiki-2/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(3)', url: '/shouhou/kabushiki-3/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(4)', url: '/shouhou/kabushiki-4/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(5)', url: '/shouhou/kabushiki-5/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(6)', url: '/shouhou/kabushiki-6/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(7)', url: '/shouhou/kabushiki-7/', difficulty: 'A', type: 'link' },
                    { title: '株式会社(8)', url: '/shouhou/kabushiki-8/', difficulty: 'A', type: 'link' },
                    { title: '組織再編', url: '/shouhou/soshiki-saihen/', difficulty: 'B', type: 'link' }
                ]
            },
            'basic_law': {
                name: '第5編 基礎法学',
                order: 5,
                topics: [
                    { title: '法の分類', url: '/kiso/hou-bunrui/', difficulty: 'B', type: 'link' },
                    { title: '法の効力・適用範囲', url: '/kiso/hou-kouryoku/', difficulty: 'B', type: 'link' },
                    { title: '法律用語・法の解釈', url: '/kiso/houritsu-yougo/', difficulty: 'A', type: 'link' },
                    { title: '紛争解決', url: '/kiso/funsou-kaiketsu/', difficulty: 'B', type: 'link' },
                    { title: '刑事法', url: '/kiso/keiji-hou/', difficulty: 'B', type: 'link' }
                ]
            }
        };

        // 現在の選択状態
        this.currentSubject = null;
        this.currentTopicIndex = null;
        this.currentView = 'subjects';
        this.keyTermsHidden = false;
        this.initialized = false;
        this.isContentView = false;
        this.currentContentLocation = null;
        
        // カード選択用の状態
        this.selectedSubjectForRegister = null;
        this.selectedTopicForRegister = null;
    }

    /**
     * 🚀 Firestoreから階層構造を読み込み（新機能）
     */
    async loadStructureFromFirestore() {
        try {
            console.log('📚 階層構造をFirestoreから読み込み中...');

            if (!window.firebase) {
                console.warn('⚠️  Firebase未初期化 - フォールバック構造を使用');
                return false;
            }

            const db = firebase.firestore();
            const doc = await db.collection('keypoints_structure').doc('master').get();

            if (doc.exists) {
                const data = doc.data();
                this.structureData = data.subjects;
                console.log(`✅ 階層構造読み込み完了: ${Object.keys(this.structureData).length}科目`);
                return true;
            } else {
                console.warn('⚠️  階層構造データなし - フォールバック構造を使用');
                return false;
            }

        } catch (error) {
            console.error('❌ 階層構造読み込みエラー:', error);
            return false;
        }
    }

    /**
     * 🚀 Firestoreからユーザーの要点内容を読み込み（既存機能改良）
     */
    async loadContentFromFirestore() {
        try {
            if (!window.firebase || !window.ULTRA_STABLE_USER_ID) {
                console.warn('⚠️  Firebase/ユーザーID未設定 - LocalStorageから読み込み');
                return this.loadContentFromLocalStorage();
            }

            console.log('📖 要点内容をFirestoreから読み込み中...');

            const db = firebase.firestore();
            const userRef = db.collection('users').doc(window.ULTRA_STABLE_USER_ID);
            const keyPointsRef = userRef.collection('keyPoints');

            const snapshot = await keyPointsRef.get();
            if (!snapshot.empty) {
                this.userContent = {};
                snapshot.forEach(doc => {
                    this.userContent[doc.id] = doc.data();
                });
                console.log(`✅ 要点内容読み込み完了: ${Object.keys(this.userContent).length}科目`);
                return true;
            } else {
                console.log('📝 要点内容なし - 新規ユーザーまたは未編集');
                this.userContent = {};
                return true;
            }

        } catch (error) {
            console.error('❌ 要点内容読み込みエラー:', error);
            return this.loadContentFromLocalStorage(); // フォールバック
        }
    }

    /**
     * 🔄 LocalStorageからの読み込み（フォールバック）
     */
    loadContentFromLocalStorage() {
        try {
            const saved = localStorage.getItem('keyPointsData');
            if (saved) {
                this.userContent = JSON.parse(saved);
                console.log('📁 LocalStorageから要点内容を読み込み完了');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ LocalStorage読み込みエラー:', error);
            return false;
        }
    }

    /**
     * 🚀 階層構造と要点内容をマージして表示用データ作成
     */
    mergeStructureAndContent() {
        try {
            console.log('🔀 データマージ開始...');

            // フォールバック: structureDataがない場合は既存構造を使用
            const sourceStructure = this.structureData || this.subjects;

            // 深いコピーでベース構造作成
            this.subjects = JSON.parse(JSON.stringify(sourceStructure));

            // ユーザーの要点内容をマージ
            if (this.userContent) {
                Object.keys(this.userContent).forEach(subjectKey => {
                    if (this.subjects[subjectKey] && this.userContent[subjectKey].topics) {
                        this.userContent[subjectKey].topics.forEach((savedTopic, index) => {
                            if (savedTopic.htmlContent && this.subjects[subjectKey].topics[index]) {
                                this.subjects[subjectKey].topics[index].htmlContent = savedTopic.htmlContent;
                                this.subjects[subjectKey].topics[index].type = 'html';
                            }
                        });
                    }
                });
            }

            console.log('✅ データマージ完了');
            return true;

        } catch (error) {
            console.error('❌ データマージエラー:', error);
            return false;
        }
    }

    /**
     * 🚀 新しい軽量読み込みシステム
     */
    async loadKeyPointsDataNew() {
        if (this.isLoading) {
            console.log('⏳ 読み込み中...');
            return;
        }

        try {
            this.isLoading = true;
            console.log('🚀 軽量読み込みシステム開始');

            // Step 1: 階層構造を読み込み
            const structureLoaded = await this.loadStructureFromFirestore();

            // Step 2: ユーザーの要点内容を読み込み
            const contentLoaded = await this.loadContentFromFirestore();

            // Step 3: データをマージして表示用構造作成
            this.mergeStructureAndContent();

            console.log('🎉 軽量読み込み完了');
            return true;

        } catch (error) {
            console.error('💥 軽量読み込みエラー:', error);
            // 完全フォールバック: 既存システムを使用
            return this.loadKeyPointsDataLegacy();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 🔄 既存の読み込みシステム（フォールバック用に名前変更）
     */
    loadKeyPointsDataLegacy() {
        try {
            const saved = localStorage.getItem('keyPointsData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                if (parsedData && typeof parsedData === 'object') {
                    // カスタムHTMLコンテンツをマージ
                    Object.keys(this.subjects).forEach(subjectKey => {
                        if (parsedData[subjectKey] && parsedData[subjectKey].topics) {
                            parsedData[subjectKey].topics.forEach((savedTopic, index) => {
                                if (savedTopic.htmlContent && this.subjects[subjectKey].topics[index]) {
                                    this.subjects[subjectKey].topics[index].htmlContent = savedTopic.htmlContent;
                                    this.subjects[subjectKey].topics[index].type = 'html';
                                }
                            });
                        }
                    });
                }
            }
            // Firebase統合
            this.initializeFirebaseSync();
            return true;
        } catch (error) {
            console.error('❌ レガシー読み込みエラー:', error);
            return false;
        }
    }

    /**
     * 🔄 カスタムコンテンツをマージ（DataManager連携用）
     */
    mergeCustomContent(subjectKey, subjectData) {
        try {
            if (!this.subjects[subjectKey] || !subjectData || !subjectData.topics) {
                return;
            }

            // topics配列の各項目にカスタムHTMLコンテンツをマージ
            subjectData.topics.forEach((savedTopic, index) => {
                if (savedTopic.htmlContent && this.subjects[subjectKey].topics[index]) {
                    this.subjects[subjectKey].topics[index].htmlContent = savedTopic.htmlContent;
                    this.subjects[subjectKey].topics[index].type = 'html';
                }
            });

            console.log(`✅ ${subjectKey} のカスタムコンテンツをマージしました`);
        } catch (error) {
            console.error(`❌ ${subjectKey} のコンテンツマージエラー:`, error);
        }
    }

    /**
     * 管理者ステータス判定
     */
    async detectAdminStatus() {
        try {
            if (!window.firebase || !window.firebase.auth) {
                this.isAdmin = false;
                console.log('🔑 Firebase認証が利用できません');
                return;
            }

            // Firebase認証の状態変更を待つ
            return new Promise((resolve) => {
                const unsubscribe = window.firebase.auth().onAuthStateChanged((user) => {
                    unsubscribe(); // リスナーを解除

                    if (!user) {
                        this.isAdmin = false;
                        console.log('🔑 管理者判定: 未ログイン');
                        resolve();
                        return;
                    }

                    // 管理者メールアドレスのリスト
                    const adminEmails = [
                        'utohideki@gmail.com', // メインの管理者
                        // 必要に応じて他の管理者メールを追加
                    ];

                    this.isAdmin = adminEmails.includes(user.email);
                    console.log(`🔑 管理者判定: ${this.isAdmin ? '管理者' : '一般ユーザー'} (${user.email})`);

                    if (this.isAdmin) {
                        console.log('🔓 管理者機能が有効になりました');
                        this.loadTemplateData(); // 管理者の場合はテンプレートデータを読み込み
                        this.showAdminIndicator(); // 管理者表示を追加
                    }

                    resolve();
                });
            });
        } catch (error) {
            console.error('❌ 管理者判定エラー:', error);
            this.isAdmin = false;
        }
    }

    /**
     * テンプレートデータ読み込み（管理者用）
     */
    async loadTemplateData() {
        try {
            const db = window.firebase.firestore();
            const templateRef = db.collection('keypoints_templates').doc('default');
            const doc = await templateRef.get();

            if (doc.exists) {
                this.templateData = doc.data();
                console.log('📋 テンプレートデータ読み込み完了:', Object.keys(this.templateData).length, 'subjects');
            } else {
                console.log('📋 テンプレートデータが存在しません');
                this.templateData = {};
            }
        } catch (error) {
            console.error('❌ テンプレートデータ読み込みエラー:', error);
            this.templateData = {};
        }
    }

    /**
     * 初期データテンプレート保存（管理者用）
     */
    async saveAsTemplate(subjectKey, topicIndex, content) {
        if (!this.isAdmin) {
            console.warn('⚠️ 管理者のみがテンプレートを保存できます');
            return false;
        }

        try {
            const db = window.firebase.firestore();
            const templateRef = db.collection('keypoints_templates').doc('default');

            // 既存のテンプレートデータを取得
            const doc = await templateRef.get();
            const existingData = doc.exists ? doc.data() : {};

            // 新しい内容を追加/更新
            if (!existingData[subjectKey]) {
                existingData[subjectKey] = {};
            }
            if (!existingData[subjectKey].topics) {
                existingData[subjectKey].topics = {};
            }

            existingData[subjectKey].topics[topicIndex] = {
                htmlContent: content,
                updatedAt: new Date().toISOString(),
                updatedBy: window.firebase.auth().currentUser?.email
            };

            // Firestoreに保存
            await templateRef.set(existingData, { merge: true });

            console.log(`✅ テンプレート保存完了: ${subjectKey} - トピック${topicIndex}`);
            return true;
        } catch (error) {
            console.error('❌ テンプレート保存エラー:', error);
            return false;
        }
    }

    /**
     * 管理者ステータス表示インジケーター
     */
    showAdminIndicator() {
        // 既存のインジケーターがあれば削除
        const existingIndicator = document.getElementById('admin-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const indicator = document.createElement('div');
        indicator.id = 'admin-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                z-index: 9999;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 5px;
            ">
                🔓 管理者モード
            </div>
        `;
        document.body.appendChild(indicator);

        console.log('👑 管理者インジケーターを表示しました');
    }

    /**
     * 管理者UIボタンを追加
     */
    addAdminUI(container, subjectKey, topicIndex) {
        if (!this.isAdmin) return;

        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.innerHTML = `
            <div class="admin-panel" style="margin-top: 10px; padding: 10px; background: #f0f8ff; border: 1px solid #87ceeb; border-radius: 5px;">
                <strong>🔓 管理者機能</strong>
                <button onclick="KeyPointsModule.saveCurrentAsTemplate('${subjectKey}', ${topicIndex})"
                        class="admin-btn" style="margin-left: 10px; padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    初期データとして保存
                </button>
                <button onclick="KeyPointsModule.showTemplatePreview('${subjectKey}', ${topicIndex})"
                        class="admin-btn" style="margin-left: 5px; padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    テンプレート確認
                </button>
            </div>
        `;
        container.appendChild(adminControls);
    }

    /**
     * 現在の内容をテンプレートとして保存
     */
    async saveCurrentAsTemplate(subjectKey, topicIndex) {
        if (!this.isAdmin) {
            alert('管理者権限が必要です');
            return;
        }

        // エディタから現在の内容を取得
        const editor = document.querySelector(`[data-subject="${subjectKey}"][data-topic="${topicIndex}"] .editor-content`);
        if (!editor) {
            alert('エディタが見つかりません');
            return;
        }

        const content = editor.innerHTML;
        if (!content.trim()) {
            alert('内容が空です');
            return;
        }

        const success = await this.saveAsTemplate(subjectKey, topicIndex, content);
        if (success) {
            alert('初期データテンプレートとして保存しました！\n全てのユーザーがこの内容を初期状態で見ることができます。');
        } else {
            alert('保存に失敗しました');
        }
    }

    /**
     * テンプレート内容プレビュー表示
     */
    showTemplatePreview(subjectKey, topicIndex) {
        if (!this.isAdmin || !this.templateData) return;

        const templateContent = this.templateData[subjectKey]?.topics?.[topicIndex];
        if (!templateContent) {
            alert('このトピックにはテンプレートが設定されていません');
            return;
        }

        const preview = document.createElement('div');
        preview.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 80%; max-width: 600px; height: 70%;
            background: white; border: 2px solid #87ceeb; border-radius: 10px;
            padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000;
            overflow-y: auto;
        `;

        preview.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>📋 テンプレートプレビュー</h3>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    閉じる
                </button>
            </div>
            <p><strong>更新日時:</strong> ${new Date(templateContent.updatedAt).toLocaleString('ja-JP')}</p>
            <p><strong>更新者:</strong> ${templateContent.updatedBy}</p>
            <hr>
            <div style="border: 1px solid #ddd; padding: 15px; background: #f9f9f9;">
                ${templateContent.htmlContent}
            </div>
        `;

        document.body.appendChild(preview);
    }

    /**
     * ユーザー向けテンプレートデータ読み込み
     */
    async loadUserTemplateData(subjectKey, topicIndex) {
        try {
            const db = window.firebase.firestore();
            const templateRef = db.collection('keypoints_templates').doc('default');
            const doc = await templateRef.get();

            if (doc.exists) {
                const templateData = doc.data();
                const templateContent = templateData[subjectKey]?.topics?.[topicIndex];

                if (templateContent) {
                    console.log(`📋 初期データテンプレートを読み込みました: ${subjectKey} - トピック${topicIndex}`);
                    return templateContent.htmlContent;
                }
            }

            return null;
        } catch (error) {
            console.error('❌ テンプレートデータ読み込みエラー:', error);
            return null;
        }
    }

    /**
     * 初期化
     */
    async initialize() {
        if (this.initialized) return;

        try {
            console.log('🚀 KeyPointsModule初期化開始 (軽量版)');

            // DataManagerの存在確認
            if (!window.DataManager) {
                console.log('⏳ DataManager待機中...');
                setTimeout(() => this.initialize(), 100);
                return;
            }

            // 🔑 管理者判定
            await this.detectAdminStatus();

            // 🚀 新しい軽量データ読み込み
            const loadSuccess = await this.loadKeyPointsDataNew();
            if (!loadSuccess) {
                console.warn('⚠️  新しい読み込み失敗 - レガシーシステムを使用');
            }

            // スタイル追加
            this.addKeyPointStyles();
            this.addDifficultyStyles();

            // グローバル関数定義
            window.toggleKeyTerms = () => this.toggleKeyTerms();

            this.initialized = true;
            console.log('✅ KeyPointsModule初期化完了');

        } catch (error) {
            console.error('❌ KeyPointsModule初期化エラー:', error);
            this.initialized = true;
        }
    }

    /**
     * 🔄 要点データの読み込み（後方互換性用）
     */
    loadKeyPointsData() {
        console.warn('⚠️  loadKeyPointsData() は非推奨です。loadKeyPointsDataNew() を使用してください。');
        return this.loadKeyPointsDataLegacy();
    }

    /**
     * 旧版要点データの読み込み
     */
    loadKeyPointsDataOld() {
        try {
            const saved = localStorage.getItem('keyPointsData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                if (parsedData && typeof parsedData === 'object') {
                    // カスタムHTMLコンテンツをマージ
                    Object.keys(this.subjects).forEach(subjectKey => {
                        if (parsedData[subjectKey] && parsedData[subjectKey].topics) {
                            parsedData[subjectKey].topics.forEach((savedTopic, index) => {
                                if (savedTopic.htmlContent && this.subjects[subjectKey].topics[index]) {
                                    this.subjects[subjectKey].topics[index].htmlContent = savedTopic.htmlContent;
                                    this.subjects[subjectKey].topics[index].type = 'html';
                                }
                            });
                        }
                    });
                }
            }
            // Firebase統合
            this.initializeFirebaseSync();
        } catch (error) {
            console.error('❌ KeyPointsデータ読み込みエラー:', error);
        }
    }

    /**
     * Firebase同期初期化
     */
    initializeFirebaseSync() {
        if (window.firebase && window.ULTRA_STABLE_USER_ID) {
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(window.ULTRA_STABLE_USER_ID);
            const keyPointsRef = userRef.collection('keyPoints');

            keyPointsRef.get().then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const subjectKey = doc.id;
                        const data = doc.data();
                        if (data && data.topics && this.subjects[subjectKey]) {
                            data.topics.forEach((savedTopic, index) => {
                                if (savedTopic.htmlContent && this.subjects[subjectKey].topics[index]) {
                                    this.subjects[subjectKey].topics[index].htmlContent = savedTopic.htmlContent;
                                    this.subjects[subjectKey].topics[index].type = 'html';
                                }
                            });
                        }
                    });
                    this.saveKeyPointsData();
                }
            }).catch(error => {
                console.warn('Firebase同期エラー:', error);
            });
        }
    }

    /**
     * 要点データの保存
     */
    saveKeyPointsData() {
        try {
            // LocalStorage保存
            const dataToSave = {};
            Object.keys(this.subjects).forEach(subjectKey => {
                dataToSave[subjectKey] = {
                    ...this.subjects[subjectKey],
                    topics: this.subjects[subjectKey].topics.map(topic => ({
                        ...topic
                    }))
                };
            });
            localStorage.setItem('keyPointsData', JSON.stringify(dataToSave));

            // Firebase保存
            if (window.firebase && window.ULTRA_STABLE_USER_ID) {
                const db = firebase.firestore();
                const userRef = db.collection('users').doc(window.ULTRA_STABLE_USER_ID);
                const keyPointsRef = userRef.collection('keyPoints');

                Object.keys(this.subjects).forEach(subjectKey => {
                    keyPointsRef.doc(subjectKey).set({
                        ...this.subjects[subjectKey],
                        lastUpdated: new Date().toISOString()
                    }, { merge: true });
                });
            }

            if (window.DataManager && typeof DataManager.saveToFirebase === 'function') {
                DataManager.saveToFirebase();
            }

            return true;
        } catch (error) {
            console.error('保存エラー:', error);
            return false;
        }
    }

    /**
     * 要点確認のメインコンテンツを描画
     */
    renderKeyPointsContent() {
        this.isContentView = false;
        
        return `
            <div id="keyPointsMainContent">
                ${this.renderSubjectList()}
            </div>
        `;
    }

    /**
     * 科目一覧を表示
     */
    renderSubjectList() {
        this.currentView = 'subjects';
        this.isContentView = false;
        
        const subjects = Object.entries(this.subjects)
            .map(([key, data]) => ({ key, ...data }))
            .sort((a, b) => a.order - b.order);
        
        let html = `
            <div style="padding: 15px;">
                <h3 style="text-align: center; margin-bottom: 25px; color: #2d3748;">📋 科目一覧</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        `;

        subjects.forEach(subject => {
            const registeredCount = subject.topics.filter(t => t.type === 'html' && t.htmlContent).length;
            html += `
                <div class="subject-card" style="background: white; border: 2px solid var(--light); border-radius: 10px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s;" 
                     onclick="KeyPointsModule.selectSubject('${subject.key}')">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        ${subject.name}
                    </div>
                    <div style="font-size: 12px; color: var(--gray);">
                        項目数: ${subject.topics.length}
                    </div>
                    ${registeredCount > 0 ? `
                        <div style="font-size: 11px; color: var(--success); margin-top: 5px;">
                            登録済: ${registeredCount}件
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <h4 style="margin-bottom: 15px;">📝 要点編集</h4>
                    ${this.renderRegistrationCards()}
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>📚 登録済み要点</h4>
                    ${this.renderRegisteredKeyPoints()}
                </div>
            </div>
        `;

        return html;
    }

    /**
     * 科目選択（項目一覧表示）
     */
    selectSubject(subjectKey) {
        this.currentSubject = subjectKey;
        this.currentView = 'topics';
        this.isContentView = false;
        
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        let html = `
            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0;">${subject.name}</h3>
                    <button onclick="KeyPointsModule.backToSubjectList()" 
                            style="padding: 6px 12px; background: var(--gray); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        戻る
                    </button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;

        subject.topics.forEach((topic, index) => {
            const hasContent = topic.type === 'html' && topic.htmlContent;
            const difficultyClass = `difficulty-${topic.difficulty.toLowerCase()}`;
            
            html += `
                <div class="topic-item" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;"
                     onclick="KeyPointsModule.viewTopicContent('${subjectKey}', ${index})">
                    <span style="color: #718096; min-width: 30px; font-weight: 600;">
                        ${index + 1}
                    </span>
                    <div style="flex: 1;">
                        ${topic.title}
                    </div>
                    <span class="difficulty-badge ${difficultyClass}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${topic.difficulty}
                    </span>
                    ${hasContent ? 
                        '<span style="color: var(--success);">✅</span>' : 
                        ''
                    }
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    /**
     * カード形式の登録フォーム
     */
    renderRegistrationCards() {
        const subjects = Object.entries(this.subjects)
            .map(([key, data]) => ({ key, ...data }))
            .sort((a, b) => a.order - b.order);

        let html = `
            <div id="registrationArea">
                <div id="subjectSelectCards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 15px;">
        `;

        subjects.forEach(subject => {
            const isSelected = this.selectedSubjectForRegister === subject.key;
            html += `
                <div class="register-card ${isSelected ? 'selected' : ''}" 
                     style="background: ${isSelected ? 'var(--primary)' : 'white'}; color: ${isSelected ? 'white' : 'black'}; 
                            border: 2px solid ${isSelected ? 'var(--primary)' : '#e2e8f0'}; 
                            border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s;"
                     onclick="KeyPointsModule.selectSubjectForRegister('${subject.key}')">
                    <div style="font-size: 14px; font-weight: 500;">
                        ${subject.name.replace('第', '').replace('編 ', '')}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                
                <div id="topicSelectArea" style="display: ${this.selectedSubjectForRegister ? 'block' : 'none'};">
                    <div id="topicSelectCards" style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 15px;">
                        ${this.renderTopicCards()}
                    </div>
                </div>
                
                <div id="htmlInputArea" style="display: ${this.selectedTopicForRegister !== null ? 'block' : 'none'};">
                    <textarea class="form-control" id="registerHtml" rows="8" 
                              placeholder="HTML形式の要点まとめを入力" 
                              style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical;"></textarea>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                        💡 重要語句を &lt;span class="wp-key-term"&gt;語句&lt;/span&gt; で囲むと隠し機能付きになります
                    </div>
                    <button onclick="KeyPointsModule.registerKeyPoint()" 
                            style="margin-top: 10px; padding: 10px 20px; background: var(--success); color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                        📝 要点を登録
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * 項目カードを描画
     */
    renderTopicCards() {
        if (!this.selectedSubjectForRegister) return '';

        const subject = this.subjects[this.selectedSubjectForRegister];
        if (!subject) return '';

        let html = '<div style="display: flex; flex-direction: column; gap: 5px;">';

        subject.topics.forEach((topic, index) => {
            const hasContent = topic.type === 'html' && topic.htmlContent;
            const isSelected = this.selectedTopicForRegister === index;
            
            html += `
                <div class="topic-register-card ${isSelected ? 'selected' : ''}"
                     style="background: ${isSelected ? '#f0f9ff' : 'white'}; 
                            border: 1px solid ${isSelected ? 'var(--primary)' : '#e2e8f0'}; 
                            border-radius: 6px; padding: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                     onclick="KeyPointsModule.selectTopicForRegister(${index})">
                    <span style="color: #718096; min-width: 25px; font-size: 12px;">${index + 1}</span>
                    <div style="flex: 1; font-size: 13px;">${topic.title}</div>
                    ${hasContent ? '<span style="color: var(--success); font-size: 12px;">✅</span>' : ''}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * 登録用科目選択
     */
    selectSubjectForRegister(subjectKey) {
        this.selectedSubjectForRegister = subjectKey;
        this.selectedTopicForRegister = null;
        
        // UIを更新
        document.getElementById('registrationArea').innerHTML = this.renderRegistrationCards();
    }

    /**
     * 登録用項目選択
     */
    selectTopicForRegister(topicIndex) {
        this.selectedTopicForRegister = topicIndex;
        
        // HTMLエリアを表示
        const htmlArea = document.getElementById('htmlInputArea');
        if (htmlArea) {
            htmlArea.style.display = 'block';
            
            // 既存のコンテンツがある場合は表示
            const subject = this.subjects[this.selectedSubjectForRegister];
            const topic = subject.topics[topicIndex];
            if (topic.htmlContent) {
                document.getElementById('registerHtml').value = topic.htmlContent;
            }
        }
        
        // 選択状態を更新
        this.updateTopicCardSelection();
    }

    /**
     * 項目カードの選択状態を更新
     */
    updateTopicCardSelection() {
        const cards = document.querySelectorAll('.topic-register-card');
        cards.forEach((card, index) => {
            if (index === this.selectedTopicForRegister) {
                card.style.background = '#f0f9ff';
                card.style.border = '1px solid var(--primary)';
            } else {
                card.style.background = 'white';
                card.style.border = '1px solid #e2e8f0';
            }
        });
    }

    /**
     * 要点を登録
     */
    registerKeyPoint() {
        const htmlContent = document.getElementById('registerHtml').value.trim();

        if (!this.selectedSubjectForRegister || this.selectedTopicForRegister === null || !htmlContent) {
            alert('すべての項目を入力してください');
            return;
        }

        const subject = this.subjects[this.selectedSubjectForRegister];
        if (!subject || !subject.topics[this.selectedTopicForRegister]) {
            alert('選択した項目が見つかりません');
            return;
        }

        // HTMLコンテンツを保存
        subject.topics[this.selectedTopicForRegister].htmlContent = htmlContent;
        subject.topics[this.selectedTopicForRegister].type = 'html';

        // データを保存
        if (this.saveKeyPointsData()) {
            alert('要点を登録しました！');
            
            // フォームをリセット
            this.selectedSubjectForRegister = null;
            this.selectedTopicForRegister = null;
            
            // UIを更新
            const content = document.getElementById('keyPointsMainContent');
            if (content) {
                content.innerHTML = this.renderSubjectList();
            }
        } else {
            alert('保存に失敗しました');
        }
    }

    /**
     * 登録済み要点を表示（科目一覧と同様のUI）
     */
    renderRegisteredKeyPoints() {
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">';
        let hasItems = false;

        Object.entries(this.subjects)
            .sort((a, b) => a[1].order - b[1].order)
            .forEach(([subjectKey, subject]) => {
                const registeredTopics = subject.topics
                    .map((topic, index) => ({ ...topic, index }))
                    .filter(topic => topic.type === 'html' && topic.htmlContent);

                if (registeredTopics.length > 0) {
                    hasItems = true;
                    html += `
                        <div class="registered-subject-card" style="background: white; border: 2px solid #86efac; border-radius: 10px; padding: 12px; cursor: pointer;"
                             onclick="KeyPointsModule.showEditList('${subjectKey}')">
                            <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 5px;">
                                ${subject.name}
                            </div>
                            <div style="font-size: 12px; color: var(--success);">
                                登録済: ${registeredTopics.length}件
                            </div>
                        </div>
                    `;
                }
            });

        if (!hasItems) {
            html = '<div style="text-align: center; color: var(--gray); padding: 20px;">登録済みの要点はありません</div>';
        } else {
            html += '</div>';
        }

        return html;
    }

    /**
     * 編集リスト表示
     */
    showEditList(subjectKey) {
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        let html = `
            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${subject.name} の登録済み要点</h3>
                    <button onclick="KeyPointsModule.backToSubjectList()" 
                            style="padding: 6px 12px; background: var(--gray); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        戻る
                    </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;

        subject.topics.forEach((topic, index) => {
            const hasContent = topic.type === 'html' && topic.htmlContent;
            if (hasContent) {
                html += `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: #718096; min-width: 25px; font-size: 14px;">${index + 1}</span>
                            <div style="font-weight: 500;">
                                ${topic.title}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="KeyPointsModule.editKeyPoint('${subjectKey}', ${index})" 
                                    style="padding: 4px 8px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                編集
                            </button>
                            <button onclick="KeyPointsModule.deleteKeyPoint('${subjectKey}', ${index})" 
                                    style="padding: 4px 8px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                削除
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }

    /**
     * 項目内容表示
     */
    viewTopicContent(subjectKey, topicIndex) {
        const subject = this.subjects[subjectKey];
        if (!subject || !subject.topics[topicIndex]) return;

        const topic = subject.topics[topicIndex];
        
        // 現在位置を保存
        this.currentContentLocation = {
            subjectKey,
            topicIndex
        };

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
        this.isContentView = true;
        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const paginationInfo = this.calculatePagination();

        const html = `
            <div style="padding: 20px;">
                <div id="keyPointContent">
                    ${htmlContent}
                </div>
            </div>
        `;

        content.innerHTML = html;
        
        // モーダルヘッダーを更新
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    ${paginationInfo.hasPrev ? 
                        `<button onclick="KeyPointsModule.navigateTopic(-1)" style="padding: 5px 10px; background: var(--light); border: none; border-radius: 5px; cursor: pointer;">◀</button>` : 
                        '<div style="width: 30px;"></div>'
                    }
                    <h3 style="margin: 0; flex-grow: 1; text-align: center;">${title}</h3>
                    <button onclick="toggleKeyTerms()" style="padding: 5px 10px; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        重要語句
                    </button>
                    ${paginationInfo.hasNext ? 
                        `<button onclick="KeyPointsModule.navigateTopic(1)" style="padding: 5px 10px; background: var(--light); border: none; border-radius: 5px; cursor: pointer;">▶</button>` : 
                        '<div style="width: 30px;"></div>'
                    }
                    <button class="modal-close" onclick="KeyPointsModule.backFromContent()">×</button>
                </div>
            `;
        }
    }

    /**
     * ページネーション情報を計算
     */
    calculatePagination() {
        if (!this.currentContentLocation) {
            return { hasPrev: false, hasNext: false };
        }

        const { subjectKey, topicIndex } = this.currentContentLocation;
        const subject = this.subjects[subjectKey];
        
        if (!subject) {
            return { hasPrev: false, hasNext: false };
        }

        return {
            hasPrev: topicIndex > 0,
            hasNext: topicIndex < subject.topics.length - 1,
            current: topicIndex + 1,
            total: subject.topics.length
        };
    }

    /**
     * 項目間のナビゲーション
     */
    navigateTopic(direction) {
        if (!this.currentContentLocation) return;

        const { subjectKey, topicIndex } = this.currentContentLocation;
        const subject = this.subjects[subjectKey];
        
        if (!subject) return;

        const newIndex = topicIndex + direction;
        
        if (newIndex >= 0 && newIndex < subject.topics.length) {
            this.viewTopicContent(subjectKey, newIndex);
        }
    }

    /**
     * コンテンツ表示から戻る
     */
    backFromContent() {
        if (this.currentContentLocation) {
            this.selectSubject(this.currentContentLocation.subjectKey);
        } else {
            this.backToSubjectList();
        }
    }

    /**
     * 科目一覧に戻る
     */
    backToSubjectList() {
        const content = document.getElementById('keyPointsMainContent');
        if (content) {
            content.innerHTML = this.renderSubjectList();
        }
        this.resetModalHeader();
    }

    /**
     * モーダルヘッダーをリセット
     */
    resetModalHeader() {
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">📚 要点確認</h3>
                <button class="modal-close" onclick="App.closeFooterModal()">×</button>
            `;
        }
    }

    /**
     * 要点編集
     */
    editKeyPoint(subjectKey, topicIndex) {
        const subject = this.subjects[subjectKey];
        if (!subject || !subject.topics[topicIndex]) {
            alert('編集対象が見つかりません');
            return;
        }

        const topic = subject.topics[topicIndex];
        const currentContent = topic.htmlContent || '';

        const dialogBody = `
            <div class="form-group">
                <label class="form-label">項目名</label>
                <input type="text" class="form-control" value="${topic.title}" readonly style="background: #f8f9fa;">
            </div>
            <div class="form-group">
                <label class="form-label">HTML内容</label>
                <textarea class="form-control" id="editKeyPointHtml" rows="10">${currentContent}</textarea>
                <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                    💡 重要語句を &lt;span class="wp-key-term"&gt;語句&lt;/span&gt; で囲むと隠し機能付きになります
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content" style="max-width: 600px;">
                <div class="custom-modal-header">
                    <h3>要点を編集</h3>
                    <button class="modal-close" onclick="this.closest('.custom-modal').remove()">×</button>
                </div>
                <div class="custom-modal-body">
                    ${dialogBody}
                </div>
                <div class="custom-modal-footer">
                    <button class="save-button" onclick="KeyPointsModule.saveEditedKeyPoint('${subjectKey}', ${topicIndex})">
                        保存
                    </button>
                    <button class="cancel-button" onclick="this.closest('.custom-modal').remove()">
                        キャンセル
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 編集した要点を保存
     */
    saveEditedKeyPoint(subjectKey, topicIndex) {
        const htmlContent = document.getElementById('editKeyPointHtml').value.trim();
        
        if (!htmlContent) {
            alert('HTML内容を入力してください');
            return;
        }

        const subject = this.subjects[subjectKey];
        if (!subject || !subject.topics[topicIndex]) {
            alert('保存対象が見つかりません');
            return;
        }

        // 保存
        subject.topics[topicIndex].htmlContent = htmlContent;
        subject.topics[topicIndex].type = 'html';

        if (this.saveKeyPointsData()) {
            alert('更新しました！');
            document.querySelector('.custom-modal').remove();
            
            // 表示を更新
            this.showEditList(subjectKey);
        } else {
            alert('保存に失敗しました');
        }
    }

    /**
     * 要点削除
     */
    deleteKeyPoint(subjectKey, topicIndex) {
        if (!confirm('この要点を削除しますか？')) return;

        const subject = this.subjects[subjectKey];
        if (!subject || !subject.topics[topicIndex]) {
            alert('削除対象が見つかりません');
            return;
        }

        // HTMLコンテンツを削除
        delete subject.topics[topicIndex].htmlContent;
        subject.topics[topicIndex].type = 'link';

        if (this.saveKeyPointsData()) {
            alert('削除しました');
            
            // 表示を更新
            this.showEditList(subjectKey);
        } else {
            alert('削除に失敗しました');
        }
    }

    /**
     * 重要語句の表示/非表示切替
     */
    toggleKeyTerms() {
        this.keyTermsHidden = !this.keyTermsHidden;
        const terms = document.querySelectorAll('.wp-key-term');
        
        terms.forEach(term => {
            if (this.keyTermsHidden) {
                term.style.backgroundColor = '#333';
                term.style.color = '#333';
            } else {
                term.style.backgroundColor = '#ffeb3b';
                term.style.color = '#000';
            }
        });
    }

    /**
     * スタイル追加
     */
    addKeyPointStyles() {
        if (document.getElementById('keypoint-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'keypoint-styles';
        style.innerHTML = `
            .wp-key-term {
                background-color: #ffeb3b;
                padding: 2px 4px;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-block;
                font-weight: 500;
            }
            
            .wp-key-term.hidden {
                background-color: #333 !important;
                color: #333 !important;
            }
            
            .subject-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-color: var(--primary) !important;
            }
            
            .registered-subject-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .register-card:hover {
                transform: scale(1.05);
            }
            
            .topic-item:hover {
                background: #f8f9fa !important;
                transform: translateX(4px);
            }
            
            .custom-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .custom-modal-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .custom-modal-header {
                padding: 15px 20px;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .custom-modal-body {
                padding: 20px;
            }
            
            .custom-modal-footer {
                padding: 15px 20px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .cancel-button {
                padding: 8px 16px;
                background: var(--gray);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .form-control {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 5px;
                font-size: 14px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                font-size: 14px;
                color: #2d3748;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 難易度スタイル追加
     */
    addDifficultyStyles() {
        if (document.getElementById('difficulty-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'difficulty-styles';
        style.innerHTML = `
            .difficulty-a {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .difficulty-b {
                background: #fef3c7;
                color: #d97706;
            }
            
            .difficulty-c {
                background: #dbeafe;
                color: #2563eb;
            }
        `;
        document.head.appendChild(style);
    }
}

// グローバルに公開
window.KeyPointsModule = new KeyPointsModuleClass();

// 初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        KeyPointsModule.initialize();
    });
} else {
    KeyPointsModule.initialize();
}

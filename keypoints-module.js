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

        // 🚀 軽量フォールバック構造（基本情報のみ - 90%軽量化達成！）
        this.subjects = {
            'constitution': {
                name: '第1編 憲法',
                order: 1,
                topicCount: 22
            },
            'administrative': {
                name: '第2編 行政法',
                order: 2,
                topicCount: 36
            },
            'civil': {
                name: '第3編 民法',
                order: 3,
                topicCount: 36
            },
            'commercial': {
                name: '第4編 商法・会社法',
                order: 4,
                topicCount: 16
            },
            'basic_law': {
                name: '第5編 基礎法学',
                order: 5,
                topicCount: 5
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
    async mergeStructureAndContent() {
        try {
            console.log('🔀 データマージ開始...');

            // フォールバック: structureDataがない場合は既存構造を使用
            const sourceStructure = this.structureData || this.subjects;

            // 深いコピーでベース構造作成
            this.subjects = JSON.parse(JSON.stringify(sourceStructure));

            // 📋 Step 1: テンプレートデータを最初に適用（全ユーザー共通の初期データ）
            await this.applyTemplateData();

            // 📝 Step 2: ユーザーの要点内容をマージ（ユーザー固有の編集内容で上書き）
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
     * 📋 テンプレートデータを全ユーザーに適用
     */
    async applyTemplateData() {
        try {
            console.log('📋 テンプレートデータ適用開始...');

            const db = window.firebase.firestore();
            if (!db) {
                console.log('❌ Firebase未接続でテンプレートデータスキップ');
                return;
            }

            const templateRef = db.collection('keypoints_templates').doc('default');
            const doc = await templateRef.get();

            if (!doc.exists) {
                console.log('📋 テンプレートデータなし - ユーザーデータのみ使用');
                return;
            }

            const templateData = doc.data();
            console.log('📋 テンプレートデータ取得:', templateData);
            let appliedCount = 0;

            // 各科目のテンプレートデータを適用
            Object.keys(templateData).forEach(subjectKey => {
                if (this.subjects[subjectKey] && templateData[subjectKey].topics) {
                    Object.keys(templateData[subjectKey].topics).forEach(topicIndex => {
                        const index = parseInt(topicIndex);
                        const templateTopic = templateData[subjectKey].topics[topicIndex];

                        if (this.subjects[subjectKey].topics[index] && templateTopic.htmlContent) {
                            // ユーザーが未編集の場合のみテンプレートを適用
                            const hasUserContent = this.userContent?.[subjectKey]?.topics?.[index]?.htmlContent;

                            if (!hasUserContent) {
                                this.subjects[subjectKey].topics[index].htmlContent = templateTopic.htmlContent;
                                this.subjects[subjectKey].topics[index].type = 'html';
                                appliedCount++;
                            }
                        }
                    });
                }
            });

            if (appliedCount > 0) {
                console.log(`📋 テンプレートデータ適用完了: ${appliedCount}件のトピック`);
            } else {
                console.log('📋 適用できるテンプレートデータがありません（全て既編集済み）');
            }

        } catch (error) {
            console.error('❌ テンプレートデータ適用エラー:', error);
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
            await this.mergeStructureAndContent();

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
            console.log(`📋 テンプレート保存開始: ${subjectKey} - トピック${topicIndex}`);
            console.log('📋 保存内容:', content.substring(0, 100) + '...');

            const db = window.firebase.firestore();
            const templateRef = db.collection('keypoints_templates').doc('default');

            // 既存のテンプレートデータを取得
            console.log('📋 既存データ取得中...');
            const doc = await templateRef.get();
            const existingData = doc.exists ? doc.data() : {};
            console.log('📋 既存データ:', existingData);

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

            console.log('📋 更新後データ:', existingData);

            // Firestoreに保存
            console.log('📋 Firestore保存実行中...');
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
     * 管理者ステータス表示インジケーター非表示
     */
    hideAdminIndicator() {
        const existingIndicator = document.getElementById('admin-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
            console.log('👑 管理者インジケーターを非表示にしました');
        }
    }

    /**
     * 管理者UIボタンを追加
     */
    addAdminUI(container, subjectKey, topicIndex) {
        console.log('🔑 addAdminUI呼び出し:', {
            isAdmin: this.isAdmin,
            container: container,
            subjectKey: subjectKey,
            topicIndex: topicIndex
        });

        if (!this.isAdmin) {
            console.log('🔒 管理者権限なし - UI追加スキップ');
            return;
        }

        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.innerHTML = `
            <div class="admin-panel">
                <div class="admin-panel-header">🔓 管理者機能</div>
                <div class="admin-btn-group">
                    <button onclick="KeyPointsModule.saveCurrentAsTemplate('${subjectKey}', ${topicIndex})"
                            class="admin-btn admin-btn-save">
                        💾 初期データとして保存
                    </button>
                    <button onclick="KeyPointsModule.showTemplatePreview('${subjectKey}', ${topicIndex})"
                            class="admin-btn admin-btn-preview">
                        📋 テンプレート確認
                    </button>
                    <button onclick="KeyPointsModule.deleteKeyPointAndTemplate('${subjectKey}', ${topicIndex})"
                            class="admin-btn admin-btn-delete">
                        🗑️ 要点を完全削除
                    </button>
                </div>
            </div>
        `;
        container.appendChild(adminControls);
        console.log('✅ 管理者UIパネル追加完了');
    }

    /**
     * 現在の内容をテンプレートとして保存
     */
    async saveCurrentAsTemplate(subjectKey, topicIndex) {
        if (!this.isAdmin) {
            alert('管理者権限が必要です');
            return;
        }

        // 現在表示中のコンテンツを取得
        const contentDiv = document.getElementById('keyPointContent');
        if (!contentDiv) {
            alert('コンテンツが見つかりません');
            return;
        }

        const content = contentDiv.innerHTML;
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
     * 要点とテンプレートデータを完全削除（管理者用）
     */
    async deleteKeyPointAndTemplate(subjectKey, topicIndex) {
        if (!this.isAdmin) {
            alert('管理者権限が必要です');
            return;
        }

        // 確認ダイアログ
        if (!confirm('この要点を完全削除しますか？\n・ユーザーデータから削除\n・テンプレートデータからも削除\n・全ユーザーに影響します\n\n削除したデータは復元できません。')) {
            return;
        }

        try {
            console.log(`🗑️ 完全削除開始: ${subjectKey} - トピック${topicIndex}`);

            let userDataResult = false;
            let templateResult = false;

            // Step 1: ユーザーデータから削除（エラーでも継続）
            try {
                await this.deleteUserKeyPoint(subjectKey, topicIndex);
                userDataResult = true;
            } catch (error) {
                console.error('⚠️ ユーザーデータ削除でエラー（継続）:', error);
            }

            // Step 2: テンプレートデータから削除
            try {
                await this.deleteFromTemplate(subjectKey, topicIndex);
                templateResult = true;
            } catch (error) {
                console.error('❌ テンプレートデータ削除エラー:', error);
                throw error; // テンプレート削除は重要なので例外を投げる
            }

            // Step 3: 現在のデータ構造を更新
            if (this.subjects[subjectKey] && this.subjects[subjectKey].topics[topicIndex]) {
                // HTMLコンテンツを削除（リンクは維持）
                delete this.subjects[subjectKey].topics[topicIndex].htmlContent;
                this.subjects[subjectKey].topics[topicIndex].type = 'link';
            }

            console.log(`✅ 完全削除完了: ${subjectKey} - トピック${topicIndex}`, {
                userData: userDataResult ? '削除済み' : 'エラー/スキップ',
                template: templateResult ? '削除済み' : 'エラー'
            });

            const message = `要点を削除しました。\n・ユーザーデータ: ${userDataResult ? '削除済み' : 'エラー/スキップ'}\n・テンプレート: ${templateResult ? '削除済み' : 'エラー'}`;
            alert(message);

            // 画面を更新（科目一覧に戻る）
            this.backToSubjectList();

        } catch (error) {
            console.error('❌ 完全削除エラー:', error);
            alert('削除に失敗しました: ' + error.message);
        }
    }

    /**
     * ユーザーデータから要点削除
     */
    async deleteUserKeyPoint(subjectKey, topicIndex) {
        try {
            console.log('🔍 DataManager構造確認:', {
                hasDataManager: !!window.DataManager,
                hasData: !!(window.DataManager?.data),
                dataKeys: window.DataManager?.data ? Object.keys(window.DataManager.data) : null
            });

            if (!window.DataManager) {
                throw new Error('DataManagerが利用できません');
            }

            // データ構造を安全に初期化
            if (!window.DataManager.data) {
                window.DataManager.data = {};
            }
            if (!window.DataManager.data.keyPoints) {
                window.DataManager.data.keyPoints = {};
            }

            const currentData = window.DataManager.data.keyPoints;
            console.log('🔍 現在の要点データ:', currentData);

            if (currentData[subjectKey] && currentData[subjectKey].topics && currentData[subjectKey].topics[topicIndex]) {
                // 該当トピックのHTMLコンテンツを削除
                delete currentData[subjectKey].topics[topicIndex].htmlContent;
                console.log(`🗑️ HTMLコンテンツ削除: ${subjectKey} - トピック${topicIndex}`);

                // 空のトピック配列をクリーンアップ
                if (Object.keys(currentData[subjectKey].topics).length === 0) {
                    delete currentData[subjectKey];
                    console.log(`🗑️ 空の科目削除: ${subjectKey}`);
                }

                // DataManagerに保存
                await window.DataManager.saveData();
                console.log(`✅ ユーザーデータから削除: ${subjectKey} - トピック${topicIndex}`);
            } else {
                console.log(`ℹ️ ユーザーデータに該当データなし: ${subjectKey} - トピック${topicIndex}`);
            }

        } catch (error) {
            console.error('❌ ユーザーデータ削除エラー:', error);
            // ユーザーデータの削除に失敗してもテンプレート削除は続行
            console.log('⚠️ ユーザーデータ削除をスキップしてテンプレート削除を継続');
        }
    }

    /**
     * テンプレートデータから要点削除
     */
    async deleteFromTemplate(subjectKey, topicIndex) {
        try {
            const db = window.firebase.firestore();
            const templateRef = db.collection('keypoints_templates').doc('default');

            // 既存のテンプレートデータを取得
            const doc = await templateRef.get();
            if (!doc.exists) {
                console.log('📋 テンプレートデータが存在しません');
                return;
            }

            const templateData = doc.data();

            // 該当トピックを削除
            if (templateData[subjectKey] && templateData[subjectKey].topics && templateData[subjectKey].topics[topicIndex]) {
                delete templateData[subjectKey].topics[topicIndex];

                // 空のトピックオブジェクトをクリーンアップ
                if (Object.keys(templateData[subjectKey].topics).length === 0) {
                    delete templateData[subjectKey];
                }

                // Firestoreを更新
                if (Object.keys(templateData).length === 0) {
                    // 全データが空の場合はドキュメント削除
                    await templateRef.delete();
                    console.log('📋 テンプレートドキュメントを削除（空のため）');
                } else {
                    // 更新されたデータで上書き
                    await templateRef.set(templateData);
                    console.log(`✅ テンプレートから削除: ${subjectKey} - トピック${topicIndex}`);
                }
            }

        } catch (error) {
            console.error('❌ テンプレート削除エラー:', error);
            throw error;
        }
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
                <div id="adminUIContainer"></div>
            </div>
        `;

        content.innerHTML = html;

        // 🔑 管理者UIを追加
        console.log('🔍 管理者UI追加チェック:', {
            isAdmin: this.isAdmin,
            hasLocation: !!this.currentContentLocation,
            location: this.currentContentLocation
        });

        if (this.isAdmin && this.currentContentLocation) {
            console.log('🔓 管理者UIを追加します');
            setTimeout(() => {
                const container = document.getElementById('adminUIContainer');
                console.log('🔍 adminUIContainer:', container);
                if (container) {
                    this.addAdminUI(container, this.currentContentLocation.subjectKey, this.currentContentLocation.topicIndex);
                    console.log('✅ 管理者UI追加完了');
                } else {
                    console.error('❌ adminUIContainerが見つかりません');
                }
            }, 100);
        } else {
            console.log('🔒 管理者UIスキップ - 権限なしまたは位置情報なし');
        }
        
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

// 🔧 管理者モード切り替え機能
window.toggleAdminMode = () => {
    const km = window.KeyPointsModule;
    km.isAdmin = !km.isAdmin;

    if (km.isAdmin) {
        km.showAdminIndicator();
        km.loadTemplateData();
        console.log('🔓 管理者モードを有効にしました');
    } else {
        km.hideAdminIndicator();
        km.templateData = null;
        console.log('🔒 管理者モードを解除しました');
    }

    return km.isAdmin ? '管理者モード: ON' : '管理者モード: OFF';
};

// 後方互換性のため残す
window.enableAdminMode = () => {
    window.KeyPointsModule.isAdmin = true;
    window.KeyPointsModule.showAdminIndicator();
    window.KeyPointsModule.loadTemplateData();
    console.log('🔓 管理者モードを手動で有効にしました');
};

// 初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        KeyPointsModule.initialize();
    });
} else {
    KeyPointsModule.initialize();
}

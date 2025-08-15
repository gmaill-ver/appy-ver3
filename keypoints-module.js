/**
 * KeyPointsModule - 要点確認専用モジュール
 */
class KeyPointsModuleClass {
    constructor() {
        this.subjects = {
            'constitution': { name: '憲法', items: [] },
            'administrative': { name: '行政法', items: [] },
            'civil': { name: '民法', items: [] },
            'commercial': { name: '商法', items: [] },
            'basic_knowledge': { name: '基礎知識', items: [] },
            'basic_law': { name: '基礎法学', items: [] }
        };
        this.currentSubject = null;
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
                    this.subjects = { ...this.subjects, ...parsedData };
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
            itemCount: data.items ? data.items.length : 0
        }));
    }

    /**
     * 科目の要点項目を取得
     */
    getSubjectItems(subjectKey) {
        return this.subjects[subjectKey]?.items || [];
    }

    /**
     * 要点項目を追加
     */
    addKeyPointItem(subjectKey, item) {
        if (!this.subjects[subjectKey]) {
            return false;
        }

        const newItem = {
            id: Date.now(),
            title: item.title,
            url: item.url || '',
            htmlContent: item.htmlContent || '',
            type: item.type || 'link', // 'link' or 'html'
            order: item.order || 0,
            createdAt: new Date().toISOString()
        };

        this.subjects[subjectKey].items.push(newItem);
        this.saveKeyPointsData();
        return true;
    }

    /**
     * 要点項目を更新
     */
    updateKeyPointItem(subjectKey, itemId, updates) {
        if (!this.subjects[subjectKey]) {
            return false;
        }

        const items = this.subjects[subjectKey].items;
        const index = items.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            this.saveKeyPointsData();
            return true;
        }
        return false;
    }

    /**
     * 要点項目を削除
     */
    deleteKeyPointItem(subjectKey, itemId) {
        if (!this.subjects[subjectKey]) {
            return false;
        }

        this.subjects[subjectKey].items = this.subjects[subjectKey].items.filter(
            item => item.id !== itemId
        );
        this.saveKeyPointsData();
        return true;
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
    }

    /**
     * 科目選択
     */
    selectSubject(subjectKey) {
        this.currentSubject = subjectKey;
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const items = this.getSubjectItems(subjectKey);
        
        let html = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h3>📚 ${subject.name} 要点まとめ</h3>
                    <button class="save-button" onclick="KeyPointsModule.showSubjectList()" 
                            style="background: var(--gray); padding: 8px 15px; font-size: 14px;">← 一覧に戻る</button>
                </div>
        `;

        if (items.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: var(--gray);">
                    <p>まだ要点項目がありません</p>
                    <p style="font-size: 14px;">下の管理画面から項目を追加してください</p>
                </div>
            `;
        } else {
            html += `<div class="keypoints-items">`;
            
            items.sort((a, b) => a.order - b.order).forEach((item, index) => {
                html += `
                    <div class="keypoint-item" style="border: 1px solid var(--light); border-radius: 8px; margin-bottom: 10px; overflow: hidden;">
                        <div class="keypoint-header" style="background: var(--primary); color: white; padding: 15px 20px; font-size: 16px; font-weight: bold; cursor: pointer;"
                             onclick="KeyPointsModule.toggleKeyPoint(${item.id})">
                            ${index + 1}. ${item.title}
                            <span style="float: right;">▼</span>
                        </div>
                        <div class="keypoint-content" id="keypoint-${item.id}" style="display: none; padding: 20px;">
                            ${item.type === 'html' ? item.htmlContent : `
                                <div style="text-align: center;">
                                    <a href="${item.url}" target="_blank" style="display: inline-block; padding: 12px 24px; background: var(--secondary); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                        📖 要点を確認する
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `</div>`;
        content.innerHTML = html;

        // CSS追加
        this.addKeyPointStyles();
    }

    /**
     * 要点項目の開閉
     */
    toggleKeyPoint(itemId) {
        const content = document.getElementById(`keypoint-${itemId}`);
        if (!content) return;

        if (content.style.display === 'none') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }

    /**
     * ウェルカム画面に戻る
     */
    showWelcome() {
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
            title,
            type,
            url: type === 'link' ? url : '',
            htmlContent: type === 'html' ? htmlContent : '',
            order: this.getSubjectItems(subjectKey).length
        };

        if (this.addKeyPointItem(subjectKey, item)) {
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
        } else {
            alert('項目の追加に失敗しました');
        }
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
            if (this.deleteKeyPointItem(subjectKey, itemId)) {
                const listContainer = document.getElementById('keyPointsList');
                if (listContainer) {
                    listContainer.innerHTML = this.renderKeyPointsList();
                }
                alert('項目を削除しました');
            }
        }
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

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>StudyTracker Pro - 肢別問題集完全対応版</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #1f2937;
            --gray: #6b7280;
            --light: #f3f4f6;
            --white: #ffffff;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans CJK JP', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
            z-index: 0;
        }
        
        .app-container {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            padding-bottom: 100px;
        }
        
        /* ヘッダー */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: var(--shadow-lg);
            animation: slideDown 0.5s ease;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .header-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .app-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--dark);
        }
        
        .app-subtitle {
            font-size: 14px;
            color: var(--gray);
            margin-top: 4px;
        }
        
        /* タブナビゲーション */
        .tab-nav {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            overflow-x: auto;
            padding-bottom: 5px;
        }
        
        .tab-btn {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid transparent;
            border-radius: 12px;
            color: var(--gray);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            backdrop-filter: blur(10px);
        }
        
        .tab-btn:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .tab-btn.active {
            background: white;
            color: var(--primary);
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        /* コンテンツカード */
        .content-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: var(--shadow-lg);
            animation: fadeInUp 0.5s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--light);
        }
        
        .card-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--dark);
        }
        
        /* フォーム要素 */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 8px;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.3s;
            background: white;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        select.form-control {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 20px;
            padding-right: 40px;
            cursor: pointer;
        }
        
        /* 階層ナビゲーション（パンくずリスト） */
        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 15px;
            background: var(--light);
            border-radius: 10px;
            margin-bottom: 20px;
            overflow-x: auto;
            white-space: nowrap;
        }
        
        .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--gray);
            font-size: 14px;
            cursor: pointer;
            transition: color 0.3s;
        }
        
        .breadcrumb-item:hover {
            color: var(--primary);
        }
        
        .breadcrumb-item.active {
            color: var(--primary);
            font-weight: 600;
        }
        
        .breadcrumb-separator {
            color: var(--gray);
        }
        
        /* 階層リスト */
        .hierarchy-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .hierarchy-item {
            padding: 15px;
            background: var(--light);
            border: 2px solid transparent;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .hierarchy-item:hover {
            background: white;
            border-color: var(--primary);
            transform: translateX(5px);
        }
        
        .hierarchy-item.selected {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-color: var(--primary);
        }
        
        .hierarchy-item-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .hierarchy-item-title {
            font-weight: 600;
            font-size: 15px;
        }
        
        .hierarchy-item-detail {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .hierarchy-item-count {
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        /* 問題番号グリッド */
        .question-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
            gap: 8px;
            max-height: 400px;
            overflow-y: auto;
            padding: 15px;
            background: var(--light);
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .question-cell {
            aspect-ratio: 1;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }
        
        .question-cell:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow);
        }
        
        .question-cell.correct {
            background: var(--success);
            color: white;
            border-color: var(--success);
        }
        
        .question-cell.wrong {
            background: var(--danger);
            color: white;
            border-color: var(--danger);
        }
        
        .question-cell.bookmarked::after {
            content: '⭐';
            position: absolute;
            top: -5px;
            right: -5px;
            font-size: 12px;
            background: var(--warning);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* 新規登録フォーム */
        .registration-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .add-button {
            padding: 10px 20px;
            background: linear-gradient(135deg, var(--success), #34d399);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .add-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .delete-button {
            padding: 8px 16px;
            background: var(--danger);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .delete-button:hover {
            background: #dc2626;
        }
        
        /* 統計表示 */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .stat-card {
            padding: 20px;
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border-radius: 15px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 13px;
            color: var(--gray);
        }
        
        /* アクションボタン */
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .action-btn {
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .action-btn:active {
            transform: scale(0.95);
        }
        
        .action-btn.correct {
            background: linear-gradient(135deg, #10b981, #34d399);
        }
        
        .action-btn.wrong {
            background: linear-gradient(135deg, #ef4444, #f87171);
        }
        
        .action-btn.bookmark {
            background: linear-gradient(135deg, #f59e0b, #fbbf24);
        }
        
        /* 保存ボタン */
        .save-button {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .save-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .save-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }
        
        .save-button:active::before {
            width: 300px;
            height: 300px;
        }
        
        /* タブコンテンツ */
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* モーダル */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--dark);
        }
        
        .modal-close {
            width: 30px;
            height: 30px;
            border: none;
            background: var(--light);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        
        .modal-close:hover {
            background: var(--danger);
            color: white;
        }
        
        /* レスポンシブ */
        @media (max-width: 768px) {
            .app-container {
                padding: 15px;
            }
            
            .header-content {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .action-buttons {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- ヘッダー -->
        <header class="header">
            <div class="header-content">
                <div class="header-title">
                    <div class="logo">📚</div>
                    <div>
                        <div class="app-title">StudyTracker Pro</div>
                        <div class="app-subtitle">肢別問題集完全対応 学習管理システム</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- タブナビゲーション -->
        <div class="tab-nav">
            <button class="tab-btn active" onclick="switchTab('record')">学習記録</button>
            <button class="tab-btn" onclick="switchTab('register')">問題集登録</button>
            <button class="tab-btn" onclick="switchTab('progress')">進捗管理</button>
            <button class="tab-btn" onclick="switchTab('history')">学習履歴</button>
        </div>

        <!-- 学習記録タブ -->
        <div id="record-tab" class="tab-content active">
            <!-- 問題集選択 -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📖</div>
                    <h2 class="card-title">問題集選択</h2>
                </div>
                
                <div class="form-group">
                    <label class="form-label">登録済み問題集</label>
                    <select class="form-control" id="bookSelect" onchange="loadBookStructure()">
                        <option value="">問題集を選択してください</option>
                    </select>
                </div>

                <!-- パンくずリスト -->
                <div class="breadcrumb" id="breadcrumb" style="display: none;">
                    <span class="breadcrumb-item" onclick="navigateTo('book')">問題集</span>
                </div>
            </div>

            <!-- 階層選択 -->
            <div class="content-card" id="hierarchySection" style="display: none;">
                <div class="card-header">
                    <div class="card-icon">📂</div>
                    <h2 class="card-title" id="hierarchyTitle">科目を選択</h2>
                </div>
                
                <div class="hierarchy-list" id="hierarchyList">
                    <!-- 動的に生成 -->
                </div>
            </div>

            <!-- 問題入力 -->
            <div class="content-card" id="questionSection" style="display: none;">
                <div class="card-header">
                    <div class="card-icon">✍️</div>
                    <h2 class="card-title">問題別正誤入力</h2>
                </div>

                <div class="action-buttons">
                    <button class="action-btn correct" onclick="markCorrect()">
                        <span>⭕</span>
                        <span>正解</span>
                    </button>
                    <button class="action-btn wrong" onclick="markWrong()">
                        <span>❌</span>
                        <span>不正解</span>
                    </button>
                    <button class="action-btn bookmark" onclick="toggleBookmark()">
                        <span>⭐</span>
                        <span>マーク</span>
                    </button>
                </div>

                <div class="question-grid" id="questionGrid">
                    <!-- 動的に生成 -->
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="totalCount">0</div>
                        <div class="stat-label">解答数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="correctCount">0</div>
                        <div class="stat-label">正解数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="wrongCount">0</div>
                        <div class="stat-label">不正解数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="correctRate">0%</div>
                        <div class="stat-label">正答率</div>
                    </div>
                </div>

                <button class="save-button" onclick="saveRecord()">
                    学習記録を保存
                </button>
            </div>
        </div>

        <!-- 問題集登録タブ -->
        <div id="register-tab" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">➕</div>
                    <h2 class="card-title">新規問題集登録</h2>
                </div>
                
                <div class="registration-form">
                    <div class="form-group">
                        <label class="form-label">問題集名</label>
                        <input type="text" class="form-control" id="newBookName" placeholder="例: 合格革命 肢別過去問集 2024年版">
                    </div>

                    <div class="form-group">
                        <label class="form-label">試験種別</label>
                        <select class="form-control" id="newExamType">
                            <option value="">選択してください</option>
                            <option value="gyousei">行政書士試験</option>
                            <option value="takken">宅建士試験</option>
                            <option value="sharoushi">社労士試験</option>
                            <option value="fp">FP技能検定</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <button class="add-button" onclick="createNewBook()">
                        <span>➕</span>
                        <span>問題集を作成</span>
                    </button>
                </div>
            </div>

            <!-- 登録済み問題集一覧 -->
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📚</div>
                    <h2 class="card-title">登録済み問題集</h2>
                </div>
                
                <div class="hierarchy-list" id="registeredBooks">
                    <!-- 動的に生成 -->
                </div>
            </div>
        </div>

        <!-- 進捗管理タブ -->
        <div id="progress-tab" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <h2 class="card-title">学習進捗</h2>
                </div>
                
                <div id="progressContent">
                    <!-- 動的に生成 -->
                </div>
            </div>
        </div>

        <!-- 学習履歴タブ -->
        <div id="history-tab" class="tab-content">
            <div class="content-card">
                <div class="card-header">
                    <div class="card-icon">📅</div>
                    <h2 class="card-title">学習履歴</h2>
                </div>
                
                <div class="hierarchy-list" id="historyList">
                    <!-- 動的に生成 -->
                </div>
            </div>
        </div>
    </div>

    <!-- 階層構造編集モーダル -->
    <div id="structureModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">階層構造を編集</h3>
                <button class="modal-close" onclick="closeModal('structureModal')">×</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">階層レベル</label>
                <select class="form-control" id="hierarchyLevel" onchange="updateHierarchyForm()">
                    <option value="subject">科目</option>
                    <option value="chapter">章</option>
                    <option value="section">節</option>
                    <option value="subsection">項</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">名称</label>
                <input type="text" class="form-control" id="hierarchyName" placeholder="例: 民法の基本原則">
            </div>

            <div class="form-group">
                <label class="form-label">問題数（項の場合のみ）</label>
                <input type="number" class="form-control" id="questionCount" placeholder="50" min="1">
            </div>

            <div class="form-group" id="parentSelect" style="display: none;">
                <label class="form-label">親階層</label>
                <select class="form-control" id="parentHierarchy">
                    <option value="">選択してください</option>
                </select>
            </div>

            <button class="save-button" onclick="saveHierarchy()">階層を追加</button>
        </div>
    </div>

    <script>
        // データ構造
        let books = {};
        let currentBook = null;
        let currentPath = [];
        let questionStates = {};
        
        // 初期化
        document.addEventListener('DOMContentLoaded', function() {
            loadBooksFromStorage();
            initializeSampleData();
            updateBookSelect();
            loadHistory();
        });
        
        // サンプルデータの初期化
        function initializeSampleData() {
            if (Object.keys(books).length === 0) {
                // サンプル: 合格革命 肢別過去問集
                const sampleBook = {
                    id: 'goukaku-2024',
                    name: '合格革命 肢別過去問集 2024年版',
                    examType: 'gyousei',
                    structure: {
                        '民法': {
                            type: 'subject',
                            children: {
                                '総則': {
                                    type: 'chapter',
                                    children: {
                                        '民法の基本原則': {
                                            type: 'section',
                                            children: {
                                                '信義誠実の原則': {
                                                    type: 'subsection',
                                                    questionCount: 15,
                                                    questions: generateQuestionNumbers(1, 15)
                                                },
                                                '権利の行使又は義務の履行': {
                                                    type: 'subsection',
                                                    questionCount: 12,
                                                    questions: generateQuestionNumbers(16, 27)
                                                }
                                            }
                                        },
                                        '権利の主体・客体': {
                                            type: 'section',
                                            children: {
                                                '権利能力': {
                                                    type: 'subsection',
                                                    questionCount: 20,
                                                    questions: generateQuestionNumbers(28, 47)
                                                },
                                                '意思能力': {
                                                    type: 'subsection',
                                                    questionCount: 18,
                                                    questions: generateQuestionNumbers(48, 65)
                                                }
                                            }
                                        }
                                    }
                                },
                                '物権': {
                                    type: 'chapter',
                                    children: {
                                        '物権総則': {
                                            type: 'section',
                                            children: {
                                                '物権の効力': {
                                                    type: 'subsection',
                                                    questionCount: 25,
                                                    questions: generateQuestionNumbers(66, 90)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '行政法': {
                            type: 'subject',
                            children: {
                                '行政法総論': {
                                    type: 'chapter',
                                    children: {
                                        '行政主体': {
                                            type: 'section',
                                            children: {
                                                '国と地方公共団体': {
                                                    type: 'subsection',
                                                    questionCount: 30,
                                                    questions: generateQuestionNumbers(1, 30)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    createdAt: new Date().toISOString()
                };
                
                books[sampleBook.id] = sampleBook;
                saveBooksToStorage();
            }
        }
        
        // 問題番号生成
        function generateQuestionNumbers(start, end) {
            const questions = [];
            for (let i = start; i <= end; i++) {
                questions.push(i);
            }
            return questions;
        }
        
        // LocalStorage操作
        function loadBooksFromStorage() {
            const stored = localStorage.getItem('studyTrackerBooks');
            if (stored) {
                books = JSON.parse(stored);
            }
        }
        
        function saveBooksToStorage() {
            localStorage.setItem('studyTrackerBooks', JSON.stringify(books));
        }
        
        // タブ切り替え
        function switchTab(tabName) {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + '-tab').classList.add('active');
            
            if (tabName === 'register') {
                updateRegisteredBooksList();
            } else if (tabName === 'progress') {
                updateProgressDisplay();
            }
        }
        
        // 問題集選択更新
        function updateBookSelect() {
            const select = document.getElementById('bookSelect');
            select.innerHTML = '<option value="">問題集を選択してください</option>';
            
            Object.values(books).forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = book.name;
                select.appendChild(option);
            });
        }
        
        // 問題集構造読み込み
        function loadBookStructure() {
            const bookId = document.getElementById('bookSelect').value;
            if (!bookId) return;
            
            currentBook = books[bookId];
            currentPath = [];
            
            document.getElementById('breadcrumb').style.display = 'block';
            document.getElementById('hierarchySection').style.display = 'block';
            document.getElementById('questionSection').style.display = 'none';
            
            updateBreadcrumb();
            showHierarchyLevel(currentBook.structure);
        }
        
        // パンくずリスト更新
        function updateBreadcrumb() {
            const breadcrumb = document.getElementById('breadcrumb');
            let html = `<span class="breadcrumb-item" onclick="navigateTo(-1)">${currentBook.name}</span>`;
            
            currentPath.forEach((item, index) => {
                html += '<span class="breadcrumb-separator">›</span>';
                html += `<span class="breadcrumb-item ${index === currentPath.length - 1 ? 'active' : ''}" 
                         onclick="navigateTo(${index})">${item.name}</span>`;
            });
            
            breadcrumb.innerHTML = html;
        }
        
        // 階層表示
        function showHierarchyLevel(structure, parentName = null) {
            const list = document.getElementById('hierarchyList');
            const title = document.getElementById('hierarchyTitle');
            
            list.innerHTML = '';
            
            // タイトル設定
            if (currentPath.length === 0) {
                title.textContent = '科目を選択';
            } else if (currentPath[currentPath.length - 1].type === 'subject') {
                title.textContent = '章を選択';
            } else if (currentPath[currentPath.length - 1].type === 'chapter') {
                title.textContent = '節を選択';
            } else if (currentPath[currentPath.length - 1].type === 'section') {
                title.textContent = '項を選択';
            }
            
            Object.entries(structure).forEach(([name, item]) => {
                const div = document.createElement('div');
                div.className = 'hierarchy-item';
                div.onclick = () => selectHierarchy(name, item);
                
                let detail = '';
                if (item.type === 'subsection') {
                    detail = `${item.questionCount}問`;
                } else {
                    const count = countQuestions(item);
                    detail = `${Object.keys(item.children || {}).length}項目 / ${count}問`;
                }
                
                div.innerHTML = `
                    <div class="hierarchy-item-info">
                        <div class="hierarchy-item-title">${name}</div>
                        <div class="hierarchy-item-detail">${detail}</div>
                    </div>
                    <div class="hierarchy-item-count">${getTypeLabel(item.type)}</div>
                `;
                
                list.appendChild(div);
            });
        }
        
        // 階層選択
        function selectHierarchy(name, item) {
            currentPath.push({ name, ...item });
            updateBreadcrumb();
            
            if (item.type === 'subsection' || (item.type === 'section' && item.questions)) {
                // 最下層（項または問題を持つ節）に到達したら問題表示
                showQuestions(item);
            } else if (item.children) {
                // まだ下の階層があるので続ける
                showHierarchyLevel(item.children);
            } else {
                alert('この階層には問題または下位階層がありません');
            }
        }
        
        // パンくずナビゲーション
        function navigateTo(index) {
            if (index === -1) {
                // 最上位に戻る
                currentPath = [];
                showHierarchyLevel(currentBook.structure);
                document.getElementById('questionSection').style.display = 'none';
            } else {
                // 特定の階層に戻る
                currentPath = currentPath.slice(0, index + 1);
                const current = getCurrentStructure();
                
                if (currentPath[index].type === 'subsection') {
                    showQuestions(currentPath[index]);
                } else {
                    showHierarchyLevel(currentPath[index].children);
                    document.getElementById('questionSection').style.display = 'none';
                }
            }
            updateBreadcrumb();
        }
        
        // 現在の構造を取得
        function getCurrentStructure() {
            let current = currentBook.structure;
            currentPath.forEach(item => {
                if (item.children) {
                    current = item.children;
                }
            });
            return current;
        }
        
        // 問題表示
        function showQuestions(item) {
            document.getElementById('hierarchySection').style.display = 'none';
            document.getElementById('questionSection').style.display = 'block';
            
            const grid = document.getElementById('questionGrid');
            grid.innerHTML = '';
            questionStates = {};
            
            item.questions.forEach(num => {
                const cell = document.createElement('div');
                cell.className = 'question-cell';
                cell.textContent = num;
                cell.dataset.number = num;
                cell.onclick = () => toggleQuestion(num);
                
                grid.appendChild(cell);
                
                questionStates[num] = {
                    state: null,
                    bookmarked: false
                };
            });
            
            updateStats();
        }
        
        // 問題状態切り替え
        function toggleQuestion(num) {
            const cell = document.querySelector(`[data-number="${num}"]`);
            const state = questionStates[num];
            
            if (state.state === null) {
                state.state = 'correct';
                cell.classList.add('correct');
            } else if (state.state === 'correct') {
                state.state = 'wrong';
                cell.classList.remove('correct');
                cell.classList.add('wrong');
            } else {
                state.state = null;
                cell.classList.remove('wrong');
            }
            
            updateStats();
        }
        
        // 正解マーク
        function markCorrect() {
            Object.keys(questionStates).forEach(num => {
                if (questionStates[num].state === null) {
                    questionStates[num].state = 'correct';
                    const cell = document.querySelector(`[data-number="${num}"]`);
                    if (cell) {
                        cell.classList.add('correct');
                    }
                }
            });
            updateStats();
        }
        
        // 不正解マーク
        function markWrong() {
            Object.keys(questionStates).forEach(num => {
                if (questionStates[num].state === null) {
                    questionStates[num].state = 'wrong';
                    const cell = document.querySelector(`[data-number="${num}"]`);
                    if (cell) {
                        cell.classList.add('wrong');
                    }
                }
            });
            updateStats();
        }
        
        // ブックマーク切り替え
        function toggleBookmark() {
            Object.keys(questionStates).forEach(num => {
                if (questionStates[num].state !== null) {
                    questionStates[num].bookmarked = !questionStates[num].bookmarked;
                    const cell = document.querySelector(`[data-number="${num}"]`);
                    if (cell) {
                        cell.classList.toggle('bookmarked');
                    }
                }
            });
        }
        
        // 統計更新
        function updateStats() {
            let total = 0;
            let correct = 0;
            let wrong = 0;
            
            Object.values(questionStates).forEach(state => {
                if (state.state !== null) {
                    total++;
                    if (state.state === 'correct') {
                        correct++;
                    } else {
                        wrong++;
                    }
                }
            });
            
            const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
            
            document.getElementById('totalCount').textContent = total;
            document.getElementById('correctCount').textContent = correct;
            document.getElementById('wrongCount').textContent = wrong;
            document.getElementById('correctRate').textContent = rate + '%';
        }
        
        // 記録保存
        function saveRecord() {
            const button = event.currentTarget;
            const originalText = button.textContent;
            
            button.textContent = '保存中...';
            button.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
            
            const record = {
                bookId: currentBook.id,
                bookName: currentBook.name,
                path: currentPath.map(p => p.name),
                questions: questionStates,
                timestamp: new Date().toISOString(),
                stats: {
                    total: parseInt(document.getElementById('totalCount').textContent),
                    correct: parseInt(document.getElementById('correctCount').textContent),
                    wrong: parseInt(document.getElementById('wrongCount').textContent),
                    rate: document.getElementById('correctRate').textContent
                }
            };
            
            saveToHistory(record);
            
            setTimeout(() => {
                button.textContent = '✓ 保存完了！';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                }, 1500);
            }, 1000);
        }
        
        // 履歴保存
        function saveToHistory(record) {
            let history = localStorage.getItem('studyHistory');
            history = history ? JSON.parse(history) : [];
            history.push(record);
            
            // 最新100件のみ保持
            if (history.length > 100) {
                history = history.slice(-100);
            }
            
            localStorage.setItem('studyHistory', JSON.stringify(history));
        }
        
        // 履歴読み込み
        function loadHistory() {
            const history = localStorage.getItem('studyHistory');
            if (history) {
                updateHistoryDisplay(JSON.parse(history));
            }
        }
        
        // 履歴表示更新
        function updateHistoryDisplay(history) {
            const list = document.getElementById('historyList');
            if (!list) return;
            
            list.innerHTML = '';
            
            history.slice(-10).reverse().forEach(record => {
                const date = new Date(record.timestamp);
                const div = document.createElement('div');
                div.className = 'hierarchy-item';
                
                div.innerHTML = `
                    <div class="hierarchy-item-info">
                        <div class="hierarchy-item-title">${record.path.join(' › ')}</div>
                        <div class="hierarchy-item-detail">
                            ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}
                            | ${record.bookName}
                        </div>
                    </div>
                    <div class="hierarchy-item-count">${record.stats.rate}</div>
                `;
                
                list.appendChild(div);
            });
        }
        
        // 新規問題集作成
        function createNewBook() {
            const name = document.getElementById('newBookName').value;
            const examType = document.getElementById('newExamType').value;
            
            if (!name || !examType) {
                alert('問題集名と試験種別を入力してください');
                return;
            }
            
            const bookId = 'book_' + Date.now();
            const newBook = {
                id: bookId,
                name: name,
                examType: examType,
                structure: {},
                createdAt: new Date().toISOString()
            };
            
            books[bookId] = newBook;
            saveBooksToStorage();
            
            currentBook = newBook;
            openModal('structureModal');
            
            // フォームリセット
            document.getElementById('newBookName').value = '';
            document.getElementById('newExamType').value = '';
            
            updateBookSelect();
            updateRegisteredBooksList();
        }
        
        // 登録済み問題集一覧更新
        function updateRegisteredBooksList() {
            const list = document.getElementById('registeredBooks');
            list.innerHTML = '';
            
            Object.values(books).forEach(book => {
                const div = document.createElement('div');
                div.className = 'hierarchy-item';
                
                const totalQuestions = countQuestionsInBook(book);
                
                div.innerHTML = `
                    <div class="hierarchy-item-info">
                        <div class="hierarchy-item-title">${book.name}</div>
                        <div class="hierarchy-item-detail">
                            ${getExamTypeName(book.examType)} | ${Object.keys(book.structure).length}科目 | ${totalQuestions}問
                        </div>
                    </div>
                    <button class="delete-button" onclick="editBook('${book.id}')">編集</button>
                `;
                
                list.appendChild(div);
            });
        }
        
        // 問題集編集
        function editBook(bookId) {
            currentBook = books[bookId];
            openModal('structureModal');
        }
        
        // モーダル操作
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
            if (modalId === 'structureModal') {
                updateHierarchyForm();
            }
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }
        
        // 階層フォーム更新
        function updateHierarchyForm() {
            const level = document.getElementById('hierarchyLevel').value;
            const parentSelect = document.getElementById('parentSelect');
            const questionCount = document.getElementById('questionCount').parentElement;
            
            if (level === 'subject') {
                parentSelect.style.display = 'none';
                questionCount.style.display = 'none';
            } else if (level === 'subsection' || level === 'section') {
                parentSelect.style.display = 'block';
                questionCount.style.display = 'block';
                
                if (level === 'section') {
                    updateParentOptions('chapter');
                    // 節の場合は問題数入力を任意にする説明を追加
                    document.querySelector('label[for="questionCount"]').textContent = '問題数（節に直接問題がある場合）';
                } else {
                    updateParentOptions('section');
                    document.querySelector('label[for="questionCount"]').textContent = '問題数';
                }
            } else {
                parentSelect.style.display = 'block';
                questionCount.style.display = 'none';
                
                if (level === 'chapter') {
                    updateParentOptions('subject');
                }
            }
        }
        
        // 親階層オプション更新
        function updateParentOptions(parentType) {
            const select = document.getElementById('parentHierarchy');
            select.innerHTML = '<option value="">選択してください</option>';
            
            if (!currentBook) return;
            
            function addOptions(structure, path = []) {
                Object.entries(structure).forEach(([name, item]) => {
                    if (item.type === parentType) {
                        const option = document.createElement('option');
                        option.value = [...path, name].join('/');
                        option.textContent = [...path, name].join(' › ');
                        select.appendChild(option);
                    }
                    if (item.children) {
                        addOptions(item.children, [...path, name]);
                    }
                });
            }
            
            addOptions(currentBook.structure);
        }
        
        // 階層保存
        function saveHierarchy() {
            const level = document.getElementById('hierarchyLevel').value;
            const name = document.getElementById('hierarchyName').value;
            const parent = document.getElementById('parentHierarchy').value;
            const count = document.getElementById('questionCount').value;
            
            if (!name) {
                alert('名称を入力してください');
                return;
            }
            
            if (level !== 'subject' && !parent) {
                alert('親階層を選択してください');
                return;
            }
            
            // 節または項の場合で問題数が入力されていれば問題を持つ
            const hasQuestions = (level === 'subsection' || level === 'section') && count;
            
            if (level === 'subsection' && !count) {
                alert('項には問題数を入力してください');
                return;
            }
            
            // 階層を追加
            if (level === 'subject') {
                currentBook.structure[name] = {
                    type: 'subject',
                    children: {}
                };
            } else {
                const parentPath = parent.split('/');
                let target = currentBook.structure;
                
                parentPath.forEach(p => {
                    if (target[p]) {
                        target = target[p].children || {};
                    }
                });
                
                if (hasQuestions) {
                    // 問題を持つ節または項
                    target[name] = {
                        type: level,
                        questionCount: parseInt(count),
                        questions: generateQuestionNumbers(1, parseInt(count))
                    };
                    
                    // 節で問題を持つ場合はchildrenも追加可能にする
                    if (level === 'section') {
                        target[name].children = {};
                    }
                } else if (level === 'section') {
                    // 問題を持たない節（下に項がある）
                    target[name] = {
                        type: 'section',
                        children: {}
                    };
                } else {
                    // その他の階層
                    target[name] = {
                        type: level,
                        children: {}
                    };
                }
            }
            
            saveBooksToStorage();
            closeModal('structureModal');
            
            // フォームリセット
            document.getElementById('hierarchyName').value = '';
            document.getElementById('questionCount').value = '';
            
            alert('追加しました');
        }
        
        // 進捗表示更新
        function updateProgressDisplay() {
            const content = document.getElementById('progressContent');
            content.innerHTML = '';
            
            Object.values(books).forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'hierarchy-item';
                
                const totalQuestions = countQuestionsInBook(book);
                
                bookDiv.innerHTML = `
                    <div class="hierarchy-item-info">
                        <div class="hierarchy-item-title">${book.name}</div>
                        <div class="hierarchy-item-detail">
                            総問題数: ${totalQuestions}問
                        </div>
                    </div>
                `;
                
                content.appendChild(bookDiv);
            });
        }
        
        // ヘルパー関数
        function countQuestions(item) {
            if (item.type === 'subsection') {
                return item.questionCount || 0;
            }
            
            let count = 0;
            if (item.children) {
                Object.values(item.children).forEach(child => {
                    count += countQuestions(child);
                });
            }
            return count;
        }
        
        function countQuestionsInBook(book) {
            let count = 0;
            Object.values(book.structure).forEach(item => {
                count += countQuestions(item);
            });
            return count;
        }
        
        function getTypeLabel(type) {
            const labels = {
                'subject': '科目',
                'chapter': '章',
                'section': '節',
                'subsection': '項'
            };
            return labels[type] || type;
        }
        
        function getExamTypeName(type) {
            const names = {
                'gyousei': '行政書士',
                'takken': '宅建士',
                'sharoushi': '社労士',
                'fp': 'FP技能',
                'other': 'その他'
            };
            return names[type] || type;
        }
    </script>

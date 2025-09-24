/**
 * AuthManager - 認証管理モジュール
 */
class AuthManagerClass {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.isAdmin = false;
    }

    /**
     * 初期化
     */
    async initialize() {
        try {
            if (!window.firebase || !window.firebase.auth) {
                console.log('🔐 Firebase認証が利用できません');
                return;
            }

            // 認証状態の監視
            window.firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });

            console.log('🔐 AuthManager初期化完了');
        } catch (error) {
            console.error('❌ AuthManager初期化エラー:', error);
        }
    }

    /**
     * 認証状態変更処理
     */
    handleAuthStateChange(user) {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        // 管理者判定
        this.checkAdminStatus(user);

        // UIの更新
        this.updateAuthUI();

        // KeyPointsModuleに管理者状態を通知
        if (window.KeyPointsModule) {
            window.KeyPointsModule.isAdmin = this.isAdmin;
            if (this.isAdmin) {
                window.KeyPointsModule.showAdminIndicator();
                window.KeyPointsModule.loadTemplateData();
            } else {
                window.KeyPointsModule.hideAdminIndicator();
            }
        }

        console.log(`🔐 認証状態変更: ${this.isAuthenticated ? 'ログイン' : 'ログアウト'}`,
                   this.isAdmin ? '(管理者)' : '(一般ユーザー)');
    }

    /**
     * 管理者ステータス確認
     */
    checkAdminStatus(user) {
        if (!user) {
            this.isAdmin = false;
            return;
        }

        // 管理者メールアドレスのリスト
        const adminEmails = [
            'utohideki@gmail.com',
            'u.t.o0911@gmail.com'  // 実際のメールアドレス
        ];

        // Googleログインの場合のみ管理者判定
        if (user.providerData && user.providerData.some(p => p.providerId === 'google.com')) {
            this.isAdmin = adminEmails.includes(user.email);
        } else {
            this.isAdmin = false; // 匿名ログインは管理者不可
        }
    }

    /**
     * 認証UIの更新
     */
    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        const authIcon = document.getElementById('authIcon');
        const authText = document.getElementById('authText');

        if (!authBtn || !authIcon || !authText) return;

        if (this.isAuthenticated && this.currentUser) {
            authBtn.classList.add('authenticated');
            if (this.currentUser.photoURL) {
                authIcon.innerHTML = `<img src="${this.currentUser.photoURL}" style="width: 20px; height: 20px; border-radius: 50%;" alt="Avatar">`;
            } else {
                authIcon.textContent = '👤';
            }

            // 表示名またはメールの最初の部分を表示
            const displayName = this.currentUser.displayName ||
                               this.currentUser.email?.split('@')[0] ||
                               '匿名ユーザー';
            authText.textContent = displayName.length > 8 ? displayName.substring(0, 8) + '...' : displayName;

        } else {
            authBtn.classList.remove('authenticated');
            authIcon.textContent = '👤';
            authText.textContent = 'ログイン';
        }
    }

    /**
     * 認証切り替え（ログイン/ログアウト）
     */
    async toggleAuth() {
        try {
            if (this.isAuthenticated) {
                await this.signOut();
            } else {
                await this.signInWithGoogle();
            }
        } catch (error) {
            console.error('❌ 認証切り替えエラー:', error);
            alert('認証処理でエラーが発生しました: ' + error.message);
        }
    }

    /**
     * Googleログイン
     */
    async signInWithGoogle() {
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await window.firebase.auth().signInWithPopup(provider);
            console.log('✅ Googleログイン成功:', result.user.email);

            return result;
        } catch (error) {
            console.error('❌ Googleログインエラー:', error);
            throw error;
        }
    }

    /**
     * ログアウト
     */
    async signOut() {
        try {
            await window.firebase.auth().signOut();
            console.log('✅ ログアウト完了');
        } catch (error) {
            console.error('❌ ログアウトエラー:', error);
            throw error;
        }
    }

    /**
     * 手動管理者モード切り替え（開発用）
     */
    toggleAdminMode() {
        this.isAdmin = !this.isAdmin;

        if (window.KeyPointsModule) {
            window.KeyPointsModule.isAdmin = this.isAdmin;
            if (this.isAdmin) {
                window.KeyPointsModule.showAdminIndicator();
                window.KeyPointsModule.loadTemplateData();
                console.log('🔓 管理者モードを手動で有効にしました');
            } else {
                window.KeyPointsModule.hideAdminIndicator();
                console.log('🔒 管理者モードを手動で解除しました');
            }
        }

        return this.isAdmin ? '管理者モード: ON' : '管理者モード: OFF';
    }
}

// グローバルに公開
window.AuthManager = new AuthManagerClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // Firebase読み込み待機
    const initAuth = () => {
        if (window.firebase && window.firebase.auth) {
            AuthManager.initialize();
        } else {
            setTimeout(initAuth, 100);
        }
    };
    initAuth();
});
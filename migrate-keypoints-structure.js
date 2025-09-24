/**
 * KeyPoints構造データのFirestore移行スクリプト
 * 一度だけ実行して、既存のJavaScript内階層構造をFirestoreに移行
 */

// 既存のKeyPointsModuleClassから構造データを抽出
function extractStructureData() {
    // 一時的にKeyPointsModuleのインスタンスを作成
    const tempModule = new KeyPointsModuleClass();
    const structureData = {};

    // subjects構造から階層情報のみ抽出（要点内容は除外）
    Object.keys(tempModule.subjects).forEach(subjectKey => {
        const subject = tempModule.subjects[subjectKey];
        structureData[subjectKey] = {
            name: subject.name,
            order: subject.order,
            topics: subject.topics.map((topic, index) => ({
                title: topic.title,
                url: topic.url || '',
                difficulty: topic.difficulty || 'B',
                type: topic.type || 'link',
                order: index + 1
            }))
        };
    });

    return structureData;
}

/**
 * Firestoreに階層構造を移行
 */
async function migrateStructureToFirestore() {
    console.log('🚀 KeyPoints階層構造の移行を開始...');

    try {
        // Firebase初期化チェック
        if (!window.firebase) {
            throw new Error('Firebase が初期化されていません');
        }

        const db = firebase.firestore();

        // 既存構造データを抽出
        const structureData = extractStructureData();
        console.log('📊 抽出された構造データ:', Object.keys(structureData).length + '科目');

        // Firestoreにドキュメントを作成
        const migrationData = {
            subjects: structureData,
            version: '1.0',
            migratedAt: new Date().toISOString(),
            totalSubjects: Object.keys(structureData).length,
            totalTopics: Object.values(structureData).reduce((sum, subject) => sum + subject.topics.length, 0)
        };

        // keypoints_structure コレクションに保存
        await db.collection('keypoints_structure').doc('master').set(migrationData);

        console.log('✅ 移行完了!');
        console.log(`📚 科目数: ${migrationData.totalSubjects}`);
        console.log(`📖 総トピック数: ${migrationData.totalTopics}`);
        console.log('🔗 Firestore パス: keypoints_structure/master');

        return migrationData;

    } catch (error) {
        console.error('❌ 移行エラー:', error);
        throw error;
    }
}

/**
 * 移行されたデータの検証
 */
async function validateMigration() {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('keypoints_structure').doc('master').get();

        if (!doc.exists) {
            console.error('❌ 移行データが見つかりません');
            return false;
        }

        const data = doc.data();
        console.log('🔍 移行データ検証:');
        console.log(`- バージョン: ${data.version}`);
        console.log(`- 移行日時: ${data.migratedAt}`);
        console.log(`- 科目数: ${data.totalSubjects}`);
        console.log(`- トピック数: ${data.totalTopics}`);

        // 既存データとの比較
        const originalStructure = extractStructureData();
        const originalSubjectCount = Object.keys(originalStructure).length;

        if (data.totalSubjects === originalSubjectCount) {
            console.log('✅ 科目数一致');
            return true;
        } else {
            console.error(`❌ 科目数不一致: 期待=${originalSubjectCount}, 実際=${data.totalSubjects}`);
            return false;
        }

    } catch (error) {
        console.error('❌ 検証エラー:', error);
        return false;
    }
}

/**
 * 移行の実行（コンソールから呼び出し用）
 */
async function runMigration() {
    try {
        console.log('🔧 KeyPoints構造移行ツール');
        console.log('================================');

        // 既存データサイズチェック
        const structureData = extractStructureData();
        const dataSize = JSON.stringify(structureData).length;
        console.log(`📏 構造データサイズ: ${(dataSize / 1024).toFixed(2)} KB`);

        // 移行実行
        const result = await migrateStructureToFirestore();

        // 検証
        const isValid = await validateMigration();

        if (isValid) {
            console.log('🎉 移行が正常に完了しました!');
            console.log('💡 次のステップ: keypoints-module.js の読み込み機能を更新してください');
        } else {
            console.error('⚠️  移行は完了しましたが検証でエラーが発生しました');
        }

        return result;

    } catch (error) {
        console.error('💥 移行処理でエラーが発生しました:', error);
        return null;
    }
}

// グローバルに公開（コンソールから実行可能にする）
window.KeyPointsMigration = {
    run: runMigration,
    migrate: migrateStructureToFirestore,
    validate: validateMigration,
    extract: extractStructureData
};

console.log('🔧 KeyPoints移行ツールが読み込まれました');
console.log('💡 使用方法: KeyPointsMigration.run() を実行してください');
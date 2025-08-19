/**
 * KeyPointsModule - 要点確認専用モジュール（Firebase統合完全版）
 */
class KeyPointsModuleClass {
    constructor() {
    this.subjects = {
        'constitution': { 
            name: '憲法', 
            chapters: {
                '第1章 総論': {
                    sections: {
                        '第1節 憲法の意味': [
                            { title: '憲法の特色', url: '/kenpou/kenpou-tokushitsu/', difficulty: 'C', type: 'link' },
                            { title: '憲法の基本原理', url: '/kenpou/kenpou-kihon-genri/', difficulty: 'C', type: 'link' }
                        ],
                        '第2節 天皇': [
                            { title: '天皇の地位', url: '/kenpou/tennou-chii/', difficulty: 'B', type: 'link' },
                            { title: '皇位継承', url: '/kenpou/koi-keisho/', difficulty: 'C', type: 'link' },
                            { title: '天皇の権能', url: '/kenpou/tennou-kennou/', difficulty: 'A', type: 'link' },
                            { title: '皇室の財産授受の議決', url: '/kenpou/koshitsu-zaisan/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第2章 人権': {
                    sections: {
                        '第1節 人権総論': [
                            { title: '人権の分類', url: '/kenpou/jinken-bunrui/', difficulty: 'B', type: 'link' },
                            { title: '人権の享有主体', url: '/kenpou/jinken-kyouyu-shutai/', difficulty: 'A', type: 'link' },
                            { title: '人権の限界', url: '/kenpou/jinken-genkai/', difficulty: 'A', type: 'link' },
                            { title: '人権の私人間効力', url: '/kenpou/shijin-kan-kouri/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 幸福追求権・法の下の平等': [
                            { title: '幸福追求権', url: '/kenpou/koufuku-tsuikyuu/', difficulty: 'A', type: 'link' },
                            { title: '法の下の平等', url: '/kenpou/hou-shita-byoudou/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 精神的自由権': [
                            { title: '思想・良心の自由', url: '/kenpou/shisou-ryoushin/', difficulty: 'B', type: 'link' },
                            { title: '信教の自由', url: '/kenpou/shinkyou-jiyuu/', difficulty: 'A', type: 'link' },
                            { title: '表現の自由', url: '/kenpou/hyougen-jiyuu/', difficulty: 'A', type: 'link' },
                            { title: '学問の自由', url: '/kenpou/gakumon-jiyuu/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 経済的自由権': [
                            { title: '職業選択の自由', url: '/kenpou/shokugyou-sentaku/', difficulty: 'A', type: 'link' },
                            { title: '居住・移転の自由', url: '/kenpou/kyojuu-iten/', difficulty: 'B', type: 'link' },
                            { title: '外国移住・国籍離脱の自由', url: '/kenpou/gaikoku-iten/', difficulty: 'B', type: 'link' },
                            { title: '財産権', url: '/kenpou/zaisan-ken/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 人身の自由': [
                            { title: '奴隷的拘束・苦役からの自由', url: '/kenpou/doreitekikousoku/', difficulty: 'B', type: 'link' },
                            { title: '法定手続の保障', url: '/kenpou/houtei-tetuzuki/', difficulty: 'A', type: 'link' },
                            { title: '被疑者・被告人の権利', url: '/kenpou/higisha-kokokuninz/', difficulty: 'B', type: 'link' }
                        ],
                        '第6節 社会権': [
                            { title: '生存権', url: '/kenpou/seizon-ken/', difficulty: 'A', type: 'link' },
                            { title: '教育を受ける権利', url: '/kenpou/kyouiku-ukeru/', difficulty: 'B', type: 'link' },
                            { title: '勤労の権利', url: '/kenpou/roudou-kenri/', difficulty: 'C', type: 'link' },
                            { title: '労働基本権', url: '/kenpou/roudou-kihon/', difficulty: 'B', type: 'link' }
                        ],
                        '第7節 参政権・国務請求権': [
                            { title: '参政権', url: '/kenpou/sansei-ken/', difficulty: 'B', type: 'link' },
                            { title: '国務請求権', url: '/kenpou/kokumu-seikyu/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第3章 統治': {
                    sections: {
                        '第1節 国会': [
                            { title: '権力分立', url: '/kenpou/kenryoku-bunritsu/', difficulty: 'A', type: 'link' },
                            { title: '国会の地位', url: '/kenpou/kokkai-chii/', difficulty: 'A', type: 'link' },
                            { title: '二院制', url: '/kenpou/niinsei/', difficulty: 'A', type: 'link' },
                            { title: '国会の活動', url: '/kenpou/kokkai-katsudou/', difficulty: 'A', type: 'link' },
                            { title: '国会議員の特権', url: '/kenpou/kokkai-giin-tokken/', difficulty: 'A', type: 'link' },
                            { title: '国会と議院の権能', url: '/kenpou/kokkai-giin-kennou/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 内閣': [
                            { title: '行政権と内閣', url: '/kenpou/gyouseikenz-naikaku/', difficulty: 'B', type: 'link' },
                            { title: '内閣の組織', url: '/kenpou/naikaku-soshiki/', difficulty: 'A', type: 'link' },
                            { title: '議院内閣制', url: '/kenpou/giin-naikaku-sei/', difficulty: 'A', type: 'link' },
                            { title: '内閣と内閣総理大臣の権能', url: '/kenpou/naikaku-naikaku-souri/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 裁判所': [
                            { title: '司法権', url: '/kenpou/shihou-ken/', difficulty: 'A', type: 'link' },
                            { title: '裁判所の組織と権能', url: '/kenpou/saibansho-soshiki/', difficulty: 'A', type: 'link' },
                            { title: '司法権の独立', url: '/kenpou/shihou-dokuritsu/', difficulty: 'A', type: 'link' },
                            { title: '違憲審査権', url: '/kenpou/kenpou-shinsa/', difficulty: 'A', type: 'link' },
                            { title: '裁判の公開', url: '/kenpou/saiban-koukai/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 財政': [
                            { title: '国家財政', url: '/kenpou/kokka-zaisei/', difficulty: 'B', type: 'link' },
                            { title: '予算・会計検査', url: '/kenpou/yosan-kaikei/', difficulty: 'C', type: 'link' }
                        ],
                        '第5節 地方自治・憲法改正': [
                            { title: '地方自治の本旨', url: '/kenpou/chihou-jichi-honshi/', difficulty: 'B', type: 'link' },
                            { title: '憲法改正', url: '/kenpou/kenpou-kaisei/', difficulty: 'A', type: 'link' }
                        ]
                    }
                }
            },
            items: []
        },
        'administrative': { 
            name: '行政法', 
            chapters: {
                '第1章 行政法の一般的な法理論': {
                    sections: {
                        '第1節 行政法総論': [
                            { title: '行政法の一般原理', url: '/gyouseihou/gyouseihou-ippan-genri/', difficulty: 'A', type: 'link' },
                            { title: '行政上の法律関係', url: '/gyouseihou/gyouseihou-houtei-kankei/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 行政組織法': [
                            { title: '行政主体と行政機関', url: '/gyouseihou/gyousei-shutai-kikan/', difficulty: 'A', type: 'link' },
                            { title: '行政機関の権限', url: '/gyouseihou/gyousei-kikan-kengen/', difficulty: 'A', type: 'link' },
                            { title: '国の行政組織', url: '/gyouseihou/kuni-gyousei-soshiki/', difficulty: 'B', type: 'link' },
                            { title: '公務員', url: '/gyouseihou/koumuin/', difficulty: 'B', type: 'link' },
                            { title: '公物', url: '/gyouseihou/kouchoubutsu/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 行政作用の類型': [
                            { title: '行政作用とは何か', url: '/gyouseihou/gyousei-sayou-towa/', difficulty: 'B', type: 'link' },
                            { title: '行政処分', url: '/gyouseihou/gyousei-shobun/', difficulty: 'A', type: 'link' },
                            { title: '行政立法', url: '/gyouseihou/gyousei-rippou/', difficulty: 'A', type: 'link' },
                            { title: '行政計画', url: '/gyouseihou/gyousei-keikaku/', difficulty: 'B', type: 'link' },
                            { title: '行政契約', url: '/gyouseihou/gyousei-keiyaku/', difficulty: 'B', type: 'link' },
                            { title: '行政指導', url: '/gyouseihou/gyousei-shidou/', difficulty: 'B', type: 'link' },
                            { title: '行政調査', url: '/gyouseihou/gyousei-chousa/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 行政上の強制措置': [
                            { title: '行政上の強制措置の全体像', url: '/gyouseihou/gyousei-kyousei-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '行政上の強制執行', url: '/gyouseihou/gyousei-kyousei-shikkou/', difficulty: 'A', type: 'link' },
                            { title: '即時強制', url: '/gyouseihou/sokuji-kyousei/', difficulty: 'B', type: 'link' },
                            { title: '行政罰', url: '/gyouseihou/gyousei-batsu/', difficulty: 'A', type: 'link' }
                        ]
                    }
                },
                '第2章 行政手続法': {
                    sections: {
                        '第1節 行政手続法総則': [
                            { title: '行政手続法とは何か', url: '/gyouseihou/gyousei-tetuzuki-towa/', difficulty: 'B', type: 'link' },
                            { title: '行政手続法の目的', url: '/gyouseihou/gyousei-tetuzuki-mokuteki/', difficulty: 'A', type: 'link' },
                            { title: '行政手続法の対象', url: '/gyouseihou/gyousei-tetuzuki-taishou/', difficulty: 'A', type: 'link' },
                            { title: '適用除外', url: '/gyouseihou/tekiyou-jogai/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 申請に対する処分': [
                            { title: '申請に対する処分とは何か', url: '/gyouseihou/shinsei-shobun-towa/', difficulty: 'B', type: 'link' },
                            { title: '審査基準', url: '/gyouseihou/shinsa-kijun/', difficulty: 'A', type: 'link' },
                            { title: '標準処理期間', url: '/gyouseihou/hyoujun-shori-kikan/', difficulty: 'A', type: 'link' },
                            { title: '申請に対する審査・応答', url: '/gyouseihou/shinsei-shinsa-toutou/', difficulty: 'A', type: 'link' },
                            { title: '理由の提示', url: '/gyouseihou/riyuu-teijiZ/', difficulty: 'A', type: 'link' },
                            { title: 'その他の規定', url: '/gyouseihou/sonota-kitei/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 不利益処分': [
                            { title: '不利益処分とは何か', url: '/gyouseihou/furieki-shobun-towa/', difficulty: 'A', type: 'link' },
                            { title: '処分基準', url: '/gyouseihou/shobun-kijun/', difficulty: 'A', type: 'link' },
                            { title: '理由の提示', url: '/gyouseihou/riyuu-teijiZ-furieki/', difficulty: 'A', type: 'link' },
                            { title: '聴聞選択手続', url: '/gyouseihou/choushin-tetuzuki/', difficulty: 'A', type: 'link' }
                        ],
                        '第4節 行政指導': [
                            { title: '行政指導とは何か', url: '/gyouseihou/gyousei-shidou-towa/', difficulty: 'A', type: 'link' },
                            { title: '行政指導の手続', url: '/gyouseihou/gyousei-shidou-tetsuzuki/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 届出': [
                            { title: '届出とは何か', url: '/gyouseihou/todokede-towa/', difficulty: 'C', type: 'link' },
                            { title: '届出の効力発生時期', url: '/gyouseihou/todokede-kouryoku-hassei/', difficulty: 'C', type: 'link' }
                        ],
                        '第6節 命令等制定手続': [
                            { title: '命令等を定める場合の一般原則', url: '/gyouseihou/meirei-toutei-ippan-genri/', difficulty: 'B', type: 'link' },
                            { title: '意見公募手続', url: '/gyouseihou/iken-koubo/', difficulty: 'A', type: 'link' }
                        ]
                    }
                },
                '第3章 行政不服審査法': {
                    sections: {
                        '第1節 行政不服審査法総則': [
                            { title: '行政済法の全体像', url: '/gyouseihou/gyousei-fufuku-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '行政不服審査法の目的', url: '/gyouseihou/gyousei-fufuku-mokuteki/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の対象', url: '/gyouseihou/shinsei-kyusai-taishou/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 審査請求': [
                            { title: '審査請求の流れ', url: '/gyouseihou/shinsa-seikyu-nagare/', difficulty: 'B', type: 'link' },
                            { title: '審査請求の要件', url: '/gyouseihou/shinsa-seikyu-youken/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の審理手続', url: '/gyouseihou/shinsa-seikyu-shinri-tetuzuki/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の裁決', url: '/gyouseihou/shinsa-seikyu-saiketsu/', difficulty: 'A', type: 'link' },
                            { title: '執行停止', url: '/gyouseihou/shikkou-teishi/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 審査請求以外の不服申立て': [
                            { title: '再調査の請求', url: '/gyouseihou/saichousa-seikyu/', difficulty: 'B', type: 'link' },
                            { title: '再審査請求', url: '/gyouseihou/saishingsa-seikyu/', difficulty: 'C', type: 'link' }
                        ],
                        '第4節 教示': [
                            { title: '教示とは何か', url: '/gyouseihou/kyouji-towa/', difficulty: 'B', type: 'link' },
                            { title: '教示の内容', url: '/gyouseihou/kyouji-naiyou/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第4章 行政事件訴訟法': {
                    sections: {
                        '第1節 行政事件訴訟の類型': [
                            { title: '行政事件訴訟', url: '/gyouseihou/gyousei-jiken-soshou/', difficulty: 'A', type: 'link' },
                            { title: '抗告訴訟', url: '/gyouseihou/koutoku-soshou/', difficulty: 'A', type: 'link' },
                            { title: '当事者訴訟', url: '/gyouseihou/touji-soshou/', difficulty: 'B', type: 'link' },
                            { title: '民衆訴訟', url: '/gyouseihou/minshuu-soshou/', difficulty: 'B', type: 'link' },
                            { title: '機関訴訟', url: '/gyouseihou/kikan-soshou/', difficulty: 'C', type: 'link' }
                        ],
                        '第2節 取消訴訟': [
                            { title: '取消訴訟の類型', url: '/gyouseihou/torikeshi-soshou-ruikei/', difficulty: 'A', type: 'link' },
                            { title: '取消訴訟の要件', url: '/gyouseihou/torikeshi-soshou-youken/', difficulty: 'A', type: 'link' },
                            { title: '取消訴訟の審理', url: '/gyouseihou/torikeshi-soshou-shinri/', difficulty: 'B', type: 'link' },
                            { title: '取消訴訟の判決', url: '/gyouseihou/torikeshi-soshou-hanketsu/', difficulty: 'A', type: 'link' },
                            { title: '執行停止', url: '/gyouseihou/shikkou-teishi-soshou/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 取消訴訟以外の抗告訴訟': [
                            { title: '無効等確認訴訟', url: '/gyouseihou/mukou-toutou-kakunin/', difficulty: 'B', type: 'link' },
                            { title: '不作為の違法確認訴訟', url: '/gyouseihou/fusaku-ihou-kakunin/', difficulty: 'B', type: 'link' },
                            { title: '義務付け訴訟', url: '/gyouseihou/gimu-dzuke-soshou/', difficulty: 'A', type: 'link' },
                            { title: '差止め訴訟', url: '/gyouseihou/sashi-tome-soshou/', difficulty: 'B', type: 'link' },
                            { title: '仮の義務付け・仮の差止め', url: '/gyouseihou/kari-gimu-dzuke-sashitome/', difficulty: 'A', type: 'link' }
                        ],
                        '第4節 当事者訴訟': [
                            { title: '当事者訴訟とは何か', url: '/gyouseihou/toujisha-soshou-towa/', difficulty: 'B', type: 'link' },
                            { title: '形態的当事者訴訟', url: '/gyouseihou/keitai-betsu-toujisha/', difficulty: 'B', type: 'link' },
                            { title: '実質的当事者訴訟', url: '/gyouseihou/jisshitsu-toujisha/', difficulty: 'C', type: 'link' }
                        ],
                        '第5節 民衆訴訟・機関訴訟': [
                            { title: '民衆訴訟', url: '/gyouseihou/minshuu-soshou-towa/', difficulty: 'C', type: 'link' },
                            { title: '機関訴訟', url: '/gyouseihou/kikan-soshou-towa/', difficulty: 'C', type: 'link' }
                        ],
                        '第6節 教示': [
                            { title: '教示とは何か', url: '/gyouseihou/kyouji-soshou/', difficulty: 'B', type: 'link' },
                            { title: '教示の内容', url: '/gyouseihou/kyouji-naiyou-soshou/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第5章 国家賠償法・損失補償': {
                    sections: {
                        '第1節 国家賠償法': [
                            { title: '国家賠償法の全体像', url: '/gyouseihou/kokka-baishou-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '国家賠償法1条', url: '/gyouseihou/kokka-baishou-1jou/', difficulty: 'A', type: 'link' },
                            { title: '国家賠償法2条', url: '/gyouseihou/kokka-baishou-2jou/', difficulty: 'A', type: 'link' },
                            { title: '国家賠償法3条～6条', url: '/gyouseihou/kokka-baishou-3-6jou/', difficulty: 'B', type: 'link' }
                        ],
                        '第2節 損失補償': [
                            { title: '損失補償とは何か', url: '/gyouseihou/sonshitsu-hoshou-towa/', difficulty: 'B', type: 'link' },
                            { title: '補償の根拠', url: '/gyouseihou/hoshou-konkyou/', difficulty: 'B', type: 'link' },
                            { title: '補償の内容・程度', url: '/gyouseihou/hoshou-naiyou-teido/', difficulty: 'B', type: 'link' },
                            { title: '補償の方法', url: '/gyouseihou/hoshou-houhou/', difficulty: 'C', type: 'link' }
                        ]
                    }
                },
                '第6章 地方自治法': {
                    sections: {
                        '第1節 地方公共団体の種類': [
                            { title: '地方自治とは何か', url: '/gyouseihou/chihou-jichi-towa/', difficulty: 'B', type: 'link' },
                            { title: '地方公共団体の種類', url: '/gyouseihou/chihou-dantai-shurui/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 地方公共団体の事務': [
                            { title: '地方公共団体の事務の種類', url: '/gyouseihou/chihou-dantai-jimu-shurui/', difficulty: 'B', type: 'link' },
                            { title: '事務処理の基本原則', url: '/gyouseihou/jimu-shori-kihon-genri/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 地方公共団体の機関': [
                            { title: '議会', url: '/gyouseihou/gikai/', difficulty: 'A', type: 'link' },
                            { title: '執行機関', url: '/gyouseihou/shikkou-kikan/', difficulty: 'A', type: 'link' },
                            { title: '議会と長の関係', url: '/gyouseihou/gikai-chou-kankei/', difficulty: 'A', type: 'link' },
                            { title: '地域自治区', url: '/gyouseihou/chiiki-jichi-ku/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 地方公共団体の立法': [
                            { title: '地方公共団体の自主立法', url: '/gyouseihou/chihou-dantai-jiritsu-rippou/', difficulty: 'B', type: 'link' },
                            { title: '条例', url: '/gyouseihou/jourei/', difficulty: 'A', type: 'link' },
                            { title: '規則', url: '/gyouseihou/kisoku/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 地方公共団体の財務': [
                            { title: '地方公共団体の財務の流れ', url: '/gyouseihou/chihou-dantai-zaimu-nagare/', difficulty: 'B', type: 'link' },
                            { title: '地方公共団体の財務に関する規定', url: '/gyouseihou/chihou-dantai-zaimu-kitei/', difficulty: 'B', type: 'link' }
                        ],
                        '第6節 住民の権利': [
                            { title: '住民', url: '/gyouseihou/juumin/', difficulty: 'B', type: 'link' },
                            { title: '選挙', url: '/gyouseihou/senkyo/', difficulty: 'B', type: 'link' },
                            { title: '直接請求', url: '/gyouseihou/chokusetsu-seikyu/', difficulty: 'A', type: 'link' },
                            { title: '住民監査請求・住民訴訟', url: '/gyouseihou/juumin-kansa-seikyu-soshou/', difficulty: 'A', type: 'link' },
                            { title: '公の施設', url: '/gyouseihou/koukai-seikyu/', difficulty: 'A', type: 'link' }
                        ],
                        '第7節 関与': [
                            { title: '関与とは何か', url: '/gyouseihou/kanyo-towa/', difficulty: 'B', type: 'link' },
                            { title: '関与の基本原則', url: '/gyouseihou/kanyo-kihon-genri/', difficulty: 'B', type: 'link' },
                            { title: '関与の基本類型', url: '/gyouseihou/kanyo-kihon-ruikei/', difficulty: 'B', type: 'link' },
                            { title: '紛争処理', url: '/gyouseihou/funsou-shori/', difficulty: 'B', type: 'link' }
                        ]
                    }
                }
            },
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
                                { title: '表見代理', url: '/minpou/hyoken-dairi/', difficulty: 'A', type: 'link' }
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
                                { title: '不動産物権変動②－登記と対抗要件', url: '/minpou/fudousan-bukken-hendou2/', difficulty: 'A', type: 'link' },
                                { title: '動産物権変動①－対抗要件', url: '/minpou/dousann-bukken-hendou1/', difficulty: 'B', type: 'link' },
                                { title: '動産物権変動②－即時取得', url: '/minpou/dousann-bukken-hendou2/', difficulty: 'A', type: 'link' }
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
                                { title: '共有', url: '/minpou/kyoyuu/', difficulty: 'A', type: 'link' }
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
                                { title: '抵当権', url: '/minpou/teitou-ken/', difficulty: 'A', type: 'link' }
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
                                { title: '債務不履行の効果', url: '/minpou/saimu-furikou-kouryoku/', difficulty: 'A', type: 'link' }
                            ],
                            '第3節 契約': [
                                { title: '売買', url: '/minpou/baibai/', difficulty: 'A', type: 'link' },
                                { title: '賃貸借', url: '/minpou/chintai-shakae/', difficulty: 'A', type: 'link' },
                                { title: '請負', url: '/minpou/ukeoi/', difficulty: 'B', type: 'link' }
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
                            ],
                            '第3節 遺言': [
                                { title: '遺言の方式', url: '/minpou/yuigon-houshiki/', difficulty: 'B', type: 'link' },
                                { title: '遺言の効力', url: '/minpou/yuigon-kouryoku/', difficulty: 'B', type: 'link' }
                            ]
                        }
                    }
                constructor() {
    this.subjects = {
        'constitution': { 
            name: '憲法', 
            chapters: {
                '第1章 総論': {
                    sections: {
                        '第1節 憲法の意味': [
                            { title: '憲法の特色', url: '/kenpou/kenpou-tokushitsu/', difficulty: 'C', type: 'link' },
                            { title: '憲法の基本原理', url: '/kenpou/kenpou-kihon-genri/', difficulty: 'C', type: 'link' }
                        ],
                        '第2節 天皇': [
                            { title: '天皇の地位', url: '/kenpou/tennou-chii/', difficulty: 'B', type: 'link' },
                            { title: '皇位継承', url: '/kenpou/koi-keisho/', difficulty: 'C', type: 'link' },
                            { title: '天皇の権能', url: '/kenpou/tennou-kennou/', difficulty: 'A', type: 'link' },
                            { title: '皇室の財産授受の議決', url: '/kenpou/koshitsu-zaisan/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第2章 人権': {
                    sections: {
                        '第1節 人権総論': [
                            { title: '人権の分類', url: '/kenpou/jinken-bunrui/', difficulty: 'B', type: 'link' },
                            { title: '人権の享有主体', url: '/kenpou/jinken-kyouyu-shutai/', difficulty: 'A', type: 'link' },
                            { title: '人権の限界', url: '/kenpou/jinken-genkai/', difficulty: 'A', type: 'link' },
                            { title: '人権の私人間効力', url: '/kenpou/shijin-kan-kouri/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 幸福追求権・法の下の平等': [
                            { title: '幸福追求権', url: '/kenpou/koufuku-tsuikyuu/', difficulty: 'A', type: 'link' },
                            { title: '法の下の平等', url: '/kenpou/hou-shita-byoudou/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 精神的自由権': [
                            { title: '思想・良心の自由', url: '/kenpou/shisou-ryoushin/', difficulty: 'B', type: 'link' },
                            { title: '信教の自由', url: '/kenpou/shinkyou-jiyuu/', difficulty: 'A', type: 'link' },
                            { title: '表現の自由', url: '/kenpou/hyougen-jiyuu/', difficulty: 'A', type: 'link' },
                            { title: '学問の自由', url: '/kenpou/gakumon-jiyuu/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 経済的自由権': [
                            { title: '職業選択の自由', url: '/kenpou/shokugyou-sentaku/', difficulty: 'A', type: 'link' },
                            { title: '居住・移転の自由', url: '/kenpou/kyojuu-iten/', difficulty: 'B', type: 'link' },
                            { title: '外国移住・国籍離脱の自由', url: '/kenpou/gaikoku-iten/', difficulty: 'B', type: 'link' },
                            { title: '財産権', url: '/kenpou/zaisan-ken/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 人身の自由': [
                            { title: '奴隷的拘束・苦役からの自由', url: '/kenpou/doreitekikousoku/', difficulty: 'B', type: 'link' },
                            { title: '法定手続の保障', url: '/kenpou/houtei-tetuzuki/', difficulty: 'A', type: 'link' },
                            { title: '被疑者・被告人の権利', url: '/kenpou/higisha-kokokuninz/', difficulty: 'B', type: 'link' }
                        ],
                        '第6節 社会権': [
                            { title: '生存権', url: '/kenpou/seizon-ken/', difficulty: 'A', type: 'link' },
                            { title: '教育を受ける権利', url: '/kenpou/kyouiku-ukeru/', difficulty: 'B', type: 'link' },
                            { title: '勤労の権利', url: '/kenpou/roudou-kenri/', difficulty: 'C', type: 'link' },
                            { title: '労働基本権', url: '/kenpou/roudou-kihon/', difficulty: 'B', type: 'link' }
                        ],
                        '第7節 参政権・国務請求権': [
                            { title: '参政権', url: '/kenpou/sansei-ken/', difficulty: 'B', type: 'link' },
                            { title: '国務請求権', url: '/kenpou/kokumu-seikyu/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第3章 統治': {
                    sections: {
                        '第1節 国会': [
                            { title: '権力分立', url: '/kenpou/kenryoku-bunritsu/', difficulty: 'A', type: 'link' },
                            { title: '国会の地位', url: '/kenpou/kokkai-chii/', difficulty: 'A', type: 'link' },
                            { title: '二院制', url: '/kenpou/niinsei/', difficulty: 'A', type: 'link' },
                            { title: '国会の活動', url: '/kenpou/kokkai-katsudou/', difficulty: 'A', type: 'link' },
                            { title: '国会議員の特権', url: '/kenpou/kokkai-giin-tokken/', difficulty: 'A', type: 'link' },
                            { title: '国会と議院の権能', url: '/kenpou/kokkai-giin-kennou/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 内閣': [
                            { title: '行政権と内閣', url: '/kenpou/gyouseikenz-naikaku/', difficulty: 'B', type: 'link' },
                            { title: '内閣の組織', url: '/kenpou/naikaku-soshiki/', difficulty: 'A', type: 'link' },
                            { title: '議院内閣制', url: '/kenpou/giin-naikaku-sei/', difficulty: 'A', type: 'link' },
                            { title: '内閣と内閣総理大臣の権能', url: '/kenpou/naikaku-naikaku-souri/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 裁判所': [
                            { title: '司法権', url: '/kenpou/shihou-ken/', difficulty: 'A', type: 'link' },
                            { title: '裁判所の組織と権能', url: '/kenpou/saibansho-soshiki/', difficulty: 'A', type: 'link' },
                            { title: '司法権の独立', url: '/kenpou/shihou-dokuritsu/', difficulty: 'A', type: 'link' },
                            { title: '違憲審査権', url: '/kenpou/kenpou-shinsa/', difficulty: 'A', type: 'link' },
                            { title: '裁判の公開', url: '/kenpou/saiban-koukai/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 財政': [
                            { title: '国家財政', url: '/kenpou/kokka-zaisei/', difficulty: 'B', type: 'link' },
                            { title: '予算・会計検査', url: '/kenpou/yosan-kaikei/', difficulty: 'C', type: 'link' }
                        ],
                        '第5節 地方自治・憲法改正': [
                            { title: '地方自治の本旨', url: '/kenpou/chihou-jichi-honshi/', difficulty: 'B', type: 'link' },
                            { title: '憲法改正', url: '/kenpou/kenpou-kaisei/', difficulty: 'A', type: 'link' }
                        ]
                    }
                }
            },
            items: []
        },
        'administrative': { 
            name: '行政法', 
            chapters: {
                '第1章 行政法の一般的な法理論': {
                    sections: {
                        '第1節 行政法総論': [
                            { title: '行政法の一般原理', url: '/gyouseihou/gyouseihou-ippan-genri/', difficulty: 'A', type: 'link' },
                            { title: '行政上の法律関係', url: '/gyouseihou/gyouseihou-houtei-kankei/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 行政組織法': [
                            { title: '行政主体と行政機関', url: '/gyouseihou/gyousei-shutai-kikan/', difficulty: 'A', type: 'link' },
                            { title: '行政機関の権限', url: '/gyouseihou/gyousei-kikan-kengen/', difficulty: 'A', type: 'link' },
                            { title: '国の行政組織', url: '/gyouseihou/kuni-gyousei-soshiki/', difficulty: 'B', type: 'link' },
                            { title: '公務員', url: '/gyouseihou/koumuin/', difficulty: 'B', type: 'link' },
                            { title: '公物', url: '/gyouseihou/kouchoubutsu/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 行政作用の類型': [
                            { title: '行政作用とは何か', url: '/gyouseihou/gyousei-sayou-towa/', difficulty: 'B', type: 'link' },
                            { title: '行政処分', url: '/gyouseihou/gyousei-shobun/', difficulty: 'A', type: 'link' },
                            { title: '行政立法', url: '/gyouseihou/gyousei-rippou/', difficulty: 'A', type: 'link' },
                            { title: '行政計画', url: '/gyouseihou/gyousei-keikaku/', difficulty: 'B', type: 'link' },
                            { title: '行政契約', url: '/gyouseihou/gyousei-keiyaku/', difficulty: 'B', type: 'link' },
                            { title: '行政指導', url: '/gyouseihou/gyousei-shidou/', difficulty: 'B', type: 'link' },
                            { title: '行政調査', url: '/gyouseihou/gyousei-chousa/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 行政上の強制措置': [
                            { title: '行政上の強制措置の全体像', url: '/gyouseihou/gyousei-kyousei-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '行政上の強制執行', url: '/gyouseihou/gyousei-kyousei-shikkou/', difficulty: 'A', type: 'link' },
                            { title: '即時強制', url: '/gyouseihou/sokuji-kyousei/', difficulty: 'B', type: 'link' },
                            { title: '行政罰', url: '/gyouseihou/gyousei-batsu/', difficulty: 'A', type: 'link' }
                        ]
                    }
                },
                '第2章 行政手続法': {
                    sections: {
                        '第1節 行政手続法総則': [
                            { title: '行政手続法とは何か', url: '/gyouseihou/gyousei-tetuzuki-towa/', difficulty: 'B', type: 'link' },
                            { title: '行政手続法の目的', url: '/gyouseihou/gyousei-tetuzuki-mokuteki/', difficulty: 'A', type: 'link' },
                            { title: '行政手続法の対象', url: '/gyouseihou/gyousei-tetuzuki-taishou/', difficulty: 'A', type: 'link' },
                            { title: '適用除外', url: '/gyouseihou/tekiyou-jogai/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 申請に対する処分': [
                            { title: '申請に対する処分とは何か', url: '/gyouseihou/shinsei-shobun-towa/', difficulty: 'B', type: 'link' },
                            { title: '審査基準', url: '/gyouseihou/shinsa-kijun/', difficulty: 'A', type: 'link' },
                            { title: '標準処理期間', url: '/gyouseihou/hyoujun-shori-kikan/', difficulty: 'A', type: 'link' },
                            { title: '申請に対する審査・応答', url: '/gyouseihou/shinsei-shinsa-toutou/', difficulty: 'A', type: 'link' },
                            { title: '理由の提示', url: '/gyouseihou/riyuu-teijiZ/', difficulty: 'A', type: 'link' },
                            { title: 'その他の規定', url: '/gyouseihou/sonota-kitei/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 不利益処分': [
                            { title: '不利益処分とは何か', url: '/gyouseihou/furieki-shobun-towa/', difficulty: 'A', type: 'link' },
                            { title: '処分基準', url: '/gyouseihou/shobun-kijun/', difficulty: 'A', type: 'link' },
                            { title: '理由の提示', url: '/gyouseihou/riyuu-teijiZ-furieki/', difficulty: 'A', type: 'link' },
                            { title: '聴聞選択手続', url: '/gyouseihou/choushin-tetuzuki/', difficulty: 'A', type: 'link' }
                        ],
                        '第4節 行政指導': [
                            { title: '行政指導とは何か', url: '/gyouseihou/gyousei-shidou-towa/', difficulty: 'A', type: 'link' },
                            { title: '行政指導の手続', url: '/gyouseihou/gyousei-shidou-tetsuzuki/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 届出': [
                            { title: '届出とは何か', url: '/gyouseihou/todokede-towa/', difficulty: 'C', type: 'link' },
                            { title: '届出の効力発生時期', url: '/gyouseihou/todokede-kouryoku-hassei/', difficulty: 'C', type: 'link' }
                        ],
                        '第6節 命令等制定手続': [
                            { title: '命令等を定める場合の一般原則', url: '/gyouseihou/meirei-toutei-ippan-genri/', difficulty: 'B', type: 'link' },
                            { title: '意見公募手続', url: '/gyouseihou/iken-koubo/', difficulty: 'A', type: 'link' }
                        ]
                    }
                },
                '第3章 行政不服審査法': {
                    sections: {
                        '第1節 行政不服審査法総則': [
                            { title: '行政済法の全体像', url: '/gyouseihou/gyousei-fufuku-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '行政不服審査法の目的', url: '/gyouseihou/gyousei-fufuku-mokuteki/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の対象', url: '/gyouseihou/shinsei-kyusai-taishou/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 審査請求': [
                            { title: '審査請求の流れ', url: '/gyouseihou/shinsa-seikyu-nagare/', difficulty: 'B', type: 'link' },
                            { title: '審査請求の要件', url: '/gyouseihou/shinsa-seikyu-youken/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の審理手続', url: '/gyouseihou/shinsa-seikyu-shinri-tetuzuki/', difficulty: 'A', type: 'link' },
                            { title: '審査請求の裁決', url: '/gyouseihou/shinsa-seikyu-saiketsu/', difficulty: 'A', type: 'link' },
                            { title: '執行停止', url: '/gyouseihou/shikkou-teishi/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 審査請求以外の不服申立て': [
                            { title: '再調査の請求', url: '/gyouseihou/saichousa-seikyu/', difficulty: 'B', type: 'link' },
                            { title: '再審査請求', url: '/gyouseihou/saishingsa-seikyu/', difficulty: 'C', type: 'link' }
                        ],
                        '第4節 教示': [
                            { title: '教示とは何か', url: '/gyouseihou/kyouji-towa/', difficulty: 'B', type: 'link' },
                            { title: '教示の内容', url: '/gyouseihou/kyouji-naiyou/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第4章 行政事件訴訟法': {
                    sections: {
                        '第1節 行政事件訴訟の類型': [
                            { title: '行政事件訴訟', url: '/gyouseihou/gyousei-jiken-soshou/', difficulty: 'A', type: 'link' },
                            { title: '抗告訴訟', url: '/gyouseihou/koutoku-soshou/', difficulty: 'A', type: 'link' },
                            { title: '当事者訴訟', url: '/gyouseihou/touji-soshou/', difficulty: 'B', type: 'link' },
                            { title: '民衆訴訟', url: '/gyouseihou/minshuu-soshou/', difficulty: 'B', type: 'link' },
                            { title: '機関訴訟', url: '/gyouseihou/kikan-soshou/', difficulty: 'C', type: 'link' }
                        ],
                        '第2節 取消訴訟': [
                            { title: '取消訴訟の類型', url: '/gyouseihou/torikeshi-soshou-ruikei/', difficulty: 'A', type: 'link' },
                            { title: '取消訴訟の要件', url: '/gyouseihou/torikeshi-soshou-youken/', difficulty: 'A', type: 'link' },
                            { title: '取消訴訟の審理', url: '/gyouseihou/torikeshi-soshou-shinri/', difficulty: 'B', type: 'link' },
                            { title: '取消訴訟の判決', url: '/gyouseihou/torikeshi-soshou-hanketsu/', difficulty: 'A', type: 'link' },
                            { title: '執行停止', url: '/gyouseihou/shikkou-teishi-soshou/', difficulty: 'A', type: 'link' }
                        ],
                        '第3節 取消訴訟以外の抗告訴訟': [
                            { title: '無効等確認訴訟', url: '/gyouseihou/mukou-toutou-kakunin/', difficulty: 'B', type: 'link' },
                            { title: '不作為の違法確認訴訟', url: '/gyouseihou/fusaku-ihou-kakunin/', difficulty: 'B', type: 'link' },
                            { title: '義務付け訴訟', url: '/gyouseihou/gimu-dzuke-soshou/', difficulty: 'A', type: 'link' },
                            { title: '差止め訴訟', url: '/gyouseihou/sashi-tome-soshou/', difficulty: 'B', type: 'link' },
                            { title: '仮の義務付け・仮の差止め', url: '/gyouseihou/kari-gimu-dzuke-sashitome/', difficulty: 'A', type: 'link' }
                        ],
                        '第4節 当事者訴訟': [
                            { title: '当事者訴訟とは何か', url: '/gyouseihou/toujisha-soshou-towa/', difficulty: 'B', type: 'link' },
                            { title: '形態的当事者訴訟', url: '/gyouseihou/keitai-betsu-toujisha/', difficulty: 'B', type: 'link' },
                            { title: '実質的当事者訴訟', url: '/gyouseihou/jisshitsu-toujisha/', difficulty: 'C', type: 'link' }
                        ],
                        '第5節 民衆訴訟・機関訴訟': [
                            { title: '民衆訴訟', url: '/gyouseihou/minshuu-soshou-towa/', difficulty: 'C', type: 'link' },
                            { title: '機関訴訟', url: '/gyouseihou/kikan-soshou-towa/', difficulty: 'C', type: 'link' }
                        ],
                        '第6節 教示': [
                            { title: '教示とは何か', url: '/gyouseihou/kyouji-soshou/', difficulty: 'B', type: 'link' },
                            { title: '教示の内容', url: '/gyouseihou/kyouji-naiyou-soshou/', difficulty: 'B', type: 'link' }
                        ]
                    }
                },
                '第5章 国家賠償法・損失補償': {
                    sections: {
                        '第1節 国家賠償法': [
                            { title: '国家賠償法の全体像', url: '/gyouseihou/kokka-baishou-zentaizou/', difficulty: 'B', type: 'link' },
                            { title: '国家賠償法1条', url: '/gyouseihou/kokka-baishou-1jou/', difficulty: 'A', type: 'link' },
                            { title: '国家賠償法2条', url: '/gyouseihou/kokka-baishou-2jou/', difficulty: 'A', type: 'link' },
                            { title: '国家賠償法3条～6条', url: '/gyouseihou/kokka-baishou-3-6jou/', difficulty: 'B', type: 'link' }
                        ],
                        '第2節 損失補償': [
                            { title: '損失補償とは何か', url: '/gyouseihou/sonshitsu-hoshou-towa/', difficulty: 'B', type: 'link' },
                            { title: '補償の根拠', url: '/gyouseihou/hoshou-konkyou/', difficulty: 'B', type: 'link' },
                            { title: '補償の内容・程度', url: '/gyouseihou/hoshou-naiyou-teido/', difficulty: 'B', type: 'link' },
                            { title: '補償の方法', url: '/gyouseihou/hoshou-houhou/', difficulty: 'C', type: 'link' }
                        ]
                    }
                },
                '第6章 地方自治法': {
                    sections: {
                        '第1節 地方公共団体の種類': [
                            { title: '地方自治とは何か', url: '/gyouseihou/chihou-jichi-towa/', difficulty: 'B', type: 'link' },
                            { title: '地方公共団体の種類', url: '/gyouseihou/chihou-dantai-shurui/', difficulty: 'A', type: 'link' }
                        ],
                        '第2節 地方公共団体の事務': [
                            { title: '地方公共団体の事務の種類', url: '/gyouseihou/chihou-dantai-jimu-shurui/', difficulty: 'B', type: 'link' },
                            { title: '事務処理の基本原則', url: '/gyouseihou/jimu-shori-kihon-genri/', difficulty: 'B', type: 'link' }
                        ],
                        '第3節 地方公共団体の機関': [
                            { title: '議会', url: '/gyouseihou/gikai/', difficulty: 'A', type: 'link' },
                            { title: '執行機関', url: '/gyouseihou/shikkou-kikan/', difficulty: 'A', type: 'link' },
                            { title: '議会と長の関係', url: '/gyouseihou/gikai-chou-kankei/', difficulty: 'A', type: 'link' },
                            { title: '地域自治区', url: '/gyouseihou/chiiki-jichi-ku/', difficulty: 'B', type: 'link' }
                        ],
                        '第4節 地方公共団体の立法': [
                            { title: '地方公共団体の自主立法', url: '/gyouseihou/chihou-dantai-jiritsu-rippou/', difficulty: 'B', type: 'link' },
                            { title: '条例', url: '/gyouseihou/jourei/', difficulty: 'A', type: 'link' },
                            { title: '規則', url: '/gyouseihou/kisoku/', difficulty: 'A', type: 'link' }
                        ],
                        '第5節 地方公共団体の財務': [
                            { title: '地方公共団体の財務の流れ', url: '/gyouseihou/chihou-dantai-zaimu-nagare/', difficulty: 'B', type: 'link' },
                            { title: '地方公共団体の財務に関する規定', url: '/gyouseihou/chihou-dantai-zaimu-kitei/', difficulty: 'B', type: 'link' }
                        ],
                        '第6節 住民の権利': [
                            { title: '住民', url: '/gyouseihou/juumin/', difficulty: 'B', type: 'link' },
                            { title: '選挙', url: '/gyouseihou/senkyo/', difficulty: 'B', type: 'link' },
                            { title: '直接請求', url: '/gyouseihou/chokusetsu-seikyu/', difficulty: 'A', type: 'link' },
                            { title: '住民監査請求・住民訴訟', url: '/gyouseihou/juumin-kansa-seikyu-soshou/', difficulty: 'A', type: 'link' },
                            { title: '公の施設', url: '/gyouseihou/koukai-seikyu/', difficulty: 'A', type: 'link' }
                        ],
                        '第7節 関与': [
                            { title: '関与とは何か', url: '/gyouseihou/kanyo-towa/', difficulty: 'B', type: 'link' },
                            { title: '関与の基本原則', url: '/gyouseihou/kanyo-kihon-genri/', difficulty: 'B', type: 'link' },
                            { title: '関与の基本類型', url: '/gyouseihou/kanyo-kihon-ruikei/', difficulty: 'B', type: 'link' },
                            { title: '紛争処理', url: '/gyouseihou/funsou-shori/', difficulty: 'B', type: 'link' }
                        ]
                    }
                }
            },
            items: []
        },
        'civil': { 
            name: '民法', 
            chapters: {

    /**
     * 初期化
     */
    initialize() {
        if (this.initialized) {
            console.log('KeyPointsModule already initialized');
            return;
        }

        if (!window.DataManager) {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        this.loadKeyPointsData();
        this.initialized = true;
        console.log('KeyPointsModule initialized successfully');
    }

    /**
     * 要点データの読み込み（Firebase統合）
     */
    loadKeyPointsData() {
        try {
            const saved = localStorage.getItem('keyPointsData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                if (parsedData && typeof parsedData === 'object') {
                    Object.keys(this.subjects).forEach(key => {
                        if (parsedData[key] && parsedData[key].items) {
                            this.subjects[key].items = parsedData[key].items;
                        }
                        if (parsedData[key] && parsedData[key].chapters) {
                            // カスタム追加されたHTMLコンテンツをマージ
                            Object.keys(parsedData[key].chapters).forEach(chapterKey => {
                                if (this.subjects[key].chapters[chapterKey] && parsedData[key].chapters[chapterKey].sections) {
                                    Object.keys(parsedData[key].chapters[chapterKey].sections).forEach(sectionKey => {
                                        if (this.subjects[key].chapters[chapterKey].sections[sectionKey]) {
                                            // 既存の項目にHTMLコンテンツを追加
                                            parsedData[key].chapters[chapterKey].sections[sectionKey].forEach((savedTopic, index) => {
                                                if (this.subjects[key].chapters[chapterKey].sections[sectionKey][index] && 
                                                    savedTopic.htmlContent) {
                                                    this.subjects[key].chapters[chapterKey].sections[sectionKey][index].htmlContent = savedTopic.htmlContent;
                                                    this.subjects[key].chapters[chapterKey].sections[sectionKey][index].type = 'html';
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading key points data:', error);
        }
    }

    /**
     * 要点データの保存（Firebase統合強化版）
     */
    saveKeyPointsData() {
        try {
            console.log('💾 KeyPoints保存開始（Firebase統合版）');
            
            // LocalStorageに保存
            localStorage.setItem('keyPointsData', JSON.stringify(this.subjects));
            
            // Firebaseにも保存（ULTRA_STABLE_USER_IDが利用可能な場合）
            if (window.ULTRA_STABLE_USER_ID && window.DataManager && typeof DataManager.saveToFirestore === 'function') {
                const keyPointsCount = this.countTotalKeyPoints();
                
                DataManager.saveToFirestore({
                    type: 'keyPoints',
                    action: 'save',
                    keyPointsCount: keyPointsCount,
                    subjectsCount: Object.keys(this.subjects).length,
                    timestamp: new Date().toISOString(),
                    message: '要点確認データを保存しました'
                });
                
                console.log('✅ KeyPoints Firebase保存完了');
            } else {
                console.log('📝 KeyPoints LocalStorage保存のみ');
            }
            
        } catch (error) {
            console.error('❌ KeyPoints保存エラー:', error);
        }
    }

    /**
     * 総要点数カウント
     */
    countTotalKeyPoints() {
        let count = 0;
        Object.values(this.subjects).forEach(subject => {
            if (subject.chapters) {
                Object.values(subject.chapters).forEach(chapter => {
                    if (chapter.sections) {
                        Object.values(chapter.sections).forEach(topics => {
                            if (Array.isArray(topics)) {
                                topics.forEach(topic => {
                                    if (topic.type === 'html' && topic.htmlContent) {
                                        count++;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        return count;
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
        this.isContentView = false;
        
        return `
            <div id="keyPointsMainContent">
                ${this.renderSubjectListDirect()}
            </div>
        `;
    }

    /**
     * 直接科目一覧を表示（カードなし・3列固定）
     */
    renderSubjectListDirect() {
        this.currentView = 'subjects';
        this.isContentView = false;
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
                        ${subject.chapterCount} 編
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
                <h4 style="margin-bottom: 15px;">📝 要点管理（カード選択式）</h4>
                <div id="hierarchySelectionArea">
                    <div class="form-group">
                        <label class="form-label">科目を選択</label>
                        <select class="form-control" id="keyPointSubjectSelect" onchange="KeyPointsModule.onSubjectChangeCard()">
                            <option value="">科目を選択</option>
                            ${this.getSubjectList().map(subject => 
                                `<option value="${subject.key}">${subject.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- パンくずリスト -->
                    <div id="selectionBreadcrumb" style="display: none; margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">選択履歴</div>
                        <div id="breadcrumbPath" style="font-size: 13px; color: #495057; font-weight: 500;"></div>
                    </div>
                    
                    <div id="chapterCardsArea" style="display: none;">
                        <label class="form-label">編を選択</label>
                        <div id="chapterCards" class="small-card-grid"></div>
                    </div>
                    
                    <div id="sectionCardsArea" style="display: none;">
                        <label class="form-label">節を選択</label>
                        <div id="sectionCards" class="small-card-grid"></div>
                    </div>
                    
                    <div id="topicCardsArea" style="display: none;">
                        <label class="form-label">項目を選択</label>
                        <div id="topicCards" class="small-card-grid"></div>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 20px;">
                    <label class="form-label">要点まとめタイトル</label>
                    <input type="text" class="form-control" id="keyPointTitle" 
                           placeholder="例：権利能力の要点まとめ">
                </div>
                
                <div class="form-group">
                    <label class="form-label">HTML内容</label>
                    <textarea class="form-control" id="keyPointHtml" rows="8" 
                              placeholder="HTML形式の要点まとめ内容を入力してください"></textarea>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                        💡 <strong class="wp-key-term">重要語句</strong> を&lt;span class="wp-key-term"&gt;語句&lt;/span&gt;で囲むと、クリック可能な隠し機能付きになります
                    </div>
                </div>
                
                <button class="save-button" onclick="KeyPointsModule.handleAddHierarchyItemCard()" id="submitBtn" disabled>
                    📋 階層に要点を登録
                </button>
            </div>
            
            <div style="margin: 20px 15px;">
                <h4>📚 登録済み要点</h4>
                <div id="keyPointsList">${this.renderKeyPointsList()}</div>
            </div>
        `;

        return html;
    }

    /**
     * 科目選択（章一覧表示・折りたたみ機能付き）
     */
    selectSubject(subjectKey) {
        this.currentSubject = subjectKey;
        this.currentView = 'chapters';
        this.isContentView = false;
        const subject = this.subjects[subjectKey];
        if (!subject) return;

        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        let html = `
            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0;">📚 ${subject.name} 要点まとめ</h3>
                    <button class="save-button" onclick="KeyPointsModule.backToSubjectList()" 
                            style="background: var(--gray); padding: 8px 12px; font-size: 14px; min-width: auto; width: auto;">↩️ 戻る</button>
                </div>
        `;

        const chapters = subject.chapters || {};
        
        if (Object.keys(chapters).length === 0) {
            html += `
                <div style="text-align: center; padding: 30px; color: var(--gray);">
                    <p>まだ編項目がありません</p>
                    <p style="font-size: 14px;">下の管理画面から項目を追加してください</p>
                </div>
            `;
        } else {
            // 折りたたみ可能な編構造
            Object.entries(chapters).forEach(([chapterName, chapterData]) => {
                const chapterId = `chapter-${subjectKey}-${chapterName.replace(/\s+/g, '-')}`;
                
                html += `
                    <div class="collapsible-chapter" style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div class="chapter-header-collapsible" style="background: linear-gradient(135deg, #4a5568, #2d3748); color: white; padding: 15px 20px; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;"
                             onclick="KeyPointsModule.toggleChapter('${chapterId}')">
                            <span style="font-size: 16px; font-weight: bold;">${chapterName}</span>
                            <span class="chapter-arrow" id="arrow-${chapterId}" style="font-size: 14px; transition: transform 0.3s;">▼</span>
                        </div>
                        <div class="chapter-content-collapsible" id="${chapterId}" style="display: block; background: white;">
                            <div style="padding: 20px;">
                `;
                
                if (chapterData.sections) {
                    Object.entries(chapterData.sections).forEach(([sectionName, topics]) => {
                        html += `
                            <div class="section" style="margin-bottom: 25px;">
                                <div class="section-title" style="font-size: 15px; font-weight: bold; color: #2d3748; margin-bottom: 15px; padding: 8px 0; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 8px;">
                                    <span style="background: #4a5568; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${Object.keys(chapterData.sections).indexOf(sectionName) + 1}</span>
                                    ${sectionName}
                                </div>
                                <div class="topic-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
                        `;
                        
                        topics.forEach((topic, index) => {
                            const difficultyClass = `difficulty-${topic.difficulty.toLowerCase()}`;
                            const hasCustomContent = topic.type === 'html' && topic.htmlContent;
                            
                            html += `
                                <div class="topic-card" style="background: ${hasCustomContent ? '#f0f8ff' : '#f7fafc'}; border: 1px solid ${hasCustomContent ? '#2196f3' : '#e2e8f0'}; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s ease; position: relative;"
                                     onclick="KeyPointsModule.viewTopicContent('${subjectKey}', '${chapterName}', '${sectionName}', ${index})">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <span style="font-size: 11px; color: #718096; min-width: 20px; font-weight: 500; background: #edf2f7; padding: 2px 6px; border-radius: 3px;">${index + 1}</span>
                                        <span class="difficulty-badge ${difficultyClass}" style="padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; min-width: 20px; text-align: center;">${topic.difficulty}</span>
                                        ${hasCustomContent ? '<span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold;">HTML</span>' : ''}
                                    </div>
                                    <div style="font-size: 13px; font-weight: 500; color: #2d3748; line-height: 1.4;">${topic.title}</div>
                                    ${hasCustomContent ? '<div style="position: absolute; top: 8px; right: 8px; color: #2196f3; font-size: 12px;">📄</div>' : '<div style="position: absolute; top: 8px; right: 8px; color: #9ca3af; font-size: 12px;">🔗</div>'}
                                </div>
                            `;
                        });
                        
                        html += `
                                </div>
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

        this.addDifficultyStyles();
        this.addKeyPointStyles();
    }

    /**
     * 編の折りたたみ切り替え（修正版）
     */
    toggleChapter(chapterId) {
        const content = document.getElementById(chapterId);
        const arrow = document.getElementById(`arrow-${chapterId}`);
        
        if (!content || !arrow) {
            console.warn(`Chapter elements not found: ${chapterId}`);
            return;
        }

        try {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(0deg)';
                arrow.textContent = '▼';
            } else {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(-90deg)';
                arrow.textContent = '▶';
            }
        } catch (error) {
            console.error('Error toggling chapter:', error);
        }
    }

    /**
     * 科目一覧に戻る
     */
    backToSubjectList() {
        this.isContentView = false;
        const content = document.getElementById('keyPointsMainContent');
        if (content) {
            content.innerHTML = this.renderSubjectListDirect();
            this.addKeyPointStyles();
        }
        
        this.resetModalHeader();
        
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }

    /**
     * モーダルヘッダーを通常状態にリセット
     */
    resetModalHeader() {
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <h3 id="modalTitle" style="margin: 0; flex-grow: 1; text-align: center;">📚 要点確認</h3>
                <button class="modal-close" style="width: 30px; height: 30px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="App.closeFooterModal()">×</button>
            `;
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
        this.isContentView = true;
        const content = document.getElementById('keyPointsMainContent');
        if (!content) return;

        const html = `
            <div style="padding: 0; margin: 0;">
                <div style="padding: 20px;" id="keyPointContent">
                    ${htmlContent}
                </div>
            </div>
        `;

        content.innerHTML = html;
        
        // モーダルヘッダーに重要語句ボタンを追加
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader && !modalHeader.querySelector('#keyPointToggleBtn')) {
            modalHeader.innerHTML = `
                <h3 style="margin: 0; flex-grow: 1; text-align: center;">📄 ${title}</h3>
                <button onclick="KeyPointsModule.toggleKeyTerms()" id="keyPointToggleBtn" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.3s;">重要語句を隠す</button>
                <button class="modal-close" style="width: 24px; height: 24px; border: none; background: var(--light); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-left: 10px;" onclick="App.closeFooterModal()">×</button>
            `;
        }
        
        // モーダルフッターを戻るボタン付きに変更
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <div style="display: flex; gap: 10px;">
                    <button style="background: var(--gray); color: white; border: none; border-radius: 10px; padding: 15px 20px; cursor: pointer; font-size: 16px; font-weight: 600;" onclick="KeyPointsModule.selectSubject('${this.currentSubject}')">↩️ 戻る</button>
                    <button class="modal-close-bottom" style="flex: 1;" onclick="App.closeFooterModal()">閉じる</button>
                </div>
            `;
        }
        
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        
        this.initializeKeyTerms();
    }

    /**
     * 重要語句機能の初期化
     */
    initializeKeyTerms() {
        setTimeout(() => {
            this.keyTermsHidden = false;
            const keyTerms = document.querySelectorAll('.wp-key-term');
            
            keyTerms.forEach((term) => {
                term.dataset.individualState = 'visible';
                
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
        if (!this.isContentView) {
            console.log('Not in content view, toggle ignored');
            return;
        }

        const keyTerms = document.querySelectorAll('.wp-key-term');
        const btn = document.getElementById('keyPointToggleBtn');
        
        if (!btn || keyTerms.length === 0) {
            console.log('No key terms found or button missing');
            return;
        }
        
        this.keyTermsHidden = !this.keyTermsHidden;
        
        if (this.keyTermsHidden) {
            keyTerms.forEach((term) => {
                term.classList.add('wp-hidden');
                term.dataset.individualState = 'hidden';
            });
            btn.textContent = '重要語句を表示';
            btn.style.background = '#f44336';
        } else {
            keyTerms.forEach((term) => {
                term.classList.remove('wp-hidden');
                term.dataset.individualState = 'visible';
            });
            btn.textContent = '重要語句を隠す';
            btn.style.background = '#2196f3';
        }
        
        console.log(`Toggled ${keyTerms.length} key terms to ${this.keyTermsHidden ? 'hidden' : 'visible'}`);
    }

    /**
     * カード式科目選択時のイベント（修正版）
     */
    onSubjectChangeCard() {
        const subjectSelect = document.getElementById('keyPointSubjectSelect');
        if (!subjectSelect) {
            console.warn('Subject select not found');
            return;
        }
        
        const chapterCardsArea = document.getElementById('chapterCardsArea');
        const sectionCardsArea = document.getElementById('sectionCardsArea');
        const topicCardsArea = document.getElementById('topicCardsArea');
        const breadcrumb = document.getElementById('selectionBreadcrumb');

        if (!subjectSelect || !chapterCardsArea) {
            console.warn('Required elements not found for card selection');
            return;
        }

        const subjectKey = subjectSelect.value;
        
        // すべての下位選択をリセット
        chapterCardsArea.style.display = 'none';
        sectionCardsArea.style.display = 'none';
        topicCardsArea.style.display = 'none';
        breadcrumb.style.display = 'none';
        this.resetSelectionState();

        if (subjectKey && this.subjects[subjectKey]) {
            chapterCardsArea.style.display = 'block';
            this.renderChapterCards(subjectKey);
            this.updateBreadcrumb();
        }
    }

    /**
     * 選択状態をリセット
     */
    resetSelectionState() {
        this.selectedSubject = null;
        this.selectedChapter = null;
        this.selectedSection = null;
        this.selectedTopic = null;
        this.selectedTopicIndex = null;
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    /**
     * 編カードを描画
     */
    renderChapterCards(subjectKey) {
        const container = document.getElementById('chapterCards');
        if (!container) return;

        const chapters = this.subjects[subjectKey].chapters || {};
        this.selectedSubject = subjectKey;
        
        let html = '';
        Object.entries(chapters).forEach(([chapterName, chapterData]) => {
            const sectionCount = Object.keys(chapterData.sections || {}).length;
            html += `
                <div class="small-selection-card" onclick="KeyPointsModule.selectChapterCard('${chapterName}')">
                    <div class="small-card-title">${chapterName}</div>
                    <div class="small-card-meta">${sectionCount} 節</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * 編を選択
     */
    selectChapterCard(chapterName) {
        this.selectedChapter = chapterName;
        
        // 編カードエリアを非表示にして節カードエリアを表示
        const chapterCardsArea = document.getElementById('chapterCardsArea');
        const sectionCardsArea = document.getElementById('sectionCardsArea');
        const topicCardsArea = document.getElementById('topicCardsArea');
        
        if (chapterCardsArea) chapterCardsArea.style.display = 'none';
        if (sectionCardsArea) sectionCardsArea.style.display = 'block';
        if (topicCardsArea) topicCardsArea.style.display = 'none';
        
        this.renderSectionCards();
        this.updateBreadcrumb();
    }

    /**
     * 節カードを描画
     */
    renderSectionCards() {
        const container = document.getElementById('sectionCards');
        if (!container || !this.selectedSubject || !this.selectedChapter) return;

        const sections = this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections || {};
        
        let html = '';
        Object.entries(sections).forEach(([sectionName, topics]) => {
            html += `
                <div class="small-selection-card" onclick="KeyPointsModule.selectSectionCard('${sectionName}')">
                    <div class="small-card-title">${sectionName}</div>
                    <div class="small-card-meta">${topics.length} 項目</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * 節を選択
     */
    selectSectionCard(sectionName) {
        this.selectedSection = sectionName;
        
        // 節カードエリアを非表示にして項目カードエリアを表示
        const sectionCardsArea = document.getElementById('sectionCardsArea');
        const topicCardsArea = document.getElementById('topicCardsArea');
        
        if (sectionCardsArea) sectionCardsArea.style.display = 'none';
        if (topicCardsArea) topicCardsArea.style.display = 'block';
        
        this.renderTopicCards();
        this.updateBreadcrumb();
    }

    /**
     * 項目カードを描画
     */
    renderTopicCards() {
        const container = document.getElementById('topicCards');
        if (!container || !this.selectedSubject || !this.selectedChapter || !this.selectedSection) return;

        const topics = this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections[this.selectedSection] || [];
        
        let html = '';
        topics.forEach((topic, index) => {
            const difficultyClass = `difficulty-${topic.difficulty.toLowerCase()}`;
            const hasCustomContent = topic.type === 'html' && topic.htmlContent;
            
            html += `
                <div class="small-selection-card topic-card-small" onclick="KeyPointsModule.selectTopicCard('${topic.title}', ${index})">
                    <div class="small-card-title">${topic.title}</div>
                    <div class="small-card-meta">
                        <span class="difficulty-badge ${difficultyClass}">${topic.difficulty}</span>
                        ${hasCustomContent ? '<span class="custom-badge-small">HTML</span>' : '<span class="link-badge-small">Link</span>'}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * 項目を選択
     */
    selectTopicCard(topicTitle, topicIndex) {
        this.selectedTopic = topicTitle;
        this.selectedTopicIndex = topicIndex;
        
        // 選択した項目カードを強調表示
        document.querySelectorAll('#topicCards .small-selection-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.target.closest('.small-selection-card').classList.add('selected');
        
        // 登録ボタンを有効化
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        this.updateBreadcrumb();
    }

    /**
     * パンくずリスト表示を更新
     */
    updateBreadcrumb() {
        const breadcrumbPath = document.getElementById('breadcrumbPath');
        const breadcrumb = document.getElementById('selectionBreadcrumb');
        
        if (!breadcrumbPath || !breadcrumb) return;

        let html = '';
        
        if (this.selectedSubject) {
            const subjectName = this.subjects[this.selectedSubject].name;
            html += `<span class="breadcrumb-item" onclick="KeyPointsModule.goToStep('subject')" style="cursor: pointer; color: #007bff; text-decoration: underline;">${subjectName}</span>`;
            breadcrumb.style.display = 'block';
            
            if (this.selectedChapter) {
                html += ` → <span class="breadcrumb-item" onclick="KeyPointsModule.goToStep('chapter')" style="cursor: pointer; color: #007bff; text-decoration: underline;">${this.selectedChapter}</span>`;
                
                if (this.selectedSection) {
                    html += ` → <span class="breadcrumb-item" onclick="KeyPointsModule.goToStep('section')" style="cursor: pointer; color: #007bff; text-decoration: underline;">${this.selectedSection}</span>`;
                    
                    if (this.selectedTopic) {
                        html += ` → <span class="breadcrumb-item current" style="color: #495057; font-weight: 600;">${this.selectedTopic}</span>`;
                    }
                }
            }
        }
        
        if (html) {
            breadcrumbPath.innerHTML = html;
        } else {
            breadcrumb.style.display = 'none';
        }
    }

    /**
     * パンくずリストから指定の段階に戻る
     */
    goToStep(step) {
        const chapterCardsArea = document.getElementById('chapterCardsArea');
        const sectionCardsArea = document.getElementById('sectionCardsArea');
        const topicCardsArea = document.getElementById('topicCardsArea');
        
        // すべて非表示にする
        if (chapterCardsArea) chapterCardsArea.style.display = 'none';
        if (sectionCardsArea) sectionCardsArea.style.display = 'none';
        if (topicCardsArea) topicCardsArea.style.display = 'none';
        
        // 登録ボタンを無効化
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        
        if (step === 'subject') {
            // 科目選択段階に戻る（編選択を表示）
            this.selectedChapter = null;
            this.selectedSection = null;
            this.selectedTopic = null;
            this.selectedTopicIndex = null;
            
            if (chapterCardsArea) chapterCardsArea.style.display = 'block';
            this.renderChapterCards(this.selectedSubject);
            
        } else if (step === 'chapter') {
            // 編選択段階に戻る（節選択を表示）
            this.selectedSection = null;
            this.selectedTopic = null;
            this.selectedTopicIndex = null;
            
            if (sectionCardsArea) sectionCardsArea.style.display = 'block';
            this.renderSectionCards();
            
        } else if (step === 'section') {
            // 節選択段階に戻る（項目選択を表示）
            this.selectedTopic = null;
            this.selectedTopicIndex = null;
            
            if (topicCardsArea) topicCardsArea.style.display = 'block';
            this.renderTopicCards();
        }
        
        this.updateBreadcrumb();
    }

    /**
     * カード選択式の項目追加（Firebase統合版）
     */
    handleAddHierarchyItemCard() {
        const titleInput = document.getElementById('keyPointTitle');
        const htmlInput = document.getElementById('keyPointHtml');

        if (!titleInput || !htmlInput) {
            alert('必要な項目を入力してください');
            return;
        }

        const title = titleInput.value.trim();
        const htmlContent = htmlInput.value.trim();

        if (!this.selectedSubject || !this.selectedChapter || !this.selectedSection || this.selectedTopicIndex === null) {
            alert('すべての階層を選択してください');
            return;
        }

        if (!title || !htmlContent) {
            alert('タイトルとHTML内容を入力してください');
            return;
        }

        // 該当する項目を取得して更新
        if (this.subjects[this.selectedSubject] && 
            this.subjects[this.selectedSubject].chapters[this.selectedChapter] && 
            this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections[this.selectedSection] && 
            this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections[this.selectedSection][this.selectedTopicIndex]) {
            
            // 項目をHTMLコンテンツ付きで更新
            this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections[this.selectedSection][this.selectedTopicIndex] = {
                ...this.subjects[this.selectedSubject].chapters[this.selectedChapter].sections[this.selectedSection][this.selectedTopicIndex],
                title: title,
                htmlContent: htmlContent,
                type: 'html'
            };

            // Firebase統合保存
            this.saveKeyPointsData();

            // フォームをクリア
            titleInput.value = '';
            htmlInput.value = '';
            
            // 選択をリセット
            const subjectSelect = document.getElementById('keyPointSubjectSelect');
            if (subjectSelect) {
                subjectSelect.value = '';
                this.onSubjectChangeCard();
            }

            // 登録済みリストを更新
            const listContainer = document.getElementById('keyPointsList');
            if (listContainer) {
                listContainer.innerHTML = this.renderKeyPointsList();
            }

            alert('要点まとめを登録しました！該当項目をクリックすると表示されます。');
        } else {
            alert('選択した項目が見つかりません');
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
                                        path: `${chapterName} → ${sectionName}`,
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
                html += `<h5 style="color: #2d3748; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #e2e8f0;">${subject.name} (${customItems.length}項目)</h5>`;
                
                customItems.forEach(item => {
                    html += `
                        <div class="delete-list-item" style="background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; transition: all 0.3s;">
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: #2d3748;">
                                    📄 ${item.title}
                                </div>
                                <div style="font-size: 12px; color: var(--gray); margin-top: 5px;">
                                    📍 ${item.path}
                                </div>
                            </div>
                            <button class="delete-btn" 
                                    onclick="KeyPointsModule.deleteHierarchyItem('${item.subjectKey}', '${item.chapterName}', '${item.sectionName}', ${item.topicIndex})"
                                    style="background: #ef4444; font-size: 12px;">
                                削除
                            </button>
                        </div>
                    `;
                });
            }
        });
        
        if (!html) {
            html = '<div style="text-align: center; padding: 30px; color: var(--gray); background: #f8f9fa; border-radius: 8px;"><p>📝 登録済み要点がありません</p><p style="font-size: 14px;">上のフォームから要点を追加してください</p></div>';
        }
        
        return html;
    }

    /**
     * 階層項目削除（Firebase統合版）
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

                // Firebase統合保存
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
                border: 1px solid #fc8181 !important;
            }
            
            .difficulty-b {
                background: #feebc8 !important;
                color: #dd6b20 !important;
                border: 1px solid #f6ad55 !important;
            }
            
            .difficulty-c {
                background: #c6f6d5 !important;
                color: #38a169 !important;
                border: 1px solid #68d391 !important;
            }

            .topic-card:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }

            /* 重要語句のスタイル */
            .wp-key-term {
                display: inline !important;
                text-decoration: none !important;
                border: none !important;
                outline: none !important;
                padding: 2px 6px !important;
                margin: 0 1px !important;
                color: #d32f2f !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border-radius: 4px !important;
                transition: all 0.3s ease !important;
                background: rgba(211, 47, 47, 0.1) !important;
            }
            
            .wp-key-term:hover {
                background: rgba(211, 47, 47, 0.2) !important;
                transform: scale(1.05) !important;
            }
            
            .wp-key-term.wp-hidden {
                background: repeating-linear-gradient(
                    45deg,
                    #e8e8e8,
                    #e8e8e8 2px,
                    #d0d0d0 2px,
                    #d0d0d0 4px
                ) !important;
                color: transparent !important;
                text-shadow: none !important;
                border: 1px solid #ccc !important;
            }
            
            .wp-key-term.wp-hidden:hover {
                background: repeating-linear-gradient(
                    45deg,
                    #f0f0f0,
                    #f0f0f0 2px,
                    #d8d8d8 2px,
                    #d8d8d8 4px
                ) !important;
                transform: scale(1.02) !important;
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
                transform: translateY(-2px) !important;
            }

            /* 3列固定（モバイルでも） */
            .subject-grid-fixed {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 12px !important;
            }

            /* カード選択式スタイル（小さなカード版） */
            .small-card-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin: 15px 0;
            }

            .small-selection-card {
                background: white;
                border: 2px solid var(--light);
                border-radius: 8px;
                padding: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-height: 55px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
                position: relative;
            }

            .small-selection-card:hover {
                border-color: var(--secondary);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
                transform: translateY(-2px);
            }

            .small-selection-card.selected {
                border-color: var(--primary);
                background: linear-gradient(135deg, rgba(44, 62, 80, 0.08), rgba(52, 152, 219, 0.08));
                box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
                transform: translateY(-1px);
            }

            .small-card-title {
                font-weight: 600;
                font-size: 12px;
                margin-bottom: 4px;
                line-height: 1.2;
                color: var(--dark);
            }

            .small-card-meta {
                font-size: 10px;
                color: var(--gray);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                flex-wrap: wrap;
            }

            .topic-card-small .small-card-meta {
                flex-direction: column;
                gap: 2px;
            }

            .custom-badge-small {
                background: linear-gradient(135deg, #4caf50, #66bb6a);
                color: white;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 8px;
                font-weight: bold;
            }

            .link-badge-small {
                background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
                color: white;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 8px;
                font-weight: bold;
            }

            /* パンくずリストのスタイル */
            .breadcrumb-item {
                transition: all 0.2s ease;
            }

            .breadcrumb-item:hover {
                color: #0056b3 !important;
                background: rgba(0, 123, 255, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
            }

            .breadcrumb-item.current {
                background: rgba(73, 80, 87, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
            }

            @media (max-width: 768px) {
                .small-card-grid {
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                }
                
                .subject-grid-fixed {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 10px !important;
                }

                .small-selection-card {
                    padding: 7px;
                    min-height: 50px;
                }

                .small-card-title {
                    font-size: 11px;
                }

                .small-card-meta {
                    font-size: 9px;
                }

                .topic-grid {
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
                    gap: 8px !important;
                }
            }

            @media (max-width: 480px) {
                .small-card-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 5px;
                }
                
                .subject-grid-fixed {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 8px !important;
                }

                .small-selection-card {
                    padding: 6px;
                    min-height: 45px;
                }

                .small-card-title {
                    font-size: 10px;
                }

                .small-card-meta {
                    font-size: 8px;
                }

                .topic-grid {
                    grid-template-columns: 1fr !important;
                    gap: 8px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// グローバルに公開
window.KeyPointsModule = new KeyPointsModuleClass();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    KeyPointsModule.initialize();
});

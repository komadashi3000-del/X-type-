// X-TYPE 診断テスト: 質問・採点・結果解説の一元管理
(() => {
  const STORAGE_KEY = "xtype-test-state-v1";
  const HISTORY_STORAGE_KEY = "xtype-test-history-v1";
  const CREATOR_PASSCODE = "xtype-creator-2026";

  const OPTIONS = [
    { label: "はい", value: 2 },
    { label: "ややはい", value: 1 },
    { label: "どちらも", value: 0.5 },
    { label: "どちらでもない", value: 0 },
    { label: "ややいいえ", value: -1 },
    { label: "いいえ", value: -2 }
  ];

  const sectionConfigs = [
    { id: "AFN", title: "セクション1: AFN（15問）", description: "愛情型・友情型・中立型の傾向を見ます。", start: 1, end: 15 },
    { id: "DS", title: "セクション2: D/S（20問）", description: "汎用型と没頭型の傾向を見ます。", start: 16, end: 35 },
    { id: "OI", title: "セクション3: O/I（20問）", description: "集団型と個人型の傾向を見ます。", start: 36, end: 55 },
    { id: "RS", title: "セクション4: R/S（20問）", description: "体得型と習得型の傾向を見ます。", start: 56, end: 75 },
    { id: "AE", title: "セクション5: A/E（25問）", description: "外へ開く方向と内へ深める方向を見ます。", start: 76, end: 100 }
  ];

  const officialNameMap = {
    "A-DOR": "勇者", "A-DOS": "先導者", "A-DIR": "人情家", "A-DIS": "教師", "A-SOR": "守護者", "A-SOS": "指揮者", "A-SIR": "探検家", "A-SIS": "研究者",
    "F-DOR": "立会人", "F-DOS": "調律師", "F-DIR": "案内人", "F-DIS": "調停者", "F-SOR": "立役者", "F-SOS": "監督", "F-SIR": "革新家", "F-SIS": "開発者",
    "N-DOR": "批評家", "N-DOS": "是正者", "N-DIR": "観察家", "N-DIS": "書記官", "N-SOR": "裁判官", "N-SOS": "設計士", "N-SIR": "分析官", "N-SIS": "哲学者"
  };

  const firstCharSummary = {
    A: "真摯に、深く、一対一で向き合う型",
    F: "ラフに、広く、みんなと繋がる型",
    N: "冷静に、距離感と構造を見て判断する型"
  };

  const tailSummary = {
    A: "外へ開く、与える、表に出す方向",
    E: "内に深める、自分を軸にする、静かに積み上げる方向"
  };

  const axisDescriptions = {
    AFN: {
      title: "AFN｜関わり方の軸",
      intro: "人とどう関わるかの土台。X-TYPEの中で最も“温度”が出る軸。",
      items: [
        { key: "A", label: "Affection｜愛情型", summary: "真摯に、深く、一対一で向き合う型。", body: "人との関係を広さより濃さで見る。", strengths: ["深い信頼関係を築きやすい", "相手に誠実", "責任感がある", "一対一の関係で強い"], weaknesses: ["情で動きすぎることがある", "抱え込みやすい", "距離が近くなりすぎることがある", "好き嫌いが判断に混ざりやすい"] },
        { key: "F", label: "Fraternity｜友情型", summary: "ラフに、広く、みんなと繋がる型。", body: "人間関係を流れや空気で捉える。", strengths: ["親しみやすい", "空気を柔らかくできる", "人脈や場づくりに強い", "関係を軽やかに広げられる"], weaknesses: ["深い責任関係は重く感じやすい", "距離感が浅く見えることがある", "八方美人に見られることがある", "場を優先しすぎて自分の本音が薄れることがある"] },
        { key: "N", label: "Neutral｜中立型", summary: "冷静に、距離感と構造を見て判断する型。", body: "感情より構造や状況を先に見る。", strengths: ["客観性がある", "状況判断に強い", "感情の波に巻かれにくい", "冷静な調整や分析が得意"], weaknesses: ["冷たく見られやすい", "感情面での共感が薄く見えることがある", "距離を置きすぎることがある", "人間関係の温度に鈍い時がある"] }
      ]
    },
    DS: {
      title: "D/S｜行動スタイルの軸",
      intro: "どう動くか、どこに集中するかを見る軸。",
      items: [
        { key: "D", label: "Dexterity｜汎用型", summary: "器用で、柔軟で、切り替えが早い型。", strengths: ["柔軟性", "マルチタスク", "順応力", "役割変更への強さ"], weaknesses: ["深掘りが浅くなりやすい", "一点特化ではS型に負けやすい", "自分の核が見えにくくなることがある", "なんでもできるが何者か分からなくなりやすい"] },
        { key: "S", label: "Speciality｜没頭型", summary: "深く入り、一点集中し、こだわりを磨く型。", strengths: ["集中力", "専門性", "没入", "こだわりの強さ"], weaknesses: ["視野が狭くなりやすい", "切り替えが苦手", "興味がないことへの消耗が激しい", "柔軟性を失うと頑固に見える"] }
      ]
    },
    OI: {
      title: "O/I｜社会性の軸",
      intro: "どこで本領が出るかを見る軸。",
      items: [
        { key: "O", label: "Organization｜集団型", summary: "組織、チーム、場の中で力を発揮する型。", strengths: ["協働", "チーム内役割", "共同作業", "場づくり"], weaknesses: ["一人の時間が薄くなると疲れることがある", "組織への適応を優先しすぎることがある", "自分の輪郭が曖昧になる場合がある"] },
        { key: "I", label: "Individual｜個人型", summary: "個人、自分の領域、自分のペースで動く型。", strengths: ["自立心", "マイペース", "個人戦での強さ", "自分の方法を持ちやすい"], weaknesses: ["協調でストレスが溜まりやすい", "集団に馴染みにくいことがある", "自分の流儀を守りすぎる場合がある", "周囲から孤立して見えることがある"] }
      ]
    },
    RS: {
      title: "R/S｜学び方の軸",
      intro: "どう学ぶか、どう理解するかを見る軸。",
      items: [
        { key: "R", label: "Realization｜体得型", summary: "経験して、感じて、身体で覚える型。", strengths: ["実践力", "現場理解", "直感", "体験からの吸収"], weaknesses: ["理屈の整理が後回しになりやすい", "失敗して学ぶぶん遠回りすることがある", "理論説明に弱いことがある"] },
        { key: "St", label: "Study｜習得型", summary: "理解して、整理して、積み上げて覚える型。", strengths: ["整理力", "理解力", "体系化", "再現性の高い学習"], weaknesses: ["動き出しが遅くなることがある", "分かった気になりやすい", "現場経験が不足すると机上化しやすい"] }
      ]
    },
    AE: {
      title: "A/E｜方向性の軸",
      intro: "エネルギーの向き、仕上がりの方向を見る軸。",
      items: [
        { key: "A", label: "Altruistic｜外向寄り", summary: "外へ開く、与える、表に出す方向。" },
        { key: "E", label: "Egotistic｜内向寄り", summary: "内に深める、自分を軸にする、静かに積み上げる方向。" }
      ]
    }
  };

  const typeDescriptions = {
    "A-DOR": { name: "勇者", short: "愛情が行動力に直結する、前線型の実践者。", core: "愛情がそのまま行動力になるタイプ。守りたいもの、大事なもの、信じたい人がいると強くなる。心を原動力にして前へ出る人。", strengths: ["緊急時や危機時に強い", "誰かのために本気を出せる", "行動が早い", "人を引っ張る実践力がある"], weaknesses: ["情で無理をする", "自己犠牲に寄りやすい", "視野が狭まりやすい", "勢いで抱え込みやすい"], relations: "人に対して誠実で、守るべき対象ができた時の強さが大きい。", roles: ["前線", "現場責任者", "危機対応役", "誰かを守る立場"], depth: "見捨てたくない。ちゃんと守りたい。" },
    "A-DOS": { name: "先導者", short: "人をより良い方向へ導く、誠実なナビゲーター。", core: "人に真摯に向き合いながら、方向を示すタイプ。ただ優しいだけでなく、相手をより良い方向へ進ませたい。", strengths: ["教える力", "人を導く言葉", "集団を前に進める", "感情と理屈の橋渡し"], weaknesses: ["世話焼きになりやすい", "相手のためを思いすぎる", "正しい導き方にこだわる", "責任感で消耗しやすい"], relations: "その人のためになる形で関わろうとする。甘やかすより育てる。", roles: ["教育", "指導", "ナビゲーター", "リーダー補佐"], depth: "良い方向へ連れていきたい。" },
    "A-DIR": { name: "人情家", short: "情で人に向き合い、個人単位で深く尽くすタイプ。", core: "理屈ではなく情で人を見る。集団全体よりも目の前の誰か一人に対して濃くなりやすい。", strengths: ["温かい", "個別の相手への寄り添いが深い", "反応に敏感", "情のある世話ができる"], weaknesses: ["情で判断が揺れやすい", "依怙贔屓になりやすい", "関係を切れない", "特定の相手に偏りやすい"], relations: "この人だと思うとかなり深い。関心が向かない相手には熱が出にくい。", roles: ["個別支援", "世話役", "現場対応", "身近な人のサポート"], depth: "その人が大事だから動く。" },
    "A-DIS": { name: "教師", short: "理解し、整理し、伝えることで相手を支えるタイプ。", core: "相手を理解し、整理し、分かる形で伝える。愛情が知性と結びついている。", strengths: ["説明力", "理解力", "一対一の対話", "人を落ち着かせる言葉"], weaknesses: ["理解したつもりになりやすい", "整理を優先しすぎることがある", "導く側に立ちやすい", "説教くさくなることがある"], relations: "感情に飲まれず、でも冷たくない。相談相手として優秀。", roles: ["教師", "カウンセラー", "コーチ", "言語化役"], depth: "分かれば、きっと救える。" },
    "A-SOR": { name: "守護者", short: "守ると決めた対象に強く忠実な防衛型。", core: "愛情が防衛本能として出やすい。守ると決めた対象への忠義が濃い。", strengths: ["忠誠心", "責任感", "継続的な守り", "困難時の安定感"], weaknesses: ["頑固", "排他的になりやすい", "理想の守り方に固執しやすい", "柔軟性が不足することがある"], relations: "誰とでも仲良くではないが、大事なものには非常に強い。", roles: ["守備", "後衛", "継続管理", "組織防衛"], depth: "失わせたくない。" },
    "A-SOS": { name: "指揮者", short: "感情と場の流れを読み、全体を一つにまとめるタイプ。", core: "人の感情、場の流れ、関係の温度を読み取り、それを一つの響きにまとめようとする。", strengths: ["全体の空気を読む力", "表現力", "統率力", "感情の流れを整える能力"], weaknesses: ["理想の空気にこだわりやすい", "人のズレに疲れやすい", "コントロール欲が強く見えることがある", "完成度を優先しすぎることがある"], relations: "関係や場そのものを美しくしたい気持ちが強い。", roles: ["指揮", "演出", "感情統率", "チームの空気設計"], depth: "バラバラじゃなく、ひとつの響きにしたい。" },
    "A-SIR": { name: "探検家", short: "好きなものへ自ら飛び込み、体験で確かめる情熱家。", core: "愛情も好奇心も、自分で飛び込んで確かめたいタイプ。", strengths: ["行動力", "熱量", "好奇心", "実感による理解"], weaknesses: ["衝動性", "周囲が見えなくなる", "気分の波が出やすい", "一貫性が弱く見えることがある"], relations: "好きな人やものに対して距離を縮めやすい。推測より体験。", roles: ["挑戦", "現場体験", "新規体験の先頭", "実地調査"], depth: "自分の感覚で確かめたい。" },
    "A-SIS": { name: "研究者", short: "愛を理解と探究の形で深める、一途な深掘り型。", core: "深い愛情を静かに、長く、理解の形で積み上げるタイプ。", strengths: ["一途さ", "深い理解", "集中力", "長期的な探究"], weaknesses: ["動き出しが遅い", "外から熱が見えにくい", "考えすぎて機会を逃しやすい", "内に籠もりやすい"], relations: "広く浅くではなく、狭く深く。表面は静かでも内側の熱量は高い。", roles: ["研究", "深掘り", "長期制作", "個別探究"], depth: "ちゃんと知りたい。深く、長く。" },
    "F-DOR": { name: "立会人", short: "場に立ち会い、その場の成立を支える柔軟な橋渡し役。", core: "その場に居合わせ、空気や関係を見ながら動くタイプ。", strengths: ["空気を読む", "柔軟な判断", "橋渡し", "場の維持"], weaknesses: ["自分の立場が曖昧になりやすい", "中立でいることに疲れやすい", "八方美人に見られることがある"], relations: "その場で必要な距離を取れるため、複数人の場で強い。", roles: ["現場立会い", "仲介", "接続役", "場の緩衝材"], depth: "場が成立しているかが気になる。" },
    "F-DOS": { name: "調律師", short: "空気や人間関係のズレを整える、集団チューニング型。", core: "場のズレや人の噛み合わなさを見つけ、それを整えるタイプ。", strengths: ["雰囲気調整", "共有力", "伝達のうまさ", "集団のチューニング"], weaknesses: ["周囲に合わせすぎやすい", "自分を後回しにしやすい", "全員を整えようとしすぎる"], relations: "全体の調子が揃っていることに安心を覚える。", roles: ["調整", "進行補助", "ファシリテーション", "チーム内の緩衝"], depth: "みんなの調子が揃ってると安心する。" },
    "F-DIR": { name: "案内人", short: "気さくで自然に人を連れていける同行型サポーター。", core: "人を軽やかに導く。強く引っ張るのではなく、横に並んで進ませる。", strengths: ["親しみやすい", "導線づくり", "相手を緊張させにくい", "動きながら支えられる"], weaknesses: ["軽く見られやすい", "自分の本音を見せにくい", "支え役に固定されやすい"], relations: "初心者や不安な相手にかなり強い。", roles: ["案内", "接客", "同行サポート", "導入役"], depth: "分からないままにさせたくない。" },
    "F-DIS": { name: "調停者", short: "言葉と理解で関係の摩擦を和らげる話しやすい調整役。", core: "人と人の間に入り、ズレや摩擦を和らげるタイプ。", strengths: ["話しやすさ", "和らげる力", "気持ちの整理", "関係のクッション"], weaknesses: ["深刻なものを抱え込みやすい", "丸く収めることを優先しすぎる", "自分の意思が薄く見えることがある"], relations: "揉めた後より、揉める前の調整に強い。", roles: ["調停", "相談", "関係の緩和", "小集団の安定化"], depth: "壊れなくて済むなら、その方がいい。" },
    "F-SOR": { name: "立役者", short: "その場に熱を生み、空気を動かす中心的存在。", core: "自分がいることで場に火がつく。空気を動かすタイプ。", strengths: ["熱量", "引力", "ムード形成", "勢いづけ"], weaknesses: ["ムラが出やすい", "盛り上げ役に固定される", "自分が落ちると場も落ちやすい"], relations: "いるだけで場が動きやすくなる。", roles: ["中心人物", "ムードメーカー", "現場リーダー", "実演役"], depth: "動いている場が好きだ。" },
    "F-SOS": { name: "監督", short: "場と人を配置し、全体の完成度を引き上げる統制者。", core: "場を読み、全体を整え、完成度を上げるタイプ。", strengths: ["全体を見る目", "人の配置", "演出", "完成度へのこだわり"], weaknesses: ["采配疲れしやすい", "理想の仕上がりに固執しやすい", "人への要求が強く見えることがある"], relations: "仲良くするだけではなく、どうすればもっと良くなるかを考える。", roles: ["監督", "ディレクション", "企画運営", "チームの完成度管理"], depth: "もっと良い形にできるはずだ。" },
    "F-SIR": { name: "革新家", short: "人を巻き込みながら新しい流れを起こす変化の起点。", core: "新しい流れを起こしたい人。友情型の巻き込み力と没頭型の熱量がある。", strengths: ["発想力", "推進力", "挑戦性", "変化を起こす力"], weaknesses: ["落ち着きがないと見られやすい", "飽きやすい", "周囲との温度差が出やすい", "既存の枠に馴染みにくい"], relations: "平穏な関係維持より、新しい刺激に価値を感じやすい。", roles: ["新規開発", "改革", "実験企画", "変化の起点"], depth: "まだ見たことのないものを起こしたい。" },
    "F-SIS": { name: "開発者", short: "人と繋がりながら専門性を形にしていく実装型の友人。", core: "人と繋がりながら、自分の知識や専門性を形にしていくタイプ。", strengths: ["実装力", "専門知識", "知識共有", "改善と開発"], weaknesses: ["こだわりが見えにくい", "一人で抱え込みやすい", "軽く見られることがある"], relations: "人との繋がりを通して知識を活かし、形にして返す。", roles: ["開発", "改良", "実装", "知識の具体化"], depth: "ちゃんと形にしたい。" },
    "N-DOR": { name: "批評家", short: "現場感のある視点で価値を見抜き、言語化する評価者。", core: "中立の立場から、見たもの・経験したものをもとに集団や対象を評価し位置づける。", strengths: ["評価軸がある", "言語化が上手い", "客観性", "現場感のある批評"], weaknesses: ["厳しく見えやすい", "値踏みしているように見られることがある", "共感より分析が前に出やすい"], relations: "何が良くて何が足りないかをよく見抜く。", roles: ["批評", "評価", "品評", "審査"], depth: "これはどういう価値を持っているのか。" },
    "N-DOS": { name: "是正者", short: "歪みやズレを見つけ、正しい位置に戻す実務型修正者。", core: "歪みやズレを見つけ、それを正常な形へ戻そうとするタイプ。", strengths: ["問題発見力", "修正能力", "正常化", "秩序回復"], weaknesses: ["厳格すぎると見られやすい", "間違いに敏感すぎる", "柔らかい感情ケアは後回しになりやすい"], relations: "人よりも状態を見る。必要な修正に強い。", roles: ["是正", "改善", "バランス修正", "品質管理"], depth: "このままでは整っていない。" },
    "N-DIR": { name: "観察家", short: "距離を保ちながら変化や反応を見抜く静かな読み手。", core: "距離を取りながらもかなりよく見ている。反応と変化を見抜く。", strengths: ["観察力", "変化検知", "状況把握", "感情を挟まず見られる"], weaknesses: ["受け身に見える", "分かっていても言わないことがある", "冷たく見られやすい"], relations: "近すぎないが、見ていないわけではない。", roles: ["観察", "読み", "見守り", "必要時の介入"], depth: "今、何が起きているかを知りたい。" },
    "N-DIS": { name: "書記官", short: "事実や経緯を正確に記し、整理し、残す記録者。", core: "出来事や情報を正確に記し、整え、残すタイプ。", strengths: ["記録", "正確性", "情報整理", "文書化"], weaknesses: ["感情に弱い", "公平さを優先しすぎて冷たく見えることがある", "残すことに集中して動きが遅れることがある"], relations: "曖昧さを減らし、物事を正確に残すという意味で信頼されやすい。", roles: ["書記", "記録管理", "文書作成", "履歴管理"], depth: "残っていなければ、曖昧になる。" },
    "N-SOR": { name: "裁判官", short: "原則と秩序を現実に適用する、強い判断者。", core: "原則と秩序を現実に適用するタイプ。知っているだけではなく、それを通す強さがある。", strengths: ["判断力", "厳格さ", "一貫性", "秩序維持"], weaknesses: ["硬い", "頑固", "人情より規則を優先しがち", "威圧感が出やすい"], relations: "人の感情に流されにくい。ブレない。", roles: ["判定", "秩序維持", "執行", "規則適用"], depth: "基準は守られなければならない。" },
    "N-SOS": { name: "設計士", short: "構造・制度・配置を考え、全体の骨組みを作る人。", core: "構造、制度、配置、骨組みを作るタイプ。仕組みとしてどう成立するかを見る。", strengths: ["設計力", "全体把握", "構造理解", "長期的視点"], weaknesses: ["感情面を軽視しやすい", "完璧主義になりやすい", "現場の勢いとズレやすい"], relations: "人そのものより、人がどう動くかの仕組みを見る。", roles: ["制度設計", "システム設計", "構造構築", "人員配置"], depth: "美しい構造には無駄がない。" },
    "N-SIR": { name: "分析官", short: "現実に即した理を作る、切り分けと見抜きの専門家。", core: "物事を分け、見抜き、現実に即した理を作るタイプ。", strengths: ["分析", "問題切り分け", "現実的理解", "見抜く力"], weaknesses: ["疑い深くなりやすい", "温度が低く見えやすい", "解体しすぎて全体の熱を失うことがある"], relations: "感情よりロジック、勢いより構造。", roles: ["分析", "現状把握", "問題分解", "改善前の診断"], depth: "どういう仕組みでこうなっているのか。" },
    "N-SIS": { name: "哲学者", short: "知を掘り続け、問いの根本に向かう静かな探究者。", core: "知を掘り続ける人。答えよりも問いの深さを大事にする。", strengths: ["思索", "深度", "概念整理", "存在や意味への問い"], weaknesses: ["現実から離れやすい", "動き出しが遅い", "周囲には分かりにくい", "深掘りしすぎて出口を失いやすい"], relations: "外には静かだが、内側ではかなり濃い。", roles: ["哲学", "理論構築", "概念設計", "深度のある研究"], depth: "そもそも、それは何なのか。" }
  };

  const deepReadingSections = [
    { title: "同じA群でも、DとSで全然違う", body: "同じ愛情型でも、A-DORは「愛で動く」のに対し、A-SISは「愛を深く考える」。X-TYPEは同じ感情の種類でも、その出方の違いを読む体系である。" },
    { title: "OとIは社交性ではなく、本領の出る場所", body: "Oだから明るい、Iだから暗い、ではない。Oは人の流れの中で本領が出る。Iは自分の領域で本領が出る。X-TYPEのO/Iは、社交性の多寡ではなく、どこで最も自然に力が出るかを示している。" },
    { title: "RとStudyは賢さの種類の違い", body: "Rが脳筋でStudyが頭脳派、ということではない。Rは現場で賢い。Studyは構造で賢い。どちらも知性だが、知性の出る場所が違う。" },
    { title: "A/Eは外向内向ではなく、エネルギーの向き", body: "A/Eは性格の本体ではなく仕上がりの方向性である。同じA-SISでも、A-SISAは外へ研究熱を共有しやすく、A-SISEは内へ深く積みやすい。これは表現方向の差である。" }
  ];

  const questionTexts = [
    "一対一で深く向き合う時間に満足を感じる。","どんな場でもすぐ輪に入りフラットに話せる。","感情に流されず公平な距離感を保つ方だ。","相手の心情を汲み取り寄り添うことを優先する。","ラフな冗談と軽いノリで関係を温めるのが得意だ。","誰に対しても同じ原則で接するよう努める。","大切な人とは密度の高い関係を築きたい。","初対面でも広く友達になれる自信がある。","相手との距離を適切に取り直せる。","親密な約束や節目を大事にする。","集まりの雰囲気を軽く明るくする役回りが多い。","状況のバランスを見て個人感情を抑えられる。","一人を丁寧に支える方が性に合う。","気軽な関係を多めに持っていたい。","原則に反しても情だけでは動かない。",
    "何をするにも、その場の状況に合わせてやり方を変える方だ。","一つのことを始めると、時間を忘れて没頭してしまう。","複数の作業を並行してそつなく回せる。","興味を持ったことは、とことん突き詰めないと気が済まない。","新しい環境や人に慣れるのは早い方だ。","一度好きになったことは、飽きても完全には離れられない。","その場の空気を読んで動くのが得意だ。","物事を深く考え込みすぎて、時間を忘れることがある。","状況に応じて行動を切り替えるのが自然にできる。","自分の世界に入り込み、他人の声が聞こえなくなることがある。","環境や人間関係が変わっても、すぐに順応できる。","得意な分野では、誰にも負けたくないと思う。","予定が変わっても、特に動揺はしない。","興味のあることに集中している時、周囲のことを完全に忘れる。","求められた役割に合わせて、自分を調整するのが上手い。","ひとつのテーマを何年もかけて磨くことが好きだ。","その場のノリや即興で動くことが多い。","自分のこだわりを貫くことに喜びを感じる。","柔軟さを失うより、深さを失う方が怖い。","変化に対応する方が得意か、集中し続ける方が得意かといえば前者だ。",
    "チームやグループの中にいると安心する。","一人の時間がないと落ち着かない。","誰かと一緒に行動した方がモチベーションが上がる。","自分のペースで動ける環境が最も成果を出せる。","仲間の成功を自分のことのように喜べる。","周囲の期待より、自分の満足を優先したい。","集団で意見をまとめる作業は得意だと思う。","意見が違っても、譲らず自分の考えを貫きたい。","周囲の雰囲気を壊さないように発言を選ぶ。","他人に合わせすぎると、自分を見失う気がする。","チームのためなら、自分の役割を変えることもできる。","成果を他人と分け合うより、自分で完結させたい。","会議や議論の場では、みんなの意見を聞いて調整する。","自分の考えを理解してくれる人だけいれば十分だ。","「みんなでやる」が好きな言葉だ。","他人のペースに合わせるのはストレスになる。","組織やルールに従うのは大切なことだと思う。","結果よりも、自分のやり方でやり遂げた満足感を重視する。","周囲と協力して進める方が安心する。","他人と関わるより、自分の時間を優先したい。",
    "行動してみないと理解できないことが多い。","まず試してみてから考えるタイプだ。","新しいことを始める時、理屈より感覚を信じる。","頭で理解してから動く方が安心する。","経験を通して身につけるのが得意だ。","計画を立ててから行動する方が性に合う。","やってみるうちにコツを掴むタイプだ。","理論や手順を覚えてからでないと不安になる。","体で覚えることの方が長く身につく。","資料や説明書を読むのが好きだ。","実際の現場に立ってこそ本質が見えると思う。","人の話よりも、自分の経験を信じる。","情報を整理して理解するのが得意だ。","感覚的に理解する方が早い。","知識を積み重ねる過程に楽しさを感じる。","直感で判断してもうまくいくことが多い。","理論的な説明がないと納得しづらい。","体験して初めて納得できる。","理解より行動を優先する。","行動より理解を優先する。",
    "思いつきをまず外に出して場を動かす。","他人のためなら段取りを肩代わりできる。","ひとまず自分の基準で静かに判断してから動く。","公に出す前に内側で十分に練る。","人に見せない努力時間を確保してから勝負する。","自分の考えや感情は、比較的すぐ表に出る方だ。","思いつきは内で練り込んでから出したい。","自分より相手の必要に手を伸ばしやすい。","自分の基準に沿って優先順位を決める方だ。","情報や知見は積極的に共有したい。","情報や知見は必要な時に的確に出す方が好きだ。","周囲を巻き込んで加速させるのが得意だ。","一人でも進められる仕組みを作るのが得意だ。","公の場で振る舞うとエネルギーが湧く。","閉じた環境で集中した方が力が出る。","他者の成功を後押しすると満足する。","自分の成長曲線を静かに磨くと満足する。","困っている人に自然と声をかける。","声をかける前に状況と自分の余力を測る。","チームに貢献すると自分も引き上がる。","自分が整えば周囲にも良い影響が出ると思う。","まず場を温めてから本題に入る。","まず核心を固めてから場に出す。","人前での発表や議論を楽しめる。","少人数または非公開の環境を好む。"
  ];

  const labels = [
    ..."AFNAFNAFNAFNAFN".split(""),
    ..."DSDSDSDSDSDSDSDSDSDS".split(""),
    ..."OIOIOIOIOIOIOIOIOIOI".split(""),
    ...["R", "St", "R", "St", "R", "St", "R", "St", "R", "St", "R", "St", "R", "St", "R", "St", "R", "St", "R", "St"],
    ...["A", "A", "E", "E", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E", "A", "E"]
  ];

  const questions = questionTexts.map((text, i) => ({ id: i + 1, text, label: labels[i] }));
  const state = loadState();

  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const sectionTitle = document.getElementById("section-title");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const progressBar = document.querySelector(".progress-bar");
  const quizTitle = document.getElementById("quiz-title");
  const quizDescription = document.getElementById("quiz-description");
  const form = document.getElementById("questions-form");
  const resultSlides = [...document.querySelectorAll("[data-slide]")];
  const resultPrevBtn = document.getElementById("result-prev-btn");
  const resultNextBtn = document.getElementById("result-next-btn");
  const resultPageIndicator = document.getElementById("result-page-indicator");
  const respondentNameInput = document.getElementById("respondent-name");
  const respondentBirthInput = document.getElementById("respondent-birthdate");
  const respondentGenderInput = document.getElementById("respondent-gender");
  const openAdminBtn = document.getElementById("open-admin-btn");
  const creatorPasscodeInput = document.getElementById("creator-passcode");
  let currentResultSlide = 0;

  document.getElementById("start-btn").addEventListener("click", () => {
    const profile = collectRespondentProfile();
    if (!profile) return;
    state.profile = profile;
    saveState();
    showQuiz();
    renderSection();
  });
  document.getElementById("next-btn").addEventListener("click", handleNext);
  document.getElementById("prev-btn").addEventListener("click", handlePrev);
  document.getElementById("retry-btn").addEventListener("click", () => {
    state.currentSection = 0;
    saveState();
    showQuiz();
    renderSection();
  });
  document.getElementById("reset-btn").addEventListener("click", resetAll);
  openAdminBtn.addEventListener("click", renderCreatorData);
  resultPrevBtn.addEventListener("click", () => moveResultSlide(-1));
  resultNextBtn.addEventListener("click", () => moveResultSlide(1));

  syncProfileInputs();
  if (state.completed) showResults();

  function renderSection() {
    const section = sectionConfigs[state.currentSection];
    const sectionQuestions = questions.filter((q) => q.id >= section.start && q.id <= section.end);
    sectionTitle.textContent = section.title;
    quizTitle.textContent = section.title;
    quizDescription.textContent = section.description;
    updateProgress();

    form.innerHTML = "";
    sectionQuestions.forEach((q) => {
      const wrapper = document.createElement("article");
      wrapper.className = "question";
      const title = document.createElement("p");
      title.innerHTML = `<strong>Q${q.id}.</strong> ${q.text}`;
      const options = document.createElement("div");
      options.className = "options";

      OPTIONS.forEach((opt) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q-${q.id}`;
        input.value = String(opt.value);
        input.checked = state.answers[q.id] === opt.value;
        input.addEventListener("change", () => {
          state.answers[q.id] = opt.value;
          saveState();
          updateProgress();
        });
        label.append(input, document.createTextNode(opt.label));
        options.appendChild(label);
      });

      wrapper.append(title, options);
      form.appendChild(wrapper);
    });

    document.getElementById("prev-btn").disabled = state.currentSection === 0;
    document.getElementById("next-btn").textContent = state.currentSection === sectionConfigs.length - 1 ? "結果を見る" : "次へ";
  }

  function handleNext() {
    const section = sectionConfigs[state.currentSection];
    const sectionQuestions = questions.filter((q) => q.id >= section.start && q.id <= section.end);
    if (!sectionQuestions.every((q) => typeof state.answers[q.id] === "number")) {
      window.alert("このセクションの全設問に回答してください。");
      return;
    }
    if (state.currentSection < sectionConfigs.length - 1) {
      state.currentSection += 1;
      saveState();
      renderSection();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scores = computeScores(state.answers);
    const type = determineType(scores);
    persistHistory(scores, type);
    state.completed = true;
    saveState();
    showResults();
  }

  function handlePrev() {
    if (state.currentSection === 0) return;
    state.currentSection -= 1;
    saveState();
    renderSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function computeScores(answerMap) {
    const score = {
      AFN: { A: 0, F: 0, N: 0 },
      DS: { D: 0, S: 0 },
      OI: { O: 0, I: 0 },
      RS: { R: 0, St: 0 },
      AE: { A: 0, E: 0, ACount: 0, ECount: 0 }
    };

    questions.forEach((q) => {
      const point = answerMap[q.id] ?? 0;
      if (["A", "F", "N"].includes(q.label) && q.id <= 15) score.AFN[q.label] += point;
      if (["D", "S"].includes(q.label) && q.id >= 16 && q.id <= 35) score.DS[q.label] += point;
      if (["O", "I"].includes(q.label) && q.id >= 36 && q.id <= 55) score.OI[q.label] += point;
      if (["R", "St"].includes(q.label) && q.id >= 56 && q.id <= 75) score.RS[q.label] += point;
      if (["A", "E"].includes(q.label) && q.id >= 76) {
        score.AE[q.label] += point;
        if (q.label === "A") score.AE.ACount += 1;
        if (q.label === "E") score.AE.ECount += 1;
      }
    });
    return score;
  }

  function determineType(scores) {
    const first = maxByKey(scores.AFN);
    const second = scores.DS.D >= scores.DS.S ? "D" : "S";
    const third = scores.OI.O >= scores.OI.I ? "O" : "I";
    const fourth = scores.RS.R >= scores.RS.St ? "R" : "S";
    const aAvg = scores.AE.A / scores.AE.ACount;
    const eAvg = scores.AE.E / scores.AE.ECount;
    const fifth = aAvg >= eAvg ? "A" : "E";
    const baseCode = `${first}-${second}${third}${fourth}`;
    return {
      first, second, third, fourth, fifth,
      baseCode,
      fullCode: `${baseCode}${fifth}`,
      officialName: officialNameMap[baseCode] ?? "未定義",
      aAvg,
      eAvg
    };
  }

  function showResults() {
    const scores = computeScores(state.answers);
    const type = determineType(scores);
    startScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    document.getElementById("full-code").textContent = type.fullCode;
    document.getElementById("base-code").textContent = type.baseCode;
    document.getElementById("official-name").textContent = type.officialName;
    document.getElementById("result-respondent").textContent = state.profile ? `${state.profile.name} / ${state.profile.birthDate} / ${state.profile.gender}` : "未設定";

    renderScoreMeters(scores, type);
    renderScoreList(scores, type);
    renderTypeDetail(type.baseCode);
    renderAxisDescriptions();
    renderTypeCatalog(type.baseCode);
    renderDeepReadings();
    renderMyHistory();

    document.getElementById("summary-text").textContent = `あなたは「${firstCharSummary[type.first]}」。また末尾は「${type.fifth}」で、「${tailSummary[type.fifth]}」の方向性が強めです。`;
    initResultPager();
  }

  function initResultPager() {
    currentResultSlide = 0;
    updateResultSlide();
  }

  function moveResultSlide(step) {
    const nextIndex = currentResultSlide + step;
    if (nextIndex < 0 || nextIndex >= resultSlides.length) return;
    currentResultSlide = nextIndex;
    updateResultSlide();
    resultScreen.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateResultSlide() {
    resultSlides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentResultSlide);
    });
    resultPageIndicator.textContent = `${currentResultSlide + 1} / ${resultSlides.length}`;
    resultPrevBtn.disabled = currentResultSlide === 0;
    resultNextBtn.disabled = currentResultSlide === resultSlides.length - 1;
  }

  function renderScoreMeters(scores, type) {
    const container = document.getElementById("score-meters");
    container.innerHTML = "";

    const meters = [
      scoreMeterData("AFN", "A", "N", scores.AFN.A, scores.AFN.N, 5, "#38bdf8"),
      scoreMeterData("D / S", "D", "S", scores.DS.D, scores.DS.S, 20, "#f59e0b"),
      scoreMeterData("O / I", "O", "I", scores.OI.O, scores.OI.I, 20, "#22c55e"),
      scoreMeterData("R / Study", "R", "Study", scores.RS.R, scores.RS.St, 20, "#a78bfa"),
      scoreMeterData("A / E", "A", "E", type.aAvg, type.eAvg, 1, "#fb7185", true)
    ];

    meters.forEach((m) => {
      const el = document.createElement("div");
      el.className = "axis-meter";
      el.innerHTML = `
        <div class="meter-head"><strong>${m.title}</strong><br><span>${m.percent}% ${m.dominant}</span></div>
        <div class="track"><div class="fill" style="background:${m.color}"></div><span class="knob" style="left:${m.rightPercent}%"></span></div>
        <div class="scale-labels"><span>${m.left}</span><span>${m.right}</span></div>
      `;
      container.appendChild(el);
    });
  }

  function scoreMeterData(title, left, right, leftScore, rightScore, count, color, average = false) {
    const max = average ? 2 : 2 * count;
    const leftNorm = (leftScore + max) / (2 * max);
    const rightNorm = (rightScore + max) / (2 * max);
    const rightPercent = Math.round((rightNorm / (leftNorm + rightNorm || 1)) * 100);
    const dominant = rightPercent >= 50 ? right : left;
    const percent = rightPercent >= 50 ? rightPercent : 100 - rightPercent;
    return { title, left, right, dominant, percent, rightPercent, color };
  }

  function renderScoreList(scores, type) {
    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    [
      `AFN: A=${scores.AFN.A.toFixed(1)} / F=${scores.AFN.F.toFixed(1)} / N=${scores.AFN.N.toFixed(1)}`,
      `D/S: D=${scores.DS.D.toFixed(1)} / S=${scores.DS.S.toFixed(1)}`,
      `O/I: O=${scores.OI.O.toFixed(1)} / I=${scores.OI.I.toFixed(1)}`,
      `R/S: R=${scores.RS.R.toFixed(1)} / St=${scores.RS.St.toFixed(1)}`,
      `A/E(平均): A=${type.aAvg.toFixed(2)} / E=${type.eAvg.toFixed(2)}`
    ].forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      scoreList.appendChild(li);
    });
  }

  function renderTypeDetail(baseCode) {
    const detail = typeDescriptions[baseCode];
    const container = document.getElementById("type-detail");
    if (!detail) {
      container.textContent = "該当タイプの解説が未登録です。";
      return;
    }
    container.innerHTML = `
      <h4>${baseCode}｜${detail.name}</h4>
      <p>${detail.short}</p>
      <p><strong>性格の芯:</strong> ${detail.core}</p>
      <p><strong>強み</strong></p>
      <ul>${detail.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>
      <p><strong>弱み</strong></p>
      <ul>${detail.weaknesses.map((s) => `<li>${s}</li>`).join("")}</ul>
      <p><strong>対人傾向:</strong> ${detail.relations}</p>
      <p><strong>向いている役割</strong></p>
      <ul>${detail.roles.map((s) => `<li>${s}</li>`).join("")}</ul>
      <p><strong>深層心理:</strong> ${detail.depth}</p>
    `;
  }

  function renderAxisDescriptions() {
    const container = document.getElementById("axis-accordion");
    container.innerHTML = "";
    Object.values(axisDescriptions).forEach((axis) => {
      const wrapper = document.createElement("details");
      wrapper.innerHTML = `<summary>${axis.title}</summary><p>${axis.intro ?? ""}</p>`;
      axis.items.forEach((item) => {
        const block = document.createElement("div");
        block.innerHTML = `
          <h4>${item.key} = ${item.label}</h4>
          <p>${item.summary}</p>
          ${item.body ? `<p>${item.body}</p>` : ""}
          ${item.strengths ? `<p><strong>強み</strong></p><ul>${item.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
          ${item.weaknesses ? `<p><strong>弱み</strong></p><ul>${item.weaknesses.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}
        `;
        wrapper.appendChild(block);
      });
      container.appendChild(wrapper);
    });
  }

  function renderTypeCatalog(currentBaseCode) {
    const container = document.getElementById("type-catalog");
    container.innerHTML = "";
    Object.entries(typeDescriptions).forEach(([code, detail]) => {
      const card = document.createElement("details");
      card.className = `type-card ${code === currentBaseCode ? "current" : ""}`;
      card.innerHTML = `
        <summary>${code}｜${detail.name}${code === currentBaseCode ? '<span class="badge">あなたのタイプ</span>' : ""}</summary>
        <p>${detail.short}</p>
        <p><strong>性格の芯:</strong> ${detail.core}</p>
        <p><strong>向いている役割:</strong> ${detail.roles.join(" / ")}</p>
        <p><strong>深層心理:</strong> ${detail.depth}</p>
      `;
      container.appendChild(card);
    });
  }

  function renderDeepReadings() {
    const container = document.getElementById("deep-reading");
    container.innerHTML = "";
    deepReadingSections.forEach((section) => {
      const card = document.createElement("article");
      card.className = "type-card";
      card.innerHTML = `<h4>${section.title}</h4><p>${section.body}</p>`;
      container.appendChild(card);
    });
  }

  function showQuiz() {
    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    state.answers = {};
    state.currentSection = 0;
    state.completed = false;
    state.profile = null;
    showQuiz();
    renderSection();
  }

  function updateProgress() {
    const answeredCount = Object.keys(state.answers).filter((key) => typeof state.answers[key] === "number").length;
    const progress = Math.round((answeredCount / questions.length) * 100);
    progressText.textContent = `${answeredCount} / ${questions.length}`;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(progress));
  }

  function maxByKey(record) {
    return Object.entries(record).sort((a, b) => b[1] - a[1])[0][0];
  }

  function loadState() {
    const defaults = { answers: {}, currentSection: 0, completed: false, profile: null };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        answers: parsed.answers ?? {},
        currentSection: Number.isInteger(parsed.currentSection) ? parsed.currentSection : 0,
        completed: !!parsed.completed,
        profile: parsed.profile ?? null
      };
    } catch {
      return defaults;
    }
  }

  function collectRespondentProfile() {
    const name = respondentNameInput.value.trim();
    const birthDate = respondentBirthInput.value;
    const gender = respondentGenderInput.value;

    if (!name) {
      window.alert("名前（ニックネーム可）を入力してください。");
      return null;
    }
    if (!birthDate) {
      window.alert("生年月日は必須です。");
      return null;
    }
    const year = Number(birthDate.slice(0, 4));
    if (year < 1900 || year > 2026) {
      window.alert("生年月日の年は1900〜2026の範囲で入力してください。");
      return null;
    }
    if (!gender) {
      window.alert("性別を選択してください。");
      return null;
    }

    return { name, birthDate, gender };
  }

  function syncProfileInputs() {
    if (!state.profile) return;
    respondentNameInput.value = state.profile.name ?? "";
    respondentBirthInput.value = state.profile.birthDate ?? "";
    respondentGenderInput.value = state.profile.gender ?? "";
  }

  function profileKey(profile) {
    return `${profile.name}__${profile.birthDate}__${profile.gender}`;
  }

  function loadHistoryStore() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return { respondents: {} };
      const parsed = JSON.parse(raw);
      return { respondents: parsed.respondents ?? {} };
    } catch {
      return { respondents: {} };
    }
  }

  function persistHistory(scores, type) {
    if (!state.profile) return;
    const store = loadHistoryStore();
    const key = profileKey(state.profile);
    if (!store.respondents[key]) {
      store.respondents[key] = { profile: state.profile, entries: [] };
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      fullCode: type.fullCode,
      baseCode: type.baseCode,
      officialName: type.officialName,
      scores,
      answers: state.answers
    };
    store.respondents[key].entries.push(entry);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(store));
  }

  function renderMyHistory() {
    const container = document.getElementById("my-history-list");
    container.innerHTML = "";
    if (!state.profile) {
      container.innerHTML = '<p>回答者情報が見つかりません。</p>';
      return;
    }
    const store = loadHistoryStore();
    const key = profileKey(state.profile);
    const entries = (store.respondents[key]?.entries ?? []).slice().reverse();
    if (!entries.length) {
      container.innerHTML = '<p>履歴はまだありません。</p>';
      return;
    }
    entries.forEach((entry) => {
      const el = document.createElement("article");
      el.className = "history-item";
      el.innerHTML = `<p><strong>${new Date(entry.createdAt).toLocaleString("ja-JP")}</strong></p>
        <p>コード: ${entry.fullCode}（${entry.officialName}）</p>
        <p>AFN: A=${entry.scores.AFN.A.toFixed(1)} / F=${entry.scores.AFN.F.toFixed(1)} / N=${entry.scores.AFN.N.toFixed(1)}</p>`;
      container.appendChild(el);
    });
  }

  function renderCreatorData() {
    const container = document.getElementById("creator-data-list");
    container.innerHTML = "";
    if (creatorPasscodeInput.value !== CREATOR_PASSCODE) {
      window.alert("製作者パスコードが違います。");
      return;
    }
    const store = loadHistoryStore();
    const respondents = Object.values(store.respondents);
    if (!respondents.length) {
      container.innerHTML = '<p>保存データはありません。</p>';
      return;
    }

    respondents.forEach((row) => {
      row.entries.forEach((entry) => {
        const item = document.createElement("article");
        item.className = "history-item";
        item.innerHTML = `<p><strong>${new Date(entry.createdAt).toLocaleString("ja-JP")}</strong></p>
          <p>回答者: ${row.profile.name} / ${row.profile.birthDate} / ${row.profile.gender}</p>
          <p>結果: ${entry.fullCode}（${entry.officialName}）</p>
          <details><summary>回答データ（100問）</summary><pre>${JSON.stringify(entry.answers, null, 2)}</pre></details>`;
        container.appendChild(item);
      });
    });
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
})();

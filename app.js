// X-TYPE 診断テスト: 質問・採点・画面制御を1ファイルで管理
(() => {
  const STORAGE_KEY = "xtype-test-state-v1";

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

  // 正式名称マップ: ベースコード(A/F/N + D/S + O/I + R/S)
  const officialNameMap = {
    "A-DOR": "勇者", "A-DOS": "先導者", "A-DIR": "人情家", "A-DIS": "教師",
    "A-SOR": "守護者", "A-SOS": "指揮者", "A-SIR": "探検家", "A-SIS": "研究者",
    "F-DOR": "立会人", "F-DOS": "調律師", "F-DIR": "案内人", "F-DIS": "調停者",
    "F-SOR": "立役者", "F-SOS": "監督", "F-SIR": "革新家", "F-SIS": "開発者",
    "N-DOR": "批評家", "N-DOS": "是正者", "N-DIR": "観察家", "N-DIS": "書記官",
    "N-SOR": "裁判官", "N-SOS": "設計士", "N-SIR": "分析官", "N-SIS": "哲学者"
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

  // 質問文リスト（差し替えしやすいよう、本文はここで一元管理）
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

  const questions = questionTexts.map((text, i) => ({
    id: i + 1,
    text,
    label: labels[i]
  }));

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

  document.getElementById("start-btn").addEventListener("click", () => {
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

  if (state.completed) {
    showResults();
  }

  function renderSection() {
    const section = sectionConfigs[state.currentSection];
    const sectionQuestions = questions.filter((q) => q.id >= section.start && q.id <= section.end);

    sectionTitle.textContent = `${section.title}`;
    quizTitle.textContent = section.title;
    quizDescription.textContent = section.description;

    const answeredCount = countAnswered();
    const progress = Math.round((answeredCount / questions.length) * 100);
    progressText.textContent = `${answeredCount} / ${questions.length}`;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(progress));

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
    const allAnswered = sectionQuestions.every((q) => typeof state.answers[q.id] === "number");

    if (!allAnswered) {
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
    const fullCode = `${baseCode}${fifth}`;
    const officialName = officialNameMap[baseCode] ?? "未定義";

    return { first, second, third, fourth, fifth, baseCode, fullCode, officialName, aAvg, eAvg };
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

    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    const items = [
      `AFN: A=${scores.AFN.A.toFixed(1)} / F=${scores.AFN.F.toFixed(1)} / N=${scores.AFN.N.toFixed(1)}`,
      `D/S: D=${scores.DS.D.toFixed(1)} / S=${scores.DS.S.toFixed(1)}`,
      `O/I: O=${scores.OI.O.toFixed(1)} / I=${scores.OI.I.toFixed(1)}`,
      `R/S: R=${scores.RS.R.toFixed(1)} / St=${scores.RS.St.toFixed(1)}`,
      `A/E(平均): A=${type.aAvg.toFixed(2)} / E=${type.eAvg.toFixed(2)}`
    ];

    items.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      scoreList.appendChild(li);
    });

    document.getElementById("summary-text").textContent = `あなたは「${firstCharSummary[type.first]}」。また末尾は「${type.fifth}」で、「${tailSummary[type.fifth]}」の方向性が強めです。`;
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
    showQuiz();
    renderSection();
  }

  function updateProgress() {
    const answeredCount = countAnswered();
    const progress = Math.round((answeredCount / questions.length) * 100);
    progressText.textContent = `${answeredCount} / ${questions.length}`;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", String(progress));
  }

  function countAnswered() {
    return Object.keys(state.answers).filter((key) => typeof state.answers[key] === "number").length;
  }

  function maxByKey(record) {
    return Object.entries(record).sort((a, b) => b[1] - a[1])[0][0];
  }

  function loadState() {
    const defaults = { answers: {}, currentSection: 0, completed: false };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        answers: parsed.answers ?? {},
        currentSection: Number.isInteger(parsed.currentSection) ? parsed.currentSection : 0,
        completed: !!parsed.completed
      };
    } catch {
      return defaults;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
})();

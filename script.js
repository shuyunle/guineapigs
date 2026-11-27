/* =========================================================
   天竺鼠新手飼主小幫手 — script.js
   ---------------------------------------------------------
   目錄
   1. 共用工具與小天竺鼠圖案
   2. 內容資料（叫聲、食物、警訊、測驗題目）
   3. 聽懂叫聲：翻開卡片看答案
   4. 能不能吃：翻牌卡
   5. 健康警訊：勾選清單
   6. 闖關測驗
   7. 首頁主視覺：點天竺鼠會彈跳、噴大便
   8. 頁面切換（hash 路由）
   9. 導覽列特效：小天竺鼠長草、吃草、亂跑
   10. 散步的小天竺鼠（聯絡卡片、頁尾）
   11. 聯絡我們：服務時間狀態、複製地址
   12. 背景：天竺鼠大便雨
   13. 回到最上面
   14. 外部連結開新分頁
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 1. 共用工具與小天竺鼠圖案 ---------- */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const random = (min, max) => min + Math.random() * (max - min);

  // 使用者在系統設定「減少動態效果」時，特效就不播放
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 小天竺鼠的毛色：body 身體、face 臉部斑塊、rear 屁股斑塊、ear 耳朵
  const COATS = {
    ginger:    { body: '#b4561a', face: '#fff6e8', rear: '#fff6e8', ear: '#7a3a10' }, // 橘白
    blackWhite:{ body: '#2e2824', face: '#f4f0ea', rear: '#f4f0ea', ear: '#15110e' }, // 黑白
    cream:     { body: '#efd2a0', face: '#fffaf0', rear: '#e2b878', ear: '#c39560' }, // 奶油
    chocolate: { body: '#6b4226', face: '#f3e6d6', rear: '#8a5a38', ear: '#4a2b17' }, // 巧克力
    grey:      { body: '#8d847b', face: '#f1ece6', rear: '#6c635b', ear: '#5a5049' }, // 灰色
    whiteGinger:{ body: '#fbf6ee', face: '#d9782b', rear: '#d9782b', ear: '#c4631c' }, // 白底橘斑
    tricolor:  { body: '#b4561a', face: '#fff6e8', rear: '#2e2824', ear: '#2e2824' }  // 三色
  };
  const COAT_LIST = Object.values(COATS);

  // 側面的小天竺鼠（面向右邊），寬 28px
  const PIG_WIDTH = 28;
  const pigSvg = (c) => `<span class="face"><svg viewBox="0 0 56 38">
    <ellipse cx="28" cy="36" rx="20" ry="2" fill="#000" opacity=".18"/>
    <path d="M5 24 C4 12 14 6 28 6 C42 6 52 12 53 22 C54 31 46 35 30 35 C14 35 6 32 5 24Z" fill="${c.body}"/>
    <path d="M36 7 C45 8 51 13 52 20 C49 16 44 14 39 14 C36 12 35 9 36 7Z" fill="${c.face}"/>
    <path d="M10 18 C13 14 19 13 22 14 C20 20 16 23 10 24 C9 22 9 20 10 18Z" fill="${c.rear}"/>
    <ellipse cx="40" cy="9" rx="5" ry="3.5" fill="${c.ear}" transform="rotate(-25 40 9)"/>
    <circle cx="45" cy="17" r="2.6" fill="#1c140d"/><circle cx="46" cy="16" r=".9" fill="#fff"/>
    <ellipse cx="52.5" cy="22" rx="2" ry="1.6" fill="#e58a8a"/>
    <ellipse cx="14" cy="34.5" rx="4" ry="2" fill="#e9b9a6"/><ellipse cx="40" cy="34.5" rx="4" ry="2" fill="#e9b9a6"/>
  </svg></span>`;


  /* ---------- 2. 內容資料 ---------- */

  const SOUNDS = [
    { zh: '咻咻叫',       en: 'Wheek',            like: '又長又響的尖叫聲',   means: '興奮、期待，常在餵食時出現',     todo: '確認牧草與水是否充足' },
    { zh: '低沉咕嚕聲',   en: '低音 Purr',         like: '冒泡泡般的低音',     means: '滿足、安心，常在被撫摸或餵食時', todo: '繼續目前的互動' },
    { zh: '高音短促咕嚕聲', en: '高音 Purr',       like: '僵硬、短促的震動聲', means: '不耐煩或緊張',                   todo: '檢查環境，先暫停互動' },
    { zh: '咯咯聲',       en: 'Chutt',            like: '簡短的咯咯、咕咕聲', means: '放鬆地到處探索',                 todo: '不用處理' },
    { zh: '磨牙聲',       en: 'Teeth chattering', like: '牙齒快速碰撞',       means: '警告、準備打架',                 todo: '立刻停止接觸，給牠空間' },
    { zh: '嘶嘶聲',       en: 'Hissing',          like: '類似磨牙的氣音',     means: '生氣，想被單獨留下，可能咬人',   todo: '退開，讓牠平靜' },
    { zh: '尖叫',         en: 'Squeal / Shriek',  like: '尖銳、急促的叫聲',   means: '不開心、疼痛或感到危險',         todo: '檢查是否受傷或受驚嚇' },
    { zh: '爆米花跳',     en: 'Popcorning',       like: '原地往上跳（動作）', means: '非常開心',                       todo: '好好欣賞就好' }
  ];

  // level：ok 可以 / few 少量 / no 避免（對應 CSS 標籤顏色）
  const FOODS = [
    { name: '彩椒（甜椒）',           level: 'ok',  label: '可以', note: '維生素 C 的好來源' },
    { name: '紅葉、綠葉萵苣',         level: 'ok',  label: '可以', note: '常見的日常葉菜' },
    { name: '紅蘿蔔葉',               level: 'ok',  label: '可以', note: '葉子可以常餵；紅蘿蔔本體含糖，當點心' },
    { name: '美生菜（球生菜）',       level: 'no',  label: '避免', note: '幾乎都是水，沒什麼營養' },
    { name: '菠菜、羽衣甘藍、巴西里', level: 'few', label: '少量', note: '鈣含量高，吃太多可能增加膀胱結石風險' },
    { name: '蘋果、梨子',             level: 'few', label: '偶爾', note: '含糖，只當點心' },
    { name: '優格豆等鼠類零食',       level: 'no',  label: '避免', note: '通常糖分很高' },
    { name: '兔子飼料',               level: 'no',  label: '避免', note: '維生素 C 不夠，要用天竺鼠專用飼料' }
  ];

  const WARNING_SIGNS = [
    '食慾變差或不吃東西', '體重下降', '毛色變得粗糙、沒光澤', '走路跛腳、關節腫脹',
    '腹瀉', '肚子脹氣、看起來很痛', '精神差、全身無力', '發出尖銳的尖叫聲'
  ];

  // answer：正確選項的索引（從 0 開始）
  const QUESTIONS = [
    {
      q: '天竺鼠為什麼每天都需要從食物中獲得維生素 C？',
      options: ['因為牠們很愛吃酸的東西', '因為牠們無法自行製造維生素 C', '因為維生素 C 可以讓牠長得更快'],
      answer: 1,
      explain: '天竺鼠和人類一樣無法自己製造維生素 C，缺乏會得壞血病。'
    },
    {
      q: '你在寵物店看到兔子飼料在特價，可以買來給天竺鼠吃嗎？',
      options: ['可以，都是吃草的動物', '不行，兔子飼料的維生素 C 不夠', '可以，只要混一半天竺鼠飼料'],
      answer: 1,
      explain: '請選天竺鼠專用飼料，兔子飼料無法提供足夠的維生素 C。'
    },
    {
      q: '下列哪一種最適合當天竺鼠的主食，而且要無限量供應？',
      options: ['牧草', '蘋果', '美生菜'],
      answer: 0,
      explain: '牧草是主食，還能幫助磨牙；蘋果含糖只當點心，美生菜幾乎都是水。'
    },
    {
      q: '你摸天竺鼠時，牠開始發出牙齒快速碰撞的磨牙聲。你該怎麼做？',
      options: ['繼續摸，牠很開心', '給牠點心獎勵牠', '停止接觸，給牠空間'],
      answer: 2,
      explain: '磨牙聲是警告，代表牠不高興、可能準備攻擊。'
    },
    {
      q: '下列哪個狀況最需要帶天竺鼠去看獸醫？',
      options: ['清晨和黃昏特別有活力', '食慾變差、體重下降', '聽到你進門就咻咻叫'],
      answer: 1,
      explain: '其他兩個是正常行為；食慾變差和體重下降是健康警訊。'
    }
  ];


  /* ---------- 3. 聽懂叫聲：翻開卡片看答案 ---------- */

  function initSounds() {
    const grid = $('#soundGrid');
    if (!grid) return;
    grid.innerHTML = SOUNDS.map((s) => `
      <button class="card sound" type="button" aria-expanded="false">
        <div class="zh">${s.zh}</div>
        <div class="en">${s.en}</div>
        <div class="like">聽起來像：${s.like}</div>
        <div class="ans"><b>代表：</b>${s.means}<br><b>你可以：</b>${s.todo}</div>
      </button>`).join('');
    grid.querySelectorAll('.sound').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
    });
  }


  /* ---------- 4. 能不能吃：翻牌卡 ---------- */

  function initFood() {
    const grid = $('#foodGrid');
    if (!grid) return;
    grid.innerHTML = FOODS.map((f) => `
      <button class="card food" type="button" aria-pressed="false">
        <div class="q">${f.name}</div>
        <div class="hint">能吃嗎？點我看答案</div>
        <div class="a"><span class="tag ${f.level}">${f.label}</span> ${f.note}</div>
      </button>`).join('');
    grid.querySelectorAll('.food').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    });
  }


  /* ---------- 5. 健康警訊：勾選清單 ---------- */

  function initHealth() {
    const list = $('#checks');
    const verdict = $('#verdict');
    if (!list || !verdict) return;
    list.innerHTML = WARNING_SIGNS.map((s, i) =>
      `<label for="sign${i}"><input type="checkbox" id="sign${i}"> ${s}</label>`).join('');
    list.addEventListener('change', () => {
      const n = list.querySelectorAll('input:checked').length;
      verdict.classList.toggle('alert', n > 0);
      verdict.textContent = n
        ? `勾選了 ${n} 項警訊：建議盡快帶牠去看能診治天竺鼠的獸醫。`
        : '目前沒有勾選任何警訊。';
    });
  }


  /* ---------- 6. 闖關測驗 ---------- */

  function initQuiz() {
    const box = $('#qbox');
    if (!box) return;
    let index = 0;
    let score = 0;
    const perQuestion = 100 / QUESTIONS.length;

    function showResult() {
      const total = Math.round(score * perQuestion);
      const msg = score === QUESTIONS.length ? '滿分！你是合格的天竺鼠飼主。'
                : score >= 3                 ? '不錯！回頭看看答錯的單元。'
                :                              '再複習一次上面的單元，你一定可以的。';
      box.innerHTML = `
        <h3>你的分數：${total} 分</h3>
        <p>${msg}</p>
        <div class="progress"><i style="width:100%"></i></div>
        <div class="btns">
          <button class="btn" type="button" id="again">再玩一次</button>
          <a class="btn ghost" href="#/sounds">回去複習</a>
        </div>`;
      $('#again').addEventListener('click', () => { index = 0; score = 0; showQuestion(); });
    }

    function showQuestion() {
      if (index >= QUESTIONS.length) { showResult(); return; }
      const item = QUESTIONS[index];
      box.innerHTML = `
        <p class="small">第 ${index + 1} 題，共 ${QUESTIONS.length} 題</p>
        <div class="progress"><i style="width:${index * perQuestion}%"></i></div>
        <h3 class="q-title">${item.q}</h3>
        <div class="opts">
          ${item.options.map((o, j) => `<button class="opt" type="button" data-j="${j}">${String.fromCharCode(65 + j)}. ${o}</button>`).join('')}
        </div>
        <div class="fb" id="fb" aria-live="polite"></div>`;

      const options = [...box.querySelectorAll('.opt')];
      options.forEach((btn) => btn.addEventListener('click', () => {
        const right = Number(btn.dataset.j) === item.answer;
        if (right) score++;
        options.forEach((o) => {
          o.disabled = true;
          if (Number(o.dataset.j) === item.answer) o.classList.add('right');
        });
        if (!right) btn.classList.add('wrong');

        const fb = $('#fb');
        fb.innerHTML = `<b>${right ? '答對了！' : '差一點！'}</b>${item.explain}<br>`;
        const next = document.createElement('button');
        next.className = 'btn';
        next.type = 'button';
        next.textContent = index < QUESTIONS.length - 1 ? '下一題' : '看分數';
        next.addEventListener('click', () => { index++; showQuestion(); });
        fb.appendChild(next);
      }));
    }

    showQuestion();
  }


  /* ---------- 7. 首頁主視覺：點天竺鼠會彈跳、噴大便 ---------- */

  function initHeroScene() {
    const scene = $('#scene');
    const pig = $('#pig');
    const say = $('#say');
    const poops = $('#poops');
    if (!scene || !pig) return;

    // 用固定種子的亂數撒牧草，每次重新整理位置都一樣
    let seed = 7;
    const seeded = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    const straw = (x, y, rot, scale) =>
      `<use href="#straw" transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})"/>`;

    let back = '';
    for (let i = 0; i < 34; i++) {
      back += straw(120 + seeded() * 560, 290 + seeded() * 36, -30 + seeded() * 60, .7 + seeded() * .8);
    }
    $('#hay').innerHTML = back;

    // 前景牧草：蓋在照片下緣，讓天竺鼠看起來坐在草堆裡
    let front = '';
    for (let i = 0; i < 16; i++) {
      front += straw(250 + seeded() * 270, 302 + seeded() * 16, -25 + seeded() * 50, .8 + seeded() * .6);
    }
    $('#hayFront').innerHTML = front;

    // 對話框輪流出現的台詞
    const lines = ['咻咻！', '好開心！', '要吃草！', '咕嚕～', '噗噗！'];
    let lineIndex = 0;

    // 大便設定
    const POOP_SIZE = 1.6;          // 顆粒大小倍率
    const POOP_MAX = 30;            // 畫面上最多留幾顆
    const START = { x: 520, y: 262 }; // 噴出點：屁股（照片右側）

    // 從屁股噴出 2～4 顆大便：畫拋物線落地 → 彈一下 → 停一會 → 淡出
    function sprayPoops() {
      if (reduceMotion.matches) return;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let k = 0; k < count; k++) {
        if (poops.childElementCount >= POOP_MAX) poops.firstElementChild.remove();
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = '<use href="#poop"/>';
        poops.appendChild(g);

        const endX = random(548, 688);          // 落地點
        const endY = random(304, 316);
        const peakY = random(150, 210);         // 拋物線最高點（數字越小飛越高）
        const spin = (Math.random() < .5 ? -1 : 1) * random(240, 600);
        const endRot = random(-25, 25);

        const frames = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          const x = START.x + (endX - START.x) * t;
          const y = (1 - t) ** 2 * START.y + 2 * (1 - t) * t * peakY + t * t * endY; // 二次貝茲曲線
          const scale = (.6 + .4 * Math.min(1, t * 3)) * POOP_SIZE;
          frames.push({ transform: `translate(${x}px,${y}px) rotate(${endRot + spin * (1 - t)}deg) scale(${scale})`, offset: t * .6 });
        }
        frames.push({ transform: `translate(${endX + 6}px,${endY - 8}px) rotate(${endRot + 8}deg) scale(${POOP_SIZE})`, offset: .7 }); // 彈一下
        frames.push({ transform: `translate(${endX + 9}px,${endY}px) rotate(${endRot}deg) scale(${POOP_SIZE})`, offset: .8 });
        frames.push({ transform: `translate(${endX + 9}px,${endY}px) rotate(${endRot}deg) scale(${POOP_SIZE})`, offset: 1 });

        g.style.transform = `translate(${START.x}px,${START.y}px) scale(0)`;
        g.animate(frames, { duration: 1100, delay: 180 + k * 90, easing: 'linear', fill: 'forwards' }).finished
          .then(() => g.animate([{ opacity: 1 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 1600, fill: 'forwards' }).finished)
          .then(() => g.remove())
          .catch(() => {});
      }
    }

    function hop() {
      pig.classList.remove('hop');
      void pig.getBBox();              // 強制重新計算，讓動畫可以連續觸發
      pig.classList.add('hop');
      lineIndex = (lineIndex + 1) % lines.length;
      say.textContent = lines[lineIndex];
      sprayPoops();
    }

    scene.addEventListener('click', hop);
    scene.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hop(); }
    });
  }


  /* ---------- 8. 頁面切換（hash 路由） ---------- */
  // 網址 #/sounds、#/food… 對應 data-view="sounds"、"food"…；空白或找不到就回首頁

  function initRouter() {
    const views = $$('.view');
    const navLinks = $$('.navbar .scroll a');
    const siteName = '天竺鼠新手飼主小幫手';
    let firstLoad = true;

    // 離開頁面時重設 YouTube iframe，讓影片停止播放
    const stopMedia = (view) => view.querySelectorAll('iframe[src*="youtube"]').forEach((f) => { f.src = f.src; });
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    function route() {
      const want = location.hash.replace(/^#\/?/, '') || 'home';
      const name = views.some((v) => v.dataset.view === want) ? want : 'home';

      views.forEach((v) => {
        const show = v.dataset.view === name;
        if (!show && !v.hidden) stopMedia(v);
        v.hidden = !show;
        if (show) document.title = name === 'home' ? siteName : `${v.dataset.title}｜${siteName}`;
      });

      navLinks.forEach((a) => {
        const active = a.dataset.route === name;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });

      if (!firstLoad) scrollTop();     // 切換頁面後回到頂部
      firstLoad = false;
    }

    window.addEventListener('hashchange', route);
    // 點目前所在頁面的連結時 hash 不會變，手動回到頂部
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#/"]');
      if (a && a.getAttribute('href') === (location.hash || '#/')) scrollTop();
    });
    route();
  }


  /* ---------- 9. 導覽列特效：小天竺鼠長草、吃草、亂跑 ---------- */

  function initHeaderPigs() {
    const fx = $('#headerFx');
    if (!fx) return;

    const MAX_PIGS = 4;              // 同時最多幾隻
    const GRASS_WIDTH = 22;
    const GRASS_SVG = `<svg viewBox="0 0 22 14" width="22" height="14">
      <path d="M4 14 Q3 8 1 4 Q5 8 6 14Z" fill="#3f9b3a"/>
      <path d="M8 14 Q8 6 10 0 Q11 7 11 14Z" fill="#59b847"/>
      <path d="M12 14 Q13 7 17 2 Q15 9 15 14Z" fill="#3f9b3a"/>
      <path d="M16 14 Q18 9 21 7 Q19 11 19 14Z" fill="#6cc757"/>
    </svg>`;
    let activePigs = 0;

    // 從目前位置跑到 toX，會自動轉向；fadeOut 為 true 時邊跑邊淡出
    function runTo(pig, state, toX, fadeOut) {
      pig.classList.toggle('to-left', toX < state.x);
      const from = `translateX(${state.x}px) scale(${state.size})`;
      const to = `translateX(${toX}px) scale(${state.size})`;
      const frames = fadeOut
        ? [{ transform: from, opacity: 1 }, { opacity: 1, offset: .5 }, { transform: to, opacity: 0 }]
        : [{ transform: from, opacity: 1 }, { transform: to, opacity: 1 }];
      const duration = Math.max(250, Math.abs(toX - state.x) / state.speed);
      state.x = toX;
      return pig.animate(frames, { duration, easing: 'ease-in-out', fill: 'forwards' }).finished;
    }

    const growGrass = (blades) => Promise.all(blades.map((b, i) => b.animate(
      [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1.15)', offset: .75 }, { transform: 'scaleY(1)' }],
      { duration: 300, delay: i * 60, easing: 'ease-out', fill: 'forwards' }).finished));

    const eatGrass = (blades) => Promise.all(blades.map((b, i) => b.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
      { duration: 700, delay: i * 50, easing: 'ease-in', fill: 'forwards' }).finished));

    async function grassSnack() {
      if (activePigs >= MAX_PIGS || document.hidden || reduceMotion.matches) return;
      activePigs++;
      let grass, pig;
      try {
        const W = fx.offsetWidth;
        const coat = COAT_LIST[Math.floor(Math.random() * COAT_LIST.length)];
        const size = random(.8, 1.2);                     // 每隻大小略有不同
        const pigW = PIG_WIDTH * size;

        // 1. 在隨機位置長出草
        const grassX = Math.round(random(40, W - 40 - GRASS_WIDTH));
        grass = document.createElement('span');
        grass.className = 'grass';
        grass.style.left = grassX + 'px';
        grass.innerHTML = GRASS_SVG;
        fx.appendChild(grass);
        const blades = [...grass.querySelectorAll('path')];
        await growGrass(blades);

        // 2. 小天竺鼠從左邊或右邊衝進來，嘴巴停在草旁邊
        const fromLeft = Math.random() < .5;
        const state = { x: fromLeft ? -pigW - 6 : W + 6, size, speed: random(.35, .6) };
        pig = document.createElement('span');
        pig.className = 'mini-pig running';
        pig.innerHTML = pigSvg(coat);
        pig.style.transformOrigin = '0 100%';
        pig.style.transform = `translateX(${state.x}px) scale(${size})`;
        fx.appendChild(pig);
        await runTo(pig, state, fromLeft ? grassX - pigW + 6 : grassX + GRASS_WIDTH - 6, false);

        // 3. 吃草
        pig.classList.replace('running', 'eating');
        await eatGrass(blades);
        grass.remove();

        // 4. 吃飽在導覽列上亂跑 1～3 段，偶爾停一下
        pig.classList.replace('eating', 'running');
        const legs = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < legs; i++) {
          await runTo(pig, state, Math.round(random(0, W - pigW)), false);
          if (Math.random() < .4) {
            pig.classList.remove('running');
            await wait(random(200, 500));
            pig.classList.add('running');
          }
        }

        // 5. 跑出畫面，邊跑邊淡出
        await runTo(pig, state, Math.random() < .5 ? -pigW - 6 : W + 6, true);
      } finally {
        grass?.remove();
        pig?.remove();
        activePigs--;
      }
    }

    // 一開始陸續跑出 3 隻，之後每 1.2～3 秒再放一隻
    [600, 1400, 2300].forEach((t) => setTimeout(grassSnack, t));
    (function schedule() {
      setTimeout(() => { grassSnack(); schedule(); }, random(1200, 3000));
    })();
  }


  /* ---------- 10. 散步的小天竺鼠（聯絡卡片、頁尾） ---------- */

  // 在 track 上慢慢走、停下來嗅一嗅；isActive() 回傳 false 時暫停
  function strollOn(track, coat, isActive, opts = {}) {
    const speed = opts.speed || .09;                  // 每毫秒幾 px
    const walker = document.createElement('span');
    walker.className = 'mini-pig';
    walker.innerHTML = pigSvg(coat);
    track.appendChild(walker);
    let x = opts.start ?? 0;
    walker.style.transform = `translateX(${x}px)`;

    (async function stroll() {
      if (opts.delay) await wait(opts.delay);
      while (true) {
        if (!isActive() || document.hidden || reduceMotion.matches) { await wait(800); continue; }

        // 選一個不要太近的目的地
        const maxX = Math.max(0, track.offsetWidth - PIG_WIDTH);
        let to = Math.round(Math.random() * maxX);
        if (Math.abs(to - x) < 40) to = x < maxX / 2 ? Math.min(maxX, x + 80) : Math.max(0, x - 80);

        walker.classList.toggle('to-left', to < x);
        walker.classList.add('running');
        await walker.animate(
          [{ transform: `translateX(${x}px)` }, { transform: `translateX(${to}px)` }],
          { duration: Math.abs(to - x) / speed, easing: 'ease-in-out', fill: 'forwards' }
        ).finished.catch(() => {});
        x = to;
        walker.classList.remove('running');

        // 一半機率停下來嗅一嗅
        if (Math.random() < .5) {
          walker.classList.add('eating');
          await wait(random(900, 1800));
          walker.classList.remove('eating');
        }
        await wait(random(700, 2500));
      }
    })();
  }

  function initStrollers() {
    // 聯絡頁：卡片上緣一隻（白底橘斑，在橘色標頭上也看得清楚）
    const cardTrack = $('#cardTrack');
    const contactView = $('[data-view="contact"]');
    if (cardTrack && contactView) {
      strollOn(cardTrack, COATS.whiteGinger, () => !contactView.hidden);
    }

    // 頁尾：牧草上兩隻，只在頁尾捲進畫面時才走
    const footerTrack = $('#footerTrack');
    if (footerTrack) {
      let footerVisible = false;
      new IntersectionObserver((entries) => { footerVisible = entries[0].isIntersecting; })
        .observe(footerTrack.parentElement);
      strollOn(footerTrack, COATS.blackWhite, () => footerVisible, { start: 40, speed: .08 });
      strollOn(footerTrack, COATS.cream, () => footerVisible, { start: 260, speed: .1, delay: 1200 });
    }
  }


  /* ---------- 11. 聯絡我們：服務時間狀態、複製地址 ---------- */

  function initContact() {
    // 以台灣時間判斷是否在 9:00～17:30 之間，每分鐘更新一次
    const badge = $('#openBadge');
    if (badge) {
      const OPEN = 9 * 60;
      const CLOSE = 17 * 60 + 30;
      const update = () => {
        const [h, m] = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).format(new Date()).split(':').map(Number);
        const minutes = h * 60 + m;
        const open = minutes >= OPEN && minutes < CLOSE;
        badge.classList.toggle('open', open);
        badge.textContent = open ? '現在是服務時間' : '目前非服務時間';
      };
      update();
      setInterval(update, 60000);
    }

    // 一鍵複製地址
    const copyBtn = $('#copyAddr');
    copyBtn?.addEventListener('click', async () => {
      const address = '300新竹市大學路1001號 國立陽明交通大學人社一館二樓212A';
      try {
        await navigator.clipboard.writeText(address);
        copyBtn.textContent = '已複製 ✓';
      } catch {
        copyBtn.textContent = '複製失敗，請手動選取';
      }
      setTimeout(() => { copyBtn.textContent = '複製地址'; }, 1800);
    });
  }


  /* ---------- 12. 背景：天竺鼠大便雨 ---------- */
  // 任何區塊放一個 <div class="poop-rain" data-drops="數量"> 就會下雨
  // 每顆的大小、速度、位置、旋轉都隨機；負的 delay 讓一打開畫面就已經在下雨

  function initPoopRain() {
    $$('.poop-rain').forEach((rain) => {
      const count = Number(rain.dataset.drops) || 36;
      let html = '';
      for (let i = 0; i < count; i++) {
        const width = random(14, 30);                 // 顆粒長度 14～30px
        const duration = random(4, 9);               // 落下時間 4～9 秒
        const r0 = Math.round(random(0, 360));
        const r1 = r0 + (Math.random() < .5 ? -1 : 1) * Math.round(random(90, 360));
        const style = [
          `left:${random(0, 100).toFixed(1)}%`,
          `opacity:${random(.55, 1).toFixed(2)}`,
          `--w:${width.toFixed(1)}px`,
          `--d:${duration.toFixed(2)}s`,
          `--delay:${(-Math.random() * duration).toFixed(2)}s`,
          `--r0:${r0}deg`,
          `--r1:${r1}deg`,
          `--still:${Math.round(random(0, 100))}%`
        ].join(';');
        html += `<span class="drop" style="${style}"></span>`;
      }
      rain.innerHTML = html;
    });
  }


  /* ---------- 13. 回到最上面 ---------- */

  function initBackToTop() {
    const btn = $('#toTop');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }


  /* ---------- 14. 外部連結開新分頁 ---------- */
  // 站內頁面切換用 #/ 開頭的連結，會留在同一個分頁

  function initExternalLinks() {
    $$('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }


  /* ---------- 啟動 ---------- */

  function init() {
    initSounds();
    initFood();
    initHealth();
    initQuiz();
    initHeroScene();
    initRouter();
    initHeaderPigs();
    initStrollers();
    initContact();
    initPoopRain();
    initBackToTop();
    initExternalLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

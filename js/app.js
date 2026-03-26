/* =====================================================
   app.js — Портфель жизни
   Главный файл: состояние, навигация, все экраны
   ===================================================== */

/* ---- 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM SDK ---- */
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : {
  // Заглушка для тестирования в браузере
  ready: () => {},
  expand: () => {},
  disableVerticalSwipes: () => {},
  setHeaderColor: () => {},
  setBackgroundColor: () => {},
  colorScheme: 'dark',
  HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {} },
  MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {}, offClick: () => {}, isVisible: false },
  BackButton: { show: () => {}, hide: () => {}, onClick: () => {}, offClick: () => {} },
  initDataUnsafe: { user: { first_name: 'Пользователь', photo_url: null } }
};

tg.ready();
tg.expand();
tg.disableVerticalSwipes && tg.disableVerticalSwipes();
tg.setHeaderColor('#0b0b17');
tg.setBackgroundColor('#0b0b17');

/* ---- 2. ХРАНИЛИЩЕ (localStorage) ---- */
const Store = {
  PREFIX: 'portfel_',

  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(this.PREFIX + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try { localStorage.setItem(this.PREFIX + key, JSON.stringify(value)); } catch {}
  },

  // Обновить оценку сферы
  setScore(sphereId, score) {
    const scores = this.get('scores', {});
    scores[sphereId] = score;
    this.set('scores', scores);
  },

  // Все оценки
  getScores() {
    const d = {};
    SPHERES.forEach(s => d[s.id] = 5);
    return { ...d, ...this.get('scores', {}) };
  },

  // Мои практики (добавленные пользователем)
  getMyRoutines() { return this.get('my_routines', []); },
  setMyRoutines(list) { this.set('my_routines', list); },
  addRoutine(routine) {
    const list = this.getMyRoutines();
    if (!list.find(r => r.id === routine.id)) {
      list.push({ ...routine, added_at: Date.now() });
      this.setMyRoutines(list);
      return true;
    }
    return false;
  },
  removeRoutine(id) {
    this.setMyRoutines(this.getMyRoutines().filter(r => r.id !== id));
  },
  hasRoutine(id) { return !!this.getMyRoutines().find(r => r.id === id); },

  // Чекины: { 'YYYY-MM-DD': ['routine_id', ...] }
  getCheckins(date) { return this.get('checkins_' + (date || todayKey()), []); },
  toggleCheckin(routineId, date) {
    const key = 'checkins_' + (date || todayKey());
    let list = this.get(key, []);
    if (list.includes(routineId)) {
      list = list.filter(id => id !== routineId);
    } else {
      list.push(routineId);
    }
    this.set(key, list);
    this.updateStreak();
    return list.includes(routineId);
  },
  isDone(routineId, date) { return this.getCheckins(date).includes(routineId); },

  // Стрик
  updateStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const checkins = this.get('checkins_' + key, []);
      if (checkins.length > 0) streak++;
      else if (i > 0) break;
    }
    this.set('streak', streak);
    return streak;
  },
  getStreak() { return this.get('streak', 0); },

  // Онбординг пройден?
  isOnboarded() { return this.get('onboarded', false); },
  setOnboarded() { this.set('onboarded', true); }
};

/* ---- 3. СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---- */
const State = {
  history: [],          // стек экранов
  currentScreen: null,  // текущий экран
  currentParams: {},    // параметры текущего экрана
  onboardingStep: 1,    // шаг онбординга (1–3)
  tempScores: {},       // временные оценки в онбординге
  libraryFilter: { sphere: 'all', difficulty: 'all', subcategory: 'all', query: '' },
  activeSphereTab: {},  // { sphereId: subcategoryId }
  activePeriod: 'week'  // для прогресс-экрана
};

/* ---- 4. НАВИГАЦИЯ ---- */
function navigate(screen, params = {}, back = false) {
  const container = document.getElementById('screen-container');
  const old = container.querySelector('.screen');

  // Анимация ухода старого экрана
  if (old) {
    old.style.pointerEvents = 'none';
    old.style.opacity = '0';
    old.style.transform = back ? 'translateX(40px)' : 'translateX(-40px)';
    old.style.transition = 'opacity 180ms ease, transform 180ms ease';
    setTimeout(() => old.remove(), 200);
  }

  State.currentScreen = screen;
  State.currentParams = params;

  const el = document.createElement('div');
  el.className = 'screen ' + (back ? 'slide-back' : 'slide-in');
  el.innerHTML = renderScreen(screen, params);
  container.appendChild(el);

  bindScreen(screen, params, el);
  updateBottomNav(screen);
  updateTgButtons(screen);

  // Прокрутка в начало
  setTimeout(() => el.scrollTop = 0, 50);
}

function goBack() {
  if (State.history.length > 0) {
    const prev = State.history.pop();
    navigate(prev.screen, prev.params, true);
  } else {
    navigate('dashboard', {}, true);
  }
}

function pushHistory(screen, params) {
  State.history.push({ screen, params });
}

// Обновление активного таба нижней навигации
function updateBottomNav(screen) {
  const nav = document.getElementById('bottom-nav');
  if (['onboarding', 'sphere-detail'].includes(screen)) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
    nav.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.screen === screen);
    });
  }
}

// Управление кнопками Telegram
function updateTgButtons(screen) {
  // BackButton — только на экранах без bottom-nav
  if (['sphere-detail'].includes(screen)) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
  tg.MainButton.hide();
}

/* ---- 5. РЕНДЕР ЭКРАНОВ (диспетчер) ---- */
function renderScreen(screen, params) {
  switch (screen) {
    case 'onboarding':    return renderOnboarding();
    case 'dashboard':     return renderDashboard();
    case 'sphere-list':   return renderSphereList();
    case 'sphere-detail': return renderSphereDetail(params.sphereId);
    case 'library':       return renderLibrary(params);
    case 'progress':      return renderProgress();
    case 'profile':       return renderProfile();
    default:              return renderDashboard();
  }
}

/* ---- 6. ОНБОРДИНГ (3 шага) ---- */
function renderOnboarding() {
  const step = State.onboardingStep;
  const dots = [1,2,3].map(i =>
    `<div class="progress-dot ${i === step ? 'active' : ''}"></div>`
  ).join('');

  let content = '';
  if (step === 1) content = renderOnboardingStep1();
  if (step === 2) content = renderOnboardingStep2();
  if (step === 3) content = renderOnboardingStep3();

  return `
    <div class="onboarding-screen">
      <div class="onboarding-progress">${dots}</div>
      <div class="onboarding-content">${content}</div>
      <div class="onboarding-footer" id="onboarding-footer">${renderOnboardingFooter(step)}</div>
    </div>
  `;
}

function renderOnboardingStep1() {
  const user = tg.initDataUnsafe?.user || {};
  const name = user.first_name || 'Пользователь';
  const photo = user.photo_url;

  return `
    <div style="text-align:center; padding-top:20px;">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6c4bff,#ff5282);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;box-shadow:0 0 0 3px rgba(108,75,255,0.4),0 8px 24px rgba(108,75,255,0.3);overflow:hidden;">
        ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : name[0].toUpperCase()}
      </div>
      <div style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;">Привет, ${name}!</div>
      <div style="font-size:15px;color:var(--text-dim);margin-bottom:24px;line-height:1.6;">Твой личный трекер баланса жизни</div>
      <div style="display:flex;flex-direction:column;gap:10px;max-width:300px;margin:0 auto 24px;text-align:left;">
        <div style="display:flex;align-items:flex-start;gap:14px;background:var(--surface2);border-radius:16px;padding:14px 16px;border:1px solid var(--border);">
          <span style="font-size:24px;flex-shrink:0;margin-top:1px;">🎯</span>
          <span style="font-size:13px;color:var(--text);line-height:1.5;">Оцени 9 сфер жизни и выбери какую прокачать</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;background:var(--surface2);border-radius:16px;padding:14px 16px;border:1px solid var(--border);">
          <span style="font-size:24px;flex-shrink:0;margin-top:1px;">✅</span>
          <span style="font-size:13px;color:var(--text);line-height:1.5;">Выбирай практики из библиотеки или добавляй свои, отмечай выполненные</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;background:var(--surface2);border-radius:16px;padding:14px 16px;border:1px solid var(--border);">
          <span style="font-size:24px;flex-shrink:0;margin-top:1px;">📈</span>
          <span style="font-size:13px;color:var(--text);line-height:1.5;">Следи за прогрессом и анализируй улучшения</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:280px;margin:0 auto;">
        ${SPHERES.slice(0,9).map(s => `
          <div style="background:var(--surface2);border-radius:14px;padding:12px 8px;text-align:center;border:1px solid var(--border);">
            <div style="font-size:22px;margin-bottom:4px;">${s.emoji}</div>
            <div style="font-size:10px;color:var(--text-muted);line-height:1.2;">${s.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOnboardingStep2() {
  const scores = State.tempScores;
  SPHERES.forEach(s => { if (!scores[s.id]) scores[s.id] = 5; });

  return `
    <div>
      <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px;">Оцени каждую сферу</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Честно. От 0 до 10. Это твоя точка отсчёта.</div>

      <div class="radar-wrap" style="margin-bottom:20px;">
        ${renderRadarSVG(SPHERES.map(s => scores[s.id] || 5), 100)}
      </div>

      <div id="sliders-container">
        ${SPHERES.map(s => `
          <div class="slider-wrap">
            <div class="slider-label-row">
              <div class="slider-sphere-name">
                <span>${s.emoji}</span><span>${s.name}</span>
              </div>
              <div class="slider-value" id="val-${s.id}" style="color:${s.color}">${scores[s.id] || 5}</div>
            </div>
            <input type="range" min="0" max="10" value="${scores[s.id] || 5}"
              data-sphere="${s.id}"
              style="background: linear-gradient(to right, ${s.color} 0%, ${s.color} ${(scores[s.id]||5)*10}%, rgba(255,255,255,0.1) ${(scores[s.id]||5)*10}%, rgba(255,255,255,0.1) 100%);"
            >
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOnboardingStep3() {
  // Находим сферу с минимальной оценкой
  const scores = State.tempScores;
  let minSphere = SPHERES[0];
  SPHERES.forEach(s => { if ((scores[s.id] || 5) < (scores[minSphere.id] || 5)) minSphere = s; });

  // Первая практика для этой сферы
  const routine = getRoutinesBySphere(minSphere.id)[0];

  return `
    <div>
      <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px;">Начни с малого</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Твоя сфера "${minSphere.name}" требует внимания. Вот практика на 5 минут:</div>

      ${routine ? `
        <div style="background:linear-gradient(135deg,${minSphere.color}15,${minSphere.color}08);border:1px solid ${minSphere.color}25;border-radius:20px;padding:20px;margin-bottom:20px;">
          <div style="font-size:36px;margin-bottom:8px;">${routine.emoji}</div>
          <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;margin-bottom:6px;color:${minSphere.color};">${routine.title}</div>
          <div style="font-size:13px;color:var(--text-dim);margin-bottom:10px;line-height:1.5;">${routine.description}</div>
          <div style="font-size:11px;color:var(--text-muted);background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 12px;">
            🔬 ${routine.science_note}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;font-size:11px;color:var(--text-muted);">
            <span>⏱ ${formatDuration(routine.duration_minutes)}</span>
            <span>${difficultyBadge(routine.difficulty)}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-full" id="btn-add-first" data-id="${routine.id}">
          ✓ Добавить в мои практики
        </button>
        <button class="btn btn-ghost btn-full" id="btn-skip-routine" style="margin-top:8px;">
          Пропустить
        </button>
      ` : ''}
    </div>
  `;
}

function renderOnboardingFooter(step) {
  if (step === 1) return `<button class="btn btn-primary btn-full" id="btn-next-step">Начать →</button>`;
  if (step === 2) return `<button class="btn btn-primary btn-full" id="btn-next-step">Посмотреть мой радар →</button>`;
  if (step === 3) return `<button class="btn btn-primary btn-full" id="btn-finish">Перейти в приложение →</button>`;
  return '';
}

/* ---- 7. ДАШБОРД ---- */
function renderDashboard() {
  const user = tg.initDataUnsafe?.user || {};
  const name = user.first_name || 'Пользователь';
  const photo = user.photo_url;
  const scores = Store.getScores();
  const streak = Store.getStreak();
  const myRoutines = Store.getMyRoutines();
  const todayCheckins = Store.getCheckins();
  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / SPHERES.length).toFixed(1);
  const doneCount = myRoutines.filter(r => todayCheckins.includes(r.id)).length;
  const totalCount = myRoutines.length;

  // Слабые сферы (< 5) для блока "Требуют внимания"
  const weakSpheres = SPHERES.filter(s => (scores[s.id] || 5) < 5).slice(0, 3);
  // Показывать блок только если пользователь > 7 дней или есть слабые сферы
  const showAttention = weakSpheres.length > 0;

  return `
    <!-- Хедер -->
    <div class="dashboard-header anim-1">
      <div class="greeting-wrap">
        <div class="greeting-sub">${greeting()},</div>
        <div class="greeting-name">${name}</div>
      </div>
      <div class="avatar-wrap" id="avatar-btn">
        <div class="avatar">
          ${photo ? `<img src="${photo}" alt="">` : name[0].toUpperCase()}
        </div>
        <div class="avatar-badge">⚡</div>
      </div>
    </div>

    <!-- Стрик -->
    <div class="section anim-1" style="margin-top:14px;">
      <div class="streak-banner" id="streak-banner">
        <div class="streak-fire">🔥</div>
        <div class="streak-info">
          <div class="streak-num">${streak} ${pluralDays(streak)}</div>
          <div class="streak-label">Серия без перерыва</div>
        </div>
        <div class="streak-bar-wrap">
          <div class="streak-bar-fill" style="width:${Math.min(100, (streak % 7) / 7 * 100)}%"></div>
        </div>
      </div>
    </div>

    <!-- Радар + прогресс дня -->
    <div class="section anim-2">
      <div class="card" style="padding:16px;">
        <!-- Заголовок -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.04em;line-height:1;">
              ${avg}<span style="font-size:14px;color:var(--text-muted);font-weight:400;">/10</span>
            </div>
            <div style="font-size:11px;color:var(--text-muted);">Средний баланс</div>
          </div>
          <button style="font-size:11px;color:var(--accent);background:none;border:1px solid rgba(108,75,255,0.3);border-radius:20px;padding:5px 10px;cursor:pointer;" id="btn-reeval">изменить →</button>
        </div>
        <!-- Радар на всю ширину -->
        <div style="width:100%;aspect-ratio:1/1;max-width:280px;margin:0 auto 14px;">
          ${renderRadarSVG(SPHERES.map(s => scores[s.id] || 5), 280, true)}
        </div>
        <!-- Минибары всех сфер -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;">
          ${SPHERES.map(s => `
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:12px;width:16px;">${s.emoji}</span>
              <div style="flex:1;height:3px;background:rgba(255,255,255,0.07);border-radius:100px;overflow:hidden;">
                <div style="width:${(scores[s.id]||5)*10}%;height:100%;background:${s.color};border-radius:100px;"></div>
              </div>
              <span style="font-size:9px;color:var(--text-muted);width:14px;text-align:right;">${scores[s.id]||5}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Прогресс дня -->
    <div class="section anim-3">
      <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:14px;">
        <div class="progress-ring-wrap">
          ${renderProgressRing(totalCount > 0 ? doneCount / totalCount : 0, 60)}
          <div class="progress-ring-text">
            <span class="progress-ring-pct">${doneCount}</span>
            <span class="progress-ring-sub">из ${totalCount}</span>
          </div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text-dim);">Сегодня</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
            ${doneCount === totalCount && totalCount > 0
              ? '✅ Всё выполнено!'
              : totalCount === 0
                ? 'Добавь практики из библиотеки'
                : `Осталось ${totalCount - doneCount}`}
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
            <span style="background:rgba(92,248,160,0.12);color:#5cf8a0;border:1px solid rgba(92,248,160,0.2);border-radius:100px;font-size:10px;padding:3px 9px;">${doneCount} сделано</span>
            <span style="background:rgba(255,255,255,0.05);color:var(--text-muted);border:1px solid var(--border);border-radius:100px;font-size:10px;padding:3px 9px;">${totalCount - doneCount} осталось</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Блок "Требуют внимания" -->
    ${showAttention ? `
      <div class="section anim-4">
        <div class="attention-card">
          <div class="attention-header">
            <div class="attention-dot"></div>
            <div class="attention-title">Требуют внимания</div>
          </div>
          ${weakSpheres.map(s => `
            <div class="attention-row">
              <div class="attention-sphere">
                <span>${s.emoji}</span><span>${s.name}</span>
                <span style="color:${s.color};font-family:'Syne',sans-serif;font-weight:800;font-size:13px;">${scores[s.id]}/10</span>
              </div>
              <button class="btn-add-routine" data-sphere="${s.id}" onclick="openLibrary('${s.id}')">+ Практика</button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Быстрые чекины -->
    ${myRoutines.length > 0 ? `
      <div class="section anim-5">
        <div class="section-title">Практики сегодня</div>
        <div class="checkins-scroll">
          ${myRoutines.map(r => {
            const s = getSphere(r.sphere);
            const done = todayCheckins.includes(r.id);
            return `
              <div class="checkin-card" data-id="${r.id}">
                <div class="checkin-stripe" style="background:linear-gradient(90deg,${s?.color||'#6c4bff'},${s?.color||'#6c4bff'}88);"></div>
                <div class="checkin-emoji">${r.emoji}</div>
                <div class="checkin-name">${r.title}</div>
                <div class="checkin-sphere">${s?.name || ''} · ${formatDuration(r.duration_minutes)}</div>
                <button class="checkin-btn ${done ? 'done' : ''}" data-id="${r.id}">
                  ${done ? '✓ Готово' : 'Отметить'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="section anim-4">
        <div class="empty-state" style="padding:30px 0;">
          <div class="empty-emoji">🌱</div>
          <div class="empty-title">Нет практик</div>
          <div class="empty-text">Добавь первую практику из библиотеки и начни строить привычки</div>
          <button class="btn btn-primary" onclick="openLibrary()" style="margin-top:8px;">Открыть библиотеку</button>
        </div>
      </div>
    `}
  `;
}

/* ---- 8. СПИСОК СФЕР ---- */
function renderSphereList() {
  const scores = Store.getScores();
  const myRoutines = Store.getMyRoutines();

  return `
    <div class="screen-header">
      <div class="screen-title">Сферы жизни</div>
      <div class="screen-subtitle">Колесо жизненного баланса</div>
    </div>

    <div class="section">
      <div class="radar-wrap" style="margin-bottom:16px;">
        ${renderRadarSVG(SPHERES.map(s => scores[s.id] || 5), 110)}
      </div>
    </div>

    <div class="section">
      <div class="spheres-grid">
        ${SPHERES.map(s => {
          const score = scores[s.id] || 5;
          const count = myRoutines.filter(r => r.sphere === s.id).length;
          return `
            <div class="sphere-card" data-sphere="${s.id}" style="cursor:pointer;">
              <div class="sphere-card-emoji">${s.emoji}</div>
              <div class="sphere-card-name">${s.name}</div>
              <div class="sphere-score-row">
                <div class="sphere-score" style="color:${s.color}">${score}</div>
                <div class="sphere-score-label">/10</div>
              </div>
              <div class="sphere-bar">
                <div class="sphere-bar-fill" style="width:${score*10}%;background:${s.color};"></div>
              </div>
              <div class="sphere-routines-count">${count} ${pluralRoutines(count)}</div>
              <div style="position:absolute;top:0;left:0;right:0;height:3px;border-radius:22px 22px 0 0;background:${s.color};opacity:0.6;"></div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="section">
      <button class="btn btn-ghost btn-full" id="btn-reeval-full">Переоценить сферы</button>
    </div>
  `;
}

/* ---- 9. ДЕТАЛИ СФЕРЫ ---- */
function renderSphereDetail(sphereId) {
  const sphere = getSphere(sphereId);
  if (!sphere) return '<div class="section"><p>Сфера не найдена</p></div>';

  const scores = Store.getScores();
  const score = scores[sphereId] || 5;
  const myRoutines = Store.getMyRoutines().filter(r => r.sphere === sphereId);
  const todayCheckins = Store.getCheckins();

  const hasTabs = sphere.subcategories && sphere.subcategories.length > 1;
  const activeTab = State.activeSphereTab[sphereId] || (sphere.subcategories[0] || 'general');
  const tabRoutines = hasTabs
    ? myRoutines.filter(r => r.subcategory === activeTab)
    : myRoutines;

  // Хeatmap — последние 28 дней
  const heatmapCells = renderHeatmap(sphereId);

  return `
    <!-- Хедер сферы -->
    <div class="sphere-detail-header">
      <div class="sphere-back-btn" id="btn-back">←</div>
      <div class="sphere-detail-info">
        <div class="sphere-detail-tag" style="color:${sphere.color}">${sphere.name}</div>
        <div class="sphere-detail-name">${sphere.name}</div>
      </div>
      <div class="sphere-detail-emoji">${sphere.emoji}</div>
    </div>

    <!-- Оценка -->
    <div class="section" style="margin-top:16px;">
      <div style="background:${sphere.color}10;border:1px solid ${sphere.color}20;border-radius:20px;padding:16px;display:flex;align-items:center;gap:16px;">
        <div>
          ${renderDialGauge(score, sphere.color)}
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted);">Текущая оценка</div>
          <div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:${sphere.color};">${score}/10</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${myRoutines.length} активных практик</div>
          <button class="btn btn-sm btn-ghost" id="btn-edit-score" data-sphere="${sphereId}" style="margin-top:8px;">Изменить оценку</button>
        </div>
      </div>
    </div>

    <!-- Тепловая карта -->
    <div class="section">
      <div class="section-title">Активность за месяц</div>
      <div class="card" style="padding:14px;">
        ${heatmapCells}
      </div>
    </div>

    <!-- Вкладки (если есть подкатегории) -->
    ${hasTabs ? `
      <div class="section">
        <div class="tabs" id="sphere-tabs">
          ${sphere.subcategories.map(sub => `
            <button class="tab-btn ${sub === activeTab ? 'active' : ''}" data-tab="${sub}" data-sphere="${sphereId}">
              ${SUBCATEGORY_LABELS[sub] || sub}
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Список практик -->
    <div class="section">
      <div class="section-title">Мои практики</div>
      <div id="routines-list">
        ${tabRoutines.length > 0 ? tabRoutines.map(r => {
          const done = todayCheckins.includes(r.id);
          return `
            <div class="routine-item ${done ? 'routine-done' : ''}" style="margin-bottom:8px;" data-routine="${r.id}">
              <div class="routine-emoji">${r.emoji}</div>
              <div class="routine-body">
                <div class="routine-name">${r.title}</div>
                <div class="routine-meta">
                  <span>⏱ ${formatDuration(r.duration_minutes)}</span>
                  ${difficultyBadge(r.difficulty)}
                  ${r.is_custom ? '<span class="badge-custom">Своя</span>' : ''}
                </div>
              </div>
              ${r.is_custom ? `
                <div class="routine-actions">
                  <div class="routine-action-btn" data-edit-custom="${r.id}">✏️</div>
                  <div class="routine-action-btn danger" data-delete-custom="${r.id}">🗑️</div>
                </div>
              ` : `
                <div class="check-circle ${done ? 'done' : ''}" data-id="${r.id}">
                  ${done ? '✓' : ''}
                </div>
              `}
            </div>
          `;
        }).join('') : `
          <div class="empty-state" style="padding:24px 0;">
            <div class="empty-emoji">🌱</div>
            <div class="empty-title">Пусто</div>
            <div class="empty-text">Добавь практики из библиотеки и начни прокачивать эту сферу</div>
          </div>
        `}
      </div>
      <button class="btn-add-dashed" style="margin-top:8px;" id="btn-add-from-lib" data-sphere="${sphereId}" ${hasTabs ? `data-sub="${activeTab}"` : ''}>
        + Добавить из библиотеки
      </button>
    </div>
  `;
}

/* ---- 10. БИБЛИОТЕКА ---- */
function renderLibrary(params = {}) {
  const filter = State.libraryFilter;
  if (params.sphere) filter.sphere = params.sphere;
  if (params.subcategory) filter.subcategory = params.subcategory;

  let routines = ROUTINES;

  // Фильтр по сфере
  if (filter.sphere !== 'all') routines = routines.filter(r => r.sphere === filter.sphere);
  // Фильтр по подкатегории
  if (filter.subcategory !== 'all') routines = routines.filter(r => r.subcategory === filter.subcategory);
  // Фильтр по сложности
  if (filter.difficulty !== 'all') routines = routines.filter(r => r.difficulty === filter.difficulty);
  // Поиск
  if (filter.query) {
    const q = filter.query.toLowerCase();
    routines = routines.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  return `
    <div class="screen-header">
      <div class="screen-title">Библиотека практик</div>
      <div class="screen-subtitle">${ROUTINES.length} практик по всем сферам</div>
    </div>

    <div class="section">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="lib-search" placeholder="Поиск практик..." value="${filter.query}" autocomplete="off">
      </div>
    </div>

    <div class="section" style="margin-bottom:10px;">
      <div class="filter-chips" id="sphere-chips">
        <div class="chip ${filter.sphere === 'all' ? 'active' : ''}" data-sphere="all">Все</div>
        ${SPHERES.map(s => `
          <div class="chip ${filter.sphere === s.id ? 'active' : ''}" data-sphere="${s.id}" style="${filter.sphere === s.id ? `border-color:${s.color}44;color:${s.color};background:${s.color}18;` : ''}">
            ${s.emoji} ${s.name}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section" style="margin-bottom:10px;">
      <div class="filter-chips" id="diff-chips">
        <div class="chip ${filter.difficulty === 'all' ? 'active' : ''}" data-diff="all">Любая сложность</div>
        <div class="chip ${filter.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Лёгкое</div>
        <div class="chip ${filter.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Среднее</div>
        <div class="chip ${filter.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Сложное</div>
      </div>
    </div>

    <!-- Кастомные практики пользователя в библиотеке -->
    ${(() => {
      const custom = Store.getMyRoutines().filter(r => r.is_custom);
      if (!custom.length) return '';
      return `
        <div class="section" style="margin-bottom:10px;">
          <div class="section-title">Мои практики ✦</div>
          ${custom.map(r => {
            const s = getSphere(r.sphere);
            return `
              <div class="routine-item" style="margin-bottom:8px;" data-routine-info="${r.id}">
                <div class="routine-emoji">${r.emoji}</div>
                <div class="routine-body">
                  <div class="routine-name">${r.title}</div>
                  <div class="routine-meta">
                    <span style="color:${s?.color}">${s?.emoji} ${s?.name}</span>
                    <span>⏱ ${formatDuration(r.duration_minutes)}</span>
                    <span class="badge-custom">Своя</span>
                  </div>
                </div>
                <div class="routine-actions">
                  <div class="routine-action-btn" data-edit-custom="${r.id}" title="Редактировать">✏️</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    })()}

    <!-- Кнопка добавить свою практику -->
    <div class="section" style="margin-bottom:4px;">
      <button id="fab-create-routine" style="
        width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
        padding:14px;border-radius:16px;border:1.5px dashed rgba(108,75,255,0.5);
        background:rgba(108,75,255,0.08);color:var(--accent);
        font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;
      ">
        <span style="font-size:20px;line-height:1;">+</span>
        Создать свою практику
      </button>
    </div>

    <div class="section">
      <div class="section-title">${routines.length} практик</div>
      <div id="library-list">
        ${routines.length > 0 ? routines.map(r => {
          const s = getSphere(r.sphere);
          const added = Store.hasRoutine(r.id);
          return `
            <div class="routine-item" style="margin-bottom:8px;" data-routine-info="${r.id}">
              <div class="routine-emoji">${r.emoji}</div>
              <div class="routine-body">
                <div class="routine-name">${r.title}</div>
                <div class="routine-meta">
                  <span style="color:${s?.color}">${s?.emoji} ${s?.name}</span>
                  <span>⏱ ${formatDuration(r.duration_minutes)}</span>
                  ${difficultyBadge(r.difficulty)}
                </div>
              </div>
              <button class="btn btn-sm ${added ? 'btn-ghost' : 'btn-secondary'}" data-add="${r.id}" style="flex-shrink:0;${added ? '' : `color:${s?.color};border-color:${s?.color}33;background:${s?.color}15;`}">
                ${added ? '✓' : '+'}
              </button>
            </div>
          `;
        }).join('') : `
          <div class="empty-state">
            <div class="empty-emoji">🔍</div>
            <div class="empty-title">Ничего не найдено</div>
            <div class="empty-text">Попробуй другой поиск или сброси фильтры</div>
            <button class="btn btn-ghost" id="btn-reset-filters">Сбросить фильтры</button>
          </div>
        `}
      </div>
    </div>

  `;
}

/* ---- 11. ПРОГРЕСС ---- */
function renderProgress() {
  const scores = Store.getScores();
  const myRoutines = Store.getMyRoutines();
  const streak = Store.getStreak();
  const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / SPHERES.length).toFixed(1);
  const period = State.activePeriod;

  // Посчитаем общее число чекинов за 7 дней
  let totalCheckins = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    totalCheckins += Store.getCheckins(d.toISOString().slice(0, 10)).length;
  }

  return `
    <div class="screen-header">
      <div class="screen-title">Прогресс</div>
      <div class="screen-subtitle">Твоя динамика</div>
    </div>

    <div class="section">
      <div class="period-tabs">
        <button class="period-tab ${period === 'week' ? 'active' : ''}" data-period="week">Неделя</button>
        <button class="period-tab ${period === 'month' ? 'active' : ''}" data-period="month">Месяц</button>
        <button class="period-tab ${period === 'year' ? 'active' : ''}" data-period="year">Год</button>
      </div>
    </div>

    <div class="section">
      <div class="card" style="padding:20px;text-align:center;">
        <div class="score-big-num">${avg}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Средний баланс /10</div>
        <div style="font-size:13px;margin-top:8px;color:#5cf8a0;">↑ Продолжай в том же духе!</div>
      </div>
    </div>

    <!-- Мини-статистика -->
    <div class="section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num" style="color:#ff9500;">🔥 ${streak}</div>
          <div class="stat-label">Дней серии</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${totalCheckins}</div>
          <div class="stat-label">Чекинов за 7 дней</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${myRoutines.length}</div>
          <div class="stat-label">Активных практик</div>
        </div>
      </div>
    </div>

    <!-- Оценки по сферам -->
    <div class="section">
      <div class="section-title">Оценки по сферам</div>
      <div class="card" style="padding:16px;">
        ${SPHERES.map(s => {
          const score = scores[s.id] || 5;
          return `
            <div class="sphere-bar-row">
              <div class="sphere-bar-row-name">
                <span>${s.emoji}</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.name}</span>
              </div>
              <div class="sphere-bar-row-track">
                <div class="sphere-bar-row-fill" style="width:${score*10}%;background:${s.color};"></div>
              </div>
              <div class="sphere-bar-row-val" style="color:${s.color};">${score}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Радар -->
    <div class="section">
      <div class="section-title">Колесо жизни</div>
      <div class="card" style="padding:16px;">
        <div class="radar-wrap">
          ${renderRadarSVG(SPHERES.map(s => scores[s.id] || 5), 130)}
        </div>
      </div>
    </div>

    <!-- Pro-блок -->
    <div class="section">
      <div class="pro-block">
        <div class="pro-title">✦ Портфель Pro</div>
        <ul class="pro-features">
          <li>История за 6 месяцев</li>
          <li>Еженедельный AI-разбор от Gemini</li>
          <li>Экспорт в Telegram Stories</li>
          <li>Приоритетные напоминания</li>
        </ul>
        <button class="btn btn-primary btn-full" id="btn-go-pro">Попробовать Pro</button>
      </div>
    </div>
  `;
}

/* ---- 12. ПРОФИЛЬ ---- */
function renderProfile() {
  const user = tg.initDataUnsafe?.user || {};
  const name = user.first_name || 'Пользователь';
  const username = user.username ? '@' + user.username : '';
  const photo = user.photo_url;
  const streak = Store.getStreak();
  const myRoutines = Store.getMyRoutines();
  const totalCheckins = Store.get('total_checkins', 0);
  const reminderOn = Store.get('reminder_on', false);
  const reminderTime = Store.get('reminder_time', '09:00');

  return `
    <div class="screen-header">
      <div class="screen-title">Профиль</div>
    </div>

    <!-- Аватар + имя -->
    <div class="section">
      <div style="display:flex;align-items:center;gap:14px;padding:8px 0;">
        <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#6c4bff,#ff5282);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;flex-shrink:0;overflow:hidden;box-shadow:0 0 0 2px rgba(108,75,255,0.4);">
          ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : name[0].toUpperCase()}
        </div>
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;">${name}</div>
          <div style="font-size:13px;color:var(--text-muted);">${username || 'Telegram-пользователь'}</div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num" style="color:#ff9500;">🔥${streak}</div>
          <div class="stat-label">Серия дней</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${myRoutines.length}</div>
          <div class="stat-label">Моих практик</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${totalCheckins}</div>
          <div class="stat-label">Всего чекинов</div>
        </div>
      </div>
    </div>

    <!-- Напоминания -->
    <div class="section">
      <div class="section-title">Напоминания</div>
      <div class="card-surface" style="padding:0 16px;">
        <div class="setting-row">
          <span class="setting-icon">🔔</span>
          <span class="setting-label">Ежедневное напоминание</span>
          <label class="toggle">
            <input type="checkbox" id="toggle-reminder" ${reminderOn ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="setting-row" id="reminder-time-row" style="${reminderOn ? '' : 'opacity:0.4;pointer-events:none;'}">
          <span class="setting-icon">⏰</span>
          <span class="setting-label">Время напоминания</span>
          <input type="time" id="reminder-time" value="${reminderTime}" style="color:var(--text-muted);font-size:14px;background:none;border:none;outline:none;cursor:pointer;">
        </div>
      </div>
    </div>

    <!-- Настройки -->
    <div class="section">
      <div class="section-title">Настройки</div>
      <div class="card-surface" style="padding:0 16px;">
        <div class="setting-row" id="btn-reeval-profile">
          <span class="setting-icon">🎯</span>
          <span class="setting-label">Переоценить колесо жизни</span>
          <span style="font-size:14px;color:var(--text-muted);">→</span>
        </div>
        <div class="setting-row" id="btn-share">
          <span class="setting-icon">📤</span>
          <span class="setting-label">Поделиться приложением</span>
          <span style="font-size:14px;color:var(--text-muted);">→</span>
        </div>
        <div class="setting-row" id="btn-reset">
          <span class="setting-icon">🗑️</span>
          <span class="setting-label" style="color:var(--danger);">Сбросить данные</span>
          <span style="font-size:14px;color:var(--text-muted);">→</span>
        </div>
      </div>
    </div>

    <!-- Pro -->
    <div class="section">
      <div class="pro-block">
        <div class="pro-title">✦ Портфель Pro</div>
        <ul class="pro-features">
          <li>Еженедельный AI-отчёт от Gemini</li>
          <li>История за 6 месяцев</li>
          <li>Экспорт итогов недели</li>
        </ul>
        <button class="btn btn-primary btn-full" id="btn-go-pro-profile">Попробовать Pro — 299 ★</button>
        <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:6px;">≈ 90 ₽/мес</div>
      </div>
    </div>

    <div style="text-align:center;padding:16px 0 8px;font-size:11px;color:var(--text-faint);">
      Портфель жизни v1.0 · MVP
    </div>
  `;
}

/* ---- 13. КОМПОНЕНТЫ SVG ---- */

// Radar-диаграмма (9 сфер)
function renderRadarSVG(values, size = 130, responsive = false) {
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.44;
  const N = 9;
  const dotR = responsive ? 4 : 3;
  const strokeW = responsive ? 2 : 1.5;
  const gridStroke = responsive ? 1 : 0.7;

  function point(val, i) {
    const angle = (i * 2 * Math.PI / N) - Math.PI / 2;
    const r = (val / 10) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function gridPoint(frac, i) {
    const angle = (i * 2 * Math.PI / N) - Math.PI / 2;
    const r = frac * maxR;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }

  const dataPoints = values.map((v, i) => point(v, i));
  const polygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const grids = gridLevels.map((frac, li) =>
    `<polygon points="${Array.from({length:N}, (_,i) => gridPoint(frac,i)).join(' ')}" fill="none" stroke="rgba(255,255,255,${li === 3 ? 0.18 : 0.09})" stroke-width="${gridStroke}"/>`
  ).join('');

  const axes = Array.from({length:N}, (_,i) => {
    const angle = (i * 2 * Math.PI / N) - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + maxR * Math.cos(angle)).toFixed(1)}" y2="${(cy + maxR * Math.sin(angle)).toFixed(1)}" stroke="rgba(255,255,255,0.12)" stroke-width="${gridStroke}"/>`;
  }).join('');

  const dots = dataPoints.map((p, i) =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotR}" fill="${SPHERES[i].color}" filter="url(#glow)"/>`
  ).join('');

  const svgSize = responsive
    ? `width="100%" height="100%" viewBox="0 0 ${size} ${size}" style="display:block;"`
    : `width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`;

  return `
    <svg ${svgSize} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${grids}${axes}
      <polygon points="${polygon}" fill="rgba(108,75,255,0.22)" stroke="rgba(108,75,255,0.85)" stroke-width="${strokeW}" stroke-linejoin="round" filter="url(#glow)"/>
      ${dots}
      <circle cx="${cx}" cy="${cy}" r="3" fill="rgba(108,75,255,0.6)" filter="url(#glow)"/>
    </svg>
  `;
}

// Кольцевой прогресс дня
function renderProgressRing(fraction, size = 60) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = fraction * circ;
  return `
    <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none"
        stroke="url(#ringGrad)" stroke-width="5"
        stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
        stroke-linecap="round"/>
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6c4bff"/>
          <stop offset="100%" stop-color="#5cf8a0"/>
        </linearGradient>
      </defs>
    </svg>
  `;
}

// Gauge для деталей сферы
function renderDialGauge(score, color, size = 72) {
  const r = (size - 10) / 2;
  const circ = Math.PI * r; // половина окружности
  const dash = (score / 10) * circ;
  return `
    <svg width="${size}" height="${size/2 + 10}" viewBox="0 0 ${size} ${size/2 + 10}" style="overflow:visible;">
      <defs>
        <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${color}60"/>
          <stop offset="100%" stop-color="${color}"/>
        </linearGradient>
      </defs>
      <path d="M 5,${size/2} A ${r},${r} 0 0,1 ${size-5},${size/2}" fill="none" stroke="${color}20" stroke-width="6" stroke-linecap="round"/>
      <path d="M 5,${size/2} A ${r},${r} 0 0,1 ${size-5},${size/2}" fill="none" stroke="url(#dialGrad)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"/>
      <text x="${size/2}" y="${size/2 - 4}" text-anchor="middle" font-family="Syne,sans-serif" font-size="20" font-weight="800" fill="white">${score}</text>
      <text x="${size/2}" y="${size/2 + 10}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.3)">/10</text>
    </svg>
  `;
}

// Тепловая карта 4×7 (28 дней)
function renderHeatmap(sphereId) {
  const cells = [];
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const checkins = Store.getCheckins(key);
    // Считаем только чекины по практикам этой сферы
    const myRoutines = Store.getMyRoutines().filter(r => r.sphere === sphereId);
    const count = myRoutines.filter(r => checkins.includes(r.id)).length;
    const lvl = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    cells.push(`<div class="heatmap-cell hm-${lvl}" title="${key}: ${count} практик"></div>`);
  }

  return `
    <div class="heatmap-grid">${cells.join('')}</div>
    <div class="heatmap-days">${days.map(d => `<div class="heatmap-day">${d}</div>`).join('')}</div>
  `;
}

/* ---- 14. МОДАЛЬНЫЕ ОКНА ---- */

// Открыть bottom sheet
function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');
  overlay.classList.remove('hidden');
  container.innerHTML = `<div class="bottom-sheet">${html}</div>`;

  overlay.onclick = closeModal;
  // Свайп вниз для закрытия
  const sheet = container.querySelector('.bottom-sheet');
  let startY = 0;
  sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - startY;
    if (dy > 80) closeModal();
  }, { passive: true });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-container').innerHTML = '';
}

// Модал: карточка практики (ищет в библиотеке и в кастомных)
function openRoutineModal(routineId) {
  // Кастомная практика → открыть форму редактирования
  const custom = Store.getMyRoutines().find(x => x.id === routineId && x.is_custom);
  if (custom) { openEditRoutineModal(custom); return; }

  const r = ROUTINES.find(x => x.id === routineId);
  if (!r) return;
  const s = getSphere(r.sphere);
  const added = Store.hasRoutine(r.id);

  openModal(`
    <div class="sheet-handle"></div>
    <div style="font-size:40px;margin-bottom:10px;">${r.emoji}</div>
    <div class="sheet-title">${r.title}</div>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="color:${s?.color};background:${s?.color}18;border:1px solid ${s?.color}30;border-radius:100px;padding:3px 10px;font-size:11px;">${s?.emoji} ${s?.name}</span>
      <span style="color:var(--text-muted);background:var(--surface2);border-radius:100px;padding:3px 10px;font-size:11px;">⏱ ${formatDuration(r.duration_minutes)}</span>
      ${difficultyBadge(r.difficulty)}
    </div>
    <div style="font-size:14px;color:var(--text-dim);line-height:1.6;margin-bottom:14px;">${r.description}</div>
    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:20px;">
      🔬 <em>${r.science_note}</em>
    </div>
    <button class="btn btn-full ${added ? 'btn-ghost' : 'btn-primary'}" id="modal-add-btn" data-id="${r.id}">
      ${added ? '✓ Уже добавлена' : '+ Добавить в мои практики'}
    </button>
    ${added ? `<button class="btn btn-full btn-danger" id="modal-remove-btn" data-id="${r.id}" style="margin-top:8px;">Удалить из моих практик</button>` : ''}
  `);

  document.getElementById('modal-add-btn')?.addEventListener('click', () => {
    if (!added) {
      Store.addRoutine(r);
      showToast('Практика добавлена! 🎉', 'success');
      tg.HapticFeedback.notificationOccurred('success');
      closeModal();
      refreshCurrentScreen();
    }
  });

  document.getElementById('modal-remove-btn')?.addEventListener('click', () => {
    Store.removeRoutine(r.id);
    showToast('Практика удалена');
    closeModal();
    refreshCurrentScreen();
  });
}

// Модал: переоценка колеса
function openReevalModal() {
  const scores = Store.getScores();

  openModal(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">Переоценить сферы</div>
    <div id="reeval-sliders">
      ${SPHERES.map(s => `
        <div class="slider-wrap">
          <div class="slider-label-row">
            <div class="slider-sphere-name"><span>${s.emoji}</span><span>${s.name}</span></div>
            <div class="slider-value" id="rv-${s.id}" style="color:${s.color}">${scores[s.id] || 5}</div>
          </div>
          <input type="range" min="0" max="10" value="${scores[s.id] || 5}" data-sphere="${s.id}" class="reeval-slider">
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary btn-full" id="btn-save-scores" style="margin-top:12px;">Сохранить</button>
  `);

  document.querySelectorAll('.reeval-slider').forEach(input => {
    input.addEventListener('input', e => {
      const id = e.target.dataset.sphere;
      document.getElementById('rv-' + id).textContent = e.target.value;
      updateSliderGradient(e.target, getSphereColor(id));
    });
  });

  document.getElementById('btn-save-scores').addEventListener('click', () => {
    document.querySelectorAll('.reeval-slider').forEach(input => {
      Store.setScore(input.dataset.sphere, parseInt(input.value));
    });
    showToast('Оценки сохранены! 📊', 'success');
    tg.HapticFeedback.notificationOccurred('success');
    closeModal();
    refreshCurrentScreen();
  });
}

// Форма создания/редактирования своей практики
function renderRoutineFormHTML(data = {}) {
  const d = {
    emoji: '⭐', title: '', description: '',
    sphere: 'health', subcategory: 'general',
    duration_minutes: 10, difficulty: 'easy', best_time: 'morning',
    ...data
  };

  const diffOptions = [
    { v: 'easy', l: 'Лёгкое' },
    { v: 'medium', l: 'Среднее' },
    { v: 'hard', l: 'Сложное' }
  ];
  const timeOptions = [
    { v: 'morning', l: 'Утром' },
    { v: 'afternoon', l: 'Днём' },
    { v: 'evening', l: 'Вечером' },
    { v: 'anytime', l: 'Любое' }
  ];

  return `
    <div class="form-group">
      <label class="form-label">Эмодзи и название</label>
      <div style="display:flex;gap:8px;">
        <input class="form-input" id="rf-emoji" value="${d.emoji}" maxlength="4" style="width:56px;text-align:center;font-size:22px;padding:8px;flex-shrink:0;">
        <input class="form-input" id="rf-title" placeholder="Название практики" value="${d.title}" style="flex:1;">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Сфера</label>
      <div class="sphere-picker" id="rf-sphere-picker">
        ${SPHERES.map(s => `
          <div class="sphere-option ${s.id === d.sphere ? 'selected' : ''}" data-sphere-pick="${s.id}"
               style="${s.id === d.sphere ? `border-color:${s.color};background:${s.color}18;` : ''}">
            <span class="sphere-option-emoji">${s.emoji}</span>
            <span class="sphere-option-name">${s.name}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Описание <span style="opacity:0.5;font-weight:400;text-transform:none;">(необязательно)</span></label>
      <textarea class="form-input form-textarea" id="rf-desc" placeholder="Что нужно сделать...">${d.description}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">Время выполнения: <span id="rf-dur-val">${d.duration_minutes}</span> мин</label>
      <input type="range" id="rf-duration" min="1" max="120" value="${d.duration_minutes}">
    </div>

    <div class="form-group">
      <label class="form-label">Сложность</label>
      <div class="btn-group">
        ${diffOptions.map(o => `
          <button class="btn-option ${d.difficulty === o.v ? 'selected' : ''}" data-diff-pick="${o.v}">${o.l}</button>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Лучшее время</label>
      <div class="btn-group">
        ${timeOptions.map(o => `
          <button class="btn-option ${d.best_time === o.v ? 'selected' : ''}" data-time-pick="${o.v}">${o.l}</button>
        `).join('')}
      </div>
    </div>
  `;
}

// Привязка событий внутри формы
function bindRoutineForm(onSave) {
  // Слайдер длительности
  const durInput = document.getElementById('rf-duration');
  if (durInput) {
    durInput.addEventListener('input', () => {
      document.getElementById('rf-dur-val').textContent = durInput.value;
      updateSliderGradient(durInput, 'var(--accent)');
    });
    updateSliderGradient(durInput, 'var(--accent)');
  }

  // Выбор сферы
  document.querySelectorAll('[data-sphere-pick]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('[data-sphere-pick]').forEach(x => {
        x.classList.remove('selected');
        x.style.borderColor = '';
        x.style.background = '';
      });
      const s = getSphere(el.dataset.spherePick);
      el.classList.add('selected');
      el.style.borderColor = s?.color || '';
      el.style.background = s ? s.color + '18' : '';
    });
  });

  // Выбор сложности
  document.querySelectorAll('[data-diff-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-diff-pick]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Выбор времени
  document.querySelectorAll('[data-time-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-time-pick]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Кнопка сохранить
  document.getElementById('rf-save')?.addEventListener('click', () => {
    const title = document.getElementById('rf-title').value.trim();
    if (!title) {
      document.getElementById('rf-title').focus();
      showToast('Введи название практики', 'error');
      return;
    }
    const routine = {
      emoji:            document.getElementById('rf-emoji').value || '⭐',
      title,
      description:      document.getElementById('rf-desc').value.trim(),
      sphere:           document.querySelector('[data-sphere-pick].selected')?.dataset.spherePick || 'health',
      subcategory:      'general',
      duration_minutes: parseInt(document.getElementById('rf-duration').value),
      difficulty:       document.querySelector('[data-diff-pick].selected')?.dataset.diffPick || 'easy',
      best_time:        document.querySelector('[data-time-pick].selected')?.dataset.timePick || 'morning',
      science_note:     '',
      is_premium:       false,
      is_custom:        true
    };
    onSave(routine);
  });
}

// Открыть модал создания практики
function openCreateRoutineModal(prefillSphere = null) {
  openModal(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">Создать свою практику</div>
    ${renderRoutineFormHTML({ sphere: prefillSphere || 'health' })}
    <button class="btn btn-primary btn-full" id="rf-save" style="margin-top:4px;">Создать практику</button>
    <button class="btn btn-ghost btn-full" onclick="closeModal()" style="margin-top:8px;">Отмена</button>
  `);

  bindRoutineForm(routine => {
    routine.id = 'custom_' + Date.now();
    Store.addRoutine(routine);
    tg.HapticFeedback.notificationOccurred('success');
    showToast('Практика создана! ✦', 'success');
    closeModal();
    refreshCurrentScreen();
  });
}

// Открыть модал редактирования кастомной практики
function openEditRoutineModal(routineData) {
  openModal(`
    <div class="sheet-handle"></div>
    <div class="sheet-title">Редактировать практику</div>
    ${renderRoutineFormHTML(routineData)}
    <button class="btn btn-primary btn-full" id="rf-save" style="margin-top:4px;">Сохранить изменения</button>
    <button class="btn btn-danger btn-full" id="rf-delete" style="margin-top:8px;">Удалить практику</button>
    <button class="btn btn-ghost btn-full" onclick="closeModal()" style="margin-top:8px;">Отмена</button>
  `);

  bindRoutineForm(updated => {
    updated.id = routineData.id;
    const list = Store.getMyRoutines().map(r => r.id === routineData.id ? { ...r, ...updated } : r);
    Store.setMyRoutines(list);
    tg.HapticFeedback.notificationOccurred('success');
    showToast('Изменения сохранены', 'success');
    closeModal();
    refreshCurrentScreen();
  });

  document.getElementById('rf-delete')?.addEventListener('click', () => {
    Store.removeRoutine(routineData.id);
    showToast('Практика удалена');
    closeModal();
    refreshCurrentScreen();
  });
}

// Обновить градиент слайдера
function updateSliderGradient(input, color) {
  const pct = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
}

/* ---- 15. TOAST ---- */
let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 2500);
}

/* ---- 16. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---- */

function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'дней';
  const m = n % 10;
  if (m === 1) return 'день';
  if (m >= 2 && m <= 4) return 'дня';
  return 'дней';
}

function pluralRoutines(n) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'практик';
  const m = n % 10;
  if (m === 1) return 'практика';
  if (m >= 2 && m <= 4) return 'практики';
  return 'практик';
}

function openLibrary(sphereId) {
  State.libraryFilter = { sphere: sphereId || 'all', difficulty: 'all', subcategory: 'all', query: '' };
  pushHistory(State.currentScreen, State.currentParams);
  navigate('library', { sphere: sphereId });
}

function refreshCurrentScreen() {
  navigate(State.currentScreen, State.currentParams, false);
}

/* ---- 17. ПРИВЯЗКА СОБЫТИЙ ---- */
function bindScreen(screen, params, container) {
  // Нижняя навигация
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.onclick = () => {
      State.history = [];
      navigate(tab.dataset.screen, {});
    };
  });

  if (screen === 'onboarding') bindOnboarding(container);
  if (screen === 'dashboard')   bindDashboard(container);
  if (screen === 'sphere-list') bindSphereList(container);
  if (screen === 'sphere-detail') bindSphereDetail(container, params.sphereId);
  if (screen === 'library')     bindLibrary(container);
  if (screen === 'progress')    bindProgress(container);
  if (screen === 'profile')     bindProfile(container);
}

function bindOnboarding(container) {
  container.querySelector('#btn-next-step')?.addEventListener('click', () => {
    if (State.onboardingStep === 2) {
      // Сохранить оценки
      SPHERES.forEach(s => {
        const val = parseInt(container.querySelector(`input[data-sphere="${s.id}"]`)?.value || 5);
        State.tempScores[s.id] = val;
        Store.setScore(s.id, val);
      });
    }
    State.onboardingStep++;
    navigate('onboarding');
  });

  container.querySelector('#btn-finish')?.addEventListener('click', () => {
    Store.setOnboarded();
    State.onboardingStep = 1;
    navigate('dashboard');
    document.getElementById('bottom-nav').classList.remove('hidden');
  });

  container.querySelector('#btn-add-first')?.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id;
    const r = ROUTINES.find(x => x.id === id);
    if (r) Store.addRoutine(r);
    e.currentTarget.textContent = '✓ Добавлено!';
    e.currentTarget.className = 'btn btn-ghost btn-full';
    tg.HapticFeedback.notificationOccurred('success');
  });

  container.querySelector('#btn-skip-routine')?.addEventListener('click', () => {
    Store.setOnboarded();
    State.onboardingStep = 1;
    navigate('dashboard');
    document.getElementById('bottom-nav').classList.remove('hidden');
  });

  // Слайдеры онбординга
  container.querySelectorAll('input[type="range"][data-sphere]').forEach(input => {
    input.addEventListener('input', e => {
      const id = e.target.dataset.sphere;
      const val = parseInt(e.target.value);
      State.tempScores[id] = val;
      const valEl = container.querySelector(`#val-${id}`);
      if (valEl) valEl.textContent = val;
      updateSliderGradient(e.target, getSphereColor(id));
      // Обновить радар
      const radar = container.querySelector('svg');
      if (radar) {
        radar.outerHTML = renderRadarSVG(SPHERES.map(s => State.tempScores[s.id] || 5), 100);
      }
    });
    updateSliderGradient(input, getSphereColor(input.dataset.sphere));
  });
}

function bindDashboard(container) {
  // Аватар → профиль
  container.querySelector('#avatar-btn')?.addEventListener('click', () => {
    pushHistory('dashboard', {});
    navigate('profile');
  });

  // Кнопка "изменить оценки"
  container.querySelector('#btn-reeval')?.addEventListener('click', openReevalModal);

  // Стрик → прогресс
  container.querySelector('#streak-banner')?.addEventListener('click', () => {
    pushHistory('dashboard', {});
    navigate('progress');
  });

  // Чекины
  container.querySelectorAll('.checkin-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const done = Store.toggleCheckin(id);
      btn.textContent = done ? '✓ Готово' : 'Отметить';
      btn.classList.toggle('done', done);
      if (done) {
        tg.HapticFeedback.impactOccurred('medium');
        showToast('Выполнено! 🎉', 'success');
        // Обновить счётчик чекинов
        const total = Store.get('total_checkins', 0);
        Store.set('total_checkins', total + 1);
      }
    });
  });

  // Кнопка "Требуют внимания" → библиотека
  container.querySelectorAll('.btn-add-routine').forEach(btn => {
    btn.addEventListener('click', () => openLibrary(btn.dataset.sphere));
  });
}

function bindSphereList(container) {
  container.querySelectorAll('.sphere-card').forEach(card => {
    card.addEventListener('click', () => {
      pushHistory('sphere-list', {});
      navigate('sphere-detail', { sphereId: card.dataset.sphere });
    });
  });

  container.querySelector('#btn-reeval-full')?.addEventListener('click', openReevalModal);
}

function bindSphereDetail(container, sphereId) {
  // Назад
  container.querySelector('#btn-back')?.addEventListener('click', goBack);
  tg.BackButton.onClick(goBack);

  // Чек-кружки
  container.querySelectorAll('.check-circle').forEach(circle => {
    circle.addEventListener('click', () => {
      const id = circle.dataset.id;
      const done = Store.toggleCheckin(id);
      circle.classList.toggle('done', done);
      circle.textContent = done ? '✓' : '';
      const item = circle.closest('.routine-item');
      item?.classList.toggle('routine-done', done);
      if (done) {
        tg.HapticFeedback.impactOccurred('medium');
        showToast('Выполнено! ✓', 'success');
        Store.set('total_checkins', (Store.get('total_checkins', 0)) + 1);
      }
    });
  });

  // Тап по карточке практики → модал
  container.querySelectorAll('.routine-item[data-routine]').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('check-circle') || e.target.closest('.check-circle')) return;
      openRoutineModal(item.dataset.routine);
    });
  });

  // Вкладки
  container.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      State.activeSphereTab[sphereId] = btn.dataset.tab;
      navigate('sphere-detail', { sphereId }, false);
    });
  });

  // Добавить из библиотеки
  container.querySelector('#btn-add-from-lib')?.addEventListener('click', e => {
    const sub = e.currentTarget.dataset.sub;
    State.libraryFilter = { sphere: sphereId, difficulty: 'all', subcategory: sub || 'all', query: '' };
    pushHistory('sphere-detail', { sphereId });
    navigate('library', { sphere: sphereId, subcategory: sub });
  });

  // Изменить оценку
  container.querySelector('#btn-edit-score')?.addEventListener('click', openReevalModal);

  // Удалить свою практику
  container.querySelectorAll('[data-delete-custom]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Store.removeRoutine(btn.dataset.deleteCustom);
      showToast('Практика удалена');
      navigate('sphere-detail', { sphereId }, false);
    });
  });

  // Редактировать свою практику
  container.querySelectorAll('[data-edit-custom]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const r = Store.getMyRoutines().find(x => x.id === btn.dataset.editCustom);
      if (r) openEditRoutineModal(r);
    });
  });
}

function bindLibrary(container) {
  // Поиск
  const searchInput = container.querySelector('#lib-search');
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        State.libraryFilter.query = e.target.value;
        navigate('library', {});
      }, 300);
    });
  }

  // Фильтр по сфере
  container.querySelectorAll('#sphere-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      State.libraryFilter.sphere = chip.dataset.sphere;
      State.libraryFilter.subcategory = 'all';
      navigate('library', {});
    });
  });

  // Фильтр по сложности
  container.querySelectorAll('#diff-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      State.libraryFilter.difficulty = chip.dataset.diff;
      navigate('library', {});
    });
  });

  // Сброс фильтров
  container.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
    State.libraryFilter = { sphere: 'all', difficulty: 'all', subcategory: 'all', query: '' };
    navigate('library', {});
  });

  // Добавить практику
  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.add;
      const r = ROUTINES.find(x => x.id === id);
      if (!r) return;
      if (!Store.hasRoutine(id)) {
        Store.addRoutine(r);
        btn.textContent = '✓';
        btn.className = 'btn btn-sm btn-ghost';
        showToast('Практика добавлена! 🎉', 'success');
        tg.HapticFeedback.notificationOccurred('success');
      }
    });
  });

  // Тап по карточке → модал
  container.querySelectorAll('[data-routine-info]').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('[data-add]') || e.target.closest('[data-edit-custom]')) return;
      openRoutineModal(item.dataset.routineInfo);
    });
  });

  // Редактировать кастомную практику (из секции "Мои практики" в библиотеке)
  container.querySelectorAll('[data-edit-custom]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const r = Store.getMyRoutines().find(x => x.id === btn.dataset.editCustom);
      if (r) openEditRoutineModal(r);
    });
  });

  // FAB: создать свою практику
  container.querySelector('#fab-create-routine')?.addEventListener('click', () => {
    const sphere = State.libraryFilter.sphere !== 'all' ? State.libraryFilter.sphere : null;
    openCreateRoutineModal(sphere);
  });
}

function bindProgress(container) {
  container.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      State.activePeriod = tab.dataset.period;
      navigate('progress', {});
    });
  });

  container.querySelector('#btn-go-pro')?.addEventListener('click', openProModal);
}

function bindProfile(container) {
  container.querySelector('#btn-reeval-profile')?.addEventListener('click', openReevalModal);

  container.querySelector('#btn-go-pro-profile')?.addEventListener('click', openProModal);

  container.querySelector('#toggle-reminder')?.addEventListener('change', e => {
    Store.set('reminder_on', e.target.checked);
    const row = container.querySelector('#reminder-time-row');
    if (row) { row.style.opacity = e.target.checked ? '1' : '0.4'; row.style.pointerEvents = e.target.checked ? '' : 'none'; }
  });

  container.querySelector('#reminder-time')?.addEventListener('change', e => {
    Store.set('reminder_time', e.target.value);
    showToast('Время напоминания сохранено');
  });

  container.querySelector('#btn-reset')?.addEventListener('click', () => {
    if (confirm('Сбросить все данные? Это действие нельзя отменить.')) {
      localStorage.clear();
      location.reload();
    }
  });

  container.querySelector('#btn-share')?.addEventListener('click', () => {
    const botUrl = 'https://t.me/lifeportfoliobot';
    const text = 'Попробуй Портфель жизни — трекер баланса по 9 сферам жизни 🌟';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
    if (tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  });
}

function openProModal() {
  openModal(`
    <div class="sheet-handle"></div>
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="font-size:40px;margin-bottom:8px;">✦</div>
      <div class="sheet-title">Портфель Pro</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Персональный коуч в твоём кармане</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
      ${[
        ['🤖 AI-отчёт каждую неделю', 'Gemini анализирует твой прогресс и даёт рекомендации'],
        ['📅 История за 6 месяцев', 'Следи за долгосрочной динамикой по всем сферам'],
        ['📤 Экспорт в Stories', 'Делись красивой карточкой с твоим радаром'],
        ['🔔 Приоритетные напоминания', 'Персонализированные уведомления для каждой сферы']
      ].map(([title, desc]) => `
        <div style="display:flex;gap:12px;align-items:flex-start;background:var(--surface2);border-radius:14px;padding:12px;">
          <div style="font-size:20px;flex-shrink:0;">${title.split(' ')[0]}</div>
          <div>
            <div style="font-size:13px;font-weight:600;margin-bottom:2px;">${title.slice(3)}</div>
            <div style="font-size:12px;color:var(--text-muted);">${desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary btn-full">Подключить Pro — 299 ★ (~90 ₽/мес)</button>
    <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:8px;">327 пользователей уже используют Pro</div>
    <button class="btn btn-ghost btn-full" onclick="closeModal()" style="margin-top:8px;">Пока нет, спасибо</button>
  `);
}

/* ---- 18. ИНИЦИАЛИЗАЦИЯ ---- */
document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading-screen');
  const app = document.getElementById('app');

  // Инициализировать слайдеры радара в онбординге
  SPHERES.forEach(s => {
    if (!State.tempScores[s.id]) State.tempScores[s.id] = Store.getScores()[s.id] || 5;
  });

  // Небольшая задержка для красивой загрузки
  setTimeout(() => {
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 300ms ease';
    setTimeout(() => {
      loading.classList.add('hidden');
      app.classList.remove('hidden');

      // Показать нужный экран
      if (!Store.isOnboarded()) {
        document.getElementById('bottom-nav').classList.add('hidden');
        navigate('onboarding');
      } else {
        document.getElementById('bottom-nav').classList.remove('hidden');
        navigate('dashboard');
      }
    }, 300);
  }, 800);

  // BackButton Telegram
  tg.BackButton.onClick(goBack);
});

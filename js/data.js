/* =====================================================
   data.js — Данные приложения "Портфель жизни"
   Сферы, рутины, начальные значения
   Источник: routines.json, brief.md
   ===================================================== */

/* --- 9 сфер жизни --- */
const SPHERES = [
  { id: 'health',        name: 'Здоровье',    emoji: '💚', color: '#5cf8a0', icon: '💪', subcategories: ['general', 'vitamins'] },
  { id: 'career',        name: 'Карьера',     emoji: '💼', color: '#6c4bff', icon: '🚀', subcategories: [] },
  { id: 'finance',       name: 'Финансы',     emoji: '💰', color: '#f59e0b', icon: '📈', subcategories: [] },
  { id: 'relationships', name: 'Отношения',   emoji: '❤️', color: '#ff5282', icon: '🤝', subcategories: [] },
  { id: 'family',        name: 'Семья',       emoji: '👨‍👩‍👧', color: '#38bdf8', icon: '🏡', subcategories: [] },
  { id: 'growth',        name: 'Развитие',    emoji: '🚀', color: '#fb923c', icon: '🧠', subcategories: ['general', 'neuro'] },
  { id: 'recreation',    name: 'Отдых',       emoji: '🌿', color: '#a3e635', icon: '🎮', subcategories: [] },
  { id: 'spirituality',  name: 'Духовность',  emoji: '✨', color: '#c084fc', icon: '🕊️', subcategories: [] },
  { id: 'home',          name: 'Дом/Порядок', emoji: '🏠', color: '#06b6d4', icon: '🧹', subcategories: ['physical', 'digital'] }
];

/* --- Карта меток подкатегорий --- */
const SUBCATEGORY_LABELS = {
  general:  'Общие',
  vitamins: 'Витамины',
  neuro:    'Нейросвязи',
  physical: 'Физическое',
  digital:  'Цифровое'
};

/* --- Метки сложности --- */
const DIFFICULTY_LABELS = { easy: 'Лёгкое', medium: 'Среднее', hard: 'Сложное' };

/* --- Метки времени --- */
const TIME_LABELS = { morning: 'Утро', evening: 'Вечер', afternoon: 'День', anytime: 'Любое время' };

/* =====================================================
   РУТИНЫ — библиотека из routines.json
   ===================================================== */
const ROUTINES = [
  /* ---- ЗДОРОВЬЕ — общие ---- */
  { id:'health_001', sphere:'health', subcategory:'general', title:'Стакан воды после пробуждения', emoji:'💧', description:'Сразу после подъёма, до телефона и кофе, выпей стакан (250 мл) воды комнатной температуры.', duration_minutes:2, difficulty:'easy', best_time:'morning', science_note:'Восполняет дегидрацию после 7–8 часов без воды, запускает метаболизм и перистальтику.', is_premium:false },
  { id:'health_002', sphere:'health', subcategory:'general', title:'Дыхание 4-7-8 перед сном', emoji:'🌬️', description:'Вдох 4 сек → задержка 7 сек → выдох 8 сек. Повтори 4 цикла лёжа в кровати.', duration_minutes:3, difficulty:'easy', best_time:'evening', science_note:'Активирует парасимпатическую нервную систему, снижает кортизол, сокращает время засыпания на 30%.', is_premium:false },
  { id:'health_003', sphere:'health', subcategory:'general', title:'Прогулка 20 минут', emoji:'🚶', description:'Выйди на улицу без наушников. Смотри по сторонам, дыши глубоко. Цель — движение, не скорость.', duration_minutes:20, difficulty:'easy', best_time:'anytime', science_note:'20 минут ходьбы в день снижают риск депрессии на 35% и улучшают работу сердечно-сосудистой системы.', is_premium:false },
  { id:'health_004', sphere:'health', subcategory:'general', title:'Утренняя зарядка 10 минут', emoji:'🤸', description:'10 упражнений по 1 минуте: приседания, отжимания, скручивания, планка и т.д. Без оборудования, дома.', duration_minutes:10, difficulty:'medium', best_time:'morning', science_note:'Короткие утренние тренировки повышают уровень энергии и концентрацию на весь день (Journal of Physiology).', is_premium:false },
  { id:'health_005', sphere:'health', subcategory:'general', title:'Сон не менее 7 часов', emoji:'😴', description:'Установи время отхода ко сну и строго его соблюдай. Телефон убери за 30 мин, свет приглуши.', duration_minutes:420, difficulty:'medium', best_time:'evening', science_note:'Менее 7 часов сна снижают когнитивные функции на уровне 48 часов без сна (Matthew Walker, Why We Sleep).', is_premium:false },
  { id:'health_006', sphere:'health', subcategory:'general', title:'Контрастный душ', emoji:'🚿', description:'Чередуй горячую и холодную воду 3 раза по 30 секунд. Заканчивай холодной. Дыши ровно.', duration_minutes:5, difficulty:'medium', best_time:'morning', science_note:'Контрастный душ стимулирует иммунную систему, повышает бодрость и выработку норадреналина на 200–300%.', is_premium:false },
  { id:'health_007', sphere:'health', subcategory:'general', title:'Без сахара сегодня', emoji:'🚫', description:'Один день без добавленного сахара: откажись от сладкого, газировки, сладких йогуртов и соков.', duration_minutes:1, difficulty:'hard', best_time:'morning', science_note:'Снижение потребления сахара улучшает инсулинорезистентность, кожу и уровень энергии уже за 2 недели.', is_premium:false },
  { id:'health_008', sphere:'health', subcategory:'general', title:'Дневник питания', emoji:'📝', description:'Записывай всё что съел за день — в любом приложении или блокноте. Не считай калории, просто фиксируй.', duration_minutes:5, difficulty:'easy', best_time:'evening', science_note:'Осознанность питания снижает потребление калорий на 15–20% без ограничений (The American Journal of Clinical Nutrition).', is_premium:false },

  /* ---- ЗДОРОВЬЕ — витамины ---- */
  { id:'health_011', sphere:'health', subcategory:'vitamins', title:'Витамин D3 — ежедневный приём', emoji:'☀️', description:'Прими 2000–4000 МЕ витамина D3 во время жирной еды (завтрак или обед). Зимой — обязательно.', duration_minutes:1, difficulty:'easy', best_time:'morning', science_note:'Дефицит D3 у 70–80% жителей северных широт. Влияет на иммунитет, настроение и качество сна.', is_premium:false },
  { id:'health_012', sphere:'health', subcategory:'vitamins', title:'Омега-3 — рыбий жир', emoji:'🐟', description:'Прими 1–2 капсулы омега-3 (EPA+DHA суммарно 1000–2000 мг) во время еды.', duration_minutes:1, difficulty:'easy', best_time:'morning', science_note:'Омега-3 снижает воспаление, триглицериды на 15–30%, улучшает когнитивные функции (NEJM, 2019).', is_premium:false },
  { id:'health_013', sphere:'health', subcategory:'vitamins', title:'Магний перед сном', emoji:'🌙', description:'За 30–60 минут до сна прими 200–400 мг магния (цитрат или глицинат). Запить стаканом воды.', duration_minutes:1, difficulty:'easy', best_time:'evening', science_note:'Магний участвует в 300+ ферментативных реакциях. Улучшает качество сна, снижает кортизол.', is_premium:false },
  { id:'health_014', sphere:'health', subcategory:'vitamins', title:'Витамин B12 — еженедельно', emoji:'⚡', description:'Раз в неделю прими 1000–2000 мкг B12 (метилкобаламин). Особенно важно для веганов и людей 40+.', duration_minutes:1, difficulty:'easy', best_time:'morning', science_note:'B12 необходим для нервной системы. Дефицит вызывает усталость, депрессию и неврологические нарушения.', is_premium:false },
  { id:'health_015', sphere:'health', subcategory:'vitamins', title:'Цинк и Витамин C в сезон', emoji:'🛡️', description:'С октября по март: цинк 15–25 мг + витамин C 500–1000 мг в день. Цинк — не натощак.', duration_minutes:1, difficulty:'easy', best_time:'morning', science_note:'Цинк сокращает длительность простуды на 33% при приёме в первые 24 часа (Cochrane, 2021).', is_premium:false },
  { id:'health_018', sphere:'health', subcategory:'vitamins', title:'Адаптогены утром', emoji:'🌿', description:'Прими ашваганду (300–600 мг) или родиолу (200–400 мг) утром натощак. Не принимать вечером.', duration_minutes:1, difficulty:'easy', best_time:'morning', science_note:'Ашваганда снижает кортизол на 27% за 8 недель, улучшает силу и VO2max (Chandrasekhar, 2012).', is_premium:false },

  /* ---- КАРЬЕРА ---- */
  { id:'career_001', sphere:'career', subcategory:'general', title:'Три главные задачи на день', emoji:'🎯', description:'Каждое утро записывай ровно три самые важные задачи на день. Начинай с первой, не переходи ко второй пока не закончишь.', duration_minutes:5, difficulty:'easy', best_time:'morning', science_note:'MIT-задачи (Most Important Tasks) — метод продуктивности. Фокус на 3 задачах даёт больший результат, чем список из 20 (David Allen).', is_premium:false },
  { id:'career_002', sphere:'career', subcategory:'general', title:'Блок глубокой работы 90 минут', emoji:'🧠', description:'Одна задача — 90 минут без прерываний. Телефон в другой комнате, уведомления выключены, одна вкладка браузера.', duration_minutes:90, difficulty:'hard', best_time:'morning', science_note:'Ультрадианный ритм: мозг работает циклами 90 минут. Глубокая работа в этом окне = пиковая продуктивность (Ultradian Rhythm, Peretz Lavie).', is_premium:false },
  { id:'career_003', sphere:'career', subcategory:'general', title:'Разбор входящих писем', emoji:'📧', description:'Дважды в день (утро и вечер) — 15 минут на email. Принцип Inbox Zero: ответил или заархивировал. Не держи непрочитанное.', duration_minutes:15, difficulty:'easy', best_time:'morning', science_note:'Постоянная проверка почты снижает IQ на 10 пунктов во время работы. Батчинг писем экономит 2+ часа в неделю.', is_premium:false },
  { id:'career_004', sphere:'career', subcategory:'general', title:'Нетворкинг: одно сообщение в день', emoji:'🤝', description:'Напиши одному человеку из своей профессиональной сети — не с просьбой, а просто поделись чем-то ценным или спроси как дела.', duration_minutes:5, difficulty:'easy', best_time:'anytime', science_note:'Слабые связи (weak ties) — главный источник карьерных возможностей. 70% вакансий заполняются через личные знакомства (Granovetter).', is_premium:false },
  { id:'career_005', sphere:'career', subcategory:'general', title:'Еженедельный обзор задач', emoji:'📋', description:'Каждую пятницу: что сделал, что не сделал, что перенести. 20 минут — и следующая неделя спланирована.', duration_minutes:20, difficulty:'medium', best_time:'evening', science_note:'Getting Things Done (GTD) weekly review: единственный способ держать всё под контролем без тревоги о забытом (David Allen).', is_premium:false },

  /* ---- ФИНАНСЫ ---- */
  { id:'finance_001', sphere:'finance', subcategory:'general', title:'Фиксация расходов за день', emoji:'💳', description:'Каждый вечер: открой приложение и запиши все траты дня. Занимает 3 минуты, но меняет всё финансовое поведение.', duration_minutes:3, difficulty:'easy', best_time:'evening', science_note:'Осознанный учёт расходов снижает импульсивные траты на 20–30%. Принцип: то что измеряешь — улучшается.', is_premium:false },
  { id:'finance_002', sphere:'finance', subcategory:'general', title:'Правило 24 часов перед покупкой', emoji:'⏰', description:'Перед любой незапланированной покупкой > 1000 руб — подожди 24 часа. Если желание не прошло — покупай.', duration_minutes:1, difficulty:'easy', best_time:'anytime', science_note:'Импульсивные покупки составляют 40% всех покупок. 24-часовое ожидание снижает их на 56% (Journal of Consumer Research).', is_premium:false },
  { id:'finance_003', sphere:'finance', subcategory:'general', title:'Перевод 10% в сбережения', emoji:'🏦', description:'В день зарплаты: сразу переведи 10% на отдельный счёт. Не оставляй "что останется" — оставшееся никогда не остаётся.', duration_minutes:2, difficulty:'easy', best_time:'morning', science_note:'Pay Yourself First (Джордж Клейсон). Автоматические сбережения эффективнее намерений в 3 раза.', is_premium:false },
  { id:'finance_004', sphere:'finance', subcategory:'general', title:'Финансовый обзор месяца', emoji:'📊', description:'В конце месяца: доходы vs расходы, категории трат, выполнение финансовых целей. 30 минут = финансовая осознанность.', duration_minutes:30, difficulty:'medium', best_time:'evening', science_note:'Люди, ведущие ежемесячный финансовый обзор, в 2 раза чаще достигают финансовых целей (Vanguard Research).', is_premium:true },
  { id:'finance_005', sphere:'finance', subcategory:'general', title:'Изучение инвестиций — 15 минут', emoji:'📚', description:'Читай про инвестиции 15 минут в день: ETF, облигации, диверсификация. Не торгуй — сначала учись.', duration_minutes:15, difficulty:'medium', best_time:'anytime', science_note:'Финансовая грамотность коррелирует с благосостоянием сильнее, чем доход. Знания = защита от плохих решений.', is_premium:false },

  /* ---- ОТНОШЕНИЯ ---- */
  { id:'relationships_001', sphere:'relationships', subcategory:'general', title:'Звонок близкому человеку', emoji:'📞', description:'Позвони другу или родственнику с которым давно не говорил. Не пиши — именно позвони. 10 минут живого голоса.', duration_minutes:10, difficulty:'easy', best_time:'anytime', science_note:'Голосовые звонки укрепляют связи сильнее текстовых сообщений. Одиночество — фактор риска смертности как курение (Holt-Lunstad).', is_premium:false },
  { id:'relationships_002', sphere:'relationships', subcategory:'general', title:'Активное слушание без телефона', emoji:'👂', description:'Во время разговора — убери телефон. Смотри в глаза, задавай уточняющие вопросы, не перебивай. Просто слушай.', duration_minutes:20, difficulty:'medium', best_time:'anytime', science_note:'Активное слушание — наиболее ценный навык в отношениях. Чувство понятости важнее всего остального (John Gottman).', is_premium:false },
  { id:'relationships_003', sphere:'relationships', subcategory:'general', title:'Выразить благодарность', emoji:'🙏', description:'Напиши или скажи кому-нибудь конкретную благодарность: не "спасибо за всё", а за конкретное действие.', duration_minutes:2, difficulty:'easy', best_time:'anytime', science_note:'Выражение благодарности повышает счастье обоих участников на 25%. 3 благодарности в неделю = уровень депрессии снижается.', is_premium:false },
  { id:'relationships_004', sphere:'relationships', subcategory:'general', title:'Совместный ужин без гаджетов', emoji:'🍽️', description:'Один приём пищи в день — только с людьми, без телефонов. Разговор, смех, настоящий контакт.', duration_minutes:30, difficulty:'medium', best_time:'evening', science_note:'Семьи, регулярно обедающие вместе, имеют более низкий уровень тревожности и лучшие коммуникативные навыки (Harvard Study).', is_premium:false },

  /* ---- СЕМЬЯ ---- */
  { id:'family_001', sphere:'family', subcategory:'general', title:'20 минут только с детьми/родными', emoji:'👶', description:'Отложи всё и проведи 20 минут с ребёнком или родными — их игра, их интересы, ты полностью присутствуешь.', duration_minutes:20, difficulty:'easy', best_time:'evening', science_note:'Качественное время важнее количества. 20 минут полного присутствия ценнее 3 часов рядом с телефоном.', is_premium:false },
  { id:'family_002', sphere:'family', subcategory:'general', title:'Семейный ритуал перед сном', emoji:'🌙', description:'Установи постоянный ритуал: чтение сказки, разговор о дне, объятие. Дети — и взрослые — нуждаются в предсказуемости.', duration_minutes:15, difficulty:'easy', best_time:'evening', science_note:'Семейные ритуалы снижают тревожность у детей, укрепляют привязанность и создают долгосрочные воспоминания.', is_premium:false },
  { id:'family_003', sphere:'family', subcategory:'general', title:'Семейный совет раз в неделю', emoji:'🗣️', description:'15 минут: каждый говорит о своей неделе, что хорошо, что сложно. Без критики — только слушаем и поддерживаем.', duration_minutes:15, difficulty:'medium', best_time:'evening', science_note:'Регулярные семейные встречи снижают конфликты на 40% и повышают ощущение безопасности у всех членов семьи.', is_premium:false },
  { id:'family_004', sphere:'family', subcategory:'general', title:'Позвонить родителям', emoji:'👵', description:'Позвони маме или папе не по делу — просто поговори. Спроси как они. Расскажи о себе. 10 минут.', duration_minutes:10, difficulty:'easy', best_time:'anytime', science_note:'Регулярный контакт с родителями снижает риск их когнитивного упадка и укрепляет твоё собственное психологическое здоровье.', is_premium:false },

  /* ---- РАЗВИТИЕ — общие ---- */
  { id:'growth_001', sphere:'growth', subcategory:'general', title:'Чтение 20 страниц нон-фикшн', emoji:'📗', description:'Прочитай 20 страниц книги по развитию навыка или знания. Записывай 1 инсайт на полях или в заметках.', duration_minutes:20, difficulty:'medium', best_time:'morning', science_note:'20 стр/день = 18 книг в год. Лидеры читают в среднем 60 книг/год (Warren Buffett: 5–6 часов чтения ежедневно).', is_premium:false },
  { id:'growth_002', sphere:'growth', subcategory:'general', title:'Учить иностранный язык 10 минут', emoji:'🗣️', description:'Открой Duolingo, Anki или YouTube-урок. Ровно 10 минут новых слов или грамматики.', duration_minutes:10, difficulty:'easy', best_time:'morning', science_note:'Распределённое обучение (spaced repetition) эффективнее марафонов в 2–3 раза. Consistency > Intensity.', is_premium:false },
  { id:'growth_003', sphere:'growth', subcategory:'general', title:'Запись утренних страниц', emoji:'✍️', description:'Сразу после пробуждения: пиши от руки 3 страницы всего что в голове. Без редактуры, просто поток сознания.', duration_minutes:20, difficulty:'medium', best_time:'morning', science_note:'Morning Pages (Джулия Кэмерон). Очищает ментальный кэш, снижает тревогу и освобождает творческое мышление.', is_premium:false },
  { id:'growth_004', sphere:'growth', subcategory:'general', title:'Один урок онлайн-курса', emoji:'🎓', description:'Пройди один урок онлайн-курса (Coursera, Skillbox). Запиши главную мысль и одно практическое задание.', duration_minutes:30, difficulty:'medium', best_time:'evening', science_note:'Deliberate practice с обратной связью — главный механизм экспертизы (Anders Ericsson).', is_premium:false },
  { id:'growth_005', sphere:'growth', subcategory:'general', title:'Фиксация инсайта дня', emoji:'💡', description:'Перед сном запиши одну вещь которую ты узнал, понял или переосмыслил сегодня. Одного предложения достаточно.', duration_minutes:2, difficulty:'easy', best_time:'evening', science_note:'Retrieval practice усиливает долгосрочную память на 50% сильнее повторного чтения.', is_premium:false },

  /* ---- РАЗВИТИЕ — нейросвязи ---- */
  { id:'growth_neuro_001', sphere:'growth', subcategory:'neuro', title:'Медитация осознанности', emoji:'🧘', description:'Сядь удобно, закрой глаза. 10 минут наблюдай за дыханием, не оценивая мысли — просто замечай их и возвращайся к дыханию.', duration_minutes:10, difficulty:'easy', best_time:'morning', science_note:'8 недель ежедневной медитации увеличивают плотность серого вещества гиппокампа на 2% (Hölzel et al., 2011).', is_premium:false },
  { id:'growth_neuro_002', sphere:'growth', subcategory:'neuro', title:'Нейробика: недоминантная рука', emoji:'🤚', description:'5 минут выполняй действия недоминантной рукой: чисть зубы, мешай кофе, листай телефон. Ощущение неловкости — это рост.', duration_minutes:5, difficulty:'easy', best_time:'morning', science_note:'Использование недоминантной руки активирует незадействованные области коры и стимулирует новые синаптические связи.', is_premium:false },
  { id:'growth_neuro_003', sphere:'growth', subcategory:'neuro', title:'Дворец памяти — 10 фактов', emoji:'🏛️', description:'Выбери маршрут (квартира, путь на работу). Размести 10 предметов для запоминания на знакомых точках в виде ярких образов.', duration_minutes:15, difficulty:'medium', best_time:'anytime', science_note:'Метод локусов задействует гиппокамп и пространственную память — метод чемпионов мира по памяти.', is_premium:false },
  { id:'growth_neuro_004', sphere:'growth', subcategory:'neuro', title:'Кросс-латеральные движения', emoji:'🔀', description:'10 минут: правое колено — левый локоть, левое колено — правый локоть поочерёдно. Рисуй двумя руками симметричные фигуры.', duration_minutes:10, difficulty:'easy', best_time:'morning', science_note:'Перекрёстные движения усиливают коммуникацию между полушариями через мозолистое тело (Brain Gym).', is_premium:false },
  { id:'growth_neuro_005', sphere:'growth', subcategory:'neuro', title:'Активное воспроизведение из памяти', emoji:'🔁', description:'После чтения закрой книгу. Возьми лист и запиши всё что помнишь без подсказок. Сверься с оригиналом.', duration_minutes:10, difficulty:'medium', best_time:'anytime', science_note:'Retrieval Practice: активное воспроизведение сильнее повторного чтения в 2–3 раза (Roediger & Karpicke, 2006).', is_premium:false },
  { id:'growth_neuro_006', sphere:'growth', subcategory:'neuro', title:'Решение головоломок', emoji:'🧩', description:'15 минут реши задачи нового типа: судоку, шахматную задачу, математическую головоломку или новый кроссворд.', duration_minutes:15, difficulty:'medium', best_time:'anytime', science_note:'Новые задачи стимулируют выработку BDNF — белка, отвечающего за рост нейронов. Рутинные задачи этого не дают.', is_premium:false },
  { id:'growth_neuro_007', sphere:'growth', subcategory:'neuro', title:'Практика визуализации', emoji:'🌀', description:'10 минут детально визуализируй навык или ситуацию: движения, ощущения, детали окружения — как будто это происходит наяву.', duration_minutes:10, difficulty:'medium', best_time:'anytime', science_note:'Ментальная симуляция активирует те же нейронные сети что и реальное действие (Jeannerod, 2001).', is_premium:false },
  { id:'growth_neuro_008', sphere:'growth', subcategory:'neuro', title:'Маршрут без навигации', emoji:'🗺️', description:'Раз в неделю иди новым маршрутом без GPS. По возвращении нарисуй карту маршрута по памяти.', duration_minutes:20, difficulty:'easy', best_time:'anytime', science_note:'Таксисты Лондона имеют увеличенный гиппокамп. GPS-зависимость атрофирует пространственную память (Maguire et al., 2000).', is_premium:false },
  { id:'growth_neuro_009', sphere:'growth', subcategory:'neuro', title:'Запись снов', emoji:'💭', description:'Сразу после пробуждения, не вставая, запиши все образы сна. Держи блокнот у кровати.', duration_minutes:5, difficulty:'easy', best_time:'morning', science_note:'Во время REM-фазы мозг консолидирует нейронные связи дня. Фиксация снов тренирует рабочую память.', is_premium:false },
  { id:'growth_neuro_010', sphere:'growth', subcategory:'neuro', title:'Интервальное повторение (Anki)', emoji:'🃏', description:'Создай 10–15 карточек по изучаемому материалу. Повторяй ежедневно по алгоритму: сложные — чаще, лёгкие — реже.', duration_minutes:15, difficulty:'medium', best_time:'anytime', science_note:'Spaced Repetition использует кривую забывания Эббингауза — максимально укрепляет синаптические связи.', is_premium:false },

  /* ---- ОТДЫХ ---- */
  { id:'recreation_001', sphere:'recreation', subcategory:'general', title:'20 минут без цели и гаджетов', emoji:'🌅', description:'Ничего не делай: не смотри телефон, не думай о задачах. Сиди у окна, выйди в сад, просто наблюдай.', duration_minutes:20, difficulty:'medium', best_time:'afternoon', science_note:'Default Mode Network — источник творческих решений. Мозгу нужны периоды "ничегонеделания".', is_premium:false },
  { id:'recreation_002', sphere:'recreation', subcategory:'general', title:'Хобби — 30 минут', emoji:'🎨', description:'Посвяти 30 минут хобби которое не связано с работой: рисование, музыка, игры, готовка. Без цели — ради удовольствия.', duration_minutes:30, difficulty:'easy', best_time:'evening', science_note:'Хобби снижают стресс и кортизол на 75% за 45 минут (American Journal of Public Health).', is_premium:false },
  { id:'recreation_003', sphere:'recreation', subcategory:'general', title:'Чтение художественной литературы', emoji:'📖', description:'30 минут художественной книги (не нон-фикшн). Дай мозгу возможность погрузиться в другой мир.', duration_minutes:30, difficulty:'easy', best_time:'evening', science_note:'Чтение художественной литературы развивает эмпатию и снижает стресс на 68% быстрее, чем музыка или прогулки.', is_premium:false },
  { id:'recreation_004', sphere:'recreation', subcategory:'general', title:'Поход на природу', emoji:'🌳', description:'Раз в неделю выйди на природу — парк, лес, набережная. Хотя бы 45 минут вдали от городского шума.', duration_minutes:45, difficulty:'easy', best_time:'anytime', science_note:'90 минут в природной среде снижают активность зоны мозга, связанной с тревожностью (Stanford, 2015).', is_premium:false },
  { id:'recreation_005', sphere:'recreation', subcategory:'general', title:'Цифровой детокс — час', emoji:'📵', description:'Один час в день совсем без экранов. Не заменяй телефон планшетом или TV. Просто без цифрового шума.', duration_minutes:60, difficulty:'medium', best_time:'evening', science_note:'Постоянное потребление контента перегружает префронтальную кору. Детокс восстанавливает способность к глубокому мышлению.', is_premium:false },

  /* ---- ДУХОВНОСТЬ ---- */
  { id:'spirituality_001', sphere:'spirituality', subcategory:'general', title:'Медитация молчания', emoji:'🕊️', description:'15 минут в полной тишине. Сядь удобно, не медитируй "правильно" — просто будь в тишине. Мысли приходят и уходят.', duration_minutes:15, difficulty:'medium', best_time:'morning', science_note:'Тишина стимулирует рост нейронов в гиппокампе (Stefan Engeser). Сложность умственного покоя — признак его ценности.', is_premium:false },
  { id:'spirituality_002', sphere:'spirituality', subcategory:'general', title:'Дневник благодарности', emoji:'🌸', description:'Запиши 3 вещи за которые благодарен сегодня. Не повторяй — ищи новое каждый день.', duration_minutes:5, difficulty:'easy', best_time:'evening', science_note:'Практика благодарности снижает депрессию на 35%, улучшает сон и укрепляет иммунитет (UC Davis, Robert Emmons).', is_premium:false },
  { id:'spirituality_003', sphere:'spirituality', subcategory:'general', title:'Чтение философии или мудрости', emoji:'📜', description:'10 минут из Марка Аврелия, Сенеки, Конфуция или другого мудрого источника. Применяй одну мысль к своему дню.', duration_minutes:10, difficulty:'easy', best_time:'morning', science_note:'Стоицизм и другие философии помогают развить эмоциональную устойчивость и перспективное мышление.', is_premium:false },
  { id:'spirituality_004', sphere:'spirituality', subcategory:'general', title:'Прогулка-медитация', emoji:'🌿', description:'30 минут медленной ходьбы только с вниманием к шагам, дыханию и ощущениям. Без музыки, без мыслей о делах.', duration_minutes:30, difficulty:'easy', best_time:'anytime', science_note:'Медитация при ходьбе снижает тревожность и повышает осознанность не хуже сидячей медитации (Journal of Health Psychology).', is_premium:false },
  { id:'spirituality_005', sphere:'spirituality', subcategory:'general', title:'Рефлексия ценностей', emoji:'🌟', description:'10 минут — запиши: что для тебя важнее всего? Как твои сегодняшние действия отражают твои ценности? Одно несоответствие?', duration_minutes:10, difficulty:'medium', best_time:'evening', science_note:'Выравнивание действий с ценностями — основа психологического благополучия (Self-Determination Theory, Ryan & Deci).', is_premium:false },

  /* ---- ДОМ — физическое ---- */
  { id:'home_001', sphere:'home', subcategory:'physical', title:'Разобрать одну зону за 10 минут', emoji:'🧹', description:'Выбери одну конкретную зону: ящик, полка, поверхность. Именно 10 минут: выбросить лишнее, расставить по местам.', duration_minutes:10, difficulty:'easy', best_time:'morning', science_note:'Метод "одна зона" предотвращает прокрастинацию уборки. Небольшие победы мотивируют продолжать (BJ Fogg, Tiny Habits).', is_premium:false },
  { id:'home_002', sphere:'home', subcategory:'physical', title:'Заправить кровать', emoji:'🛏️', description:'Заправляй кровать каждое утро сразу после подъёма. Первая маленькая победа дня задаёт тон всему остальному.', duration_minutes:2, difficulty:'easy', best_time:'morning', science_note:'Адмирал Уильям МакРейвен: люди которые заправляют кровать с утра продуктивнее и счастливее. Маленький ритуал = большой эффект.', is_premium:false },
  { id:'home_003', sphere:'home', subcategory:'physical', title:'Разобрать входную зону', emoji:'🚪', description:'Прихожая — первое что видишь дома. Убери лишнее с обувной полки, повесь всё на место. 5 минут.', duration_minutes:5, difficulty:'easy', best_time:'evening', science_note:'Порядок у входа снижает стресс при возвращении домой и создаёт ощущение контроля над пространством.', is_premium:false },

  /* ---- ДОМ — цифровое ---- */
  { id:'home_004', sphere:'home', subcategory:'digital', title:'Разбор папки Загрузки', emoji:'📁', description:'Открой папку Downloads. Удали всё что не нужно, остальное разложи по папкам. Оставляй пустой каждую неделю.', duration_minutes:10, difficulty:'easy', best_time:'anytime', science_note:'Цифровой беспорядок замедляет компьютер и создаёт скрытый когнитивный стресс.', is_premium:false },
  { id:'home_005', sphere:'home', subcategory:'digital', title:'Очистка телефона', emoji:'📱', description:'Удали 3 приложения которыми не пользовался месяц. Очисти галерею от дублей. Архивируй старые чаты.', duration_minutes:10, difficulty:'easy', best_time:'anytime', science_note:'Средний телефон содержит 80+ приложений, используется регулярно только 9. Цифровой минимализм снижает тревожность.', is_premium:false },
  { id:'home_006', sphere:'home', subcategory:'digital', title:'Отписка от ненужных рассылок', emoji:'✉️', description:'Открой почту, найди 5 рассылок которые не читаешь. Отпишись от каждой. Делай раз в неделю.', duration_minutes:5, difficulty:'easy', best_time:'anytime', science_note:'Средний офисный работник получает 121 письмо в день. Чистая почта = чистый ум.', is_premium:false }
];

/* =====================================================
   Функции для работы с данными
   ===================================================== */

/** Найти сферу по id */
function getSphere(id) {
  return SPHERES.find(s => s.id === id) || null;
}

/** Рутины по сфере */
function getRoutinesBySphere(sphereId) {
  return ROUTINES.filter(r => r.sphere === sphereId);
}

/** Рутины по сфере и подкатегории */
function getRoutinesBySubcategory(sphereId, subcategory) {
  return ROUTINES.filter(r => r.sphere === sphereId && r.subcategory === subcategory);
}

/** CSS-цвет сферы */
function getSphereColor(sphereId) {
  const s = getSphere(sphereId);
  return s ? s.color : '#6c4bff';
}

/** HTML бейдж сложности */
function difficultyBadge(difficulty) {
  const map = { easy: ['easy', 'Лёгкое'], medium: ['medium', 'Среднее'], hard: ['hard', 'Сложное'] };
  const [cls, label] = map[difficulty] || ['easy', difficulty];
  return `<span class="badge badge-${cls}">${label}</span>`;
}

/** Сегодняшняя дата в формате YYYY-MM-DD */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Приветствие по времени суток */
function greeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 17) return 'Добрый день';
  if (h < 22) return 'Добрый вечер';
  return 'Доброй ночи';
}

/** Форматирование минут */
function formatDuration(min) {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}ч ${m}м` : `${h} ч`;
}

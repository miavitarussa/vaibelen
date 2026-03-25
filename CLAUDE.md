# CLAUDE.md — Портфель жизни TMA

## Структура файлов

```
tg-app/
├── index.html         — Точка входа. HTML-оболочка, подключение SDK и скриптов
├── css/
│   └── styles.css     — Вся дизайн-система: переменные, компоненты, анимации
├── js/
│   ├── data.js        — Данные: SPHERES, ROUTINES, вспомогательные функции
│   └── app.js         — Логика: State, Store, навигация, все экраны
└── CLAUDE.md          — Этот файл
```

## Навигация между экранами

Навигация реализована через `navigate(screen, params)` в `app.js`.
**Не используется** react-router или window.history — они конфликтуют с Telegram.

| Функция | Что делает |
|---|---|
| `navigate(screen, params)` | Переход вперёд с анимацией slide |
| `goBack()` | Назад по стеку истории |
| `pushHistory(screen, params)` | Добавить текущий экран в стек перед navigate |
| `State.history` | Стек для возврата назад |

### Экраны

| ID | Описание |
|---|---|
| `onboarding` | 3 шага: приветствие → слайдеры → первая рутина |
| `dashboard` | Главная: радар, стрик, быстрые чекины |
| `sphere-list` | Сетка 9 сфер с оценками |
| `sphere-detail` | Детали сферы: gauge, heatmap, рутины, вкладки |
| `library` | Библиотека рутин с фильтрами |
| `progress` | Аналитика: графики, статистика |
| `profile` | Профиль, настройки, напоминания |

## Где менять данные

### Добавить/изменить рутину
Файл: `js/data.js`, массив `ROUTINES`

```js
{
  id: 'sphere_001',        // уникальный ID
  sphere: 'health',        // ID сферы из SPHERES
  subcategory: 'general',  // general | vitamins | neuro | physical | digital
  title: 'Название',
  emoji: '💧',
  description: 'Описание...',
  duration_minutes: 10,
  difficulty: 'easy',      // easy | medium | hard
  best_time: 'morning',    // morning | evening | afternoon | anytime
  science_note: 'Факт...',
  is_premium: false
}
```

### Изменить цвет или название сферы
Файл: `js/data.js`, массив `SPHERES`

### Изменить цвета дизайна
Файл: `css/styles.css`, секция `:root { }` — CSS-переменные

### Добавить подкатегорию в сферу
1. В `SPHERES` добавить в `subcategories: ['general', 'новая']`
2. В `SUBCATEGORY_LABELS` добавить `{ новая: 'Русское название' }`
3. Добавить рутины с `subcategory: 'новая'`

## Хранилище данных (localStorage)

Все данные хранятся в `localStorage` с префиксом `portfel_`.

| Ключ | Тип | Описание |
|---|---|---|
| `portfel_onboarded` | boolean | Онбординг пройден |
| `portfel_scores` | object | `{ sphereId: score }` |
| `portfel_my_routines` | array | Добавленные пользователем рутины |
| `portfel_checkins_YYYY-MM-DD` | array | ID рутин, выполненных в этот день |
| `portfel_streak` | number | Текущая серия дней |
| `portfel_reminder_on` | boolean | Напоминание включено |
| `portfel_reminder_time` | string | Время напоминания "09:00" |

Управление через объект `Store` в `app.js`.

## Telegram SDK

SDK подключён в `index.html` перед всеми скриптами:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

Используемые API:
- `tg.ready()` — приложение готово
- `tg.expand()` — полноэкранный режим
- `tg.initDataUnsafe.user` — имя и фото пользователя
- `tg.HapticFeedback.impactOccurred('medium')` — вибрация при чекине
- `tg.BackButton` — нативная кнопка назад
- `tg.MainButton` — нативная CTA-кнопка снизу

В `app.js` есть заглушка SDK для тестирования в браузере.

## Компоненты SVG (в app.js)

| Функция | Описание |
|---|---|
| `renderRadarSVG(values, size)` | 9-угольный радар, values = массив 9 оценок 0–10 |
| `renderProgressRing(fraction, size)` | Кольцо прогресса 0–1 |
| `renderDialGauge(score, color, size)` | Полукруглая шкала для деталей сферы |
| `renderHeatmap(sphereId)` | 4×7 тепловая карта последних 28 дней |

## Модальные окна

```js
openModal(html)    // открыть bottom sheet
closeModal()       // закрыть
openRoutineModal(routineId)  // карточка рутины
openReevalModal()            // переоценка колеса жизни
openProModal()               // Pro paywall
```

## Toast-уведомления

```js
showToast('Текст', 'success') // 'success' | 'error' | ''
```

## Запуск для тестирования

Открыть `tg-app/index.html` в браузере.
SDK-заглушка обеспечивает работу без Telegram.
Имя пользователя = "Пользователь", фото = инициал.

## Следующие шаги (backend)

1. Supabase: создать таблицы по схеме из `brief.md`
2. Edge Functions: `auth-verify`, `checkins`, `routines-library`
3. Бот grammY на Cloudflare Worker: `/start`, напоминания
4. Заменить `Store` (localStorage) на API-запросы к Supabase
5. Деплой на Cloudflare Pages, настроить webhook бота

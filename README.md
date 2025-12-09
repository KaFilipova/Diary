# Diary Project (React + TypeScript + Vite)

Личный трекер настроения и задач:
- Календарь настроений с годовым трекером
- Todo-лист с разделением по датам и статусам
- Резервное копирование (экспорт/импорт) задач и настроений

## Быстрый старт
```bash
npm install
npm run dev
```
По умолчанию dev-сервер на `http://localhost:3000`.

## Скрипты
- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка
- `npm run preview` — предпросмотр сборки
- `npm run lint` — проверка eslint

## Ключевые возможности
- Error Boundary + глобальные уведомления (Snackbar)
- Валидация форм (даты не из будущего, обязательные поля)
- Состояния загрузки (Skeleton) при инициализации данных
- A11y улучшения: aria-label для ключевых элементов
- Экспорт/импорт резервной копии (todos + moods) в JSON

## Структура
- `src/pages` — страницы (todo, mood, yearly tracker)
- `src/components` — UI-компоненты (вкл. ErrorBoundary, Notifications)
- `src/utils` — работа с localStorage и конфигурации

## Резервное копирование
- Export: кнопка `Export` на странице `/todo` — скачивает `diary-backup.json`
- Import: кнопка `Import` — выберите ранее сохранённый `diary-backup.json`

## Требования
- Node 18+
- npm 9+

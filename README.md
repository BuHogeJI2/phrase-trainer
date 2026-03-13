# RU-DE Phrase Trainer

Мобильное PWA-приложение для русскоязычных пользователей, которые учат бытовой немецкий. Приложение работает с фразами уровня `A1` и `A2`, поддерживает практику в направлениях `RU -> DE` и `DE -> RU`, и сохраняет прогресс локально в браузере.

## Что внутри

- 10 жизненных ситуаций и 200 фраз
- Русскоязычный интерфейс: главная, практика, избранное, настройки
- Флеш-карточки и тест с вариантами ответа
- Daily-сессия на 10 фраз и практика только по избранному
- Локальный прогресс, серия правильных ответов и бейджи
- PWA-оболочка с service worker для более быстрого повторного открытия

## Быстрый старт

```bash
npm install
npm run dev
```

## Основные команды

```bash
npm run lint
npm run test:run
npm run build
```

## Аудио

Если вы хотите использовать записанные MP3-файлы, положите их в `public/audio` по шаблону:

```text
<situationId>-<NN>.mp3
```

Пример:

```text
transport-01.mp3
```

Если файла нет, карточка фразы переключится на браузерный TTS fallback.

## Документация

- [AGENTS.md](AGENTS.md) - основная карта проекта и ссылки на технические документы
- [docs/product-principles.md](docs/product-principles.md) - цели продукта, тон и UX-правила
- [docs/roadmap.md](docs/roadmap.md) - текущая итерация и будущий roadmap
- [docs/project-structure.md](docs/project-structure.md) - структура репозитория и маршруты
- [docs/architecture.md](docs/architecture.md) - устройство приложения и потоки данных
- [docs/data-model.md](docs/data-model.md) - каталог фраз, localStorage и аудио
- [docs/testing.md](docs/testing.md) - тестовый стек и текущие пробелы
- [docs/frontend-qc.md](docs/frontend-qc.md) - чеклист для frontend quality control

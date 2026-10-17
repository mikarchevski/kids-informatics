# Настройка локального окружения

Инструкция по первичному запуску проекта `kids-informatics` на **Windows, macOS и Linux**.

---

## Системные требования

- **Node.js** версии 18+ ([скачать](https://nodejs.org/))
- **PostgreSQL** версии 15+
- **npm** (идёт в комплекте с Node.js)

Проверьте установленные версии:

```bash
node -v
npm -v
psql --version
```

---

## Быстрый старт

Если вы уже знакомы с проектом и хотите запустить его быстро:

```bash
# 1. Клонировать и установить зависимости
git clone <url-репозитория>
cd kids-informatics
npm install

# 2. Установить dotenv (критически важно!)
npm install dotenv

# 3. Создать файл .env
echo 'DATABASE_URL="postgresql://postgres:ПАРОЛЬ@127.0.0.1:5432/kids_informatics"' > .env

# 4. Создать базу данных
createdb -U postgres kids_informatics

# 5. Применить миграции
npx drizzle-kit push

# 6. Запустить
npm run dev
```

Откройте в браузере: **http://localhost:5173**

---

## Пошаговая инструкция

### Шаг 1. Установка PostgreSQL

**Windows**

1. Скачайте установщик с [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Запустите installer, выберите стандартные настройки
3. **Запомните пароль** пользователя `postgres`
4. После установки PostgreSQL запустится автоматически

**macOS**

```bash
brew install postgresql@18
brew services start postgresql@18
```

**Linux (Ubuntu/Debian)**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### Шаг 2. Создание базы данных

**Windows:**

```bash
createdb -U postgres kids_informatics
```

**macOS/Linux:**

```bash
sudo -u postgres createdb kids_informatics
```

> Можно также создать базу через GUI-клиент (DataGrip, pgAdmin, DBeaver).

---

### Шаг 3. Установка зависимостей проекта

```bash
npm install
```

---

### Шаг 4. Установка пакета `dotenv`

**Этот шаг критически важен.** Без него проект не сможет прочитать файл `.env` на некоторых системах.

```bash
npm install dotenv
```

---

### Шаг 5. Создание файла `.env`

**Важно:** Файл должен называться именно `.env` (без расширений `.txt` или `.example`).

**Способ 1. Через терминал (рекомендуется):**

Windows (PowerShell):

```powershell
echo 'DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@127.0.0.1:5432/kids_informatics"' > .env
```

macOS/Linux:

```bash
echo 'DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@127.0.0.1:5432/kids_informatics"' > .env
```

**Способ 2. Вручную:**

1. Создайте файл `.env` в корне проекта (рядом с `package.json`)
2. Откройте его в текстовом редакторе
3. Вставьте строку:
   ```env
   DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@127.0.0.1:5432/kids_informatics"
   ```
4. Замените `ВАШ_ПАРОЛЬ` на реальный пароль от PostgreSQL

**Проверка:**

```bash
cat .env
```

Должна вывестись одна строка с правильным URL.

> ** Почему `127.0.0.1`, а не `localhost`?**
> На некоторых системах Node.js резолвит `localhost` как IPv6-адрес (`::1`), а PostgreSQL слушает только IPv4 (`127.0.0.1`). Использование явного IP предотвращает ошибку `ECONNREFUSED`.

---

### Шаг 6. Настройка подключения к БД

Откройте файл `src/lib/db/index.ts` и убедитесь, что он выглядит **именно так**:

```typescript
// Принудительно читаем .env файл
import { config } from 'dotenv';
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('❌ ОШИБКА: DATABASE_URL не найдена. Проверьте файл .env в корне проекта.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, { schema });
```

**Ключевые моменты:**

- `import { config } from 'dotenv';` и `config();` — **должны быть в самом начале файла**
- Используется `connectionString` вместо раздельных параметров
- Добавлена проверка на наличие `DATABASE_URL`

---

### Шаг 7. Применение миграций

Создайте таблицы в базе данных:

```bash
npx drizzle-kit push
```

Ожидаемый вывод:

```
[✓] Pulling schema from database...
[✓] Changes applied
```

---

### Шаг 8. Запуск проекта

```bash
npm run dev
```

Откройте в браузере: **http://localhost:5173**

---

## Чек-лист частых проблем

### 1. Ошибка `ECONNREFUSED` при запросе к БД

**Причина:** Сервер не может подключиться к PostgreSQL.

**Решение:**

- Убедитесь, что PostgreSQL запущен:
  - **Windows:** Откройте "Службы" (`services.msc`) и найдите `postgresql-x64-XX`
  - **macOS:** `brew services list` (должен быть статус `started`)
  - **Linux:** `sudo systemctl status postgresql`
- Убедитесь, что в `.env` указан `127.0.0.1`, а не `localhost`
- Проверьте пароль в `.env`
- Полностью перезапустите сервер: `Ctrl + C` → `npm run dev`

---

### 2. Ошибка `DATABASE_URL не найдена`

**Причина:** Vite не читает файл `.env`.

**Решение:**

- Убедитесь, что установлен пакет `dotenv`: `npm install dotenv`
- Проверьте, что файл `.env` лежит в корне проекта (рядом с `package.json`)
- Очистите кэш и перезапустите:
  ```bash
  rm -rf .svelte-kit node_modules/.vite
  npm run dev
  ```
- **Windows:** Если создавали `.env` через Блокнот, он мог добавить расширение `.txt`. Переименуйте файл.

---

### 3. Файл `.env` называется `.env.txt`

**Причина:** ОС скрыла расширение.

**Решение:**

- **Windows:** Включите отображение расширений в Проводнике (Вид → Расширения имён файлов)
- **macOS/Linux:** Переименуйте через терминал:
  ```bash
  mv .env.txt .env
  ```

---

### 4. Ошибка `role "postgres" does not exist`

**Причина:** Неправильное имя пользователя в `.env`.

**Решение:**

- **Windows/Linux:** Обычно пользователь `postgres` создаётся автоматически
- **macOS:** Homebrew создаёт пользователя с именем вашего Mac-аккаунта. Замените `postgres` на ваше имя пользователя в `.env`

---

### 5. Ошибка `password authentication failed`

**Причина:** Неправильный пароль в `.env`.

**Решение:**

- Проверьте пароль, который задавали при установке PostgreSQL
- Если забыли пароль — сбросьте его через pgAdmin или командную строку

---

## Подключение через GUI-клиент (DataGrip, pgAdmin, DBeaver)

1. Создайте новое подключение **PostgreSQL**
2. **Host:** `127.0.0.1`
3. **Port:** `5432`
4. **User:** `postgres` (или ваше имя пользователя на macOS)
5. **Password:** пароль, который задали при установке
6. **Database:** `kids_informatics`
7. Нажмите **Test Connection** (должно быть успешно)

---

## Безопасность

**Никогда не коммитьте файл `.env` в Git!**

Убедитесь, что в `.gitignore` есть строка:

```
.env
```

Если случайно закоммитили `.env`, удалите его из истории Git:

```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

---

## Структура проекта

```
kids-informatics/
── .env                    # Переменные окружения (не коммитить!)
├── .gitignore
├── package.json
├── drizzle.config.ts
├── src/
│   └── lib/
│       └── db/
│           ├── index.ts    # Подключение к БД
│           └── schema.ts   # Схема таблиц
└── ...
```

---

## Полезные команды

| Команда                    | Описание                       |
| -------------------------- | ------------------------------ |
| `npm run dev`              | Запуск сервера разработки      |
| `npm run build`            | Сборка для продакшена          |
| `npm run preview`          | Предпросмотр собранной версии  |
| `npx drizzle-kit push`     | Применить схему к БД           |
| `npx drizzle-kit studio`   | Открыть визуальный редактор БД |
| `npx drizzle-kit generate` | Создать миграции               |

---

## Помощь

Если возникли проблемы, которые не описаны выше:

1. Проверьте логи в терминале, где запущен `npm run dev`
2. Убедитесь, что все зависимости установлены: `npm install`
3. Очистите кэш: `rm -rf .svelte-kit node_modules/.vite`
4. Перезапустите PostgreSQL

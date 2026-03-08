# Posting Watcher

Docker-контейнер, который находит файл `Posting Efficiency_YYYY-MM-DD*.xlsx` (за сегодняшнюю дату) и загружает его на сервер posting-racing.

## Установка на Windows

### 1. Установить Docker Desktop

Скачать и установить: https://docs.docker.com/desktop/install/windows-install/

После установки перезагрузить компьютер. Убедиться что Docker Desktop запущен (иконка в трее).

### 2. Подключить сетевую папку как диск

1. Открыть **Проводник**
2. Правый клик на **Этот компьютер** → **Подключить сетевой диск**
3. Выбрать букву диска (например `Z:`)
4. Ввести путь к сетевой папке: `\\server\share\folder`
5. Поставить галочку **Восстанавливать подключение при входе в систему**
6. Нажать **Готово**

### 3. Разрешить доступ к диску в Docker Desktop

1. Открыть **Docker Desktop** → **Settings** → **Resources** → **File sharing**
2. Добавить диск `Z:\`
3. Нажать **Apply & Restart**

### 4. Запустить

Открыть **PowerShell** и выполнить:

```powershell
docker run --rm -v Z:\:/data:ro -e SERVER_URL=https://posting-racing-production.up.railway.app -e PASSWORD=1234567890 dageev/posting-watcher:latest
```

Флаг `:ro` = read-only. Docker может только читать файлы, удалить или изменить ничего не может.

Если файлы лежат в подпапке:

```powershell
docker run --rm -v "Z:\Reports\Posting:/data:ro" -e SERVER_URL=https://posting-racing-production.up.railway.app -e PASSWORD=1234567890 dageev/posting-watcher:latest
```

### 5. Что произойдёт

1. Контейнер ищет файл за сегодня в примонтированной папке
2. Если файла нет — ждёт, проверяя каждые 10 секунд
3. Когда файл появится — загружает на сервер и останавливается

```
2026-03-08 12:00:00 [INFO] Watching for pattern: /data/Posting Efficiency_2026-03-08*.xlsx
2026-03-08 12:00:00 [INFO] Waiting for file...
2026-03-08 12:00:10 [INFO] Found file: Posting Efficiency_2026-03-08 (2026-03-01-2026-03-31).xlsx
2026-03-08 12:00:11 [INFO] Upload successful (status 200)
```

## Устранение проблем

**"error while creating mount source path"** — Docker не имеет доступа к диску. Добавьте его в Docker Desktop → Settings → Resources → File sharing.

**"Waiting for file..." бесконечно** — файл за сегодня ещё не появился, или имя не совпадает с паттерном `Posting Efficiency_YYYY-MM-DD...xlsx`.

**"Upload failed with HTTP 401"** — неправильный пароль.

**"Upload failed with HTTP 400"** — сервер не смог распарсить файл. Проверьте что в файле есть колонка "Posting completeness, %".

**PowerShell блокирует скрипт** — выполните один раз: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

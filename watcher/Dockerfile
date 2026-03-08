FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY watcher.py .

RUN adduser --disabled-password --no-create-home watcher
USER watcher

CMD ["python", "-u", "watcher.py"]

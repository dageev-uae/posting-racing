"""
File watcher that finds the latest posting efficiency file and uploads it.

Looks for files matching: Posting Efficiency_YYYY-MM-DD*.xlsx
Tries today first, then goes back day by day up to 30 days.
If nothing found, polls for today's file until it appears.
"""

import glob
import logging
import os
import re
import sys
import time
from datetime import date, timedelta

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

XLSX_MAGIC = b"PK\x03\x04"
DATE_RE = re.compile(r"Posting Efficiency_(\d{4}-\d{2}-\d{2})")


def find_latest_file(watch_dir, max_days=30):
    """Find the most recent Posting Efficiency file, starting from today."""
    today = date.today()
    for days_back in range(max_days + 1):
        d = (today - timedelta(days=days_back)).strftime("%Y-%m-%d")
        pattern = os.path.join(watch_dir, f"Posting Efficiency_{d}*.xlsx")
        matches = glob.glob(pattern)
        if matches:
            return matches[0]
    return None


def upload_file(filepath, upload_url, password):
    """Upload file to the server. Returns True on success."""
    filename = os.path.basename(filepath)

    with open(filepath, "rb") as f:
        header = f.read(4)
        if header != XLSX_MAGIC:
            log.warning("File does not look like a valid XLSX, skipping: %s", filename)
            return False
        f.seek(0)

        try:
            resp = requests.post(
                upload_url,
                files={
                    "file": (
                        filename,
                        f,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    )
                },
                headers={"Authorization": password},
                timeout=(10, 120),
            )
            resp.raise_for_status()
            log.info("Upload successful (status %d)", resp.status_code)
            return True
        except requests.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else "unknown"
            body = ""
            try:
                body = exc.response.text
            except Exception:
                pass
            log.error("Upload failed with HTTP %s: %s", status, body)
        except requests.ConnectionError:
            log.error("Upload failed: could not connect to server")
        except requests.Timeout:
            log.error("Upload failed: request timed out")
        except requests.RequestException as exc:
            log.error("Upload failed: %s", type(exc).__name__)

    return False


def main():
    server_url = os.environ.get("SERVER_URL")
    password = os.environ.get("PASSWORD")
    watch_dir = os.environ.get("WATCH_DIR", "/data")

    if not server_url:
        log.error("SERVER_URL environment variable is required")
        sys.exit(1)
    if not password:
        log.error("PASSWORD environment variable is required")
        sys.exit(1)

    try:
        poll_interval = int(os.environ.get("POLL_INTERVAL", "10"))
        if poll_interval <= 0:
            raise ValueError("must be positive")
    except ValueError as exc:
        log.error("Invalid POLL_INTERVAL: %s", exc)
        sys.exit(1)

    upload_url = f"{server_url.rstrip('/')}/api/upload"
    log.info("Upload target: %s", upload_url)

    # Try to find an existing file (today or recent)
    filepath = find_latest_file(watch_dir)

    if filepath:
        filename = os.path.basename(filepath)
        log.info("Found file: %s", filename)
        if upload_file(filepath, upload_url, password):
            return
        sys.exit(1)

    # No file found — poll for today's file
    today = date.today().strftime("%Y-%m-%d")
    pattern = os.path.join(watch_dir, f"Posting Efficiency_{today}*.xlsx")
    log.info("No recent file found. Polling for: %s", pattern)
    log.info("Poll interval: %d seconds", poll_interval)

    while True:
        matches = glob.glob(pattern)
        if matches:
            filepath = matches[0]
            log.info("Found file: %s", os.path.basename(filepath))
            if upload_file(filepath, upload_url, password):
                return
            sys.exit(1)

        log.info("Waiting for file...")
        time.sleep(poll_interval)


if __name__ == "__main__":
    main()

"""
File watcher that polls for today's posting efficiency file and uploads it.

Looks for a file matching: Posting Efficiency_YYYY-MM-DD*.xlsx
Once found, uploads it to the server via POST /api/upload and exits.
"""

import glob
import logging
import os
import sys
import time
from datetime import date

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

XLSX_MAGIC = b"PK\x03\x04"


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

    today = date.today().strftime("%Y-%m-%d")
    pattern = os.path.join(watch_dir, f"Posting Efficiency_{today}*.xlsx")
    upload_url = f"{server_url.rstrip('/')}/api/upload"

    log.info("Watching for pattern: %s", pattern)
    log.info("Upload target: %s", upload_url)
    log.info("Poll interval: %d seconds", poll_interval)

    while True:
        matches = glob.glob(pattern)
        if matches:
            filepath = matches[0]
            filename = os.path.basename(filepath)
            log.info("Found file: %s", filename)

            with open(filepath, "rb") as f:
                header = f.read(4)
                if header != XLSX_MAGIC:
                    log.warning("File does not look like a valid XLSX, skipping")
                    time.sleep(poll_interval)
                    continue
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
                except requests.HTTPError as exc:
                    status = exc.response.status_code if exc.response is not None else "unknown"
                    body = ""
                    try:
                        body = exc.response.text
                    except Exception:
                        pass
                    log.error("Upload failed with HTTP %s: %s", status, body)
                    sys.exit(1)
                except requests.ConnectionError:
                    log.error("Upload failed: could not connect to server")
                    sys.exit(1)
                except requests.Timeout:
                    log.error("Upload failed: request timed out")
                    sys.exit(1)
                except requests.RequestException as exc:
                    log.error("Upload failed: %s", type(exc).__name__)
                    sys.exit(1)

            break

        log.info("Waiting for file...")
        time.sleep(poll_interval)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Local server for the video downloader UI.
Usage: python3 server.py
Then open http://localhost:8765
"""

import http.server
import json
import os
import subprocess
import sys

DOWNLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
INDEX_HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")
PORT = 8765


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default request logging

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(INDEX_HTML, "rb") as f:
                self.wfile.write(f.read())

        elif self.path == "/files":
            os.makedirs(DOWNLOADS_DIR, exist_ok=True)
            files = sorted(f for f in os.listdir(DOWNLOADS_DIR) if not f.startswith("."))
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(files).encode())

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/download":
            self.send_response(404)
            self.end_headers()
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            url = body.get("url", "").strip()
            name = body.get("name", "").strip()
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        if not url:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "URL is required"}).encode())
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        os.makedirs(DOWNLOADS_DIR, exist_ok=True)

        if name:
            outtmpl = os.path.join(DOWNLOADS_DIR, f"{os.path.splitext(name)[0]}.%(ext)s")
        else:
            outtmpl = os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s")

        cmd = [
            sys.executable, "-m", "yt_dlp",
            "-f", "bestvideo+bestaudio/best",
            "--merge-output-format", "mp4",
            "--no-playlist",
            "-o", outtmpl,
            url,
        ]

        def send(data: dict):
            self.wfile.write(f"data: {json.dumps(data)}\n\n".encode())
            self.wfile.flush()

        try:
            proc = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, bufsize=1,
            )
            for line in iter(proc.stdout.readline, ""):
                line = line.rstrip()
                if line:
                    send({"line": line})
            proc.wait()
            if proc.returncode == 0:
                send({"done": True})
            else:
                send({"error": "Download failed — check the URL and try again."})
        except BrokenPipeError:
            pass
        except Exception as e:
            try:
                send({"error": str(e)})
            except Exception:
                pass


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("localhost", PORT), Handler)
    print(f"Video Downloader → http://localhost:{PORT}")
    print("Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")

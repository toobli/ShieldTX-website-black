#!/usr/bin/env python3
"""Local dev server: serves dist/ with Cache-Control: no-store so previews never show stale HTML/CSS/JS.
    python3 tools/serve.py [port]   (default 4216)"""
import http.server, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent / 'dist'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4216
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ROOT), **k)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('', PORT), H).serve_forever()

"""Local preview server for watts-up.html.

Serves the project folder (the parent of tools/) on 127.0.0.1. Uses a threaded server because
Python 3.6's plain `python -m http.server` handles one connection at a time and hangs when a
browser keeps a connection open.

Port: the PORT environment variable if set (the preview pane sets it when the configured port is
taken), else the first argument, else 3131.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    port = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 3131))
    os.chdir(ROOT)
    server = ThreadedServer(("127.0.0.1", port), http.server.SimpleHTTPRequestHandler)
    print("serving %s on http://localhost:%d/watts-up.html" % (ROOT, port), flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()

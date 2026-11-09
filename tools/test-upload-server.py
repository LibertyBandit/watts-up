from http.server import HTTPServer, BaseHTTPRequestHandler
import os, tempfile
# Test helper: lets a page in the browser pane POST a generated file (e.g. a Word report) to disk so Word can open it.
# Saves into UPLOAD_DIR (default: the system temp folder). Run: py -3 tools/test-upload-server.py   (listens on port 3132)
OUT=os.environ.get('UPLOAD_DIR',tempfile.gettempdir())
class H(BaseHTTPRequestHandler):
    def _c(self):
        self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Headers','*'); self.send_header('Access-Control-Allow-Methods','POST,OPTIONS')
    def do_OPTIONS(self):
        self.send_response(204); self._c(); self.end_headers()
    def do_POST(self):
        n=int(self.headers.get('Content-Length',0)); data=self.rfile.read(n)
        name=os.path.basename(self.path.strip('/')) or 'upload.bin'
        open(os.path.join(OUT,name),'wb').write(data)
        self.send_response(200); self._c(); self.end_headers(); self.wfile.write(b'ok')
HTTPServer(('',3132),H).serve_forever()

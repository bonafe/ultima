#!/usr/bin/env python3
# python3 update of https://gist.github.com/dergachev/7028596
# Create a basic certificate using openssl:
#     openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# Or to set CN, SAN and/or create a cert signed by your own root CA: https://thegreycorner.com/pentesting_stuff/writeups/selfsignedcert.html

import http.server
from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import sys
import ssl
import os

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

os.chdir("../html");

httpd = http.server.HTTPServer(('127.0.0.1', 8123), CORSRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='../python/server.pem', server_side=True)
httpd.serve_forever()
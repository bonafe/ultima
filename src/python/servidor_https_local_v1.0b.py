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

os.chdir("../../dist/v1.0b");

endereco_ip = '192.168.1.155'

httpd = http.server.HTTPServer((endereco_ip, 443), CORSRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='../../src/resources/certificadoDigital/ultima.selfsigned.pem', server_side=True)
httpd.serve_forever()

#!/usr/bin/env python3
"""
Simple HTTP server to run the audio generator app locally.
Usage: python3 serve.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}"
            print(f"\n{'='*60}")
            print(f"  Server running at {url}")
            print(f"  Press Ctrl+C to stop the server")
            print(f"{'='*60}\n")
            
            # Automatically open browser
            webbrowser.open(url)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print(f"Please close the application using port {PORT} or modify PORT in this script.\n")
        else:
            print(f"\nError: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()


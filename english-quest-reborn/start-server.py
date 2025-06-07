#!/usr/bin/env python3
"""
Serveur HTTP simple pour tester le jeu English Quest sans problèmes CORS
Usage: python start-server.py [port]
Port par défaut: 8000
"""
import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

# Port par défaut
DEFAULT_PORT = 8000

def main():
    # Obtenir le port depuis les arguments ou utiliser le port par défaut
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    
    # Changer vers le répertoire du script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print(f"🚀 Démarrage serveur English Quest...")
    print(f"📁 Répertoire: {script_dir}")
    print(f"🌐 Port: {port}")
    
    # Configuration du serveur
    handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"✅ Serveur démarré sur http://localhost:{port}")
            print(f"🎮 Jeu principal: http://localhost:{port}/games/enigma-scroll-main.html")
            print(f"👤 Profil: http://localhost:{port}/profile.html")
            print(f"🏠 Page d'accueil: http://localhost:{port}/index.html")
            print(f"\n💡 Conseil: Utilisez Ctrl+C pour arrêter le serveur")
            
            # Ouvrir automatiquement le navigateur
            webbrowser.open(f"http://localhost:{port}/games/enigma-scroll-main.html")
            
            # Démarrer le serveur
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur...")
    except OSError as e:
        if e.errno == 48:  # Port déjà utilisé
            print(f"❌ Erreur: Le port {port} est déjà utilisé")
            print(f"💡 Essayez: python start-server.py {port + 1}")
        else:
            print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
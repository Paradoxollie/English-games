import json

def convert_to_json():
    # Lire le fichier texte existant
    with open('words-5-letters.json', 'r', encoding='utf-8') as f:
        words = f.read().splitlines()
    
    # Nettoyer les mots (enlever les lignes vides et les espaces)
    words = [word.strip() for word in words if word.strip()]
    
    # Créer le nouveau fichier JSON
    with open('words-5-letters.json', 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2)
    
    print(f"Converti {len(words)} mots en format JSON")

if __name__ == "__main__":
    convert_to_json()
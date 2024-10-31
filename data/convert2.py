import json

# Charger les mots depuis le fichier .txt
with open('filtered_words.txt', 'r') as txt_file:
    words = [line.strip() for line in txt_file if line.strip()]  # Supprime les lignes vides

# Sauvegarder sous format JSON
with open('words.json', 'w') as json_file:
    json.dump(words, json_file, indent=4)

print("Le fichier 'words.json' a été créé avec succès.")

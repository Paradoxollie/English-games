import json

# Charger les mots depuis un fichier JSON
with open('words.json', 'r') as file:
    words = json.load(file)

# Filtrer les mots entre 3 et 5 lettres
filtered_words = [word for word in words if 8 <= len(word) <= 22]

# Afficher les mots dans le format souhaité
formatted_output = ", ".join(f'"{word}"' for word in filtered_words)
print(formatted_output)

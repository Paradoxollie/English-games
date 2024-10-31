# Charger la liste complète des mots
with open('words_alpha.txt', 'r') as f:
    all_words = set(word.strip().lower() for word in f if len(word.strip()) >= 3)  # Filtrer les mots de moins de 3 lettres directement

# Charger la liste des mots offensants
with open('en.txt', 'r') as f:
    inappropriate_words = set(word.strip().lower() for word in f)

# Filtrer les mots offensants
filtered_words = all_words - inappropriate_words

# Sauvegarder la liste filtrée
with open('filtered_words.txt', 'w') as f:
    for word in sorted(filtered_words):
        f.write(word + '\n')

print("La liste filtrée a été créée dans 'filtered_words.txt'.")

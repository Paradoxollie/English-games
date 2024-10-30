import requests
import json

def create_complete_word_list():
    # Télécharger une liste plus complète
    url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
    response = requests.get(url)
    words = response.text.splitlines()

    # Filtrer les mots de 5 lettres
    five_letter_words = [
        word.upper() for word in words 
        if len(word) == 5 
        and word.isalpha()  # Seulement les lettres
    ]

    # Sauvegarder en JSON
    with open('words-5-letters.json', 'w', encoding='utf-8') as f:
        json.dump(five_letter_words, f, indent=2)

    print(f"Créé une liste de {len(five_letter_words)} mots")

if __name__ == "__main__":
    create_complete_word_list()
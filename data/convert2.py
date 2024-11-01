import json

# Nom du fichier texte d'entrée et du fichier JSON de sortie
input_file = 'filtered_words.txt'  # Remplace par le nom de ton fichier texte
output_file = 'filtered_words.json'

# Fonction pour convertir le fichier texte en fichier JSON
def convert_txt_to_json(input_file, output_file):
    try:
        # Lire tous les mots du fichier texte et les stocker dans une liste
        with open(input_file, 'r', encoding='utf-8') as file:
            words = [line.strip() for line in file if line.strip()]

        # Créer un dictionnaire au format voulu
        data = {"words": words}

        # Écrire le dictionnaire dans un fichier JSON
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=4)

        print(f"Fichier JSON '{output_file}' créé avec succès!")

    except Exception as e:
        print(f"Erreur lors de la conversion: {e}")

# Appeler la fonction
convert_txt_to_json(input_file, output_file)

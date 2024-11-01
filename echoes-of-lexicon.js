// Récupération des éléments DOM
const centralLetterEl = document.getElementById('central-letter');
const otherLettersEl = document.getElementById('other-letters');
const currentWordEl = document.getElementById('current-word');
const submitWordButton = document.getElementById('submit-word');
const scoreDisplay = document.getElementById('score-display');
const messageEl = document.getElementById('message');
const topScoresList = document.getElementById('top-scores-list');

// Variables de jeu
let centralLetter = '';
let otherLetters = [];
let bonusLetter = '';
let score = 0;
let usedWords = new Set();
let validWords = [];

// Charger la liste des mots depuis words.json
fetch('words.json')
    .then(response => response.json())
    .then(data => {
        validWords = data.words;
    })
    .catch(error => console.error('Error loading words:', error));

// Initialiser les lettres du jeu avec un équilibre de voyelles et consonnes
function initializeGame() {
    const letters = generateBalancedLetters();
    centralLetter = letters[0];
    otherLetters = letters.slice(1, -1);  // Autres lettres sans la bonus
    bonusLetter = letters[letters.length - 1];  // Lettre bonus

    centralLetterEl.textContent = centralLetter.toUpperCase();
    otherLettersEl.innerHTML = otherLetters
        .map(letter => `<div class="letter">${letter.toUpperCase()}</div>`)
        .join('');
    otherLettersEl.innerHTML += `<div class="letter bonus">${bonusLetter.toUpperCase()}</div>`;

    score = 0;
    usedWords.clear();
    updateScore();
    messageEl.textContent = '';
}

// Générer des lettres avec équilibre voyelles/consonnes + bonus
function generateBalancedLetters() {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const letters = [];

    // Choisir une voyelle centrale
    letters.push(vowels[Math.floor(Math.random() * vowels.length)]);

    // Ajouter 3 consonnes et 2 voyelles supplémentaires
    while (letters.length < 6) {
        const pool = letters.length < 4 ? consonants : vowels;
        const letter = pool[Math.floor(Math.random() * pool.length)];
        if (!letters.includes(letter)) letters.push(letter);
    }

    // Ajouter une lettre bonus, différente des autres
    let bonus = '';
    while (!bonus || letters.includes(bonus)) {
        bonus = (vowels + consonants)[Math.floor(Math.random() * (vowels.length + consonants.length))];
    }
    letters.push(bonus);

    return letters;
}

// Vérifier si un mot est valide
function isValidWord(word) {
    return word.length >= 4 &&
           word.includes(centralLetter) &&
           !usedWords.has(word) &&
           validWords.includes(word);
}

// Soumettre un mot et obtenir la définition si valide
function submitWord() {
    const word = currentWordEl.value.toLowerCase().trim();

    // Vérification de la validité du mot
    if (isValidWord(word)) {
        usedWords.add(word);
        let points = word.length;
        if (word.includes(bonusLetter)) points += 5;  // Points bonus pour la lettre bonus
        score += points;
        updateScore();
        fetchDefinition(word, points); // Obtenir la définition et afficher les points
    } else {
        messageEl.textContent = usedWords.has(word) ? 'Word already used!' : 'Invalid word!';
        messageEl.style.color = 'red';
        score -= 1;  // Pénalité pour mot invalide ou déjà utilisé
        updateScore();
    }
    currentWordEl.value = '';
}

// Obtenir la définition d'un mot via l'API
function fetchDefinition(word, points) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const definition = data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";
            messageEl.textContent = `Correct! +${points} points. Definition: ${definition}`;
            messageEl.style.color = 'green';
        })
        .catch(error => {
            console.error('Error fetching definition:', error);
            messageEl.textContent = `Correct! +${points} points. Definition unavailable.`;
            messageEl.style.color = 'green';
        });
}

// Mettre à jour l'affichage du score
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Événement de clic sur le bouton de soumission
submitWordButton.addEventListener('click', submitWord);
currentWordEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWord();
});

// Initialiser le jeu au chargement
initializeGame();

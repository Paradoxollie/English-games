const WORDS = [
    "APPLE", "BEACH", "CHAIR", "DANCE", "EAGLE", "FLAME", "GRAPE", "HOUSE",
    "IMAGE", "JUICE", "KNIFE", "LEMON", "MOUSE", "NIGHT", "OCEAN", "PIANO",
    "QUEEN", "RIVER", "SNAKE", "TABLE", "UNCLE", "VOICE", "WATER", "YOUTH",
    "ZEBRA"
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WORDS };
} else {
    window.WORDS = WORDS;
}

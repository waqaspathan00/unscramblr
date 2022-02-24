function scramble (word) {
    const letters = word.split("");  // convert word into list of letters
    const length = letters.length;

    for(let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = letters[i];
        letters[i] = letters[j];
        letters[j] = tmp;
    }
    return letters.join("");
}

function randomChoice(items){
    const index = Math.floor(Math.random() * items.length)
    return items[index]
}
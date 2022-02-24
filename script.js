const VOWELS = "AEIOU"
const CONSONANTS = "CBDFGHJKLMNPQRSTVWXYZ"
const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")
const scrambledGrid = document.querySelector("[data-scrambled-grid]")
const offsetFromDate = new Date(2022, 0, 1)
const msOffset = Date.now() - offsetFromDate
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const targetWord = targetWords[Math.floor(dayOffset)]
const scrambledLetters = scramble(targetWord + randomChoice(VOWELS) + randomChoice(VOWELS) + randomChoice(CONSONANTS) + randomChoice(CONSONANTS))

displayScrambledWord()
startInteraction()

function displayScrambledWord() {
    for (let i=0; i < scrambledLetters.length; i++){
        const letterTile = document.createElement("div")
        letterTile.className = "tile"
        letterTile.innerHTML = scrambledLetters[i]
        scrambledGrid.appendChild(letterTile)
    }
}

function startInteraction() {
    document.addEventListener("click", handleMouseClick)
    document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
    document.removeEventListener("click", handleMouseClick)
    document.removeEventListener("keydown", handleKeyPress)
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key)
        return
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess()
        return
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        submitGuess()
        return
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey()
        return
    }

    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key)
        return
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH) return
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = "active"
}

function deleteKey() {
    const activeTiles = getActiveTiles()
    const lastTile = activeTiles[activeTiles.length - 1]
    if (lastTile == null) return
    lastTile.textContent = ""
    delete lastTile.dataset.state
    delete lastTile.dataset.letter
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length !== WORD_LENGTH) {
        showAlert("Not enough letters")
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, "")

    if (!dictionary.includes(guess)) {
        showAlert("Not in word list")
        shakeTiles(activeTiles)
        return
    }

    stopInteraction()
    activeTiles.forEach((...params) => flipTile(...params, guess))
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter}"i]`)
    setTimeout(() => {
        tile.classList.add("flip")
    }, (index * FLIP_ANIMATION_DURATION) / 2)

    tile.addEventListener(
        "transitionend",
        () => {
            tile.classList.remove("flip")
            if (targetWord[index] === letter) {
                tile.dataset.state = "correct"
                key.classList.add("correct")
            } else {
                tile.dataset.state = "wrong"
                key.classList.add("wrong")
            }

            if (index === array.length - 1) {
                tile.addEventListener(
                    "transitionend",
                    () => {
                        startInteraction()
                        checkWinLose(guess, array)
                    },
                    {once: true}
                )
            }
        },
        {once: true}
    )
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

function getAllTiles(){
    return guessGrid.querySelectorAll(".tile")
}

function showAlert(message, duration = 10000) {
    const alert = document.createElement("div")

    if (typeof message == "string"){
        alert.textContent = message
    } else {
        alert.appendChild(message)
    }
    alert.classList.add("alert")
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener(
            "animationend",
            () => {
                tile.classList.remove("shake")
            },
            {once: true}
        )
    })
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        showAlert("You Win", 5000)
        danceTiles(tiles)
        showShareAlert()
        stopInteraction()
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
        showAlert(targetWord.toUpperCase(), null)
        showShareAlert()
        stopInteraction()
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener(
                "animationend",
                () => {
                    tile.classList.remove("dance")
                },
                {once: true}
            )
        }, (index * DANCE_ANIMATION_DURATION) / 5)
    })
}

function showShareAlert(){
    const share = document.createElement("button")
    share.onclick = copyResults()
    share.innerText = "Share results"
    share.classList.add("btn")

    showAlert(share)
}

function copyResults(){
    const tiles = getAllTiles()
    var result = ""

    tiles.forEach((tile, index) => {
        if (tile.dataset.state === "correct"){
            result += "🟩"
        } else if (tile.dataset.state === "wrong"){
            result += "⬛️"
        }

        console.log(typeof index, index)
        if ((index+1) % 5 === 0){
            console.log('made it')
            result += "\n"
        }
    })

    /* Get the text field */
    var copyResult = document.getElementById("result");

    copyResult.value = "dayli unscramblr\n\n"
    copyResult.value += result;
    copyResult.value += "waqaspathan00.github.io/unscramblr"

    /* Select the text field */
    copyResult.select();

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyResult.value);
}
//script.js

//guesses
var prevGuesses = []
var currGuess = ""
var answer = ""
var keyboard1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o','p']
var keyboard2 = ['a','s','d','f','g','h','j','k','l']
var keyboard3 = ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
var keyboard = [keyboard1, keyboard2, keyboard3]
var keyboardFlat = keyboard.flat()

//generate word
function generateWord() {
  var possibleWords = ["apple", "block", "books", "chains", "trick"]
  let index = 0 
  let word = possibleWords[index]
  return word
}

//check game over
function isGameOver() {
  return (prevGuesses[prevGuesses.length-1] === answer) || (prevGuesses.length === 5) 
}

//check game won
function isGameWon() {
    return prevGuesses[prevGuesses.length-1] === answer
}

//check guess against answer
function checkGuessAgainstAnswer() {
  var res = []
  var guess = prevGuesses[prevGuesses.length-1]
  for (let i=0; i<5; i++) {
    color = checkLetter(i, guess[i], answer)
    res.push(color)
  }
  return res
}

//get class for letter
function checkLetter(i, letter, answer) {
    if (letter == answer[i])
        return "all-correct"
    else if (answer.includes(letter)) {
        return "part-correct"
    }
    return 'wrong'
}

//get keyboard row index 
function getKeyboardRowIndex(bigIndex) {
    let index = bigIndex
    let row
    if (index < 10) {
        row = 0
    } else if (index >= 10 && index < 19) {
        index = bigIndex - 10
        row = 1
    } else {
        index = bigIndex - 19
        row = 2
    }
    return [index, row]
}

//redraw cells after guessing
function redrawCells() {
    //change colors of guess cells
    let colors = checkGuessAgainstAnswer()
    let gameBoard = document.getElementById("cell-grid")
    let guessStartIndex = (prevGuesses.length - 1) * 5
    for (let i=0; i<5; i++) {
        let className = colors[i]
        gameBoard.children[guessStartIndex+i].children[0].children[0].classList.add(className) 
    }
    //animate flipping of cards
    timedAnimateCardRow(guessStartIndex, guessStartIndex + 5)

    //change colors of virtual keyboard keys
    //loop through each key on the virtual keyboard
    for (let i = 0; i < keyboardFlat.length; i++) {
        //indexing information for current virtual keyboard key
        let [index, row] = getKeyboardRowIndex(i)
        let rowId = 'keyboard-row' + (row + 1).toString()
        let currentRow = document.getElementById(rowId)
        let currentKey = currentRow.children[index]
        //if the letter for that key has been registered as part-correct, only change it to correct (no change for wrong)
        if (currentKey.classList.contains('part-correct')) {
            //check the current key against the letters of the current guess
            for (let j = 0; j < 5; j++) {
                //get the letter of the current guess for the index j
                let letterStatus = colors[j]
                let letter = prevGuesses[prevGuesses.length - 1][j]
                if (letter != currentKey.textContent) {
                    continue
                }
                if (letterStatus == 'all-correct') {
                    currentKey.classList.add('all-correct')
                    currentKey.classList.remove('part-correct')
                } 
            } //if the letter for that key has been registered as wrong, change it no matter what
        } else if (!currentKey.classList.contains('wrong') && !currentKey.classList.contains('all-correct')) {
            //check the current key against the letters of the current guess
            for (let j = 0; j < 5; j++) {
                //get the letter of the current guess for the index j
                let letterStatus = colors[j]
                let letter = prevGuesses[prevGuesses.length - 1][j]
                if (letter != currentKey.textContent) {
                    continue
                }
                if (colors[j] == 'all-correct') {
                    currentKey.classList.add('all-correct')
                } else if (colors[j] == 'part-correct') {
                    currentKey.classList.add('part-correct')
                } else if (colors[j] == 'wrong') {
                    currentKey.classList.add('wrong')
                }
            }
        } 
    }
}

//store guesses
function handleKeyDown(e) {
  // see how many guesses were made already
  let numPrevGuesses = prevGuesses.length
  // change content of cells in current guess
  // find place 
  let curIndex = numPrevGuesses * 5 + currGuess.length
  let gameBoard = document.getElementById("cell-grid")
  // handle different keys:
  // char -> add to currGuess if less than 5 characters in current guess
  // backspace -> delete characters from currGuess if not fewer than 0 characters
  // enter -> add current word to prevGuesses, currGuess = ""
  if (!isGameOver()) {
    if (e.key.length === 1 && currGuess.length < 5) { // case: guess has <=5 letters
      let cellFront = gameBoard.children[curIndex].children[0].children[1]
      cellFront.textContent = e.key
      currGuess += e.key
      cellFront.classList.add('active')
      cellFront.classList.add('scale-up-center')
      let cellBack = gameBoard.children[curIndex].children[0].children[0]
      cellBack.textContent = e.key
    } else if (e.key === "Backspace" && currGuess.length > 0) { // case: guess has >= 0 letters
      currGuess = currGuess.slice(0,-1)
      let cellFront = gameBoard.children[curIndex - 1].children[0].children[1]
      cellFront.textContent = ""
      cellFront.classList.remove('active')
      cellFront.classList.remove('scale-up-center')
      let cellBack = gameBoard.children[curIndex - 1].children[0].children[0]
      cellBack.textContent = ""
    } else if (e.key === "Enter" && currGuess.length === 5) { // case: enter guess
      prevGuesses.push(currGuess)
      currGuess = ""
      redrawCells()
      if (isGameWon()) {
          updateStats()
          timedStatsPopup()
          timedAnimateWinning()
          timedResultMessage()
      } else if (isGameOver()) {
          updateStats()
          timedStatsPopup()
          timedResultMessage()
      }
    }
  }
}

//store guesses
function handleVirtualKeyDown(key) {
	// see how many guesses were made already
	let numPrevGuesses = prevGuesses.length
	// change content of cells in current guess
	// find place 
	let curIndex = numPrevGuesses * 5 + currGuess.length
	let gameBoard = document.getElementById("cell-grid")
	// handle different keys:
	// char -> add to currGuess if less than 5 characters in current guess
	// backspace -> delete characters from currGuess if not fewer than 0 characters
	// enter -> add current word to prevGuesses, currGuess = ""
    if (!isGameOver()) {
        if (key.length === 1 && currGuess.length < 5) { // case: guess has <=5 letters
            let cellFront = gameBoard.children[curIndex].children[0].children[1]
            cellFront.textContent = key
            currGuess += key
            cellFront.classList.add('active')
            cellFront.classList.add('scale-up-center')
            let cellBack = gameBoard.children[curIndex].children[0].children[0]
            cellBack.textContent = key
        } else if (key === "Backspace" && currGuess.length > 0) { // case: guess has >= 0 letters
            currGuess = currGuess.slice(0, -1)
            let cellFront = gameBoard.children[curIndex - 1].children[0].children[1]
            cellFront.textContent = ""
            cellFront.classList.remove('active')
            cellFront.classList.remove('scale-up-center')
            let cellBack = gameBoard.children[curIndex - 1].children[0].children[0]
            cellBack.textContent = ""
        } else if (key === "Enter" && currGuess.length === 5) { // case: enter guess
            prevGuesses.push(currGuess)
            currGuess = ""
            redrawCells()
            if (isGameWon()) {
                updateStats()
                timedStatsPopup()
                timedAnimateWinning()
                timedResultMessage()
            } else if (isGameOver()) {
                updateStats()
                timedStatsPopup()
                timedResultMessage()
            }
        }
    }
}

//draw initial cells
function drawInitCells() {
  
    // draw cells for guesses
    for (let i=0; i<25; i++) {
        let gameBoard = document.getElementById("cell-grid")
        let cardContainer = document.createElement('div')
        cardContainer.classList.add('card-container')
        let card = document.createElement('div')
        card.classList.add('card')
        let cellFront = document.createElement("div")
        cellFront.classList.add("cell")
        cellFront.classList.add("front")
        let cellBack = document.createElement('div')
        cellBack.classList.add('cell')
        cellBack.classList.add('back')
        cardContainer.appendChild(card)
        card.appendChild(cellBack)
        card.appendChild(cellFront)
        gameBoard.appendChild(cardContainer)
    }
    // handle keyboard presses
    document.addEventListener('keyup', handleKeyDown)
    // handle virtual keyboard
    drawInitKeyboard()
}

//return HTML key (of keyboard) element
function makeKey(key) {
  let kElement = document.createElement("div")
  kElement.classList.add("key")
  kElement.textContent = key
  //on virtual keyboard key being clicked, do keydown function
  kElement.addEventListener('click', function () {
    handleVirtualKeyDown(key)
  })
  return kElement
}

//change letter key class
function changeKeyClasses() {
}

//draw keyboard
function drawInitKeyboard() {
	for (let i = 0; i < 10; i++) {
		let kbElement = document.getElementById("keyboard-row1")
		let key = keyboard1[i]
		let kElement = makeKey(key)
		kbElement.appendChild(kElement)
	}
	for (let i = 0; i < 9; i++) {
		let kbElement = document.getElementById("keyboard-row2")
		let key = keyboard2[i]
		let kElement = makeKey(key)
		kbElement.appendChild(kElement)
	}
	for (let i = 0; i < 9; i++) {
		let kbElement = document.getElementById("keyboard-row3")
		let key = keyboard3[i]
        let kElement = makeKey(key)
        if (i == 0 || i == 8) {
            kElement.classList.add('special')
        }
		kbElement.appendChild(kElement)
	}
}

//toggle stats popup
function toggleStats() {
    if (document.getElementById('stats-popup').style.display == 'block') {
        closeStats()
    } else {
        if (document.getElementById('settings-popup').style.display == 'block') {
                closeSettings()
         }
        showStats()
    }
}

//toggle settings popup
function toggleSettings() {
    if (document.getElementById('settings-popup').style.display == 'block') {
        closeSettings()
    } else {
        if (document.getElementById('stats-popup').style.display == 'block') {
            closeStats()
        }
        showSettings()
    }
}

//show stats popup
function showStats() {
    document.getElementById('stats-popup').style.display = 'block'
    if (isGameWon()) {
        showShareMessage(createShareMessage())
    }

}

//close stats popup
function closeStats() {
    document.getElementById('stats-popup').style.display = 'none'
}

//show settings
function showSettings() {
    document.getElementById('settings-popup').style.display = 'block'
}

//show settings
function closeSettings() {
    document.getElementById('settings-popup').style.display = 'none'
}

//create block of emojis to share
function createEmojiBlock() {
    //go through all prevGuesses
    //for each word guess, check the cells in the gameboard that correspond to it
    //for each cell, append the appropriate emoji
    let emojiBlock = []
    for (let i = 0; i < prevGuesses.length; i++) {
        let emojiRow = []
        for (let j = 0; j < 5; j++) {
            let cellIndex = i * 5 + j
            let cell = document.getElementById('cell-grid').children[cellIndex].children[0].children[0]
            let emoji
            if (cell.classList.contains('all-correct')) {
                emoji = '🟩'
            } else if (cell.classList.contains('part-correct')) {
                emoji = '🟨'
            } else if (cell.classList.contains('wrong')) {
                emoji = '⬜'
            }
            emojiRow.push(emoji)
        }
        emojiBlock.push(emojiRow.join(''))
    }
    let result = emojiBlock.join("\n")
    return result
}

//copy emoji block
function copyEmojiBlock() {
    let msgInput = document.getElementById('message-input')
    if (msgInput.select) {
        msgInput.select()
        try {
            document.execCommand('copy')

        } catch (err) {
            alert('u done fucked up')
        }
    }
}

//show results in text input
function showShareMessage(message) {
    let msgContainer = document.getElementById('message-container')
    document.getElementById('message-input').value = message
    msgContainer.style.display = 'block'
}

//update stats in localStorage
function updateStats() {
    //get previous stats data as ints
    let played = Number(localStorage.getItem('played'))
    let wins = Number(localStorage.getItem('wins'))
    let currStreak = Number(localStorage.getItem('currStreak'))
    let maxStreak = Number(localStorage.getItem('maxStreak'))
    let guessDist = localStorage.getItem('guessDist').split(",").map(x => Number(x))
    //declare new stats variables as ints
    let newPlayed = played + 1 //+1 game played
    let newWins
    let newCurrStreak
    let newMaxStreak
    let newGuessDist = guessDist
    //store if player won current game as bool
    let isWon = prevGuesses.includes(answer)
    //if player won game
    if (isWon) {
        newWins = wins + 1 //+1 game won
        newCurrStreak = currStreak + 1 //+1 game to current streak
        newMaxStreak = maxStreak //assume max streak is former max streak
        if (newCurrStreak > maxStreak) {
            newMaxStreak = newCurrStreak //update max streak if current streak is greater than old max streak
        } 
        let numGuesses = prevGuesses.length //+1 to guess distribution for number of guesses used in this game
        newGuessDist[numGuesses - 1] += 1
    } else { //if player lost game
        newWins = wins //wins does not change
        newCurrStreak = 0 //current streak is 0
        newMaxStreak = maxStreak //new max streak is old max streak
    }
    //store stats in localStorage again
    localStorage.setItem('played', newPlayed.toString())
    localStorage.setItem('wins', newWins.toString())
    localStorage.setItem('currStreak', newCurrStreak.toString())
    localStorage.setItem('maxStreak', newMaxStreak.toString())
    localStorage.setItem('guessDist', newGuessDist.toString())
    //updateStatsPopup
    updateStatsPopup()
}

function updateStatsPopup() {
    // get localStorage data as strings or null
    let played = localStorage.getItem('played')
    let wins = localStorage.getItem('wins')
    let currStreak = localStorage.getItem('currStreak')
    let maxStreak = localStorage.getItem('maxStreak')
    let guessDist = localStorage.getItem('guessDist')
    // if the values are null, the player is new so set the values to 0
    if (played == null) {
        localStorage.setItem('played', "0")
        played = "0"
    }
    if (wins == null) {
        localStorage.setItem('wins', "0")
        wins = "0"
    }
    if (currStreak == null) {
        localStorage.setItem('currStreak', "0")
        currStreak = "0"
    }
    if (maxStreak == null) {
        localStorage.setItem('maxStreak', "0")
        maxStreak = "0"
    }
    if (guessDist == null) {
        localStorage.setItem('guessDist', "0,0,0,0,0")
        guessDist = "0,0,0,0,0"
    }
    // get the dom elements
    let playedElt = document.getElementById('played')
    let winsElt = document.getElementById('win-percent')
    let currStreakElt = document.getElementById('curr-streak')
    let maxStreakElt = document.getElementById('max-streak')
    // set the textContent of the dom elements to the localStorage data
    playedElt.textContent = played
    winsElt.textContent = "0"
    if (played != "0") {
        winsElt.textContent = (Number(wins) / Number(played) * 100).toFixed().toString()
    }
    currStreakElt.textContent = currStreak
    maxStreakElt.textContent = maxStreak
    drawGuessDist()
    
}

function createShareMessage() {
    let emojiBlock = createEmojiBlock()
    let message = "Wordle Clone " + prevGuesses.length.toString() + "/5\n\n" + emojiBlock
    return message
}

function drawGuessDist() {
    let gd1 = document.getElementById('gd-1')
    let gd2 = document.getElementById('gd-2')
    let gd3 = document.getElementById('gd-3')
    let gd4 = document.getElementById('gd-4')
    let gd5 = document.getElementById('gd-5')
    let gdArray = [gd1, gd2, gd3, gd4, gd5]

    let gdBar1 = document.getElementById('gd-bar-1')
    let gdBar2 = document.getElementById('gd-bar-2')
    let gdBar3 = document.getElementById('gd-bar-3')
    let gdBar4 = document.getElementById('gd-bar-4')
    let gdBar5 = document.getElementById('gd-bar-5')
    let gdBarArray = [gdBar1,gdBar2,gdBar3,gdBar4,gdBar5]

    let guessDist = localStorage.getItem('guessDist').split(",").map(x => Number(x))
    gd1.textContent = guessDist[0]
    gd2.textContent = guessDist[1]
    gd3.textContent = guessDist[2]
    gd4.textContent = guessDist[3]
    gd5.textContent = guessDist[4]

    for (let i = 0; i < 5; i++) {
        let color = (prevGuesses.length == (i + 1)) ? calcRgbString(0,10,0) : calcRgbString(128,128,128)
        drawGuessDistBar(guessDist[i], gdArray[i], gdBarArray[i], color, Math.max(...guessDist))
    }
}

function calcRgbString(r, g, b) {
    return "#" + r.toString(16) + g.toString(16) + b.toString(16)
}

function drawGuessDistBar(gd, gdElem, rect, color, max) {
    rect.style.fill = color
    // longest bar = 100
    // calculate width of bar based on proportion of longest bar from max
    let widthInt = 20
    if (max != 0) {
        widthInt = ((gd / max * 180) + 25)
    }
    rect.setAttribute("width", widthInt.toFixed())
    gdElem.setAttribute("x", (widthInt + 25).toString())
}

function init() {
    // decide current word
    answer = generateWord()
    // draw initial gameboard
    drawInitCells()
    // draw stats popup
    updateStatsPopup()
}

function addAnimationClass(cardContainer) {
    let card = cardContainer.children[0]
    card.classList.add('flip-vertical-left')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function timedAnimateCardRow(startIndex, endIndex) {
    let cardRow = Array.from(document.getElementById('cell-grid').children).slice(startIndex, endIndex)
    for (let i = 0; i < 5; i++) {
        let cardContainer = cardRow[i]
        addAnimationClass(cardContainer)
        await sleep(300)
    }

}

async function timedStatsPopup() {
    await sleep(5000)
    showStats()
}

function addWinningAnimationClass(cardContainer) {
    let card = cardContainer.children[0]
    let back = card.children[0]
    cardContainer.classList.add('slide-top')
}

async function timedAnimateWinning() {
    await sleep(2000)
    let start = (prevGuesses.length - 1) * 5
    let end = start + 5
    let cardRow = Array.from(document.getElementById('cell-grid').children).slice(start, end)
    for (let i = 0; i < 5; i++) {
        let cardContainer = cardRow[i]
        addWinningAnimationClass(cardContainer)
        await sleep(100)
    }
}

function resultMessage() {
    let numGuesses = prevGuesses.length
    let message
    switch (numGuesses) {
        case 1:
            message = "Genius!"
            break
        case 2:
            message = "Amazing!"
            break
        case 3:
            message = "Great!"
            break
        case 4:
            message = "Nice!"
            break
        case 5:
            message = "Good!"
            break
        case 6:
            message = "Phew!"
            break
    }
    return message
}

async function timedResultMessage() {
    let message = resultMessage()
    let messagePopup = document.getElementById('result-msg-popup')
    messagePopup.textContent = message
    await sleep(1000)
    messagePopup.style.display = 'block'
    await sleep(1000)
    messagePopup.style.display = 'none'
}
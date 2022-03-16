import React, { useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import wordList from './words'
import allowedGuesses from './allowedGuesses'

const originalGuessMatrixState = () => {
  const guessMatrix = []
  for (let i = 0; i < 6; i++) {
    const guess = []
    for (let j = 0; j < 5; j++) {
      guess.push({letter: '', color: 'black'})
    }
    guessMatrix.push(guess)
  }
  return guessMatrix
}

const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
const totalPermittedGuesses = wordList.concat(allowedGuesses)

const originalKeyBoardState = () => {

  const topRow = ['Q', 'W', 'E', 'R','T','Y', 'U','I','O','P']
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J','K', 'L']
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  const specialRow = ['BK', 'CL', 'ENT']

  const keyboard = [topRow, middleRow, bottomRow, specialRow]

  keyboard.forEach( (row => {
    for (let i = 0; i < row.length; i++) {
      row[i] = {letter: row[i], color: "black"}
    }
  }))


  return keyboard
}

function Game(props) {

  const word = randomWord.toUpperCase()
  console.log(word)

  //state
  const [activeSquare, updateActiveSquare] = useState(0)
  const [activeRow, incrementActiveRow] = useState(0)
  const [letter, updateLetter] = useState('')
  const [guessMatrix, updateGuessMatrix] = useState(originalGuessMatrixState())
  const [keyboard, updateKeyBoard] = useState(originalKeyBoardState)
  const [result, updateResult] = useState(false)
  const [validWord, toggleValidWord] = useState(true)

  const createWordDict = () => {
    const wordDict = {}
    console.log(word)

    for(let i = 0 ; i < word.length; i++) {
      const letter = word[i]
      if(wordDict[letter]) {
        wordDict[letter].push(i)
      }
      else {
        wordDict[letter] = [i]
      }
    }
    return wordDict
  
  }
  

  const onLetterClick = (letter) => {
    if(activeSquare < 5 && !result) {
      const updatedGuessMatrix = guessMatrix
      updatedGuessMatrix[activeRow][activeSquare] = {letter: letter, color: "black"}
      updateGuessMatrix(updatedGuessMatrix)
      updateLetter({letter: letter, color: "black"})
      updateActiveSquare(activeSquare + 1)
    }
  }

  const deleteLetter = () => {
    
    if(activeSquare !== 0) {
      const updatedGuessMatrix = guessMatrix
      updatedGuessMatrix[activeRow][activeSquare-1] = {letter: '', color: "black"}
      updateGuessMatrix(updatedGuessMatrix)
      updateLetter('')
      toggleValidWord(true)
    }

    if(activeSquare > 0) {
      updateActiveSquare(activeSquare - 1)
    }
  }

  const clearGuess = () => {
    const updatedGuessMatrix = guessMatrix
    updatedGuessMatrix[activeRow] = [{letter: '', color: "black"},{letter: '', color: "black"},{letter: '', color: "black"},{letter: '', color: "black"},{letter: '', color: "black"}]
    updateGuessMatrix(updatedGuessMatrix)
    updateLetter('')
    updateActiveSquare(0)
    toggleValidWord(true)
  }

  const enterGuess = () => {

    if(activeSquare === 5 && activeRow < 6) {

      if(showInvalidWordMessage()) {
          toggleValidWord(false)
          return
      }

      incrementActiveRow(activeRow + 1)
      updateActiveSquare(0)
      updateLetter('')

      const updatedElements = validateGuess()
      updateGuessMatrix(updatedElements.updatedGuessMatrix)
      updateKeyBoard(updatedElements.updatedKeyBoard)
      updatedElements.correctGuess ? updateResult(true) : updateResult(false)
    }
  }

  const findKey = (updatedKeyBoard, key) => {
    updatedKeyBoard.forEach((row) => {
      for(let i = 0; i < row.length; i++) {
        if(row[i].letter === key.letter) {
          if(row[i].color === 'green') {
          }
          else if (row[i].color === 'yellow' && key.color === 'gray') {
          }
          else {
            row[i] = key
          }
          break
        } 
      }
    })
  }

  const validateGuess = () => {

    const updatedGuessMatrix = guessMatrix
    const updatedKeyBoard = keyboard
    const guess = updatedGuessMatrix[activeRow]

    const wordDict = createWordDict() 

    let correctLetters = 0

    for(let i = 0; i < guess.length; i++) {

      const letterGuess = guess[i].letter

      if(wordDict[letterGuess]) {

        const index = wordDict[letterGuess].indexOf(i)

        if(wordDict[letterGuess].includes(i) && word[i] === letterGuess) {
          updatedGuessMatrix[activeRow][i] = {letter: letterGuess, color: "green"}
          findKey(updatedKeyBoard, {letter: letterGuess, color: "green"})
          wordDict[letterGuess].splice(index,1)
          correctLetters +=1
        }
        else if(wordDict[letterGuess].length > 0) {
          updatedGuessMatrix[activeRow][i] = {letter: letterGuess, color: "yellow"}
          findKey(updatedKeyBoard, {letter: letterGuess, color: "yellow"})
          wordDict[letterGuess].splice(index,1)
        }
        else {
          updatedGuessMatrix[activeRow][i] = {letter: letterGuess, color: "gray"}
          findKey(updatedKeyBoard, {letter: letterGuess, color: "gray"})
        }
      }
      else {
        updatedGuessMatrix[activeRow][i] = {letter: letterGuess, color: "gray"}
        findKey(updatedKeyBoard, {letter: letterGuess, color: "gray"})
      }
    }

    return {updatedGuessMatrix: updatedGuessMatrix, updatedKeyBoard: updatedKeyBoard, correctGuess: correctLetters === 5 ? true: false}
  }

  const showInvalidWordMessage = () => {
    const letterString = guessMatrix[activeRow].map( (element) => {return element.letter })
    return letterString.filter((letter) => letter !=='').length === 5 && !totalPermittedGuesses.includes(letterString.join('').toLowerCase())
  }

  return (
    <div className="game">
      <Result result={result} activeRow={activeRow} word={word}/>
      {!validWord ? <div> {"That's not a valid word. Try something else."} </div> : null}
      <Board activeSquare={activeSquare} guessMatrix={guessMatrix} activeRow={activeRow} letter={letter} word={word} />
      <Keyboard updateLetter={onLetterClick} backspace={deleteLetter} clear={clearGuess} enter={enterGuess} keyboard={keyboard} />
    </div>
  )
  
}

function Keyboard(props) {

  const keyboard = props.keyboard

  const style = (length) => {
    return {
      display: "block",
      width: `${55 * length}px`
    }
  }

  const mappedRows = []
  const mappedSpecialRow = []

  mappedSpecialRow.push(<button onClick={() => {props.backspace()}}> <Square letter={"BK"} color={"black"}/> </button> )
  mappedSpecialRow.push(<button onClick={() => {props.clear()}}> <Square letter={"CL"} color={"black"}/> </button> )
  mappedSpecialRow.push(<button onClick={() => {props.enter()}}> <Square letter={"ENT"} color={"black"}/> </button> )

  for(let i = 0 ; i < 3; i++) {
    const mappedRow = []
    for(let j = 0; j < keyboard[i].length; j++) {
      mappedRow.push(<button onClick={() => {props.updateLetter(keyboard[i][j].letter)}}> <Square letter={keyboard[i][j].letter} color={keyboard[i][j].color}/> </button> )
    }
    mappedRows.push(<div style={style(mappedRow.length)}> {mappedRow} </div>)
  }

  mappedRows.push(<div style={style(mappedSpecialRow.length)}> {mappedSpecialRow} </div>)

  return <div className="letters" > 
    {mappedRows}
  </div> 
}

function Board(props) {
  
  const board = props.guessMatrix

  const mappedRows = board.map((row) => {
    return <Row singleRow={row} word={props.word} />
  })

  return <div className="board">{mappedRows}</div>

}

function Row(props) {

  const row = props.singleRow

  const mappedSquares = row.map((squareInfo) => {
    return <div className="row"> <Square letter={squareInfo.letter} color={squareInfo.color} /></div>
  })

  return mappedSquares
}

function Square(props) {  
  return <p className={`square ${props.color}`}> {props.letter} </p> 
}

function Result(props) {

  if(props.result) {
    return <h1>{`You won with ${6 - props.activeRow} guesses left!`}</h1>
  }
  else if(props.activeRow < 6) {
    return <h1>{`You have ${6 - props.activeRow} guesses left`}</h1>
  }
  else {
    return <h1>{`You lost! The word was ${props.word} `}</h1>
  }
}

ReactDOM.render(
  <React.StrictMode>
      <Game/>    
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

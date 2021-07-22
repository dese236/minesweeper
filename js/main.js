'use strict'



const EMPTY = '';
const MINE = '💣';
const FLAG = '🚩';
const NORMAL ='🙂'
const LOSE = '🤯'
const WIN = '😎'
const LIFE = '🧡'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    explodedCount: 0,
    secsPassed: 0
}
var gBoard;
var cell =
{
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
    i: 0,
    j: 0
};
var gIsFirstClick;
var gBoardSize = 4
var gCurrTimer;
var gTimerInterval;
var gTimeDiff;
var gMinesNum = 2;
var gEmptyCellsNum = gBoardSize ** 2 - gMinesNum
var gRemaindFlagNum = 2
var gLivesNum =2 ;


function initGame() {
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        explodedCount: 0,
        secsPassed: 0
    }
    document.querySelector('.start-game').innerHTML = NORMAL
    document.querySelector('.life').innerHTML = LIFE + 'x ' + gLivesNum
    document.querySelector('.flags').innerHTML = FLAG + 'x ' + gRemaindFlagNum

    gBoard = createboard(gBoardSize, gBoardSize)
    renderBoard(gBoard)
    console.log(gBoard);
    preventContextMenu()
    gIsFirstClick = true;

}

function setBoardSize(elCheckBox) {
    gBoardSize = +elCheckBox.id
    var elCheckBoxes = document.querySelectorAll('.selection')
    for (var i = 0; i < elCheckBoxes.length; i++) {
        if (elCheckBox === elCheckBoxes[i]) {
        } else {
            elCheckBoxes[i].checked = false
        }
    }
    initGame()
    upDateMinesNum(gBoardSize)
}

function upDateMinesNum(num) {
    switch (num) {
        case 4:
            gRemaindFlagNum = 2
            gMinesNum = 2
            gLivesNum = 2
            break;
        case 8:
            gRemaindFlagNum = 12
            gMinesNum = 12
            gLivesNum =3
            break;
        case 12:
            gRemaindFlagNum = 30
            gMinesNum = 30
            gLivesNum =3
    }
}

function createboard(numRows, numCols) {
    var board = []
    for (var i = 0; i < numRows; i++) {
        board[i] = []
        for (var j = 0; j < numCols; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                i,
                j
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBoard(board, selector) {
    var strHTML = '';    //<table border="0"><tbody>
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = 'cell' + i + '-' + j
            var cell = gBoard[i][j]
            strHTML += `<td class="${className}" data-i="${i}" data-j="${j}" 
            onclick="cellClicked(this , ${i} , ${j})" 
            oncontextmenu="markCell(this)" >${cell.isMine ? MINE : EMPTY}</td>`
        }
        strHTML += '</tr>'
    }
    //strHTML += '</tbody></table>';
    var elContainer = document.querySelector('table');
    elContainer.innerHTML = strHTML;
}

function preventContextMenu() {
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function cellClicked(elCell, i, j) {
    if (gIsFirstClick) {
        gGame.isOn = true;
        gIsFirstClick = false
        startGame(gBoard[i][j])
    }
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        if (cell.isShown || cell.isMarked) return
        elCell.innerHTML = cell.isMine ? MINE : `${cell.minesAroundCount}`;
        if (cell.isMine){
            handleMine(elCell) 
            return
        } 
        cell.isShown = true;
        gGame.shownCount++
        if (cell.minesAroundCount === 0) { expendShown(gBoard, elCell, i, j) }
        if (isVictory()) { gameDone() }
    }

}

function handleMine(elCell){
    gGame.explodedCount++
    elCell.style.background = 'red'
    gLivesNum--
    document.querySelector('.life').innerHTML = LIFE + 'x '+gLivesNum
    if (!gLivesNum) return endGame()
    // document.querySelector('mine-msg').style.visibility = 'visible'
}

function markCell(elCell) {
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var cell = gBoard[i][j]
    if (cell.isShown) return
    var isMarked = cell.isMarked
    toggleFlag(elCell, cell, isMarked)
    if (isVictory()) { gameDone() }
}

function toggleFlag(elCell, cell, isMarked) {
    var flagDiff = isMarked ? -1 : 1
    gGame.markedCount += flagDiff
    if (gGame.markedCount > gMinesNum) {
        gGame.markedCount -= flagDiff
        return
    }
    cell.isMarked = isMarked ? false : true;
    elCell.innerHTML = isMarked ? EMPTY : FLAG;
    var elFlag = document.querySelector('.flags')
    gRemaindFlagNum = gMinesNum - gGame.markedCount
    elFlag.innerHTML = FLAG + 'x ' + gRemaindFlagNum
}


function startGame(cell) {
    var startTime = Date.now()
    gTimerInterval = setInterval(renderTimer, 1000, startTime)
    placeMines(cell)
    setMinesNegsCount(gBoard)
    console.log(gBoard);
}

function renderTimer(startTime) {
    /* wait a little bit.. */
    var time2 = Date.now();
    var secondsTimeDiff = (time2 - startTime);
    gTimeDiff = new Date(secondsTimeDiff);
    /* slice from 11 to get time in hours */
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = gTimeDiff.getMinutes() * 60 + gTimeDiff.getSeconds() + ''
    gGame.secsPassed = elTimer.innerHTML;
}

function placeMines(cell) {
    var emptyCells = getEmptyCells(gBoard ,cell.i , cell.j);
    console.log(emptyCells);
    // var idx = emptyCells.indexOf(cell)
    // console.log(idx);
    for (var k = 0; k < gMinesNum; k++) {
        var idx = getRandomInt(0, emptyCells.length);
        var cell = emptyCells[idx];
        gBoard[cell.i][cell.j].isMine = true;
        emptyCells.splice(idx, 1)
        // renderCell({i:cell.i , j:cell.j} , MINE)

    }
}

function setMinesNegsCount(board) {
    var emptyCells = getEmptyCells(board)
    for (var i = 0; i < emptyCells.length; i++) {
        var cell = emptyCells[i]
        countMinesNegs(cell)
    }
}

function countMinesNegs(cell) {
    var cellNegs = getNegs(cell)
    for (var i = 0; i < cellNegs.length; i++) {
        var currNeg = cellNegs[i]
        if (currNeg.isMine) cell.minesAroundCount++

    }
}


function getNegs(cell) {
    var res = []
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i > gBoardSize - 1 || i < 0) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (j > gBoardSize - 1 || j < 0) continue
            if (i === cell.i && j === cell.j) continue
            res.push(gBoard[i][j])
        }
    }
    return res
}

function expendShown(board, Cell, i, j) {
    var cellNegs = getNegs(board[i][j])
    for (var i = 0; i < cellNegs.length; i++) {
        if (cellNegs[i].isMine || cellNegs[i].isShown) continue
        cellNegs[i].isShown = true;
        gGame.shownCount++
        document.querySelector(`.cell${cellNegs[i].i}-${cellNegs[i].j}`).innerHTML = `${cellNegs[i].minesAroundCount}`;
        // elCell.innerHTML = `${cell.minesAroundCount}`;

    }

}


function isVictory() {
    console.log('flags to go ', gRemaindFlagNum);
    console.log('shown ', gGame.shownCount);
    var currMinesNum = gMinesNum - gGame.explodedCount
    if (currMinesNum===gGame.markedCount && gGame.shownCount === gEmptyCellsNum ) return true
    return false
    // var elCells = document.querySelectorAll('.cell')
    // for (var k = 0; k < elCells.length; k++) {
    //     var i = elCells[k].dataset.i
    //     var j = elCells[k].dataset.j
    //     if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false
    //     if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) return false
    // var emptyCellsNum = gBoardSize ** 2 - gMinesNum
    // console.log(emptyCellsNum);
}


function endGame() {
    clearInterval(gTimerInterval)
    revelMines()
    document.querySelector('.start-game').innerHTML = LOSE
    gGame.isOn = false
}

function revelMines() {
    var elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        var rowIdx = elCells[i].dataset.i
        var colIdx= elCells[i].dataset.j
        if (gBoard[rowIdx][rowIdx].isShown || !gBoard[rowIdx][colIdx].isMine) continue
        elCells[i].innerHTML = MINE
        gBoard[rowIdx][colIdx].isShown =true
        // if(gBoard[i][j].isMarked) elCells[k].innerHTML += 'X'
    }
}

function gameDone() {
    clearInterval(gTimerInterval)
    document.querySelector('.start-game').innerHTML = WIN
    gGame.isOn = false
}
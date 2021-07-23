'use strict'

const EMPTY = '';
const MINE = '💣';
const FLAG = '🚩';
const NORMAL = '🙂'
const LOSE = '🤯'
const WIN = '😎'
const LIFE = '🧡'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
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
    j: 0,
    negsRevel: []

};
var gIsFirstClick;
var gBoardSize = 4
var gCurrTimer;
var gTimerInterval;
var gTimeDiff;
var gMinesNum = 2;
var gEmptyCellsNum = gBoardSize ** 2 - gMinesNum
var gRemaindFlagNum = 2
var gLivesNum = 2;
var gHintInterval;
var gBestScore;
var gOrderedClicks = [];
var gIsManually = false;
var gMineInserted = 0;
var gManuallyInterval;
var gCurrClickedCell;
var gLives = 2 ; 

function initVars() {
    gBoardSize = 4
    gMinesNum = 2;
    gEmptyCellsNum = gBoardSize ** 2 - gMinesNum
    gRemaindFlagNum = 2
    gLivesNum = 2;
    gLives =
    gOrderedClicks = [];
    gIsManually = false;
    gMineInserted = 0;
    gManuallyInterval;
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        explodedCount: 0,
        secsPassed: 0
    }
}
function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    // initVars()
    document.querySelector('.start-game').innerHTML = NORMAL
    document.querySelector('.life').innerHTML = LIFE + 'x ' +gLivesNum
    document.querySelector('.flags').innerHTML = FLAG + 'x ' + gMinesNum
    document.querySelector('.timer').innerHTML = '00:00'
    document.querySelector('.msg').style.visibility = 'hidden'
    gBoard = createboard(gBoardSize, gBoardSize)
    renderBoard(gBoard)
    preventContextMenu()
    gIsFirstClick = true;

}

function setBoardSize(elCheckBox) {
    
    if(gGame.isOn){
        elCheckBox.checked =false
        return
    } 
    gBoardSize = +elCheckBox.id
    var elCheckBoxes = document.querySelectorAll('.selection')
    for (var i = 0; i < elCheckBoxes.length; i++) {
        if (elCheckBox === elCheckBoxes[i]) {
        } else {
            elCheckBoxes[i].checked = false
        }
    }
    upDateVars(gBoardSize)
    initGame()
}

function upDateVars(num) {
    switch (num) {
        case 4:
            gRemaindFlagNum = 2
            gMinesNum = 2
            gLivesNum = 2
            break;
        case 8:
            gRemaindFlagNum = 12
            gMinesNum = 12
            gLivesNum = 3
            break;
        case 12:
            gRemaindFlagNum = 30
            gMinesNum = 30
            gLivesNum = 3
    }
    // gEmptyCellsNum = gBoardSize ** 2 - gMinesNum
    gRemaindFlagNum = gMinesNum
    // gLivesNum = 2;
    gLives = gLivesNum
    gOrderedClicks = [];
    gIsManually = false;
    gMineInserted = 0;
    gManuallyInterval;
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        explodedCount: 0,
        secsPassed: 0
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
                j,
                negsRevel: []
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
    console.log(gGame.isShown);
    if (gIsManually) {
        if (gMineInserted < gMinesNum) {
            gBoard[i][j].isMine = true
            gMineInserted++
            return
        }
        startManaully()
        gIsManually = false
        gGame.isOn = true;
        gIsFirstClick = false
    }
    if (gIsFirstClick) {
        gGame.isOn = true;
        gIsFirstClick = false
        startGame(gBoard[i][j])
    }
    if (gGame.isOn) {
        var cell = gBoard[i][j];
        if (cell.isShown || cell.isMarked) return
        if (isHint(elCell)) return
        elCell.innerHTML = cell.isMine ? MINE : `${cell.minesAroundCount}`;
        gOrderedClicks.push(elCell)
        if (cell.isMine) {
            handleMine(elCell)
            return
        }
        cell.isShown = true;
        gCurrClickedCell = cell  //// for undo
        expendShown(gBoard, elCell, i, j)
        // if (cell.minesAroundCount === 0) { expendShown(gBoard, elCell, i, j, true) }
        // gGame.shownCount++
        if (isVictory()) { gameDone() }
    }

}

function handleMine(elCell) {
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var cell = gBoard[i][j]
    cell.isShown = true
    // gGame.explodedCount
    elCell.style.background = 'red'
    gLivesNum--
    gRemaindFlagNum--
    document.querySelector('.life').innerHTML = LIFE + 'x ' + gLivesNum
    document.querySelector('.flags').innerHTML = FLAG + 'x ' + gRemaindFlagNum
    if (!gLivesNum) {
        endGame()
        return
    }
    document.querySelector('.msg').style.visibility = 'visible'
    setTimeout(function () {
        document.querySelector('.msg').style.visibility = 'hidden'
    }, 1000)
    // document.querySelector('mine-msg').style.visibility = 'visible'
}

function markCell(elCell) {
    var i = +elCell.dataset.i
    var j = +elCell.dataset.j
    var cell = gBoard[i][j]
    if (cell.isShown) return
    var isMarked = cell.isMarked
    toggleFlag(elCell, cell, isMarked)
    gOrderedClicks.push(elCell)
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

function clickHint(elBtn) {
    checkHints(elBtn)
    elBtn.classList.toggle('marked')

}

function checkHints(elBtn) {
    var elHints = document.querySelectorAll('.hint')
    for (var i = 0; i < elHints.length; i++) {
        if (elHints[i] === elBtn) continue
        if (elHints[i].classList.contains('marked')) {
            elHints[i].classList.toggle('marked')
        }
    }
}

function isHint(elCell) {
    var elMarkedHint = document.querySelector('.marked')
    if (!elMarkedHint) return false
    elMarkedHint.style.visibility = 'hidden'
    elMarkedHint.classList.remove('marked')
    // elMarkedHint.classList.add('used')
    revelNeg(elCell, true)
    setTimeout(revelNeg, 1000, elCell, false)
    return true
}

function revelNeg(elCell, isRevel) {
    var cell = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    var size = gBoardSize
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i > gBoardSize - 1 || i < 0) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (j > gBoardSize - 1 || j < 0) continue
            if (i === cell.i && j === cell.j) {
                elCell.innerHTML = EMPTY
                continue
            }
            var elNeg = document.querySelector(`.cell${i}-${j}`)
            if (isRevel) {
                elNeg.innerHTML = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount
            } else {
                if (gBoard[i][j].isShown) continue
                elNeg.innerHTML = EMPTY;
            }
        }
    }
    console.log(size);
}

function clickSafe(elBtn) {
    var releventCells = getReleventCells(gBoard)
    var idx = getRandomInt(0, releventCells.length)
    var cell = releventCells[idx]
    var elCell = document.querySelector(`.cell${cell.i}-${cell.j}`)
    elCell.innerHTML = gBoard[cell.i][cell.j].minesAroundCount
    setTimeout(function () { elCell.innerHTML = EMPTY }, 2000)
    elBtn.style.visibility = 'hidden'
}

function getReleventCells(board) {
    var res = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue
            if (board[i][j].isShown) continue
            res.push(board[i][j])
        }
    }
    return res
}

function undoLastMove() {
    console.log('hello');
    var lastCellClicked = gOrderedClicks[gOrderedClicks.length - 1]
    var i = lastCellClicked.dataset.i
    var j = lastCellClicked.dataset.j
    lastCellClicked.innerHTML = EMPTY
    var currCell = gBoard[i][j]
    if (currCell.isShown) {
        if (gBoard[i][j].minesAroundCount || gBoard[i][j].isMine) {
            coverCell(currCell , lastCellClicked)
            return
        } else {
            coverNegsRevel(cell)
            return
        }
    }
    toggleFlag(lastCellClicked, currCell, currCell.isMarked)
    gOrderedClicks.splice(gOrderedClicks.length - 1)
}

function coverCell(cell , elCell) {
    // var elCurrCell = document.querySelector(`.cell${i}-${j}`)
    // elCurrCell.innerHTML = EMPTY;
    gGame.shownCount--
    gOrderedClicks.splice(gOrderedClicks.length - 1)
    if (cell.isMine)  elCell.style.background = 'linear-gradient(to bottom, #b5bbb9 5%, #6e6c6c 100%);'
}

function coverNegsRevel(cell) {
    var negsRevel = cell.negsRevel
    console.log(negsRevel);
    console.log(cell);
    for (var i = 0; i < negsRevel.length; i++) {
        var currNeg = negsRevel[i]
        currNeg.isShown = false;
        gGame.shownCount--
        var elCurrCell = document.querySelector(`.cell${currNeg.i}-${currNeg.j}`)
        elCurrCell.innerHTML = EMPTY;
    }
    gOrderedClicks.splice(gOrderedClicks.length - 1)
}

function setManually() {
    if (gGame.isOn) return
    gIsManually = gIsManually ? false : true
    gManuallyInterval = setInterval(toggleManually, 1000)
}

function toggleManually() {
    var elManually = document.querySelector('.manually')
    elManually.classList.toggle('clicked')
}

function startManaully() {
    clearInterval(gManuallyInterval)
    var startTime = Date.now()
    gTimerInterval = setInterval(renderTimer, 1000, startTime)
    // placeMines(cell)
    setMinesNegsCount(gBoard)
    console.log(gBoard);
}
function startGame(cell) {
    upDateVars(gBoardSize)
    var startTime = Date.now()
    gTimerInterval = setInterval(renderTimer, 1000, startTime)
    placeMines(cell)
    setMinesNegsCount(gBoard)
}

function renderTimer(startTime) {
    /* wait a little bit.. */
    var time2 = Date.now();
    var secondsTimeDiff = (time2 - startTime);
    gGame.secsPassed = new Date(secondsTimeDiff);
    /* slice from 11 to get time in hours */
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = gGame.secsPassed.getMinutes() * 60 + gGame.secsPassed.getSeconds() + ''
    gGame.secsPassed = elTimer.innerHTML;
}

function placeMines(cell) {
    var emptyCells = getEmptyCells(gBoard, cell.i, cell.j);
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

// function expendShown(board , elCell, i, j) {
//     debugger
//     console.log(board);
//     var currCell = board[i][j]
//     var cellNegs = getNegs(currCell)
//     currCell.isShown = true ;
//     for (var k = 0; k < cellNegs.length; k++) {
//         if (cellNegs[k].isMine || cellNegs[k].isShown || cellNegs[k].isMarked) continue
//         var elCurrCell = document.querySelector(`.cell${cellNegs[k].i}-${cellNegs[k].j}`)
//         elCurrCell.innerHTML = `${cellNegs[k].minesAroundCount}`;
//         // cellNegs[k].isShown = true;
//         // currCell.negsRevel.push(cellNegs[i])
//         if(currCell.minesAroundCount > 0){
//             var i = currCell.i // to delete
//             var j = currCell.j //todelet
//             var text = elCurrCell.innerHTML // to delete
//             console.log('i '+i+ ' j '+j+ 'innertext '+text);
//             return
//         }
//         // gGame.shownCount++

//         elCurrCell.innerHTML = `${cellNegs[k].minesAroundCount}`;
//         expendShown(elCurrCell , cellNegs[k].i , cellNegs[k].j)
//         // elCell.innerHTML = EMPTY
//         // elCell.innerHTML = `${cell.minesAroundCount}`;

//     }

// }

function expendShown(board, elCell, i, j) {
    var currCell = board[i][j]
    var cellNegs = getNegs(currCell)
    gCurrClickedCell.negsRevel.push(currCell)
    console.log(gCurrClickedCell.negsRevel);
    elCell.innerHTML = `${currCell.minesAroundCount}`;
    currCell.isShown = true;
    gGame.shownCount++
    if (currCell.minesAroundCount) {
        var i = currCell.i // to delete
        var j = currCell.j //todelet
        var text = elCell.innerHTML // to delete
        console.log('i ' + i + ' j ' + j + 'innertext ' + text);
        return
    }
    for (var k = 0; k < cellNegs.length; k++) {
        if (cellNegs[k].isMine || cellNegs[k].isShown || cellNegs[k].isMarked) continue
        var elCurrCell = document.querySelector(`.cell${cellNegs[k].i}-${cellNegs[k].j}`)
        expendShown(board, elCurrCell, cellNegs[k].i, cellNegs[k].j)
        // elCurrCell.innerHTML = `${cellNegs[k].minesAroundCount}`;
        // elCurrCell.innerHTML = `${cellNegs[k].minesAroundCount}`;
        // cellNegs[k].isShown = true;
        // currCell.negsRevel.push(cellNegs[i])
        // gGame.shownCount++

        // elCell.innerHTML = EMPTY

    }
    cell.negsRevel = gCurrClickedCell.negsRevel
}

// function expendShown(board, Cell, i, j) {
//     var cellNegs = getNegs(board[i][j])
//     var currCell = board[i][j]
//     for (var i = 0; i < cellNegs.length; i++) {
//         if (cellNegs[i].isMine || cellNegs[i].isShown) continue
//         cellNegs[i].isShown = true;
//         currCell.negsRevel.push(cellNegs[i])
//         gGame.shownCount++
//         document.querySelector(`.cell${cellNegs[i].i}-${cellNegs[i].j}`).innerHTML = `${cellNegs[i].minesAroundCount}`;
//         elCell.innerHTML = `${cell.minesAroundCount}`; //comment

//     }

// }


function isVictory() {
    // var currMinesNum = gMinesNum - gGame.explodedCount
    console.log(gGame.markedCount);
    console.log(gGame.shownCount);
    if (gGame.markedCount + gGame.shownCount === gBoardSize ** 2) return true
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
    gGame.isOn = false
    clearInterval(gTimerInterval)
    revelMines()
    renderMsg('lose')
    document.querySelector('.start-game').innerHTML = LOSE
    initVars()
}

function revelMines() {
    var elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        var rowIdx = elCells[i].dataset.i
        var colIdx = elCells[i].dataset.j
        if (gBoard[rowIdx][rowIdx].isShown || !gBoard[rowIdx][colIdx].isMine) continue
        elCells[i].innerHTML = MINE
        gBoard[rowIdx][colIdx].isShown = true

    }
}

function gameDone() {
    clearInterval(gTimerInterval)
    renderMsg('win')
    document.querySelector('.start-game').innerHTML = WIN
    gGame.isOn = false
    initVars()
}

function renderMsg(str) {
    var elMsg = document.querySelector('.msg')
    elMsg.classList.toggle(str)
    elMsg.style.visibility = 'visible'
    setTimeout(function () {
        elMsg.classList.toggle(str)
        elMsg.style.visibility = 'hidden'
    }, 1000)
}
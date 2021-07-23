function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
      strHTML += '<tr>';
      for (var j = 0; j < mat[0].length; j++) {
        var cell = mat[i][j];
        var className = 'cell cell' + i + '-' + j;
        strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
      }
      strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
  }
  
  function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  
  
  function playSound() {
    var newAudio = new Audio('../pop.wav')
    newAudio.play()
  }
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  function getEmptyCells(board , rowIdx , colIdx) {
    var cellsInRow = board.length
    var cellsInCol = cellsInRow
    var res = []
    var location
    for (var i = 0; i < cellsInRow; i++) {
        for (var j = 0; j < cellsInCol; j++) {
            if ( i === rowIdx && j === colIdx) continue 
            if (!board[i][j].isMine) {
                res.push(board[i][j])
            }
        }
    }
    return res
  }
  
  // function printMat(mat, selector) {
  //   var strHTML = '<table border="0"><tbody>';
  //   for (var i = 0; i < mat.length; i++) {
  //     strHTML += '<tr>';
  //     for (var j = 0; j < mat[0].length; j++) {
  //       var cell = mat[i][j];
  //       var className = 'cell cell' + i + '-' + j;
  //       strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
  //     }
  //     strHTML += '</tr>'
  //   }
  //   strHTML += '</tbody></table>';
  //   var elContainer = document.querySelector(selector);
  //   elContainer.innerHTML = strHTML;
  // }
  
  function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
      var row = []
      for (var j = 0; j < COLS; j++) {
        row.push('')
      }
      mat.push(row)
    }
    return mat
  }
  
  
/**
 * Created by postonogova-an on 17.03.2016.
 */

(function () {
    var Sudoku = window.Sudoku = {};
    var tabField = document.getElementById("tField");
    var btnCalculate = document.getElementById("calculate");
    var btnСlear = document.getElementById("clear");

    var field = [];
    var arrayTest = [3, '', 1, 5, 6, '', 8, 2, '',
        '', '', '', '', '', 8, '', '', 6,
        '', '', 6, '', 4, '', 1, 9, '',
        '', 1, '', '', '', 3, 4, '', '',
        '', 8, 2, 5, '', 4, 6, 1, '',
        '', '', 5, 6, '', '', '', 7, '',
        '', 9, 8, '', 5, '', 7, '', '',
        3, '', '', 9, '', '', '', '', '',
        '', 2, 1, '', 8, 4, 5, '', 9];
    var num = 0;

    Sudoku.createTable = function () {
        var tabCount = 0;
        for (var tabi = 0; tabi < 3; tabi++) {
            var tabRow = tabField.insertRow(-1);
            for (var tabj = 0; tabj < 3; tabj++) {
                var tabCell = tabRow.insertCell(tabj);
                var tab = document.createElement("table");
                var tableArray = [];
                for (var i = 0; i < 3; i++) {
                    var row = tab.insertRow(-1);
                    tableArray[i] = [];
                    for (var j = 0; j < 3; j++) {

                        var cell = row.insertCell(j);
                        var textNode = document.createElement("input");
                        textNode.type = "text";
                        textNode.className = "cellClass";
                        $(textNode).attr('maxlength', 1);
                        textNode.value = arrayTest[num];
                        num++;
                        tableArray[i][j] = textNode;
                        $(textNode).on('input', function () {
                            this.value = this.value.replace(/\D|0/g, '');
                            if (this.value != '') {
                                this.blur();
                            }
                        });
                        cell.appendChild(textNode);
                    }
                }
                field.push(tableArray);
                tabCount++;
                tabCell.appendChild(tab);
            }
        }
    }

    $(btnCalculate).click(function () {
        var decided = false;
        var emptyCount = 0;
        while(!decided) {
            var emptyCountNew = 0;
            decided = true;
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 3; j++) {
                    for (var k = 0; k < 3; k++) {
                        if (field[i][j][k].value == '') {
                            var square = getSquare(i);
                            var line = getLine(i, j);
                            var colum = getColum(i, k);
                            var resalt = verification(square, line, colum);
                            if (resalt !== null) {
                                field[i][j][k].value = resalt;
                            }
                            else {
                                emptyCountNew++;
                                decided = false;
                            }
                            //номер строки: (Math.floor(i / 3) + 1) * j
                            //номер столбца:(i % 3 + 1) * k
                        }
                    }
                }
            }
            if (emptyCount === emptyCountNew) {
                alert("Я еще не умею решать такие сложные судоку. Добавьте, пожалуйста, значений для упрощения задачи.")
                break;
            }
            else {
                emptyCount = emptyCountNew;
            }
        }
    });

    $(btnСlear).click(function () {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    field[i][j][k].value = '';
                }
            }
        }
    });

    function getSquare(number) {
        var square = [];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                square.push(parseInt(field[number][i][j].value));
            }
        }
        return square;
    }

    function getLine(square, number) {
        var line = [];
        var sq = square - (square % 3);//Math.floor(square / 3) * 3;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                line.push(parseInt(field[sq + i][number][j].value));
            }
        }
        return line;
    }

    function getColum(square, number) {
        var colum = [];
        var sq = square % 3;
        for (var i = 0; i < 7; i += 3) {
            for (var j = 0; j < 3; j++) {
                colum.push(parseInt(field[sq + i][j][number].value));
            }
        }
        return colum;
    }

    function verification(square, line, column) {
        var resalt = [];
        for (var i = 1; i < 10; i++) {
            if (!find(square, i) && !find(line, i) && !find(column, i)) {
                resalt[resalt.length] = i;
            }
        }
        if (resalt.length === 1) {
            return resalt[0];
        }
        else {
            return null;
        }
    }

    if ([].indexOf) {
        var find = function (array, value) {
            return array.indexOf(value) > -1;
        }
    } else {
        var find = function (array, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) return true;
            }
            return false;
        }
    }

})();
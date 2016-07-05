(function (){

    var Calculator = window.Calculator = {};
    Calculator.init = function() {
        Calculator.initOperation();
        Calculator.initBtn();
        Calculator.initEvent();
    };

    Calculator.operations = [];
    Calculator.stack = [];
    Calculator.PRN = [];
    Calculator.result = null;

    Calculator.addOperation = function(name, prior, amtOperand) {
        Calculator.operations[name] = {};
        Calculator.operations[name].priority = prior;
        Calculator.operations[name].amtOperand = amtOperand;
    };

    Calculator.initOperation = function() {
        Calculator.addOperation("(", 0, 0);
        Calculator.addOperation(")", 1, 0);
        Calculator.addOperation("+", 2, 2);
        Calculator.addOperation("-", 2, 2);
        Calculator.addOperation("×", 3, 2);
        Calculator.addOperation("/", 3, 2);
        Calculator.addOperation("%", 4, 2);
    };

    Calculator.initBtn = function() {
        Calculator.renderRow(["(",")","%","×"]);
        Calculator.renderRow(["7","8","9","/"]);
        Calculator.renderRow(["4","5","6","+"]);
        Calculator.renderRow(["1","2","3","-"]);
        Calculator.renderRow(["0",",","CE","="]);
    };

    Calculator.renderRow = function(button) {
        var $calc = $('#calc');
        var $tr = $('<tr>');
        button.forEach(function(btn){
            $tr.append(Calculator.createButton(btn));
        });
        $calc.append($tr);
    };

    Calculator.createButton = function(name) {
        return $('<td>').append($('<input>').attr('type', 'button').addClass('btn').val(name));
    };

    Calculator.initEvent = function() {
        var $inp = $('.inputField');
        $inp.focus();
        $('.btn').on('click', function () {
            var btnVal = $(this).val();
            var result;
            if (Calculator.validation(btnVal)) {
                switch (btnVal) {
                    case 'CE':
                        $inp.val("");
                        break;
                    case '%':
                        var expression = $inp.val();
                        var reg = /\d/;
                        if (expression.charAt(expression.length - 1).match(reg)) {
                            var opening = Calculator.countSubStr(expression, "(");
                            var closing = Calculator.countSubStr(expression, ")");
                            var pos;
                            if (opening == closing) {
                                pos = 0;
                            } else {
                                var stack = [];
                                for (var i = 0; i < expression.length; i++) {
                                    var c = expression.charAt(i);
                                    if (c == "(") {
                                        stack.push(i);
                                    }
                                    if (c == ")") {
                                        stack.pop();
                                    }
                                }
                                pos = stack.pop() + 1;
                            }
                            var numbers = Calculator.getAllNumbers(expression);
                            var num1 = numbers[numbers.length - 1];
                            var newExpression = expression.substring(pos, expression.lastIndexOf(Calculator.getStrNum(num1)) - 1);
                            var num2 = Calculator.calculation(newExpression);
                            if (num2) {
                                result = num2 * num1 / 100;
                                var res = expression.substring(0, expression.lastIndexOf(Calculator.getStrNum(num1))).concat(Calculator.getStrNum(result));
                                $inp.val(res);
                            }
                        }
                        break;
                    case '=':
                        result = Calculator.calculation($inp.val());
                        $inp.val(Calculator.getStrNum(result));
                        Calculator.result = result;
                        break;
                    default:
                        $inp.val($inp.val() + btnVal);
                        break;
                }
            }
            $inp.trigger('input');
			$inp.focus();
        });

        $inp.on('input', function () {
            var reg = /[^\d,()×/+-]/g;
            $(this).val($(this).val().replace(reg, ""));
        });

        $inp.on('keypress', function (eventObject) {
            var isValid = Calculator.validation(eventObject.key);
            if(eventObject.which == 13) {
                var result = Calculator.calculation($inp.val());
                $inp.val(Calculator.getStrNum(result));
                Calculator.result = result;
            }
            return isValid;
        });
    };

    Calculator.getAllNumbers = function(expression) {
        var numbers = [];
        var result = Calculator.getNumber(expression, 0);
        while(result.number != "" && result.newPosition < expression.length) {
            numbers.push(result.number);
            result = Calculator.getNumber(expression, result.newPosition);
        }
        if (result.number != "") {
            numbers.push(result.number);
        }
        return numbers;
    };

    Calculator.getNumber = function(expression, position) {
        var number = "";
        var newPosition = position;
        var reg = /[\d,.]/;
        for (newPosition; newPosition < expression.length || number == ""; newPosition++) {
			var c = expression.charAt(newPosition);
			if (c.match(reg)) {
				while (c.match(reg) && newPosition < expression.length) {
					number += c;
					newPosition++;
					if (newPosition < expression.length) {
						c = expression.charAt(newPosition);
					} else {
						c = "";
					}
				}
				return {
					number: number.replace(",", "."),
					newPosition: newPosition
				}
			}
		}
        return {
            number: number.replace(",", "."),
            newPosition: newPosition
        }
		
    };

    Calculator.getStrNum = function(number) {
        return String(number).replace(".", ",");
    };

    Calculator.calculation = function(expression) {
        var PRN = Calculator.convertPRN(expression);
        return Calculator.calcResult(PRN);
    };

    Calculator.countSubStr = function(str, subStr) {
        var pos = 0;
        var count = 0;
        while (~str.indexOf(subStr, pos)) {
            count++;
            pos = str.indexOf(subStr, pos) + 1;
        }
        return count;
    };

    Calculator.validation = function(symbol) {
        var reg = /[\d]/g;
        var $inp = $('.inputField');
        var result = true;
        if(Calculator.result != null) {
            if (symbol.match(reg)) {
                $inp.val("");
            }
            Calculator.result = null;
        }
        result &= !(symbol == ")" && Calculator.countSubStr($inp.val(), "(") == Calculator.countSubStr($inp.val(), ")"));
        return result;
    };

    //--- Перевод выражения в обратную польскую запись
    Calculator.convertPRN = function(expression) {
        var PRN = [];
        var operationStack = [];
        var operation;
        var reg = /[\d,.]/;

        for (var i = 0; i < expression.length; i++) {
            var c = expression.charAt(i);
            if (c.match(reg)) {
                var result = Calculator.getNumber(expression, i);
                i = result.newPosition;
                Calculator.addPRN(PRN, result.number, false);
                if (i < expression.length) {
                    c = expression.charAt(i);
                } else {
                    c = "";
                }
            }
            switch (c) {
                case "(":
                    operationStack.push(c);
                    break;
                case ")":
                    operation = operationStack.pop();
                    while (operation != "(") {
                        Calculator.addPRN(PRN, operation, true);
                        operation = operationStack.pop();
                    }
                    break;
                case "+":
                case "-":
                case "×":
                case "/":
                    if (!operationStack.length) {
                        operationStack.push(c);
                    } else {
                        var operations = Calculator.operations;
                        operation = operationStack[operationStack.length - 1];
                        if (operations[c].priority > operations[operation].priority) {
                            operationStack.push(c);
                        } else {
                            while ((operations[c].priority <= operations[operation].priority) && operationStack.length) {
                                operation = operationStack.pop();
                                Calculator.addPRN(PRN, operation, true);
                                if (operationStack.length) {
                                    operation = operationStack[operationStack.length - 1];
                                }
                            }
                            operationStack.push(c);
                        }
                    }
                    break;
                default:
                    if (c) {
                        Calculator.addPRN(PRN, c, true);
                    }
                    break;
            }
        }
        while (operationStack.length) {
            operation = operationStack.pop();
            Calculator.addPRN(PRN, operation, true);
        }
		
		return PRN;
    };

    Calculator.addPRN = function(PRN, name, isOperation) {
        PRN.push({
            value: name,
            isOperation: isOperation
        });
    };

    //---Вычисление ОПЗ
    Calculator.calcResult = function(PRN) {
        var numbers = [];
        PRN.forEach(function(item){
            if (item.isOperation) {
                var a = Number(numbers.pop());
                var b = Number(numbers.pop());
                var result = 0;
                switch (item.value) {
                    case "+":
                        result = a + b;
                        break;
                    case "-":
                        result = b - a;
                        break;
                    case "×":
                        result = a * b;
                        break;
                    case "/":
                        result = b / a;
                        break;
                }
                numbers.push(result);
            } else {
                numbers.push(item.value);
            }
        });
		return numbers.length == 1 ? numbers.pop() : null;
    }
})();
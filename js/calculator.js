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
        $('.btn').on('click', function () {
            var $inp = $('.inputField');
            var btnVal = $(this).val();
            switch (btnVal) {
                case 'CE':
                    $inp.val("");
                    break;
                case '%':
					var expression = $inp.val();
                    var numbers = Calculator.getAllNumbers(expression);
                    if(numbers.length > 1) {
                        var num1 = numbers[numbers.length - 1];
                        var num2 = numbers[numbers.length - 2];
                        var result = num2 * num1 / 100;
                        var reg = /[\d,.]/;

                    }
					var res = expression.substring(0, expression.lastIndexOf(String(num1))).concat(String(result));
                    $inp.val(res);
					//поссчитать процент
                    break;
                case '=':
                    Calculator.convertPRN();
                    Calculator.calcResult();
                    $inp.val(String(Calculator.result).replace(".", ","));
                    break;
                default:
                    $inp.val($inp.val() + btnVal);
                    break;
            }
            $inp.trigger('input');
        });

        $('.inputField').on('input', function () {
            var reg = /[^\d,()×/+-]/g;
            $(this).val($(this).val().replace(reg, ""));
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

    //--- Перевод выражения в обратную польскую запись
    Calculator.convertPRN = function() {
        var expression = $('.inputField').val();
        var operationStack = [];
        var operation;
        var reg = /[\d,.]/;

        for (var i = 0; i < expression.length; i++) {
            var c = expression.charAt(i);
            if (c.match(reg)) {
                var result = Calculator.getNumber(expression, i);
                i = result.newPosition;
                Calculator.addPRN(result.number, false);
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
                        Calculator.addPRN(operation, true);
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
                                Calculator.addPRN(operation, true);
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
                        Calculator.addPRN(c, true);
                    }
                    break;
            }
        }
        while (operationStack.length) {
            operation = operationStack.pop();
            Calculator.addPRN(operation, true);
        }
    };

    Calculator.addPRN = function(name, isOperation) {
        Calculator.PRN.push({
            value: name,
            isOperation: isOperation
        });
    };

    //---Вычисление ОПЗ
    Calculator.calcResult = function() {
        var numbers = [];
        Calculator.PRN.forEach(function(item){
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
        Calculator.result = numbers.length == 1 ? numbers.pop() : null;
        Calculator.PRN.length = 0;
    }
})();
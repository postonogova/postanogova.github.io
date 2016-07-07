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
		$inp.selectionStart = $inp.val().length;
        $('.btn').on('click', function () {
            var btnVal = $(this).val();
            var result;
            if (Calculator.validation(btnVal) != 0 || btnVal == 'CE' || btnVal == '=') {
                switch (btnVal) {
                    case 'CE':
                        $inp.val("");
                        Calculator.result = null;
                        break;
                    case '%':
                        var expression = $inp.val();
                        var result = Calculator.calcPercent(expression);
						$inp.val(result);
                        break;
                    case '=':
                        result = Calculator.calculation($inp.val());
                        if(result !== null) {
                            $inp.val(Calculator.getStrNum(result));
                            Calculator.result = result;
                        } else {
                            alert("Выражение некорректно!")
                        }
                        break;
                    default:
                        $inp.val($inp.val() + btnVal);
                        break;
                }
            }
            $inp.trigger('input');
			$inp.focus();
			$inp.selectionStart = $inp.val().length;
        });
		
		$inp.on('click', function() {
			$inp.selectionStart = $inp.val().length;
			console.log('click');
		});

        $inp.on('input', function () {
            var expression = $(this).val();
            expression = expression.replace(".", ",");
            expression = expression.replace("*", "×");
            var reg = /[^\d,()×/+-]/g;
            $(this).val(expression.replace(reg, ""));
        });

        $inp.on('keypress', function (eventObject) {
			$inp.selectionStart = $inp.val().length;
            var isValid = Calculator.validation(eventObject.key);
            if(eventObject.which == 13) {
                var result = Calculator.calculation($inp.val());
                $inp.val(Calculator.getStrNum(result));
                Calculator.result = result;
            }
			if(eventObject.key == "%") {
				var expression = $inp.val();
                var result = Calculator.calcPercent(expression);
				$inp.val(result);
			}
            return isValid != 0;
        });
    };

    Calculator.getAllNumbers = function(expression) {
        var numbers = [];
        if(expression != "") {
            var result = Calculator.getNumber(expression, 0);
            while (result.number != "" && result.newPosition < expression.length) {
                numbers.push(result.number);
                result = Calculator.getNumber(expression, result.newPosition);
            }
            if (result.number != "") {
                numbers.push(result.number);
            }
        }
        return numbers;
    };

    Calculator.getNumber = function(expression, position) {
        var number = "";
        var newPosition = position;
        if(expression != "") {
            var reg = /[\d,.]/;
            for (newPosition; newPosition < expression.length; newPosition++) {
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
                        number: Calculator.getNum(number),
                        newPosition: newPosition
                    }
                }
            }
        }
        return {
            number: Calculator.getNum(number),
            newPosition: newPosition
        }
		
    };

    Calculator.getStrNum = function(number) {
        return String(number).replace(".", ",");
    };
	
	Calculator.getNum = function(number) {
        return number.replace(",", ".");
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
        var regNum = /[\d]/g;
		var regSign = /[*×/+-]/g;
		var regValid = /[\d,(]/g;
		var regValid2 = /[*×/+,)]/g;
        var regValid3 = /[\d.,]/g;
        var $inp = $('.inputField');
		var expression = $inp.val();
		var lastSymbol = expression.charAt(expression.length - 1);
        var result = true;
        if(Calculator.result) {
            if (symbol.match(regNum)) {
                $inp.val("");
            }
            Calculator.result = null;
        }
        if(symbol.match(regSign) && lastSymbol.match(regSign)) {
            if (expression.length > 1) {
                expression = expression.substring(0, expression.length - 1);
                $inp.val(expression);
            } else {
                $inp.val("");
                result = false;
            }
		}
        result &= !(symbol == ")" && Calculator.countSubStr(expression, "(") == Calculator.countSubStr(expression, ")"));
		result &= !(symbol.match(regValid2) && lastSymbol == "(");
		result &= !(symbol.match(regValid) && lastSymbol == ")");
		result &= !(lastSymbol.match(regNum) && symbol == "(");
		result &= !(lastSymbol == "," && !symbol.match(regNum));
		result &= !(symbol == "," && !lastSymbol.match(regNum));
        result &= !(lastSymbol == "" && symbol.match(regValid2));

        if(symbol.match(regValid3) && result != 0) {
            expression = expression.concat(symbol);
            var numbers = Calculator.getAllNumbers(expression);
            if (numbers.length > 0) {
                var number = numbers.pop();
                var newNumber = Calculator.getNum(number);
                if (~number.indexOf(",")) {
                    newNumber = number.substring(0, number.indexOf(","));
                    expression = expression.substring(0, expression.lastIndexOf(Calculator.getStrNum(number))).concat(newNumber);
                    $inp.val(expression);
                    result = false;
                }
                if(!~number.indexOf(".")) {
                    newNumber = Number(newNumber);
                    newNumber = Calculator.getStrNum(newNumber);
                    expression = expression.substring(0, expression.lastIndexOf(Calculator.getStrNum(number))).concat(newNumber);
                    $inp.val(expression);
                    result = false;
                }
            }
        }



		return result;
    };
	
	Calculator.calcPercent = function(expression) {
		var reg = /\d/;
		var res = expression;
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
            if(num2) {
                var result = +Number(num2 * num1 / 100).toFixed(6);
                res = expression.substring(0, expression.lastIndexOf(Calculator.getStrNum(num1))).concat(Calculator.getStrNum(result));
            }
        }
		return res;
	};
	
	Calculator.validExpression = function(expression) {
        var regSign = /[*×/+,-]/g;
        if (expression.charAt(0) == "-") {
            expression = ("0").concat(expression);
        }
        expression = expression.replace("(-", "(0-");
        if (expression.charAt(expression.length - 1).match(regSign)) {
            expression = expression.substring(0, expression.length - 1);
        }
        var opening = Calculator.countSubStr(expression, "(");
        var closing = Calculator.countSubStr(expression, ")");
        if (opening != closing) {
            while (opening > closing) {
                expression = expression.concat(")");
                closing++;
            }
        }
        return expression;
    };

    //--- Перевод выражения в обратную польскую запись
    Calculator.convertPRN = function(expression) {
        var PRN = [];
        var operationStack = [];
        var operation;
        var reg = /[\d,.]/;
		expression = Calculator.validExpression(expression);

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
                        if(a != 0) {
                            result = b / a;
                        } else {
                            return null;
                        }
                        break;
                }
                numbers.push(result);
            } else {
                numbers.push(item.value);
            }
        });
		return numbers.length == 1 ? +Number(numbers.pop()).toFixed(6) : null;
    }
})();
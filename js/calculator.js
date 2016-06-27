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
                    //поссчитать процент
                    break;
                case '=':
                    Calculator.convertPRN();
                    Calculator.calcResult();
                    $inp.val(Calculator.result);
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

    //--- Перевод выражения в обратную польскую запись
    Calculator.convertPRN = function() {
        var expression = $('.inputField').val();
        var operationStack = [];
        var operation;

        for (var i = 0; i < expression.length; i++) {
            var c = expression.charAt(i);
            var reg = /[\d,.]/;
            if (c.match(reg)) {
                var numb = "";
                while (c.match(reg) && i < expression.length) {
                    numb += c;
                    i++;
                    if (i < expression.length) {
                        c = expression.charAt(i);
                    } else {
                        c = "";
                    }
                }
                Calculator.addPRN(numb, false);
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
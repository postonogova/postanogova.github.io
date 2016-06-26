(function (){

    var Calculator = window.Calculator = {};
    Calculator.init = function() {
        Calculator.initOperation();
        Calculator.initBtn();
        Calculator.initEvent();
    };

    Calculator.operation = [];
    Calculator.stack = [];

    Calculator.addOperation = function(name, prior, amtOperand) {
        Calculator.operation[name] = {};
        Calculator.operation[name].priority = prior;
        Calculator.operation[name].amtOperand = amtOperand;
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
            switch(btnVal) {
                case 'CE':
                    $inp.val("");
                    break;
                case '%':
                    //поссчитать процент
                    break;
                default:
                    $inp.val($inp.val() + btnVal);
                    break;
            }
            $inp.trigger('input');
        });

        $('.inputField').on('input', function(){
            var reg = /[^\d,()×/+-]/g;
            $(this).val($(this).val().replace(reg, ""));
        });
    }

})();
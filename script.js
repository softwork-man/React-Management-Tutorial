let display, displayResult, lastOperator;
let isOperator;
let addedPoint;

function reset() {
    display.value = '';
}

function remove() {
    display.value = display.value.substr(0, display.value.length - 1)
}

function calculate() {
    // const value = display.value
    const {value} = display;

    if (value === "") {
        return;
    } else if (lastOperator) {
        return;
    } else if (Number(value) == value) {
        return;
    }
    const end = value.length;

    let current = -1;
    let stacks = [];
    let stack = '';

    console.log(stacks)

    // 1 + ( 1 + 1 - (2 + 2)) + 1
    // =>  1 + 1 - (2 + 2)
    // =>  2 + 2
    // <= 4
    // = 1 + 1 - 4
    // = -2
    // 1 + - 2 + 1

    while (++current < end) {
        const char = value.charAt(current)
        if (Number(char) == char || char === '.') {
            stack += char;
        } else {
            stacks.push(parseFloat(stack));
            stacks.push(char);
            stack = '';
        }
    }

    if (stack) {
        stacks.push(parseFloat(stack));
    }

    function getResult(a, operator, b) {
        switch (operator) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '/':
                return a / b;
            case '*':
                return a * b;
        }
    }

    // [1, +, 1, *, 2, /, 2, +, 1, *, 2]
    // [1, +,       2, /, 2, +, 1, *, 2]
    // [1, +,       2, /, 2, +,       2]
    // [1, +,             1, +,       2]
    //shift 는 배열을 하나씩 빼버린다

    const primaryOperators = ['/', '*'];
    let primaryCurrent = primaryOperators.length;

    let operatorIndex;
    let aIndex;
    let operator;

    while (primaryCurrent-- > 0) {
        operator = primaryOperators[primaryCurrent];
        operatorIndex = stacks.indexOf(operator);
        while (operatorIndex > -1) {
            aIndex = operatorIndex - 1;
            stacks.splice(aIndex, 3, getResult(stacks[aIndex], operator, stacks[operatorIndex + 1]));
            operatorIndex = stacks.indexOf(operator)
        }
    }


    while (stacks.length > 2) {
        stacks.unshift(getResult(stacks.shift(), stacks.shift(), stacks.shift()));
    }

    display.value = stacks[0];

    // for (let i = 0; i < stacks.length; i++) {
    //     const stack = stacks[i];
    //
    //     switch (stack) {
    //         case '+':
    //             stacks[i + 1] = stacks[i - 1] + stacks[i + 1]
    //             result = stacks[i + 1]
    //             break
    //         case '-':
    //             stacks[i + 1] = stacks[i - 1] - stacks[i + 1]
    //             result = stacks[i + 1]
    //             break
    //         case '/':
    //             stacks[i + 1] = stacks[i - 1] / stacks[i + 1]
    //             result = stacks[i + 1]
    //             break
    //         case '*':
    //             stacks[i + 1] = stacks[i - 1] * stacks[i + 1]
    //             result = stacks[i + 1]
    //             break
    //     }
    // }
}


function onClick(event) {
    // const target = event.target;
    const {target} = event;
    const value = target.innerText;

    isOperator = Number(value) != value ? value : null;

    if (target.tagName !== 'BUTTON') {
        return
    }

    switch (value) {
        case 'Remove':
            return remove();
        case 'AC':
            return reset();
        case '=':
            return calculate();
    }


    if (isOperator) {
        if (display.value === '') {
            return
        }

        if (lastOperator) {
            // 이전 연산자 제거
            remove();
        }


        if (isOperator === '.') {
            if (addedPoint) {
                return
            }

            addedPoint = true;
        } else {
            addedPoint = false;
        }
    }

    // 마지막에 연산자를 입력했는지 저장
    lastOperator = isOperator ? value : null;

    display.value += value;
}


// 1 + 12 * 123 * 1.1
// [1, +, 12, *, 123, *, 1.1]

window.addEventListener('DOMContentLoaded', () => {
    display = document.getElementById('display');
    displayResult = document.getElementById('result');
    /**
     * @type {HTMLElement}
     */
    const container = document.querySelector('.container');
    //const buttons = container.querySelectorAll('button');

    // 버튼의 숫자만큼 이벤트를 걸어준다
    // Array.from(buttons).forEach(button => {
    //     button.addEventListener('click', onClick);
    // });

    container.addEventListener('click', onClick);
});





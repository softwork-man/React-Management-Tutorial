(function () {
    "use static"

    const NUMBERS = /^\d$/;

    const CHARS = /^[\d.+-/*()]$/;

    /**
     * @type {string}
     */
    let LAST_ADDED_CHAR;
    /**
     * @type {null | ""}
     */
    let LAST_ADDED_OPERATOR;

    /**
     * @type {null | boolean}
     */
    let LAST_ADDED_POINT;

    /**
     * Result Display State
     * @type {null | boolean}
     */
    let DISPLAY_RESULT;

    /**
     *  Number of open parentheses
     * @type {number}
     */
    let OPENED = 0;

    /**
     * Priority Operators
     * @type {string[]}
     */
    const PRIMARY_OPERATORS = ['/', '÷', '*', '×'];

    const form = document.forms.calc;
    form.addEventListener('submit', onSubmit);
    form.addEventListener('click', onClick);

    /**
     * Formula Control
     * @type {HTMLInputElement}
     */
    const {formula} = form.elements;

    formula.addEventListener('keydown', onKeydown);

    /**
     * Stop Event
     * @param {Event} event
     * @return {*}
     */
    function stop(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Reset Formula
     * @param char
     */
    function reset(char = '') {
        LAST_ADDED_OPERATOR = null;
        LAST_ADDED_POINT = null;
        DISPLAY_RESULT = null;
        OPENED = 0;
        formula.value = char;
    }

    /**
     * Remove ends
     */
    function backspace() {
        const {value} = formula;
        const {length} = value;
        if (length > 1) {
            const from = length - 2;
            const lastBefore = value.substr(from, 1);
            // remove 2 chars of ends
            formula.value = value.substr(0, from);

            // Add string before last to restore state
            add(lastBefore);
        } else {
            reset('');
        }
    }


    /**
     * Get Result as A operator B
     * @param {number} a
     * @param {string} operator
     * @param {number} b
     * @return {number}
     */
    function calculate(a, operator, b) {
        switch (operator) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
            case '×':
                return a * b;
            case '/':
            case '÷':
                return a / b;
        }
    }

    /**
     * Get Result
     * @param {string} formula
     * @return {number}
     */
    function getResult(formula) {

        // Correction of closing brackets
        while (OPENED-- > 0) {
            formula += ')';
        }

        console.group('Formula:', formula);
        let end = formula.length;
        let current = -1;

        const stacks = [];
        let stack = '';
        let char;

        // Parsing Formula to Number and Operators
        parse:
            while (++current < end) {
                char = formula.charAt(current);

                if (NUMBERS.test(char) || char === '.') {
                    stack += char;
                } else if (char === '(') {
                    // Get results in parentheses
                    while (++current < end) {
                        char = formula.charAt(current);
                        if (char === ')') {
                            stacks.push(getResult(stack));
                            stack = '';
                            continue parse;
                        }
                        stack += char;
                    }
                } else {
                    if (stack) {
                        stacks.push(parseFloat(stack));
                    }
                    stacks.push(char);
                    stack = '';
                }
            }

        if (stack) {
            stacks.push(parseFloat(stack));
        }

        // To make 0 + any when, if not starts with number
        // -3 => 0 - 3 => -3
        if (typeof stacks[0] !== 'number') {
            stacks.unshift(calculate(0, ...stacks.splice(0, 2)));
        }

        // Calculate Priority Operators
        let primaryOperatorCurrent = PRIMARY_OPERATORS.length;
        while (primaryOperatorCurrent-- > 0) {
            const primaryOperator = PRIMARY_OPERATORS[primaryOperatorCurrent];
            let index = stacks.indexOf(primaryOperator);
            while (index > -1) {
                stack = stacks.slice(index - 1, index + 2);
                stacks.splice(index - 1, 3, calculate(...stack));
                console.log(stack, '=>', stacks);
                index = stacks.indexOf(primaryOperator);
            }
        }

        // Calculate Normal Operators
        while (stacks.length > 2) {
            stack = stacks.splice(0, 3);
            stacks.unshift(calculate(...stack));
            console.log(stack, '=>', stacks);
        }

        console.groupEnd();

        return stacks[0] || 0;
    }

    /**
     * Add char to formula
     * @param {string} char
     * @return {boolean}
     */
    function add(char) {
        console.group('Add', char);

        const {value} = formula;

        if (value === '0') {
            reset();
        }

        if (NUMBERS.test(char)) {
            console.log('Number');
            if (DISPLAY_RESULT || value === '0') {
                reset();
            }
            LAST_ADDED_OPERATOR = null;
        } else {
            switch (char) {
                case '(':
                    if (LAST_ADDED_CHAR !== '(' && !LAST_ADDED_OPERATOR) {
                        console.warn('ignore `1(`');
                        console.groupEnd();
                        return
                    }
                    OPENED++;
                    break;
                case ')':
                    if (LAST_ADDED_CHAR !== '(' && OPENED) {
                        OPENED--;
                    } else {
                        console.warn('ignore `)`, `()` ');
                        console.groupEnd();
                        return;
                    }
                    break;

                case '*':
                case '×':
                case '/':
                case '÷':
                    switch (formula.value.length) {
                        case 0:
                            console.warn('Ignore Starts with not `+` or `-`');
                            return reset(0);
                        case 1:
                            if (LAST_ADDED_CHAR === '+' || LAST_ADDED_CHAR === '-') {
                                console.warn('Ignore Starts with not `+` or `-`');
                                return reset(0);
                            }
                    }
                default:
                    if (LAST_ADDED_OPERATOR && LAST_ADDED_OPERATOR !== '.') {
                        console.warn(`fix ${LAST_ADDED_OPERATOR} to ${char}`)
                        backspace();
                    }

                    if (char === '.') {
                        // ignore `1.1.`
                        if (LAST_ADDED_POINT) {
                            console.warn('Ignore More Point');
                            console.groupEnd();
                            return false;
                        }
                        LAST_ADDED_POINT = true;
                    } else {
                        LAST_ADDED_POINT = false;
                    }
                    LAST_ADDED_OPERATOR = char;
            }
        }
        DISPLAY_RESULT = false;
        LAST_ADDED_CHAR = char;

        formula.value = formula.value.replaceAll(',', '') + char;

        console.groupEnd();
    }

    /**
     * Get Result by Form Submit
     * @param event
     * @return {boolean|void}
     */
    function onSubmit(event) {

        stop(event);

        const {value} = formula;

        if (!value.length) {
            return reset();
        }

        // add ,
        formula.value = getResult(value).toLocaleString();
        DISPLAY_RESULT = true;

        return false;
    }

    /**
     * Add by Button
     * @param {MouseEvent} event
     */
    function onClick(event) {
        const {target} = event;

        if (target.tagName !== 'BUTTON') {
            return;
        }

        add(target.innerText);
    }

    /**
     * Add by Keyboard
     * @param {KeyboardEvent} event
     * @return {boolean|void}
     */
    function onKeydown(event) {
        const {key} = event;

        if (key === 'Delete') {
            return true;
        }

        stop(event)
        if (!CHARS.test(key)) {
            switch (key) {
                case 'Enter':
                    return onSubmit(event);
                case 'Backspace':
                    return backspace();
            }
            return;
        }

        add(key);
    }
})();
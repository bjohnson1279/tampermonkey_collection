// ==UserScript==
// @name         Bing Entertainment Quiz Clicker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Click through the Bing Entertainment Quiz
// @author       Brent Johnson
// @match        https://www.bing.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const clickEvent = new CustomEvent('click');
    const event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    const gotThisRight = document.querySelectorAll('.wk_hideCompulsary');
    if (gotThisRight) {
        const gtrText = 'got this right';
        gotThisRight.forEach(right => {
            const { innerText } = right;
            if (innerText.indexOf(gtrText)) {
                right.style.visibility = 'visible';
                if (right.parentElement.classList.contains('wk_choiceMaxWidth')) {
                    right.parentElement.style.color = "green";
                    right.parentElement.click();
                }
            }
        });
    }

    for (let a = 0; a < 4; a++) {
        const answerBtn = document.querySelector('.rqAnswerOption' + a);
        if (answerBtn) {
            answerBtn.click();
        }
    }

    const startBtn = document.querySelector('#rqStartQuiz');
    console.log({ startBtn });
    if (startBtn) {
        startBtn.click();
    }

    for (let i = 0; i < 10; i++) {
        const nextQuestion = document.querySelector('#nextQuestionbtn'+i);
        if (nextQuestion) {
            console.log({ nextQuestion });
            nextQuestion.click();
        }
    }

    const answerStat = document.querySelector('.wk_hideCompulsary');
    if (answerStat) {
        const answerRow = answerStat.closest('.b_hPanel');

        if (answerRow) {
            answerRow.click();
        }
    }
})();

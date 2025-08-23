"use strict";
class BingQuizClicker {
    constructor() {
        this.GOT_THIS_RIGHT_TEXT = 'got this right';
        this.NEXT_BUTTON_SELECTOR = '.wk_button';
        this.CHECK_INTERVAL_MS = 1000;
        this.intervalId = null;
        this.initialize();
    }
    initialize() {
        console.log('Bing Quiz Clicker initialized');
        this.startWatching();
    }
    startWatching() {
        this.checkAndClick();
        this.intervalId = window.setInterval(() => this.checkAndClick(), this.CHECK_INTERVAL_MS);
    }
    getQuizElements() {
        return {
            gotThisRight: document.querySelectorAll('.wk_hideCompulsary'),
            nextButton: document.querySelector(this.NEXT_BUTTON_SELECTOR)
        };
    }
    handleQuizElements(elements) {
        if (elements.gotThisRight.length > 0) {
            this.handleCorrectAnswers(elements.gotThisRight);
            return;
        }
        if (elements.nextButton) {
            console.log('Clicking next button');
            this.safeClick(elements.nextButton);
        }
    }
    handleCorrectAnswers(elements) {
        elements.forEach(element => {
            const parent = element.parentElement;
            if (!parent)
                return;
            element.style.visibility = 'visible';
            if (parent.classList.contains('wk_choiceMaxWidth')) {
                parent.style.color = 'green';
                this.safeClick(parent);
            }
        });
    }
    safeClick(element) {
        try {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            element.dispatchEvent(event);
        }
        catch (error) {
            console.error('Error dispatching click event:', error);
        }
    }
    checkAndClick() {
        const elements = this.getQuizElements();
        this.handleQuizElements(elements);
    }
    destroy() {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
let quizClicker = null;
function initQuizClicker() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            quizClicker = new BingQuizClicker();
        });
    }
    else {
        quizClicker = new BingQuizClicker();
    }
}
initQuizClicker();
//# sourceMappingURL=bingQuizClicker.js.map
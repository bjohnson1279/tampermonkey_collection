"use strict";
class BingQuizClicker {
    constructor() {
        this.GOT_THIS_RIGHT_TEXT = 'got this right';
        this.NEXT_BUTTON_CLASS = 'wk_button';
        this.BUTTON_ROW = '.btq_row';
        this.BUTTON_OPTIONS = '.btq_opt';
        this.ANSWER_ROW = '.btq_ansRow';
        this.NEXT_BUTTON_CLICKABLE = '.acf-button-standard__btn';
        this.NEXT_QUESTION_BUTTON = '.btq_nxtQues';
        this.CHECK_INTERVAL_MS = 1000;
        this.intervalId = null;
        this.initialize();
    }
    initialize() {
        const style = document.createElement('style');
        style.textContent = `
            .wk_hideCompulsary { visibility: visible !important; }
            .wk_choiceMaxWidth:has(.wk_hideCompulsary) { color: #146c43 !important; font-weight: 600 !important; }
            .wk_choiceMaxWidth:has(.wk_hideCompulsary)::before { content: "✅ " !important; }
        `;
        (document.head || document.documentElement).appendChild(style);
        this.startWatching();
    }
    startWatching() {
        this.checkAndClick();
        this.intervalId = window.setInterval(() => this.checkAndClick(), this.CHECK_INTERVAL_MS);
    }
    getQuizElements() {
        return {
            gotThisRight: Array.from(document.getElementsByClassName('wk_hideCompulsary')),
            nextButton: document.getElementsByClassName(this.NEXT_BUTTON_CLASS)[0] || null,
        };
    }
    handleQuizElements(elements) {
        if (elements.gotThisRight.length > 0) {
            this.handleCorrectAnswers(elements.gotThisRight);
            return;
        }
        if (elements.nextButton) {
            this.safeClick(elements.nextButton);
        }
    }
    handleCorrectAnswers(elements) {
        elements.forEach((element) => {
            const parent = element.parentElement;
            if (!parent)
                return;
            if (parent.classList.contains('wk_choiceMaxWidth')) {
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
            console.error('Error dispatching click event:', error instanceof Error ? error.message : String(error));
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
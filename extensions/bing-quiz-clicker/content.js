"use strict";
class BingQuizClicker {
    constructor() {
        this.NEXT_BUTTON_CLASS = 'wk_button';
        this.CHECK_INTERVAL_MS = 1000;
        this.intervalId = null;
        this.initialize();
    }
    initialize() {
        this.gotThisRightElements = document.getElementsByClassName('wk_hideCompulsary');
        this.nextButtonElements = document.getElementsByClassName(this.NEXT_BUTTON_CLASS);
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
            gotThisRight: this.gotThisRightElements,
            nextButton: this.nextButtonElements[0] || null,
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
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const parent = element.parentElement;
            if (!parent)
                continue;
            if (parent.classList.contains('wk_choiceMaxWidth')) {
                this.safeClick(parent);
            }
        }
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
if (typeof window !== 'undefined') {
    window.BingQuizClicker = BingQuizClicker;
    window.initQuizClicker = initQuizClicker;
    window.getQuizClicker = () => quizClicker;
}
//# sourceMappingURL=bingQuizClicker.js.map
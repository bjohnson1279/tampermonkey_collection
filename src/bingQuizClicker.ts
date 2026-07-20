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

interface QuizElements {
    gotThisRight: HTMLElement[];
    nextButton: HTMLElement | null;
}

class BingQuizClicker {
    private readonly NEXT_BUTTON_SELECTOR = '.wk_button';
    private readonly CHECK_INTERVAL_MS = 1000;
    private intervalId: number | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // ⚡ Bolt: Replace O(N) inline style assignments with O(1) injected stylesheet
        const style = document.createElement('style');
        style.textContent = `
            .wk_hideCompulsary { visibility: visible !important; }
            .wk_choiceMaxWidth:has(.wk_hideCompulsary) { color: #146c43 !important; font-weight: 600 !important; }
            .wk_choiceMaxWidth:has(.wk_hideCompulsary)::before { content: "✅ " !important; }
        `;
        (document.head || document.documentElement).appendChild(style);
        this.startWatching();
    }

    private startWatching(): void {
        // Initial check
        this.checkAndClick();

        // Set up interval for continuous checking
        this.intervalId = window.setInterval(() => this.checkAndClick(), this.CHECK_INTERVAL_MS);
    }

    private getQuizElements(): QuizElements {
        // ⚡ Bolt: Replace querySelector('.class') with getElementsByClassName('class') for O(1) live collection lookup instead of O(N) tree traversal inside the 1000ms setInterval loop.
        return {
            gotThisRight: Array.from(
                document.getElementsByClassName('wk_hideCompulsary')
            ) as HTMLElement[],
            nextButton:
                (document.getElementsByClassName(this.NEXT_BUTTON_CLASS)[0] as
                    HTMLElement | undefined) || null,
        };
    }

    private handleQuizElements(elements: QuizElements): void {
        // Handle "got this right" elements
        if (elements.gotThisRight.length > 0) {
            this.handleCorrectAnswers(elements.gotThisRight);
            return;
        }

        // Handle next button if no correct answers found
        if (elements.nextButton) {
            this.safeClick(elements.nextButton);
        }
    }

    private handleCorrectAnswers(elements: HTMLElement[]): void {
        elements.forEach((element) => {
            const parent = element.parentElement;
            if (!parent) return;

            if (parent.classList.contains('wk_choiceMaxWidth')) {
                this.safeClick(parent);
            }
        });
    }

    private safeClick(element: HTMLElement): void {
        try {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            element.dispatchEvent(event);
        } catch (error) {
            // 🛡️ Sentinel: Removed error object from console.error to prevent stack trace exposure
            console.error(
                'Error dispatching click event:',
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    private checkAndClick(): void {
        const elements = this.getQuizElements();
        this.handleQuizElements(elements);
    }

    public destroy(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Initialize the quiz clicker when the page is fully loaded
let quizClicker: BingQuizClicker | null = null;

function initQuizClicker() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            quizClicker = new BingQuizClicker();
        });
    } else {
        quizClicker = new BingQuizClicker();
    }
}

initQuizClicker();

if (typeof window !== 'undefined') {
    (window as any).BingQuizClicker = BingQuizClicker;
    (window as any).initQuizClicker = initQuizClicker;
    (window as any).getQuizClicker = () => quizClicker;
}

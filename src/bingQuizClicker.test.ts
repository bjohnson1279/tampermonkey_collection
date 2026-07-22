/**
 * @jest-environment jsdom
 */

import './bingQuizClicker';

describe('BingQuizClicker', () => {
    let clicker: any;
    let BingQuizClickerClass: any;
    let initQuizClickerFunc: any;

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = ''; // Reset DOM
        // Spy on console.error to keep test output clean
        jest.spyOn(console, 'error').mockImplementation(() => {});

        BingQuizClickerClass = (window as any).BingQuizClicker;
        initQuizClickerFunc = (window as any).initQuizClicker;
    });

    afterEach(() => {
        if (clicker) {
            clicker.destroy();
        }
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('Initialization', () => {
        it('should start watching and check for elements immediately', () => {
            const getElementsByClassNameSpy = jest.spyOn(document, 'getElementsByClassName');
            clicker = new BingQuizClickerClass();

            expect(getElementsByClassNameSpy).toHaveBeenCalledWith('wk_hideCompulsary');
        });

        it('should set an interval to check periodically', () => {
            const setIntervalSpy = jest.spyOn(window, 'setInterval');
            clicker = new BingQuizClickerClass();

            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

            const getElementsByClassNameSpy = jest.spyOn(document, 'getElementsByClassName');
            getElementsByClassNameSpy.mockClear();

            // Advance time
            jest.advanceTimersByTime(1000);

            expect(getElementsByClassNameSpy).toHaveBeenCalled();
        });
    });

    describe('Handling Quiz Elements', () => {
        it('should handle correct answers and click them', () => {
            // Setup DOM
            document.body.innerHTML = `
                <div class="wk_choiceMaxWidth">
                    <div class="wk_hideCompulsary">got this right</div>
                </div>
            `;

            const parent = document.querySelector('.wk_choiceMaxWidth') as HTMLElement;
            const dispatchEventSpy = jest.spyOn(parent, 'dispatchEvent');

            clicker = new BingQuizClickerClass();

            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
        });

        it('should not click if parent does not have wk_choiceMaxWidth class', () => {
            // Setup DOM
            document.body.innerHTML = `
                <div class="other_class">
                    <div class="wk_hideCompulsary">got this right</div>
                </div>
            `;

            const parent = document.querySelector('.other_class') as HTMLElement;
            const dispatchEventSpy = jest.spyOn(parent, 'dispatchEvent');

            clicker = new BingQuizClickerClass();

            expect(dispatchEventSpy).not.toHaveBeenCalled();
        });

        it('should click the next button if no correct answers are found', () => {
            // Setup DOM
            document.body.innerHTML = `
                <button class="wk_button">Next</button>
            `;

            const nextButton = document.querySelector('.wk_button') as HTMLElement;
            const dispatchEventSpy = jest.spyOn(nextButton, 'dispatchEvent');

            clicker = new BingQuizClickerClass();

            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
        });

        it('should do nothing if neither correct answers nor next button are found', () => {
            document.body.innerHTML = '<div>Random content</div>';

            // Should not throw any error
            expect(() => {
                clicker = new BingQuizClickerClass();
            }).not.toThrow();
        });

        it('should catch errors during dispatchEvent', () => {
            document.body.innerHTML = `
                <button class="wk_button">Next</button>
            `;

            const nextButton = document.querySelector('.wk_button') as HTMLElement;
            jest.spyOn(nextButton, 'dispatchEvent').mockImplementation(() => {
                throw new Error('Fake error');
            });

            clicker = new BingQuizClickerClass();

            expect(console.error).toHaveBeenCalledWith(
                'Error dispatching click event:',
                'Fake error'
            );
        });
    });

    describe('Destroy', () => {
        it('should clear the interval when destroy is called', () => {
            const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
            clicker = new BingQuizClickerClass();

            // intervalId should be set
            expect(clearIntervalSpy).not.toHaveBeenCalled();

            clicker.destroy();

            expect(clearIntervalSpy).toHaveBeenCalled();
        });
    });

    describe('initQuizClicker', () => {
        beforeEach(() => {
            // Mock document.readyState to be 'complete'
            Object.defineProperty(document, 'readyState', {
                get() {
                    return 'complete';
                },
                configurable: true,
            });
        });

        it('should create a new instance when document is already loaded', () => {
            initQuizClickerFunc();
            const currentQuizClicker = (window as any).getQuizClicker();
            expect(currentQuizClicker).toBeInstanceOf(BingQuizClickerClass);
            currentQuizClicker?.destroy();
        });

        it('should add DOMContentLoaded listener if document is loading', () => {
            Object.defineProperty(document, 'readyState', {
                get() {
                    return 'loading';
                },
                configurable: true,
            });

            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            initQuizClickerFunc();

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'DOMContentLoaded',
                expect.any(Function)
            );

            // Simulate DOMContentLoaded
            const callback = addEventListenerSpy.mock.calls[0][1] as EventListener;
            callback(new Event('DOMContentLoaded'));

            const currentQuizClicker = (window as any).getQuizClicker();
            expect(currentQuizClicker).toBeInstanceOf(BingQuizClickerClass);
            currentQuizClicker?.destroy();
        });
    });
});

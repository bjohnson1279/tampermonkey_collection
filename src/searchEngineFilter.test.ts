describe('searchEngineFilter', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let originalWindow: any;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Save global window
        originalWindow = global.window;

        // Mock global window and its location object completely
        (global as any).window = {
            location: {
                hostname: 'www.google.com',
                search: '?q=hello',
                href: 'https://www.google.com/?q=hello',
            },
        };
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        jest.resetModules();
        (global as any).window = originalWindow;
    });

    it('should catch and log errors during processSearch', () => {
        // Mock URLSearchParams to throw an error
        const OriginalURLSearchParams = global.URLSearchParams;
        global.URLSearchParams = jest.fn().mockImplementation(() => {
            throw new Error('Simulated URLSearchParams error');
        });

        // Require the file so the IIFE executes
        require('./searchEngineFilter');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing search:', expect.any(Error));
        expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Simulated URLSearchParams error');

        // Restore URLSearchParams
        global.URLSearchParams = OriginalURLSearchParams;
    });

    it('should do nothing if hostname does not match a search engine', () => {
        window.location.hostname = 'example.com';
        window.location.search = '?q=hello';
        window.location.href = 'https://example.com/';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://example.com/');
    });

    it('should do nothing if hostname contains but does not end with search engine', () => {
        window.location.hostname = 'google.com.attacker.com';
        window.location.search = '?q=hello+asdf+world';
        window.location.href = 'https://google.com.attacker.com/?q=hello+asdf+world';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://google.com.attacker.com/?q=hello+asdf+world');
    });

    it('should do nothing if hostname is a prefix of search engine', () => {
        window.location.hostname = 'notgoogle.com';
        window.location.search = '?q=hello+asdf+world';
        window.location.href = 'https://notgoogle.com/?q=hello+asdf+world';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://notgoogle.com/?q=hello+asdf+world');
    });

    it('should do nothing if hostname matches but no query param', () => {
        window.location.hostname = 'www.google.com';
        window.location.search = '?p=hello'; // google uses 'q'
        window.location.href = 'https://www.google.com/?p=hello';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://www.google.com/?p=hello');
    });

    it('should do nothing if query is not blacklisted', () => {
        window.location.hostname = 'www.google.com';
        window.location.search = '?q=hello+world';
        window.location.href = 'https://www.google.com/?q=hello+world';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://www.google.com/?q=hello+world');
    });

    it('should redirect if query is blacklisted', () => {
        window.location.hostname = 'www.google.com';
        window.location.search = '?q=hello+asdf+world';
        window.location.href = 'https://www.google.com/?q=hello+asdf+world';
        require('./searchEngineFilter');
        expect(window.location.href).toBe('https://www.google.com/'); // This URL matches the searchEngines config with a trailing slash from new URL().href
    });
});

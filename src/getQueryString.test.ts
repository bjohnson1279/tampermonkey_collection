import { getQueryParams } from './getQueryString';

describe('getQueryParams', () => {
    // Happy paths
    it('should parse simple query strings', () => {
        const url = 'https://example.com/page?foo=bar';
        expect(getQueryParams(url)).toEqual({ foo: 'bar' });
    });

    it('should parse multiple query strings', () => {
        const url = 'https://example.com/page?foo=bar&baz=qux';
        expect(getQueryParams(url)).toEqual({ foo: 'bar', baz: 'qux' });
    });

    // Security cases
    it('should prevent prototype pollution', () => {
        const url =
            'https://example.com/page?__proto__=polluted&constructor=polluted&prototype=polluted&normal=true';
        const params = getQueryParams(url) as any;

        expect(params).toEqual({ normal: 'true' });
        expect(params.__proto__).toBeUndefined();
        expect(({} as any).polluted).toBeUndefined();
    });
    // Edge cases
    it('should return empty object for empty query string', () => {
        const url = 'https://example.com/page?';
        expect(getQueryParams(url)).toEqual({});
    });

    it('should return empty object for no query string', () => {
        const url = 'https://example.com/page';
        expect(getQueryParams(url)).toEqual({});
    });

    it('should return empty object for only question mark', () => {
        const url = 'https://example.com/page?';
        expect(getQueryParams(url)).toEqual({});
    });

    it('should handle duplicate keys by keeping the last one', () => {
        const url = 'https://example.com/page?foo=bar&foo=qux';
        expect(getQueryParams(url)).toEqual({ foo: 'qux' });
    });

    it('should handle special characters in query string', () => {
        const url = 'https://example.com/page?foo=bar%20baz&qux=%E2%9C%93';
        expect(getQueryParams(url)).toEqual({ foo: 'bar baz', qux: '✓' });
    });

    it('should ignore hash fragments', () => {
        const url = 'https://example.com/page?foo=bar#section';
        expect(getQueryParams(url)).toEqual({ foo: 'bar' });
    });

    it('should handle empty values', () => {
        const url = 'https://example.com/page?foo=&bar';
        expect(getQueryParams(url)).toEqual({ foo: '', bar: '' });
    });

    it('should handle equal signs in values', () => {
        const url = 'https://example.com/page?foo=bar=baz';
        expect(getQueryParams(url)).toEqual({ foo: 'bar=baz' });
    });
    // Error cases
    it('should return empty object for invalid URL string', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = 'invalid-url';
        expect(getQueryParams(url)).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith('Error parsing URL:', expect.anything());
        consoleSpy.mockRestore();
    });

    it('should return empty object for plain text', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = 'plain text';
        expect(getQueryParams(url)).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith('Error parsing URL:', expect.anything());
        consoleSpy.mockRestore();
    });

    it('should handle URLs without protocol', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = 'example.com/page?foo=bar';
        expect(getQueryParams(url)).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith('Error parsing URL:', expect.anything());
        consoleSpy.mockRestore();
    });
    it('should handle invalid URLs by catching the error and returning an empty object', () => {
        // Suppress console.error during this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Invalid URL string that throws when passed to new URL()
        const invalidUrl = 'not-a-valid-url';
        const params = getQueryParams(invalidUrl);

        expect(params).toEqual({});
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toBe('Error parsing URL:');
        expect(consoleSpy.mock.calls[0][1].message).toBe('Invalid URL');

        consoleSpy.mockRestore();
    });
});

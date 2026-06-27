import { getQueryParams } from './getQueryString';

describe('getQueryParams', () => {
  it('should parse valid query parameters', () => {
    const url = 'https://example.com?foo=bar&baz=qux';
    const params = getQueryParams(url);
    expect(params).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('should handle missing query parameters', () => {
    const url = 'https://example.com';
    const params = getQueryParams(url);
    expect(params).toEqual({});
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

// ==UserScript==
// @name     Get URL Query String
// @version  1.1
// @description Refactored to use URLSearchParams for modern and reliable query string parsing.
// @grant    none
// ==/UserScript==

interface QueryParams {
    [key: string]: string;
}

/**
 * Parses query parameters from a URL string into a key-value object
 * @param urlString The URL string to parse
 * @returns An object containing the query parameters
 */
const getQueryParams = (urlString: string): QueryParams => {
    try {
        const urlObj = new URL(urlString);
        const params = new URLSearchParams(urlObj.search);
        const result: QueryParams = {};
        
        // Convert URLSearchParams to a plain object
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        
        return result;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return {};
    }
};

// Log the current URL's query parameters to the console
console.log('Query parameters:', getQueryParams(window.location.href));

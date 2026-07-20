// ==UserScript==
// @name     Get URL Query String
// @version  1.1
// @description Refactored to use URLSearchParams for modern and reliable query string parsing.
// @grant    none
// ==/UserScript==

export interface QueryParams {
    [key: string]: string;
}

/**
 * Parses query parameters from a URL string into a key-value object
 * @param urlString The URL string to parse
 * @returns An object containing the query parameters
 */
export const getQueryParams = (urlString: string): QueryParams => {
    try {
        const urlObj = new URL(urlString);
        const params = new URLSearchParams(urlObj.search);
        const result: QueryParams = Object.create(null);

        // Convert URLSearchParams to a plain object
        for (const [key, value] of params.entries()) {
            // 🛡️ Sentinel: Prevent Prototype Pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }
            result[key] = value;
        }

        return result;
    } catch (error) {
        // 🛡️ Sentinel: Removed error object from console.error to prevent stack trace exposure
        console.error('Error parsing URL:', error instanceof Error ? error.message : String(error));
        return Object.create(null);
    }
};

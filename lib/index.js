const fetch = require('node-fetch').default;
const { mergeUrls, FetchError } = require('./helpers');
const debug = require('./debug');

const DEFAULT_OPTIONS = {
	headers: {}
};

class Fetcher {
	constructor(baseUrl, options = {}) {
		this.baseUrl = baseUrl;
		const mergedOptions = {
			...DEFAULT_OPTIONS,
			...options
		};
		this.headers = mergedOptions.headers;
	}

	async fetch(fetchOptionsOrMethod, path, query, headers = {}, body, redirect) {

		let method;

		switch (typeof fetchOptionsOrMethod) {
			case 'object':
				method = fetchOptionsOrMethod.method;
				path = fetchOptionsOrMethod.path;
				body = fetchOptionsOrMethod.body;
				query = fetchOptionsOrMethod.query;
				headers = fetchOptionsOrMethod.headers || headers;
				if (fetchOptionsOrMethod.redirect) {
					redirect = fetchOptionsOrMethod.redirect;
				}
				break;
			case 'string':
				method = fetchOptionsOrMethod;
				break;
		}

		headers = {
			...this.headers,
			...headers
		};

		const init = { method, headers };

		if (redirect) {
			init.redirect = redirect;
		}

		if (body) {
			init.body = typeof body === 'object'
				? JSON.stringify(body)
				: body;
			init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
		}

		const requestUrl = mergeUrls(this.baseUrl, path, query);

		if (!requestUrl) {
			throw new Error('Failed to generate a request url based on provided args');
		}

		debug('requestUrl %s', requestUrl);
		debug('request init %o', init);
		const response = await fetch(requestUrl, init);
		const parsedResponse = await parseResponseBody(response);
		const validResponseStatus = validateResponseStatus(parsedResponse);

		if (!validResponseStatus) {
			throw new FetchError(parsedResponse);
		}

		return returnParsedResponse(parsedResponse);
	}
}

async function parseResponseBody(response) {
	const isJson = isJsonContentType(response.headers.get('Content-Type') || '');
	const isText = isTextContentType(response.headers.get('Content-Type') || '');

	debug('isJson response %', isJson);
	debug('isText response %s', isText);

	if (!isJson && !isText) {
		return response;
	}

	try {
		if (isJson) {
			const body = await response.json();
			response.parsedBody = body;
		}
		if (isText) {
			const text = await response.text();
			response.parsedText = text;
		}
	} catch (error) {
		response.error = error;
	}

	return response;
}

function validateResponseStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return true;
	}

	return false;
}

function returnParsedResponse(response) {
	return response.parsedBody || response.parsedText || response;
}

module.exports = Fetcher;

/**
 * application/json
 * application/vnd.github+json
 * application/vnd.github[.version].param[+json]
 */
function isJsonContentType (contentType) {
	return /^application\/(vnd\..[^+]*\+)?json/i.test(contentType);
}

/**
 * text/html
 * text/xml
 */
function isTextContentType (contentType) {

	return /^text\//i.test(contentType);
}
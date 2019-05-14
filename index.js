const fetch = require('node-fetch').default;
const url = require('url');
const deepmerge = require('deepmerge');

class DefaultFetchError extends Error {
	constructor(response) {
		const message = response.statusText || response.message || 'unexpected error';
		super(message);
		this.response = response;
	}
}

const DEFAULT_OPTIONS = {
	FetchError: DefaultFetchError,
	headers: {}
};

class Fetcher {
	constructor(baseUrl, options = {}) {
		this.baseUrl = baseUrl;
		const mergedOptions = deepmerge(DEFAULT_OPTIONS, options);
		this.FetchError = mergedOptions.FetchError;
		this.headers = mergedOptions.headers;
	}

	async fetch({ method = 'GET', path, query = null, headers = {}, body = null }) {

		if (headers) {
			headers = deepmerge(this.headers, headers);
		}

		const init = { method, headers };

		if (body) {
			init.body = typeof body === 'object'
				? JSON.stringify(body)
				: body;
			init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
		}

		const parsedBaseUrl = this.baseUrl && url.parse(this.baseUrl);
		const requestUrl = url.format({
			...withoutNulls(parsedBaseUrl),
			...withoutNulls(url.parse(path)),
			query: withoutNulls(query)
		});

		if (!requestUrl) {
			throw new Error('');
		}

		const response = await fetch(requestUrl, init);
		const parsedResponse = await parseResponseBody(response);
		const validResponseStatus = validateResponseStatus(parsedResponse);

		if (!validResponseStatus) {
			throw new this.FetchError(parsedResponse);
		}

		return returnParsedResponse(parsedResponse);
	}
}

async function parseResponseBody(response) {
	const isJson = (response.headers.get('Content-Type') || '').startsWith('application/json');
	const isText = (response.headers.get('Content-Type') || '').startsWith('text/');

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

function withoutNulls(obj) {
	if (obj === null || obj === undefined) {
		return;
	}

	return Object.keys(obj).reduce((newObj, key) => {
		const value = obj[key];

		if (value) {
			newObj[key] = value;
		}

		return newObj;
	}, {});
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

module.exports = {
	Fetcher,
	DefaultFetchError
};
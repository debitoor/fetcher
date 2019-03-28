const fetch = require('node-fetch').default;
const formatUrl = require('url').format;
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
		headers = deepmerge(this.headers, headers);

		const url = formatUrl({
			pathname: `${this.baseUrl}${path}`,
			query: withoutNulls(query)
		});

		const init = { method, headers };

		if (body) {
			init.body = typeof body === 'object'
				? JSON.stringify(body)
				: body;
			init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
		}

		const response = await fetch(url, init);
		const parsedResponse = await parseResponseBody(response);
		const validResponseStatus = validateResponseStatus(parsedResponse);

		if (!validResponseStatus) {
			const err = new this.FetchError(parsedResponse);
			throw err;
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
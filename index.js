const fetch = require('node-fetch').default;
const formatUrl = require('url').format;

class Fetcher {
	constructor(baseUrl, FetchError) {
		this.baseUrl = baseUrl;
		this.FetchError = FetchError || DefaultFetchError;
	}

	async fetch({ method = 'GET', path, query = null, headers = {}, body = null }) {
		const url = formatUrl({
			pathname: `${this.baseUrl}${path}`,
			query: withoutNulls(query)
		});

		const init = { method, headers };

		if (body) {
			init.body = typeof body === 'object'
				? JSON.stringify(body)
				: body;
			init.headers['Content-Type'] = headers['Content-Type'] || 'application/json';
		}

		const response = await fetch(url, init);
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

class DefaultFetchError extends Error {
	constructor(response) {
		const message = response.statusText || response.message || 'unexpected error';
		super(message);
		this.response = response;
	}
}

module.exports = {
	Fetcher,
	DefaultFetchError
};
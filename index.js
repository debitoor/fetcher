const fetch = require('node-fetch').default;
const url = require('url');
const deepmerge = require('deepmerge');

class FetchError extends Error {
	constructor(response) {
		const { statusText, message } = response;
		const errorMessage = statusText || message || 'unexpected error';
		super(errorMessage);
		this.response = response;

	}
}

const DEFAULT_OPTIONS = {
	headers: {}
};

class Fetcher {
	constructor(baseUrl, options = {}) {
		this.baseUrl = baseUrl;
		const mergedOptions = deepmerge(DEFAULT_OPTIONS, options);
		this.headers = mergedOptions.headers;
	}

	async fetch(fetchOptionsOrMethod, path, query, headers = {}, body, ) {

		let method;
		switch (typeof fetchOptionsOrMethod) {
			case 'object':
				method = fetchOptionsOrMethod.method;
				path = fetchOptionsOrMethod.path;
				body = fetchOptionsOrMethod.body;
				query = fetchOptionsOrMethod.query;
				headers = fetchOptionsOrMethod.headers || headers;
				break;
			case 'string':
				method = fetchOptionsOrMethod;
				break;
		}

		headers = deepmerge(this.headers, headers);

		const init = { method, headers };

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

function mergeUrls(baseUrl, requestUrl, query = {}) {
	if (typeof baseUrl === 'string') {
		baseUrl = url.parse(baseUrl, true);
	}

	if (typeof requestUrl === 'string') {
		requestUrl = url.parse(requestUrl, true);
	}

	baseUrl = withoutNulls(baseUrl) || {}; // avoid TypeError getting props of baseUrl
	requestUrl = withoutNulls(requestUrl);

	const mergedUrl = {
		protocol: baseUrl.protocol || requestUrl.protocol,
		host: baseUrl.host || requestUrl.host,
		pathname: url.resolve((baseUrl.pathname || ''), requestUrl.pathname),
		query: withoutNulls({
			...baseUrl.query,
			...requestUrl.query,
			...query
		})
	};

	return url.format(mergedUrl);
}

module.exports = {
	Fetcher,
	FetchError,
	mergeUrls
};
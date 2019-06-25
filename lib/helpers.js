const url = require('url');

module.exports = {
	mergeUrls
};

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
		pathname: url.resolve((baseUrl.pathname || ''), requestUrl.pathname),
		query: withoutNulls({
			...baseUrl.query,
			...requestUrl.query,
			...query
		})
	};

	return url.format(mergedUrl);
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
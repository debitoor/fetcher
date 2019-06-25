[![CircleCI](https://circleci.com/gh/debitoor/fetcher/tree/master.svg?style=svg)](https://circleci.com/gh/debitoor/fetcher/tree/master)

# Fetcher

Easily make make HTTP using `node-fetch` and have response status check, json-body- and text parsing and error handling.

If response is of `"content-type": "application/json"` it will return the response of `await response.json();`.

If response is of `"content-type": "text/` it will return the response of `await response.text()`.

If response is not of either type, it will just return the response as is.

The Fetcher takes an optional `baseUrl` and an optional `options`.

It will throw an error if `response.status` is not equal to 200 or less than 300 (`response.status >= 200 && response.status < 300`).

`fetcher.fetch` function can be called with an object of options or direct function arguments. See examples.

## examples

```javascript
const Fetcher = require('@debitoor/fetcher');

// create new instance
const fetcher = new Fetcher(baseUrl, options);
const response = await fetcher.fetch({ method:'GET' path: '/foo/bar' });
// OR
const response = await fetcher.fetch(method, path, query, headers, body);

// extend class
class Example extends Fetcher {
	constructor(baseUrl) {
		super(baseUrl, options);
	}

	async requestMethod() {
		return this.fetch({ method: 'GET', path: '/foo/bar' });
	}
}
```

### Options

You can provide second optional argument options. Valid options:

* `headers` - an object of headers.

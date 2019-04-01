[![CircleCI](https://circleci.com/gh/debitoor/fetcher/tree/master.svg?style=svg)](https://circleci.com/gh/debitoor/fetcher/tree/master)

# Fetcher

An extended node-fetch module that helps you avoid repeating response status checks, but instead delivers what you are usually interested in - the response.

If response is of `"content-type": "application/json"` it will return the response of `await response.json();`.

If response is of `"content-type": "text/` it will return the response of `await response.text()`.

If response is not of either type, it will just return the response as is.

The Fetcher takes a `baseUrl` and an optional `FetchError`. If the optional `FetchError` is not provided, it will instead use a default `DefaultFetchError` in case of request errors.

It will throw either the provided `FetchError` or `DefaultFetchError` if `response.status` is not equal to 200 or less than 300 (`response.status >= 200 && response.status < 300`).

## examples

_Note_ how **Both** examples provides `ExampleError` for optional param `FetchError`:

```javascript

// example error
class ExampleError extends Error {
	constructor(response) {
		super(response.statusText);
		this.response = response;
	}
}

// create new instance
const fetcher = new Fetcher(baseUrl, options);
const response = await fetcher.fetch({ method:'GET' path: '/foo/bar' });

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

You can provide second optinal argument. Valid options:

* `FetchError` - an alternative to the default fetch error thrown in case of error on request or `status > 300`.
* `headers` - an object of headers.

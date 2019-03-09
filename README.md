[![CircleCI](https://circleci.com/gh/debitoor/fetcher/tree/master.svg?style=svg)](https://circleci.com/gh/debitoor/fetcher/tree/master)

# Fetcher

An extended node-fetcher module that helps you avoid repeating response status checks, but instead delivers what you are usually interested in - the response.

If response is of `"content-type": "application/json"` it will return the response of `await response.json();`.

If response is of `"content-type": "text/` it will return the response of `await response.text()`.

If response is not of either type, it will just return the response as is.

The Fetcher takes a `baseUrl` and an optional `FetchError`. If the optional `FetchError` is not provided, it will instead use a default `DefaultFetchError` in case of request errors.

It will throw either the provided `FetchError` or `DefaultFetchError` if `response.status` is not equal to 200 or less than 300 (`response.status >= 200 && response.status < 300`).

## examples

### New instance

```javascript
const fetcher = new Fetcher(baseUrl, ExampleError);
const response = await fetcher.fetch({ method:'GET' path: '/foo/bar' });
```

### Extend class

```javascript
class Example extends Fetcher {
	constructor(baseUrl) {
		super(baseUrl, ExampleError);
	}

	async requestMethod() {
		return this.fetch({ method: 'GET', path: '/foo/bar' });
	}
}
```

**Both** examples providing `ExampleError` for optional param `FetchError`:

```javascript
class ExampleError extends Error {
	constructor(response) {
		super(response.statusText);
		this.response = response;
	}
}
```
# Fetcher

Module adding additional checks to the response of a request made with node-fetch.

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
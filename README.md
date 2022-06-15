**ARCHIVED!!!** This package is now archived, as there are many other better alternatives that do not require ourself to maintain.

# Fetcher

Easily make make HTTP requests using `node-fetch` and have response status check, json– or text parsing and error handling.

It will throw an error if `response.status` is not equal to 200 or less than 300 (`response.status >= 200 && response.status < 300`).

If response is of `"content-type": "application/json"` it will return the response of `await response.json();`.

If response is of `"content-type": "text/` it will return the response of `await response.text()`.

If response is not of either type, it will just return the response as is.

The Fetcher takes an optional `baseUrl` and an optional `options`.

`fetcher.fetch` function can be called with an object of options or direct function arguments. See examples.

## Usage

```javascript
const Fetcher = require('@debitoor/fetcher');

// create new instance
const fetcher = new Fetcher(baseUrl, options);
const response = await fetcher.fetch({ method:'GET' path: '/foo/bar' });
// OR
const response = await fetcher.fetch(method, path, query, headers, body, redirect);

// extend class
class Example extends Fetcher {
	constructor(baseUrl, options) {
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

## baseUrl and path

It is possible to supply a `baseUrl` when initialising `fetcher` while also supplying a `path` when calling the `fetch` function.

When both are applied, we are merging them. The path of the merged url is being resolved using `url.resolve`, thus it is important to note how this works.

E.g. if `baseUrl` includes any path that should be kept in the merged url, it should end with a `/` while the `path` should not begin with one (which it usually should). See example below.

```js
const url = require('url');

const baseurl = 'https://circleci.com/api/v1.1/';
const requesturl = 'projects?circle-token=token';

console.log(url.resolve('https://circleci.com/api/v1.1/', 'projects?circle-token=token'));
// https://circleci.com/api/v1.1/projects?circle-token=token
console.log(url.resolve('https://circleci.com/api/v1.1', '/projects?circle-token=token'));
// https://circleci.com/projects?circle-token=token
```

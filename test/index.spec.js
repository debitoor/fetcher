const { Fetcher, DefaultFetchError } = require('../index');
const http = require('http');
const { expect } = require('chai');

const PORT = 1337;
const BASE_URL = `http://localhost:${PORT}`;

class CustomFetchError extends Error {
	constructor(response) {
		super('Custom fetch error');
		this.response = response;
	}
}

describe('index', () => {
	before('creating test http-server', (done) => {
		http.createServer((req, res) => {
			switch (req.url) {
				case '/json':
					res.setHeader('Content-type', 'application/json');
					res.write(JSON.stringify({ message: 'json' }));
					break;
				case '/text':
					res.setHeader('Content-Type', 'text/html');
					res.write('<body><h1>Hello world</h1></body>');
					break;
				case '/303':
					res.statusCode = 303;
					break;
				default:
					res.write('hello world');
			}
			res.end();
		}).listen(PORT, () => done());
	});
	describe('when new instance', () => {
		let fetcher;
		before(() => {
			fetcher = new Fetcher(BASE_URL);
		});
		describe('when response is content-type application/json', () => {
			it('should return as json', async () => {
				const actual = await fetcher.fetch({ method: 'GET', path: '/json' });
				const expected = { message: 'json' };

				expect(actual).to.eql(expected);
			});
		});
		describe('when response is content-type starts with text/', () => {
			it('should return text', async () => {
				const actual = await fetcher.fetch({ method: 'GET', path: '/text' });
				const expected = '<body><h1>Hello world</h1></body>';

				expect(actual).to.eql(expected);
			});
		});
		describe('when response does not include json og text header(s)', () => {
			it('should return a default fetch response', async () => {
				const res = await fetcher.fetch({ method: 'GET', path: '/unsupported' });

				const actual = await res.text();
				const expected = 'hello world';

				expect(actual).to.equal(expected);
			});
		});
		describe('when response returns status 303 and no FetcherError provide', () => {
			it('should throw an error and error should be an instance DefaultFetchError', async () => {
				let actualError;
				try {
					await fetcher.fetch({ path: '/303' });
				} catch (error) {
					actualError = error;
				}
				expect(actualError).to.be.an.instanceOf(DefaultFetchError);
			});
		});
		describe('when response returns status 303 and custom FetcherError is provided', () => {
			it('should throw an error and error should be an instance of CustomFetchError', async () => {
				const fetcherWithError = new Fetcher(BASE_URL, { FetchError: CustomFetchError });

				let actualError;
				try {
					await fetcherWithError.fetch({ path: '/303' });
				} catch (error) {
					actualError = error;
				}
				expect(actualError).to.be.an.instanceOf(CustomFetchError);
			});
		});

	});
	describe('when extending class', () => {
		let caller;
		before(() => {
			class Caller extends Fetcher {
				constructor(baseUrl) {
					super(baseUrl);
				}

				async call() {
					return this.fetch({ method: 'GET', path: '/json' });
				}
			}
			caller = new Caller(BASE_URL);
		});
		it('should return response', async () => {
			const actual = await caller.call();
			const expected = { message: 'json' };

			expect(actual).to.eql(expected);
		});
	});
});
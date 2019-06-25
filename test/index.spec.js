const Fetcher = require('../lib/index');
const { mergeUrls, FetchError } = require('../lib/helpers');
const http = require('http');
const { expect } = require('chai');

const PORT = 1337;
const BASE_URL = `http://localhost:${PORT}`;

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
				case '/headers':
					res.setHeader('accept-charset', req.headers['accept-charset']);
					res.setHeader('from', req.headers['from']);
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
			it('should throw an error and error should be an instance FetchError', async () => {
				let actualError;
				try {
					await fetcher.fetch({ path: '/303' });
				} catch (error) {
					actualError = error;
				}
				expect(actualError).to.be.an.instanceOf(FetchError);
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
	describe('when providing default headers', () => {
		const DEFAULT_HEADERS = { 'Accept-Charset': 'fetcher-charset', 'From': 'test@fetcher.com' };

		let fetcher;
		before(() => {
			fetcher = new Fetcher(BASE_URL, { headers: DEFAULT_HEADERS });
		});

		it('should request with headers', async () => {
			const actual = await fetcher.fetch({ method: 'GET', path: '/headers' });

			expect(actual.headers.get('accept-charset')).to.equal('fetcher-charset');
			expect(actual.headers.get('from')).to.equal('test@fetcher.com');
		});

		describe('when also providing headers on fetch', () => {
			it('should merge headers', async () => {
				const actual = await fetcher.fetch({ method: 'GET', path: '/headers', headers: { From: 'test-overwrite@fetcher.com' } });

				expect(actual.headers.get('accept-charset')).to.equal('fetcher-charset');
				expect(actual.headers.get('from')).to.equal('test-overwrite@fetcher.com');
			});
		});
	});
	describe('when setting baseUrl to null and using fetch with arg url', () => {
		it('should make request with provided url property', async () => {
			const fetcher = new Fetcher();

			const actual = await fetcher.fetch({ method: 'GET', path: `${BASE_URL}/text` });
			const expected = '<body><h1>Hello world</h1></body>';

			expect(actual).to.equal(expected);
		});
	});
	describe('when requesting with direct arugments instead of fetch options object', () => {
		it('should call with success', async () => {
			const fetcher = new Fetcher(BASE_URL);

			const actual = await fetcher.fetch('GET', '/json');
			const expected = { message: 'json' };

			expect(actual).to.eql(expected);
		});
	});
	describe('mergeUrls()', () => {
		describe('when baseUrl is host and requestUrl is a path', () => {
			it('should return merged url', () => {
				const actual = mergeUrls('https://debitoor.com', '/about');
				const expected = 'https://debitoor.com/about';

				expect(actual).to.eql(expected);
			});
		});
		describe('when baseUrl is host and requestUrl is a full url', () => {
			it('should return request url', () => {
				const actual = mergeUrls(null, 'https://foo.debitoor.com/about/bar');
				const expected = 'https://foo.debitoor.com/about/bar';

				expect(actual).to.eql(expected);
			});
		});
		describe('when baseUrl is host and includes a query string and requestUrl is a path', () => {
			it('should return merged url with query string from baseUrl', () => {
				const actual = mergeUrls('https://debitoor.com?token=abc123', '/foo/bar');
				const expected = 'https://debitoor.com/foo/bar?token=abc123';

				expect(actual).to.eql(expected);
			});
		});
		describe('when baseUrl is host and includes a query string and requestUrl is a path that includes query string', () => {
			it('should return request url', () => {
				const actual = mergeUrls('https://debitoor.com?token=abc123', '/foo/bar?sort=true');
				const expected = 'https://debitoor.com/foo/bar?token=abc123&sort=true';

				expect(actual).to.eql(expected);
			});
		});
	});
});
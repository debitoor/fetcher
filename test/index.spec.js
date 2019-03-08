const { Fetcher } = require('../index');
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
				default:
					res.write('hello world');
			}
			res.end();
		}).listen(PORT, () => done());
	});
	describe('when new instance', () => {
		describe('when response is content-type application/json', () => {
			it('should return as json', async () => {
				const fetcher = new Fetcher(BASE_URL);

				const actual = await fetcher.fetch({ method: 'GET', path: '/json' });
				const expected = { message: 'json' };

				expect(actual).to.eql(expected);
			});
		});
		describe('when response is content-type starts with text/', () => {
			it('should return text', async () => {
				const fetcher = new Fetcher(BASE_URL);

				const actual = await fetcher.fetch({ method: 'GET', path: '/text' });
				const expected = '<body><h1>Hello world</h1></body>';

				expect(actual).to.eql(expected);
			});
		});
		describe('when response does not include json og text header(s)', () => {
			it('should return a default fetch response', async () => {
				const fetcher = new Fetcher(BASE_URL);

				const res = await fetcher.fetch({ method: 'GET', path: '/unsupported' });

				const actual = await res.text();
				const expected = 'hello world';

				expect(actual).to.equal(expected);
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
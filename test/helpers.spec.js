const { expect } = require('chai');

const { mergeUrls } = require('../lib/helpers');

describe('helpers', () => {
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
		describe('when baseUrl includes a path', () => {
			it('should return request url with the path of baseUrl kept when formatted properly', () => {
				const actual = mergeUrls('https://circleci.com/api/v1.1/', 'projects?circle-token=token');
				const expected = 'https://circleci.com/api/v1.1/projects?circle-token=token';

				expect(actual).to.equal(expected);
			});
		});
	});
});
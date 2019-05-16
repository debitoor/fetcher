import { Response } from 'node-fetch';
import { UrlWithParsedQuery, UrlWithStringQuery } from 'url';

type Url = string | UrlWithParsedQuery | UrlWithStringQuery;

export type FetcherOptions = {
	headers?: any;
}

export type FetchOptions = {
	path?: Url;
	url?: string;
	method?: string;
	headers?: any;
	body?: any;
	query?: any;
};

type ParsedResponse = any | Response;

export class Fetcher {
	constructor(baseUrl?: Url, options?: FetcherOptions);
	fetch(fetchOptionsOrMethod: FetchOptions | string, path?: string, body?: any, query?: any, headers?: any): Promise<ParsedResponse>;
}
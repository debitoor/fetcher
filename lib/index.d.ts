// Type definitions for [@debitoor/fetcher]
import { Response } from 'node-fetch';
import { UrlWithParsedQuery, UrlWithStringQuery } from 'url';

type Url = string | UrlWithParsedQuery | UrlWithStringQuery;

type ParsedResponse = any | Response;

export =  Fetcher;

declare class Fetcher {
	constructor(baseUrl?: Url, options?: Fetcher.FetcherOptions);
	fetch(fetchOptionsOrMethod: Fetcher.FetchOptions | string, path?: string, query?: any, headers?: any, body?: any): Promise<ParsedResponse>;
}

declare namespace Fetcher {
	export type FetchOptions = {
		path?: Url;
		url?: string;
		method?: string;
		headers?: any;
		body?: any;
		query?: any;
	}

	export type FetcherOptions = {
		headers?: any;
	}
}
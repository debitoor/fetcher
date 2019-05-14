import { Response } from 'node-fetch';

export type FetcherOptions = {
	FetchError?: Error | any;
	headers?: any;
}

export type FetchOptions = {
	path?: string;
	url?: string;
	method?: string;
	headers?: any;
	body?: any;
	query?: any;
};

type ParsedResponse = any | Response;

export class Fetcher {
	constructor(baseUrl?: string, options?: FetcherOptions);
	fetch(fetchOptionsOrMethod: FetchOptions | string, path?: string, body?: any, query?: any, headers?: any): Promise<ParsedResponse>;
}
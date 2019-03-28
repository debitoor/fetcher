import { Response } from 'node-fetch';

export type FetcherOptions = {
	FetchError?: Error | any;
	headers?: any;
}

export type FetchOptions = {
	path: string;
	method?: string;
	headers?: any;
	body?: any;
	query?: any;
};

type ParsedResponse = any | Response;

export class Fetcher {
	constructor(baseUrl: string, options?: FetcherOptions);
	fetch(options: FetchOptions): Promise<ParsedResponse>;
}
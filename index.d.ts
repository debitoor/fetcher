import { Response } from 'node-fetch';

export type FetcherOpts = {
	FetchError?: Error | any;
	headers?: any;
}

export type FetchOpts = {
	path: string;
	method?: string;
	headers?: any;
	body?: any;
	query?: any;
};

type ParsedResponse = any | Response;

export class Fetcher {
	constructor(baseUrl: string, opts?: FetcherOpts);
	baseUrl: string;

	fetch({ method, path, headers, body, query }: FetchOpts): Promise<ParsedResponse>;
}
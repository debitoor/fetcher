import { Response } from 'node-fetch';

export type FetchOpts = {
	method: string;
	path: string;
	headers?: any;
	body?: any;
	query?: any;
};

type ParsedResponse = any | Response;

export class Fetcher {
	constructor(baseUrl: string, FetchError: any | Error);

	baseUrl: string;
	FetchError: Error | any;

	fetch({ method, path, headers, body, query }: FetchOpts): Promise<ParsedResponse>;
}
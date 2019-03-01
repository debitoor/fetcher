import { Response } from 'node-fetch';

export type FetchOpts = {
	method: string;
	path: string;
	headers?: any;
	body?: any;
	query?: any;
};

export class Fetcher {
	constructor(baseUrl: string, FetchError: any | Error);
	fetch({ method, path, headers, body, query }: FetchOpts): Promise<Response>;
}
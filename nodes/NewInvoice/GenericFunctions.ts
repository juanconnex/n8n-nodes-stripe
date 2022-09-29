import {
	OptionsWithUri,
} from 'request';

import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';
export async function getCredentials(this: IExecuteFunctions, keys: any): Promise<any>{
	const credentials = await this.getCredentials(keys) as IDataObject;
	return credentials.apiKey;         
}
export async function stripeApiRequest(this: IExecuteFunctions, method: string, resource: string, body: any = {}, query: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = await this.getCredentials('Stripe') as IDataObject;

	const apikey = credentials.apiKey;

	const endpoint = 'https://api.stripe.com/v1/webhook_endpoints';

	const response = await this.helpers.request({
		url: endpoint,
		headers: {
			"Authorization": `Bearer ${apikey}`
		},
		method: "GET"
	})
	
	

	try {
		const responseParse = JSON.parse(response)
		return responseParse
	} catch (error) {
		if (error.response) {
			const errorMessage = error.response.body.message || error.response.body.description || error.message;
			throw new Error(`Autopilot error response [${error.statusCode}]: ${errorMessage}`);
		}
		throw error;
	}
}
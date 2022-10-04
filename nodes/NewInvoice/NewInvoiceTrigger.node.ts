import { IHookFunctions, IWebhookFunctions } from 'n8n-core';

import { IDataObject, INodeType, INodeTypeDescription, IWebhookResponseData } from 'n8n-workflow';

export class NewInvoiceTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NewInvoiceTrigger',
		name: 'newInvoiceTrigger',
		icon: 'file:stripe_icon.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when a new invoice is created',
		defaults: {
			name: 'New invoice trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'StripeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook URL',
				name: 'webhookurl',
				type: 'string',
				default: 'some value',
				description: 'WebhookURL where you want to reciebe notification about new invoices',
			},
		],
	};

	//@ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookurl = this.getNodeWebhookUrl('default');
				//const apikey = this.getNodeParameter('apikey') as string
				const webhookData = this.getWorkflowStaticData('node');
				const credentials = (await this.getCredentials('StripeApi')) as IDataObject;
				console.log(credentials);
				const apikey = credentials.authorization;

				const response = await this.helpers.request({
					url: 'https://api.stripe.com/v1/webhook_endpoints',
					headers: {
						Authorization: `Bearer ${apikey}`,
					},
					method: 'GET',
				});

				const responseParse = JSON.parse(response);

				if (responseParse.data.length !== 0) {
					for (const item of responseParse.data) {
						if (item.url === webhookurl) {
							webhookData.webhookId = item.id;
							console.log('Already subscribe');
							return true;
						}
					}
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookurl = this.getNodeWebhookUrl('default');
				//const apikey = this.getNodeParameter('apikey') as string
				const credentials = (await this.getCredentials('StripeApi')) as IDataObject;

				const apikey = credentials.authorization;
				const response = await this.helpers.request({
					url: `https://api.stripe.com/v1/webhook_endpoints?url=${webhookurl}&enabled_events[]=invoiceitem.created`,
					headers: {
						Authorization: `Bearer ${apikey}`,
					},
					method: 'POST',
				});
				const responseParse = JSON.parse(response);

				console.log(responseParse.id);
				const webhookId = responseParse.id;
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = webhookId;
				// TODO: Add HMAC-validation once either the JSON data can be used for it or there is a way to access the binary-payload-data
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				//const apikey = this.getNodeParameter('apikey') as string
				const webhookData = this.getWorkflowStaticData('node');
				// TODO: Add HMAC-validation once either the JSON data can be used for it or there is a way to access the binary-payload-data
				const credentials = (await this.getCredentials('StripeApi')) as IDataObject;

				const apikey = credentials.authorization;
				try {
					await this.helpers.request({
						url: `https://api.stripe.com/v1/webhook_endpoints/${webhookData.webhookId}`,
						headers: {
							Authorization: `Bearer ${apikey}`,
						},
						method: 'DELETE',
					});
				} catch (error) {
					return false;
				}
				delete webhookData.webhookId;
				return true;
			},
		},
	};
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [this.helpers.returnJsonArray(req.body)],
		};
	}
}

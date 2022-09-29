import {
    IHookFunctions,
    IWebhookFunctions,
 } from 'n8n-core';
 
 import {
    IDataObject,
    INodeType,
    INodeTypeDescription,
    IWebhookResponseData,
 } from 'n8n-workflow';
import { head } from 'request-promise-native';

import {
	autofriendApiRequest,
} from './GenericFunctions';

import {
	snakeCase,
} from 'change-case';
 
 
 export class NewInvoiceTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'NewInvoiceTrigger',
        name: 'newInvoiceTrigger',
        icon: 'file:autofriend.svg',
        group: ['trigger'],
        version: 1,
        subtitle: '={{$parameter["event"]}}',
        description: 'Handle Autofriend events via webhooks',
        defaults: {
            name: 'Autofriend Trigger',
            color: '#6ad7b9',
        },
        inputs: [],
        outputs: ['main'],
        credentials: [
            {
                name: 'Stripe',
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
        properties: 
        [
            {
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-simplify
				displayName: 'Webhook URL',
				name: 'webhookurl',
				type: 'string',
				default: "some value",
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-simplify
				description:
					'WebhookURL where you want to reciebe notification about new invoices',
			},
            {
                displayName: 'API KEY',
				name: 'apikey',
				type: 'string',
				default: "sk_test_", //sk_test_51Kqfe8HFxoAnKny1eia7VEOjkVNPOrTRjEstTmD1FcYli6dSVJixoyv0YCWm560t3Rmyf1tvA8welpaQtthq4MN10055svZXCr
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-simplify
				description:
					'Put your api key starting in sk_test_',
            }
        ],
    };

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookurl = this.getNodeParameter('webhookurl') as string;
                const apikey = this.getNodeParameter('apikey') as string
                const webhookData = this.getWorkflowStaticData('node');

                const response = await this.helpers.request({
                    url: 'https://api.stripe.com/v1/webhook_endpoints',
                    headers: {
                        "Authorization": `Bearer ${apikey}`
                    },
                    method: "GET"
                })
				const responseParse = JSON.parse(response)
               
                if(responseParse.data.length != 0){
                    for (const item of responseParse.data) {
                        if (item.url === webhookurl) {
                            webhookData.webhookId = item.id;
                            console.log("Already subscribe")
                            return true;
                        }
                    }
                }
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				
				const webhookurl = this.getNodeParameter('webhookurl') as string;
                const apikey = this.getNodeParameter('apikey') as string
                
                const response = await this.helpers.request({
                    url: `https://api.stripe.com/v1/webhook_endpoints?url=${webhookurl}&enabled_events[]=invoiceitem.created`,
                    headers: {
                        "Authorization": `Bearer ${apikey}`,
                    },
                    method: "POST"
                })
                const responseParse = JSON.parse(response)
               
                console.log(responseParse.id)
                const webhookId = responseParse.id
                const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = webhookId;
				// TODO: Add HMAC-validation once either the JSON data can be used for it or there is a way to access the binary-payload-data
				return true;
			},
           
            async delete(this: IHookFunctions): Promise<boolean> {
                
                const apikey = this.getNodeParameter('apikey') as string
                const webhookData = this.getWorkflowStaticData('node');
				// TODO: Add HMAC-validation once either the JSON data can be used for it or there is a way to access the binary-payload-data
				
                try {
                    const response = await this.helpers.request({
                        url: `https://api.stripe.com/v1/webhook_endpoints/${webhookData.webhookId}`,
                        headers: {
                            "Authorization": `Bearer ${apikey}`,
                        },
                        method: "DELETE"
                    })
                    
                } catch (error) {
                    return false;
                }
                delete webhookData.webhookId;
                return true;
            },
        }
    }
    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const req = this.getRequestObject();
        return {
            workflowData: [
                this.helpers.returnJsonArray(req.body),
            ],
    };
 }}
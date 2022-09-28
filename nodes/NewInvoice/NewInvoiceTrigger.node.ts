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
 
 /*
 import {
     autofriendApiRequest,
 } from './GenericFunctions';
 
 import {
     snakeCase,
 } from 'change-case';
 */
 
 
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
        credentials: [],
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
				displayName: 'Simplify Answers',
				name: 'simplifyAnswers',
				type: 'string',
				default: "some value",
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-simplify
				description:
					'Whether to convert the answers to a key:value pair ("FIELD_TITLE":"USER_ANSER") to be easily processable',
			},
        ],
    };
    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        return {
            workflowData: [],
        };
    }
 }
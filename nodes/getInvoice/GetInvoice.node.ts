import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';
// Create the FriendGrid class

export class GetInvoice implements INodeType {
    description: INodeTypeDescription = {
       
        displayName: 'Get invoice',
        name: 'getinvoice',
        icon: 'file:stripe-logo.jpg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Retrieves the invoice with the given ID',
        defaults: {
            name: 'getInvoice',
            color: 'cb3234'
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'Stripe',
                required: true,
            },
        ],
        requestDefaults: {
            baseURL: 'https://api.stripe.com/v1',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
        //add resources 
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Invoice',
                        value: 'invoice',
                    },
                ],
                default: 'invoice',
                noDataExpression: true,
                required: true,
                description: 'Create a new contact',
            },
            // Operations will go here
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'invoice',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Look invoice by ID',
                        value: 'lookbyid',
                        description: 'Look invoice by ID',
                        action: 'Look invoice by ID',
                    },
                ],
                default: 'lookbyid',
                noDataExpression: true,
            },
            {
                displayName: 'invoiceID',
                name: 'invoiceid',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'lookbyid',
                        ],
                        resource: [
                            'invoice',
                        ],
                    },
                },
                default:'',
                placeholder: 'Invoice ID',
                description:'Invoice ID you are looking for',
            },
            //optional fields
        ],
    }

    // The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        let responseData;
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        // For each item, make an API call to create a contact
        for (let i = 0; i < items.length; i++) {
            if (resource === 'invoice') {
                if (operation === 'lookbyid') {
                    // Get email input
                    const id = this.getNodeParameter('invoiceid', i) as string;
                    // Get additional fields input
                    // const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                    // const data: IDataObject = {
                    //     email,
                    // };

                    // Object.assign(data, additionalFields);

                    // Make HTTP request according to https://sendgrid.com/docs/api-reference/
                    const options: OptionsWithUri = {
                        headers: {
                            'Accept': 'application/json',
                            
                        },
                        method: 'get',
                        body: {
                            // contacts: [
                            //     data,
                            // ],
                        },
                        uri: `https://api.stripe.com/v1/invoices/`+id,
                        json: true,
                    };
                    responseData = await this.helpers.requestWithAuthentication.call(this, 'Stripe', options); //authenticate method
                    returnData.push(responseData);
                }
            }
        }
        // Map data to n8n data structure
        return [this.helpers.returnJsonArray(returnData)];
	}
}

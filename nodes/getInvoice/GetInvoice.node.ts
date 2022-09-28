import { INodeType, INodeTypeDescription } from 'n8n-workflow';
// Create the FriendGrid class

export class GetInvoice implements INodeType {
    description: INodeTypeDescription = {
       
        displayName: 'Get invoice',
        name: 'getinvoice',
        icon: 'file:nasapics.svg',
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
                type: 'string',
                default: 'n8n',
	            description: 'The name of the user',
            },
            // Operations will go here
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                // displayOptions: {
                //     show: {
                //         resource: [
                //             'astronomyPictureOfTheDay',
                //         ],
                //     },
                // },
                options: [
                    {
                        name: 'Get',
                        value: 'get',
                        action: 'Get the Invoice by id',
                        description: 'Get the Invoice by id',
                        routing: {
                            request: {
                                method: 'GET',
                                url: '/invoices/={{$parameter["resource"]}}', //in_1LkrnsHFxoAnKny1pKiX44M5
                            },
                        },
                    },
                ],
                default: 'get',
            }
        ],
    }
}

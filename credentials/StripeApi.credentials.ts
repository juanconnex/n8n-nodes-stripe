import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class StripeApi implements ICredentialType {
	name = 'StripeApi';
	displayName = 'Stripe API';
	// Uses the link to this tutorial as an example
	// Replace with your own docs links when building your own nodes
	documentationUrl = 'https://api.stripe.com/v1/charges';
	properties: INodeProperties[] = [
		{
			displayName: 'Authorization',
			name: 'authorization',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: 'https://api.stripe.com/v1/charges',
		},
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.authorization}}',
			},
		},
	} as IAuthenticateGeneric;
}

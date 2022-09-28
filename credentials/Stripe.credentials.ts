import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Stripe implements ICredentialType {
	name = 'Stripe';
	displayName = 'Stripe';
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
		}
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				//sk_test_51Kqfe8HFxoAnKny1eia7VEOjkVNPOrTRjEstTmD1FcYli6dSVJixoyv0YCWm560t3Rmyf1tvA8welpaQtthq4MN10055svZXCr
				'Authorization': '={{"Bearer " + $credentials.authorization}}'
			}
		},
	} as IAuthenticateGeneric;
}
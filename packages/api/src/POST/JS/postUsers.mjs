export const handler = async (event) => {
	// console.log({event});
	const {httpMethod, stageVariables, path, requestContext, queryStringParameters} = event;
	const {DB, REGION, TABLE_USERS, KEYSPACE, TOKEN} = stageVariables;

	// Return if the required params are not present
	if (!Object.keys(queryStringParameters).includes('cat') || !Object.keys(queryStringParameters).includes('email') || !Object.keys(queryStringParameters).includes('name')) {
		return {
			statusCode: 400, body: JSON.stringify({
				message: 'Missing required parameter',
			}),
		};
	}

	const host = `https://${DB}-${REGION}.apps.astra.datastax.com`

	if (httpMethod !== 'POST') {
		return {
			statusCode: 405, body: JSON.stringify({error: 'Method not allowed'})
		};
	}

	if (path.split('/')[1] !== 'users') {
		return {
			statusCode: 404, body: JSON.stringify({error: 'Not Found'}),
		};
	}

	const evaluatedPath = `/api/rest/v2/keyspaces/${KEYSPACE}/${TABLE_USERS}`;

	const headers = {
		'content-type': 'application/json',
		'x-cassandra-token': TOKEN,
		'Access-Control-Allow-Origin': requestContext?.domainName ?? "*", //TODO: add func to filter origins
	}

	const respPromise = await fetch(host + evaluatedPath, {
		method: httpMethod, headers: headers, body: JSON.stringify(queryStringParameters),
	})
	const respParsed = await respPromise.json();
	return {
		statusCode: 201, body: JSON.stringify(respParsed),
	};
};
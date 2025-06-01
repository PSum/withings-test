require('dotenv').config();
const axios = require('axios');
const qs = require('qs');

const {
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI,
	AUTH_CODE,
} = process.env;

async function getAccessToken() {
	const response = await axios.post(
		'https://wbsapi.withings.net/v2/oauth2',
		qs.stringify({
			action: 'requesttoken',
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code: AUTH_CODE,
			redirect_uri: REDIRECT_URI,
		}),
		{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
	);

	return response.data.body.access_token;
}

async function getWeightData(accessToken) {
	const url = 'https://wbsapi.withings.net/measure';
	const params = {
		action: 'getmeas',
		meastype: 1,
		category: 1,
		startdate: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30,
		enddate: Math.floor(Date.now() / 1000),
	};

	const response = await axios.post(
		url,
		qs.stringify(params),
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);

	const groups = response.data.body.measuregrps;
	const result = groups.map(g => {
		const m = g.measures.find(x => x.type === 1);
		return {
			date: new Date(g.date * 1000),
			kg: m.value * 10 ** m.unit,
		};
	});

	console.log(result);
}

(async () => {
	const token = await getAccessToken();
	await getWeightData(token);
})();

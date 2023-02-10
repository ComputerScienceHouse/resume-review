const fetch = require('node-fetch');
const config = require('./config');

async function sendSlackMessage(fullName, userName) {

	if (!config.slackWebhookURL) {
		return
	}

	const webhookURL = config.slackWebhookURL

	let message = `${fullName} Uploaded a new <https://resumes.csh.rit.edu/resumes/view/user/${userName})!|Resume!>`;

	const body = {
		text: message,
		mrkdwn: true
	}

	try {
		const response = await fetch(webhookURL, {
			method: 'post',
			body: JSON.stringify(body),
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		console.log(error);
	}
}

module.exports = sendSlackMessage

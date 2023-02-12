import fetch from 'node-fetch';
import config from './config.js';
import schedule from 'node-schedule';
import db from './db/index.js';

/**
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
*/
// Runs every day at 13:00
const job = schedule.scheduleJob('0 0 13 * * *', async function() {
	const authors = await db.resumes.fetchRecentUploders()
	await sendSlackMessage(authors);
})

async function sendSlackMessage(authors) {

	if (authors.length == 0) { return }

	if (!config.slackWebhookURL) { return }

	const webhookURL = config.slackWebhookURL

	// Slack markdown formatting info can be found here: https://api.slack.com/reference/surfaces/formatting#block-formatting
	let messageString = "The following CSHers have uploaded resumes in the past 24 Hours:\n";

	authors.forEach((author) => {
		// Believe it or not, this is Slack's recommendation for creating lists (see lists section of the above list)
		messageString += `• <https://resumes.csh.rit.edu/resumes/view/user/${author.author}|${author.author}>\n`
	})

	messageString += "\nYou should check them out!"

	const body = {
		text: messageString,
		mrkdwn: true
	}

	try {
		const response = await fetch(webhookURL, {
			method: 'post',
			body: JSON.stringify(body),
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) { }
}

export default sendSlackMessage

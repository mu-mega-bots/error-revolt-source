const { Client } = require("revolt.js")
const {token, dsn} = require('./config.json')
const { readdir } = require("fs/promises");
const { join } = require("path");
const Sentry = require('@sentry/node');

// Create a new client instance
let client = new Client({
    autoReconnect: true
    
});

client.on("ready", async () => {
    console.info(`Logged in as ${client.user.username}!`);
    try {
        await client.api.patch(`/users/@me`, {
            status: {
                text: "Error 404",
                presence: "Focus"
            }
        });
        console.info("Status updated successfully!");
    } catch (error) {
        console.error("Failed to update status:", error);
        Sentry.captureException(error);
    }
});

Sentry.init({

    dsn: dsn

  });

client.commands = new Map();

async function getRandomImage(statusCode) {
    const baseUrls = [ // you may express more URLs here
        "https://http.cat/",
        "https://httpstatusdogs.com/img/",
        "https://http.pizza/",
        "https://http.dog/static/codes/dogs/small/",
        "https://httpducks.com/",
        "https://httpgoats.com/",
        "https://httpcats.com/",
        "https://http.garden/",
        "https://http.fish/"
    ];

    const urls = baseUrls.map(baseUrl => `${baseUrl}${statusCode}.jpg`);
    const shuffledUrls = urls.sort(() => 0.5 - Math.random());

    for (const url of shuffledUrls) {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            // Check if the URL is a 404 image
            const imageResponse = await fetch(url);
            if (statusCode !== "404" && imageResponse.url.includes("404")) {
                continue;
            }
            return url;
        }
    }

    return `Error 404: No images found for status code ${statusCode}. Please provide a valid status code.`;
}

const prefix = "!err"; // change the prefix if you'd like

client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(prefix) || msg.author?.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const statusCode = args[0];
    console.log('Received:', statusCode);

    if (statusCode === 'help') {
        const helpembed = { // PLEASE KEEP ALL RVLT.GG LINKS REFFERING TO THE PUBLIC REVOLT VERSION OF LOG IT AND THE MEGA UTILITIES SERVER IF YOU ARE GOING TO USE THIS! PLEASE DO NOT PUBLICALLY HOST AND ONLY USE THIS FOR PERSONAL USE
            color: `6118369`,
            title: 'Bot Information',
            description: `[Created by Mega Bots](https://rvlt.gg/d921cr9H)\nWhat's Error?\n\nError is your http status code return bot :) oops 404 **to use error just say for example: !err 404\nThis is an open source bot if you wish to use the public version of the bot press [here](https://app.revolt.chat/bot/01J83YX2FBJMJZ4QW0MXSF1H33)\n[Source Code](https://github.com/mu-mega-bots/error-revolt-source)\n\nCreated by Mega Bots. A division of Mega Utilities Company`,
            footer: { text:'Error is created by Mega Bots. A division of Mega Utilities Company' }
     }
        await msg.channel.sendMessage({ embeds: [helpembed] })
    }

    if (statusCode) {
        const imageUrl = await getRandomImage(statusCode);
        await msg.channel.sendMessage(imageUrl);
    } else {
        await msg.channel.sendMessage("Please provide a valid status code.");
    }
});
client.loginBot(token)
import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.on(Events.MessageCreate, async (message) => {
    console.log(message.content);
    if (!message.author.bot) {

        if (message.attachments.size > 0) {
            message.attachments.forEach(async (attachment) => {
                // Log each attachment URL
                console.log(attachment.url);
                const filename = path.basename(attachment.url);
                const filepath = path.join('local_downloads', filename);

                // Ensure the directory exists
                fs.mkdirSync(path.dirname(filepath), { recursive: true });

                // Fetch the attachment using node-fetch and save it locally
                const response = await fetch(attachment.url);
                const buffer = await response.buffer();
                fs.writeFile(filepath, buffer, () =>
                    console.log(`Downloaded and saved attachment to ${filepath}`)
                );

                message.channel.send(`Attachment received: ${attachment.url}`);
            });
        }

        // const channel = message.channel; // This channel is where the message was sent
        // if (channel) {
        //     await channel.send(`${message.content} Your mom`).catch(console.error);
        // } else {
        //     console.log('Unexpectedly, the channel could not be found');
        // }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
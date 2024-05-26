import { Collection } from 'discord.js';

export async function searchForFileInServer(guild, fileName) {
    const channels = guild.channels.cache.filter(channel => channel.isTextBased());

    for (const [channelId, channel] of channels) {
        let lastMessageId;
        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) {
                break;
            }

            for (const message of messages.values()) {
                for (const attachment of message.attachments.values()) {
                    if (attachment.name === fileName) {
                        return message;
                    }
                }
            }

            lastMessageId = messages.last().id;
            // Delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }

    return null;
}

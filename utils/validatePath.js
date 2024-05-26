import { MessageCollector } from 'discord.js';

export async function validatePath(interaction, FileManagementSystem, pathOption) {
    const filter = response => response.author.id === interaction.user.id;

    while (!FileManagementSystem.validatePath(pathOption)) {
        await interaction.followUp({ content: `The path "${pathOption}" does not exist. Please provide a valid path.`, ephemeral: true });

        const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 60000, // 30 seconds to respond
            errors: ['time'],
        }).catch(() => {
            interaction.followUp({ content: 'You did not provide a valid path in time. Please try again.', ephemeral: true });
            return null;
        });

        if (!collected) {
            throw new Error('Path validation timed out');
        }

        pathOption = collected.first().content;
    }

    return pathOption;
}

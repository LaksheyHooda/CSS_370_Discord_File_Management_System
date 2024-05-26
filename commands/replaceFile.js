import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('replacefile')
    .setDescription('Replace an existing file with a new one')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file is located')
            .setRequired (true))
    .addStringOption(option =>
        option.setName('oldfilename')
            .setDescription('The name of the file to be replaced')
            .setRequired (true))
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('The new file to upload')
            .setRequired (true))
    .addStringOption(option =>
        option.setName('newfilename')
            .setDescription('The name of the new file')
            .setRequired (false));

export async function execute(interaction, FileManagementSystem) {
    const oldFileName = interaction.options.getString('oldfilename');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string
    const newFileName = interaction.options.getString('newfilename') || oldFileName;
    const attachment = interaction.options.getAttachment('file');

    // Validate the path
    if (!FileManagementSystem.validatePath(pathOption)) {
        return interaction.reply({ content: `The path "${pathOption}" does not exist. Please provide a valid path.`, ephemeral: true });
    }

    // Search for the message containing the file to be replaced
    const channel = interaction.channel;
    let messageToDelete = null;

    // Fetch the last 100 messages in the channel to search for the file
    await channel.messages.fetch({ limit: 100000 }).then(messages => {
        messages.forEach(message => {
            message.attachments.forEach(attachment => {
                if (attachment.name === oldFileName) {
                    messageToDelete = message;
                }
            });
        });
    });

    // If the message is found, delete it
    if (messageToDelete) {
        await messageToDelete.delete();
        interaction.channel.send({ content: `Message containing the file "${oldFileName}" has been deleted.`, ephemeral: true });
    } else {
        return interaction.reply({ content: `File "${oldFileName}" not found in the server.`, ephemeral: true });
    }

    // Adjust the file structure
    FileManagementSystem.replaceFile(pathOption, oldFileName, newFileName, attachment.url);
    return interaction.reply({ content: `File "${oldFileName}" replaced successfully with "${newFileName}" at path "${pathOption}".`, ephemeral: true });
}

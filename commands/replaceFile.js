import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('replacefile')
    .setDescription('Replace an existing file with a new one from an attachment')
    .addStringOption(option =>
        option.setName('filepath')
            .setDescription('The path of the file to replace')
            .setRequired(true))
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('The new file to attach')
            .setRequired(true));

export async function execute(interaction, fileSystem, saveFileSystem) {
    const filePath = interaction.options.getString('filepath').split('/').filter(Boolean);
    const attachment = interaction.options.getAttachment('file');
    const fileName = filePath.pop();
    let current = fileSystem;

    for (const p of filePath) {
        if (!current[p] || current[p].type !== 'folder') {
            return interaction.reply({ content: `Path "${filePath.join('/')}" does not exist.`, ephemeral: true });
        }
        current = current[p].children;
    }

    if (!current[fileName]) {
        return interaction.reply({ content: `File "${fileName}" does not exist at path "${filePath.join('/')}".`, ephemeral: true });
    }

    current[fileName] = { type: 'file', url: attachment.url };
    saveFileSystem();
    return interaction.reply({ content: `File "${fileName}" at path "${filePath.join('/')}" replaced successfully with the new attachment.`, ephemeral: true });
}

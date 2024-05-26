import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('allfiles')
    .setDescription('Display server file structure');

function generateASCIITree(node, depth = 0) {
    let tree = '';
    for (const [key, value] of Object.entries(node)) {
        if (value.type === 'folder') {
            tree += `${' '.repeat(depth)}|-- ${key}/\n`;
            tree += generateASCIITree(value.children, depth + 2);
        } else {
            tree += `${' '.repeat(depth)}|-- ${key}\n`;
        }
    }
    return tree;
}

export async function execute(interaction, fileSystem) {
    const tree = generateASCIITree(fileSystem);
    return interaction.reply({ content: `\`\`\`\n${tree}\n\`\`\``, ephemeral: true });
}

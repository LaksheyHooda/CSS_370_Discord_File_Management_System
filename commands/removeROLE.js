import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('[ADMIN ONLY] Remove a role from a yser')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to remove the role from')
            .setRequired(true))
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {

    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');

    const member = await interaction.guild.members.fetch({ user: interaction.user.id, force: true });
    const userMember = await interaction.guild.members.fetch({ user: user.id, force: true });

    if (member.roles.cache.find(role => role.name === 'Admin')) {
        if (role && user) {
            userMember.roles.remove(role);
            return interaction.reply({ content: `Role ${role.name} removed from user ${user.username}`, ephemeral: true });
        } else {
            return interaction.reply({ content: 'Role not found.', ephemeral: true });
        }
    }

    return interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
}
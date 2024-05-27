import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('assignrole')
    .setDescription('[ADMIN ONLY] Assign a user a role')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to assign the role to')
            .setRequired(true))
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role to assign')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {

    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');

    const member = await interaction.guild.members.fetch({ user: interaction.user.id, force: true });
    const userMember = await interaction.guild.members.fetch({ user: user.id, force: true });

    if (member.roles.cache.find(role => role.name === 'Admin')) {
        if (role && userMember) {
            userMember.roles.add(role);
            return interaction.reply({ content: `Role ${role.name} assigned to user ${user.username}`, ephemeral: true });
        } else {
            return interaction.reply({ content: 'Role not found.', ephemeral: true });
        }
    } else {
        return interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
}
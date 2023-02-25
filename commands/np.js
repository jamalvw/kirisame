const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('np')
		.setDescription('Display the track currently playing.'),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		if (subscription.queue.length === 0)
			return interaction.reply({ content: 'There\'s nothing playing right now.', ephemeral: true });

		const track = subscription.queue[0];
		const embed = new EmbedBuilder()
			.setColor('#3b88c3')
			.setAuthor({ name: 'Current Track' })
			.setDescription(track.title)
			.setFooter({ text: `Artist: ${track.artist} · Duration: ${hhmmss(track.duration)} · Position: ${subscription.queue.length}` });

		return interaction.reply({ embeds: [embed] });
	},
};
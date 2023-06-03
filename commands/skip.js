const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hhmmss } = require('../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.')
        .addSubcommand(subcommand => subcommand
            .setName('current')
            .setDescription('Skip the current track.'))
		.addSubcommand(subcommand => subcommand
			.setName('track')
			.setDescription('Skip a track at a specified position.')
			.addIntegerOption(option => option
				.setName('position')
				.setDescription('The track\'s position')
                .setRequired(true))),

	async execute(interaction)
	{
		const client = interaction.client;
		const subscription = client.subscriptions.get(interaction.guildId);

        // No music subscription in this VC
		if (!subscription)
			return interaction.reply({ content: 'There\'s no listening party happening right now.', ephemeral: true });

		const queue = subscription.queue;

        // No tracks in queue to skip
		if (queue.length === 0)
			return interaction.reply({ content: 'There\'s nothing playing right now.', ephemeral: true });

		const tracksToSkip = [];

        // Skip a specified track
        if (interaction.options.getSubcommand() == 'track')
        {
            const position = interaction.options.getInteger('position', true);
            
            // Index is outside of range
            if (position < 1 || position > queue.length)
                return interaction.reply({ content: `The queue has **${queue.length}** tracks.`, ephemeral: true });

            tracksToSkip.push(position - 1);
        }
        // Skip the current track
        else
        {
            tracksToSkip.push(0);
        }

        // Remove each track listed in tracksToSkip
        for (const index of tracksToSkip)
        {
            if (index == 0)
                // Stop current track if it's skipped
                subscription.player.stop();
            else
                subscription.queue.splice(index, 1);
        }

        const embed = new EmbedBuilder()
            .setColor('#dd2e44')
            .setAuthor({ name: 'Skipped Tracks' })
            .setDescription(`Skipped **${tracksToSkip.length}** tracks.`);

		return interaction.reply({ embeds: [embed] });
	},
};
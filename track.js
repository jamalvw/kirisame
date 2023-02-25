const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');

class Track
{
	constructor(url, title, artist, duration)
	{
		this.url = url;
		this.title = title;
		this.artist = artist;
		this.duration = duration;
	}

	async createResource()
	{
		const source = await playdl.stream(this.url);
		return createAudioResource(source.stream, { inputType: source.type });
	}
}

const fromUrl = async function(url)
{
	const type = await playdl.validate(url);

	switch (type)
	{
	case 'yt_video':
	{
		const info = await playdl.video_basic_info(url);
		const title = info.video_details.title;
		const artist = info.video_details.channel.name;
		const duration = info.video_details.durationInSec;
		return [new Track(url, title, artist, duration)];
	}
	case 'yt_playlist':
	{
		const info = await playdl.playlist_info(url);

		// User queued a playlist link
		if (url.includes('/playlist'))
		{
			const videos = await info.all_videos();
			return videos.map(video =>
			{
				const link = video.url;
				const title = video.title;
				const artist = video.channel.name;
				const duration = video.durationInSec;
				return new Track(link, title, artist, duration);
			});
		}
		// User queued a video link with a playlist attached
		else
		{
			const video = info.fetched_videos.get('1')[0];
			const title = video.title;
			const artist = video.channel.name;
			const duration = video.durationInSec;
			return [new Track(url, title, artist, duration)];
		}
	}
	case 'so_track':
	{
		const info = await playdl.soundcloud(url);
		const title = info.name;
		const artist = info.user.name;
		const duration = info.durationInSec;
		return [new Track(url, title, artist, duration)];
	}
	}
};

const fromYtSearch = async function(term)
{
	const results = await playdl.search(term, { limit: 1 });

	const url = results[0].url;
	const title = results[0].title;
	const artist = results[0].channel.name;
	const duration = results[0].durationInSec;

	return new Track(url, title, artist, duration);
};

module.exports = { Track, fromUrl, fromYtSearch };
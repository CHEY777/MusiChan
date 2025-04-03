import BaseCommand from '../../libs/BaseCommand.js';
import axios from 'axios';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'instagram',
            aliases: ['ig', 'igdl'],
            description: '📸 Download Instagram posts/reels',
            usage: '[Instagram URL]',
            category: 'media',
            dm: true,
            exp: 5
        });
    }

    exec = async (M) => {
        if (!M.urls.length) return M.reply('❌ Please provide an Instagram URL!');

        const url = M.urls[0];
        try {
            const response = await axios.get(
                'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/post',
                {
                    params: { url },
                    headers: {
                        'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
                        'x-rapidapi-key': process.env.INSTA_API_KEY
                    },
                    timeout: 15000
                }
            );

            const media = response.data;
            if (!media?.media_url) return M.reply('❌ No media found');

            const buffer = await this.client.util.fetchBuffer(media.media_url);
            
            return M.replyRaw({
                [media.media_type === 'image' ? 'image' : 'video']: buffer,
                caption: `📸 Instagram ${media.media_type}\n❤️ Likes: ${media.likes || 'N/A'}`
            });

        } catch (error) {
            console.error('Instagram Error:', error);
            return M.reply(`❌ Failed to download: ${error.response?.data?.message || error.message}`);
        }
    };
}

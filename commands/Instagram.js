import BaseCommand from '../../libs/BaseCommand.js';
import axios from 'axios';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'instagram',
            aliases: ['ig', 'igdl'],
            category: 'media',
            description: {
                content: '📸 Download cute Instagram posts/reels 🎀',
                usage: '[Instagram URL]',
                examples: ['https://www.instagram.com/p/Cg0Y7K2JQ5S/']
            },
            dm: true,
            exp: 5,
            cooldown: 30
        });
    }

    validateUrl(url) {
        const patterns = [
            /instagram\.com\/p\//,
            /instagram\.com\/reel\//,
            /instagram\.com\/tv\//,
            /instagram\.com\/stories\//
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    async exec(M) {
        if (!M.urls.length) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 𝗨𝗥𝗟 📸');
        
        const [url] = M.urls;
        if (!this.validateUrl(url)) {
            return M.reply('❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝗥𝗟. 𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗲𝗱: 𝗣𝗼𝘀𝘁𝘀, 𝗥𝗲𝗲𝗹𝘀, 𝗦𝘁𝗼𝗿𝗶𝗲𝘀 🎀');
        }

        try {
            await M.reply('⏳ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝗳𝗿𝗼𝗺 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺... 📥✨');
            
            const apiUrl = `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'X-RapidAPI-Key': 'your-rapidapi-key',
                    'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com'
                },
                timeout: 15000
            });

            const media = response.data;
            if (!media?.media) return M.reply('❌ 𝗡𝗼 𝗺𝗲𝗱𝗶𝗮 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗽𝗼𝘀𝘁 🌸💔');

            const buffer = await this.client.util.fetchBuffer(media.media);
            
            if (media.type === 'image') {
                return M.replyRaw({
                    image: buffer,
                    caption: `📷 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 𝗣𝗼𝘀𝘁\n❤️ 𝗟𝗶𝗸𝗲𝘀: ${media.likes || 'N/A'}\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻 𝗕𝗼𝘁`
                });
            } else {
                return M.replyRaw({
                    video: buffer,
                    caption: `🎥 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 ${media.is_video ? '𝗩𝗶𝗱𝗲𝗼' : '𝗥𝗲𝗲𝗹'}\n❤️ 𝗟𝗶𝗸𝗲𝘀: ${media.likes || 'N/A'}\n🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻 𝗕𝗼𝘁`
                });
            }
        } catch (error) {
            console.error('Instagram error:', error);
            return M.reply('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗳𝗿𝗼𝗺 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 📸💔');
        }
    }
}

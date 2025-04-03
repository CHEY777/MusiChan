import BaseCommand from '../../libs/BaseCommand.js';
import axios from 'axios';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'instagram',
            aliases: ['ig', 'igdl', '📸', '🎞️'],
            description: {
                content: '📸 Download cute Instagram posts/reels/stories 🎀✨',
                usage: '[Instagram URL]',
                examples: ['https://www.instagram.com/p/Cg0Y7K2JQ5S/']
            },
            category: 'media',
            dm: true,
            exp: 5,
            cooldown: 20
        });
    }

    validateUrl(url) {
        const patterns = [
            /instagram\.com\/p\//,       // Posts 🌸
            /instagram\.com\/reel\//,    // Reels 🎞️
            /instagram\.com\/tv\//,      // IGTV 📺
            /instagram\.com\/stories\//  // Stories 🏙️
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    exec = async (M) => {
        if (!M.urls.length) return M.reply('❌ 𝗣𝘄𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗻 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 𝗨𝗥𝗟! 𝗧𝘆𝗽𝗲 𝗵𝗲𝗹𝗽 𝗳𝗼𝗿 𝗲𝘅𝗮𝗺𝗽𝗹𝗲𝘀~ 🎀');
        
        const [url] = M.urls;
        if (!this.validateUrl(url)) {
            return M.reply('❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝗥𝗹~ 𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗲𝗱:\n'
                + '🌸 𝗣𝗼𝘀𝘁𝘀: instagram.com/p/\n'
                + '🎞️ 𝗥𝗲𝗲𝗹𝘀: instagram.com/reel/\n'
                + '🏙️ 𝗦𝘁𝗼𝗿𝗶𝗲𝘀: instagram.com/stories/');
        }

        try {
            await M.reply('⏳ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗰𝘂𝘁𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁... 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁~ 🎀✨');
            
            const response = await axios.get(
                'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/post',
                {
                    params: { url },
                    headers: {
                        'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
                        'x-rapidapi-key': process.env.INSTA_API_KEY,
                        'accept': 'application/json'
                    },
                    timeout: 20000
                }
            );

            const media = response.data;
            if (!media?.media_url) return M.reply('❌ 𝗢𝗼𝗽𝘀! 𝗡𝗼 𝗺𝗲𝗱𝗶𝗮 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗽𝗼𝘀𝘁~ 🌸💔');

            const buffer = await this.client.util.fetchBuffer(media.media_url);
            const mediaType = media.media_type === 'image' ? 'image' : 'video';
            
            return M.replyRaw({
                [mediaType]: buffer,
                caption: `✨ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱! 🎀\n`
                       + `📸 𝗧𝘆𝗽𝗲: ${this.getMediaTypeEmoji(media.media_type)} ${media.media_type}\n`
                       + `❤️ 𝗟𝗶𝗸𝗲𝘀: ${media.likes || '~𝗡/𝗔~'}\n`
                       + `👤 𝗨𝘀𝗲𝗿: ${media.username || '~𝗨𝗻𝗸𝗻𝗼𝘄𝗻~'}\n`
                       + `🎀 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻'𝘀 𝗯𝗼𝘁 ✨`,
                contextInfo: {
                    externalAdReply: {
                        title: `📸 𝗜𝗻𝘀𝘁𝗶𝗴𝗿𝗮𝗺 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿`,
                        body: `🌸 𝗚𝗲𝘁 𝘆𝗼𝘂𝗿 𝗰𝘂𝘁𝗲 𝗺𝗲𝗱𝗶𝗮!`,
                        thumbnail: buffer,
                        mediaType: 1,
                        sourceUrl: url
                    }
                }
            });

        } catch (error) {
            console.error('Instagram Error:', error);
            const errorMsg = error.response?.data?.message || error.message;
            return M.reply(`❌ 𝗢𝗼𝗽𝘀! 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱:\n`
                         + `💔 ${errorMsg || 'Unknown error'}\n`
                         + `✨ 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿~`);
        }
    };

    getMediaTypeEmoji(type) {
        return {
            image: '🌸',
            video: '🎞️',
            reel: '🎬',
            story: '🏙️'
        }[type] || '📸';
    }
}

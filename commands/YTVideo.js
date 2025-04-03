import BaseCommand from '../../libs/BaseCommand.js';
import YT from '../../utils/YT.js';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'ytvideo',
            aliases: ['ytv'],
            category: 'media',
            description: {
                content: '🎬 Download videos from YouTube with cute quality ✨',
                usage: '[YT link]',
                examples: ['https://youtu.be/dQw4w9WgXcQ']
            },
            dm: true,
            exp: 5,
            cooldown: 30
        });
    }

    exec = async (M) => {
        if (!M.urls.length) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗨𝗥𝗟 🎥');
        
        try {
            const [url] = M.urls;
            const video = new YT(url, 'video');
            
            if (!video.validateURL()) return M.reply('❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗨𝗥𝗟 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱 🧸');
            
            const { videoDetails } = await video.getInfo();
            await M.reply(`🔍 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘃𝗶𝗱𝗲𝗼... 🎞️\n*${videoDetails.title}*`);
            
            const { buffer, mimetype } = await video.getBuffer();
            
            return M.replyRaw({
                video: buffer,
                mimetype,
                caption: `✨ *𝗧𝗶𝘁𝗹𝗲*: ${videoDetails.title}\n⏳ *𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻*: ${videoDetails.lengthSeconds}s\n🌸 *𝗖𝗵𝗮𝗻𝗻𝗲𝗹*: ${videoDetails.author.name}`,
                contextInfo: {
                    externalAdReply: {
                        title: `🎥 ${videoDetails.title}`,
                        body: `🎀 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻`,
                        thumbnail: await this.client.util.fetchBuffer(videoDetails.thumbnails[0].url),
                        mediaType: 2,
                        sourceUrl: videoDetails.video_url
                    }
                }
            });
        } catch (error) {
            console.error('YTVideo error:', error);
            return M.reply(`❌ 𝗢𝗼𝗽𝘀! ${error.message.includes('too long') ? 
                '𝗩𝗶𝗱𝗲𝗼 𝗶𝘀 𝘁𝗼𝗼 𝗹𝗼𝗻𝗴 (𝗺𝗮𝘅 𝟭𝟬 𝗺𝗶𝗻𝘂𝘁𝗲𝘀) ⏰✨' : 
                '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝘃𝗶𝗱𝗲𝗼 🎥💔'}`);
        }
    };
}

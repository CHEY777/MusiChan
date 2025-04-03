import BaseCommand from '../../libs/BaseCommand.js';
import YT from '../../utils/YT.js';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'ytaudio',
            aliases: ['yta'],
            category: 'media',
            description: {
                content: '🎵 Download high quality audio from YouTube 🎧',
                usage: '[YT link]',
                examples: ['https://youtu.be/dQw4w9WgXcQ']
            },
            dm: true,
            exp: 5,
            cooldown: 30
        });
    }

    exec = async (M) => {
        if (!M.urls.length) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗨𝗥𝗟 🎬');
        
        try {
            const [url] = M.urls;
            const video = new YT(url, 'audio');
            
            if (!video.validateURL()) return M.reply('❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗨𝗥𝗟 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝗱 🧸');
            
            const { videoDetails } = await video.getInfo();
            await M.reply(`🔍 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗮𝘂𝗱𝗶𝗼... 🎶\n*${videoDetails.title}*`);
            
            const { buffer, mimetype, filename } = await video.getBuffer();
            
            return M.replyRaw({
                audio: buffer,
                mimetype,
                fileName: filename,
                contextInfo: {
                    externalAdReply: {
                        title: `🎧 ${videoDetails.title}`,
                        body: `⏳ ${videoDetails.lengthSeconds}s | 🎀 Powered by Chey-San`,
                        thumbnail: await this.client.util.fetchBuffer(videoDetails.thumbnails[0].url),
                        mediaType: 2,
                        sourceUrl: videoDetails.video_url
                    }
                }
            });
        } catch (error) {
            console.error('YTAudio error:', error);
            return M.reply(`❌ 𝗢𝗼𝗽𝘀! ${error.message.includes('too long') ? 
                '𝗔𝘂𝗱𝗶𝗼 𝗶𝘀 𝘁𝗼𝗼 𝗹𝗼𝗻𝗴 (𝗺𝗮𝘅 𝟭𝟬 𝗺𝗶𝗻𝘂𝘁𝗲𝘀) ⏰✨' : 
                '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗮𝘂𝗱𝗶𝗼 🎧💔'}`);
        }
    };
}

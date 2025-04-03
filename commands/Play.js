import BaseCommand from '../../libs/BaseCommand.js';
import YT from '../../utils/YT.js';
import yts from 'yt-search';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'play',
            category: 'media',
            description: {
                content: '🎧 Play music directly from YouTube 🎶',
                usage: '[song name]',
                examples: ['Never Gonna Give You Up']
            },
            dm: true,
            exp: 5,
            cooldown: 15
        });
    }

    exec = async (M, { text }) => {
        if (!text) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘀𝗼𝗻𝗴 𝗻𝗮𝗺𝗲 🎵');
        
        try {
            const { videos } = await yts(text);
            if (!videos?.length) return M.reply('❌ 𝗡𝗼 𝗺𝗮𝘁𝗰𝗵𝗶𝗻𝗴 𝘀𝗼𝗻𝗴𝘀 𝗳𝗼𝘂𝗻𝗱 🎶💔');
            
            const video = videos[0];
            const yt = new YT(video.url, 'audio');
            const { videoDetails } = await yt.getInfo();
            
            await M.reply(`🎶 𝗡𝗼𝘄 𝗽𝗹𝗮𝘆𝗶𝗻𝗴... 💫\n*${videoDetails.title}*`);
            
            const { buffer, mimetype, filename } = await yt.getBuffer();
            
            return M.replyRaw({
                audio: buffer,
                mimetype,
                fileName: filename,
                contextInfo: {
                    externalAdReply: {
                        title: `🎵 ${videoDetails.title}`,
                        body: `✨ 𝗕𝘆 ${videoDetails.author.name}`,
                        thumbnail: await this.client.util.fetchBuffer(videoDetails.thumbnails[0].url),
                        mediaType: 2,
                        sourceUrl: videoDetails.video_url
                    }
                }
            });
        } catch (error) {
            console.error('Play error:', error);
            return M.reply(`❌ 𝗢𝗼𝗽𝘀! ${error.message.includes('too long') ? 
                '𝗔𝘂𝗱𝗶𝗼 𝗶𝘀 𝘁𝗼𝗼 𝗹𝗼𝗻𝗴 (𝗺𝗮𝘅 𝟭𝟬 𝗺𝗶𝗻𝘂𝘁𝗲𝘀) ⏰✨' : 
                '𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗽𝗹𝗮𝘆 𝗮𝘂𝗱𝗶𝗼 🎧💔'}`);
        }
    };
}

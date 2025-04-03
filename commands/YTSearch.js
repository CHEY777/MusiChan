import BaseCommand from '../../libs/BaseCommand.js';
import yts from 'yt-search';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'ytsearch',
            aliases: ['yts'],
            category: 'media',
            description: {
                content: '🔍 Search YouTube with cute results 🌸',
                usage: '[search query]',
                examples: ['Never Gonna Give You Up']
            },
            dm: true,
            exp: 5
        });
    }

    exec = async (M, { text }) => {
        if (!text.trim()) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘀𝗲𝗮𝗿𝗰𝗵 𝘁𝗲𝗿𝗺 🔍');
        
        try {
            const { videos } = await yts(text);
            if (!videos.length) return M.reply('❌ 𝗡𝗼 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝘂𝗻𝗱 🌸💔');
            
            let message = '🌸 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝗿: ' + text + '\n\n';
            videos.slice(0, 5).forEach((video, i) => {
                message += `✨ *${i + 1}. ${video.title}*\n`;
                message += `🧸 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${video.author.name}\n`;
                message += `⏳ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.timestamp}\n`;
                message += `🔗 𝗨𝗥𝗟: ${video.url}\n\n`;
            });
            
            return M.reply(message + '🎀 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻 𝗕𝗼𝘁 ✨');
        } catch (error) {
            console.error('YTSearch error:', error);
            return M.reply('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗲𝗮𝗿𝗰𝗵 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 🎀💔');
        }
    };
}

import BaseCommand from '../../libs/BaseCommand.js';
import axios from 'axios';

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'lyrics',
            category: 'media',
            description: {
                content: '🎤 Get lyrics for your favorite songs 🎶',
                usage: '[song name]',
                examples: ['Never Gonna Give You Up']
            },
            dm: true,
            exp: 5
        });
    }

    async exec(M, { text }) {
        if (!text) return M.reply('❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘀𝗼𝗻𝗴 𝗻𝗮𝗺𝗲 🎵');
        
        try {
            await M.reply('🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗳𝗼𝗿 𝗹𝘆𝗿𝗶𝗰𝘀... 📜✨');
            
            const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(text)}`, {
                timeout: 10000
            });

            if (!response.data.lyrics) return M.reply('❌ 𝗡𝗼 𝗹𝘆𝗿𝗶𝗰𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 𝘁𝗵𝗶𝘀 𝘀𝗼𝗻𝗴 🎶💔');
            
            const lyrics = response.data.lyrics.split('\n').slice(0, 100).join('\n');
            return M.reply(`🎵 *𝗟𝘆𝗿𝗶𝗰𝘀 𝗳𝗼𝗿*: ${text}\n\n${lyrics}\n\n...\n\n🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻 𝗕𝗼𝘁 ✨`);
        } catch (error) {
            console.error('Lyrics error:', error);
            return M.reply('❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗰𝗵 𝗹𝘆𝗿𝗶𝗰𝘀 🎤💔');
        }
    }
}

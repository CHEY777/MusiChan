import BaseCommand from '../../libs/BaseCommand.js'

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'menu',
            aliases: ['help'],
            category: 'general',
            description: {
                content: 'Displays the bot menu',
                usage: '!menu'
            },
            dm: true
        })
    }

    exec = async (M) => {
        const gifUrls = [
            "https://i.imgur.com/yBvp0q3.gif",
            "https://i.imgur.com/IAQUddi.gif",
            "https://i.imgur.com/ywJLyoO.gif",
            "https://i.imgur.com/0zUGkop.gif",
            "https://i.imgur.com/5EedMXv.gif",
            "https://i.imgur.com/pAwweeF.gif",
            "https://i.imgur.com/Pg2UGt1.gif"
        ];
        const gifUrl = gifUrls[Math.floor(Math.random() * gifUrls.length)];

        const menuText = `
❣️💕🎀✨💫 *Welcome to ᥴꫝꫀꪗ-𝙎𝙖𝙣's Bot* 💫✨🎀💕❣️

🔹 *Commands List:*  
🎶 🎧 .play [song] - Play music  
🎶 🎧 .ytaudio [link] - Download audio  
🎶 🎧 .ytvideo [link] - Download video  
📜 .lyrics [song] - Get lyrics  
🎥 .instagram [link] - Download IG media  
📺 .ytsearch [query] - Search YouTube  

🌌☄️ *Powered by ᥴꫝꫀꪗ-𝙎𝙖𝙣💫🌙✨* 🌌☄️
        `;
        
        await M.reply(menuText);
        await M.reply(gifUrl); // Sends a random GIF
    }
}

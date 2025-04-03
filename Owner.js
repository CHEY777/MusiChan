import BaseCommand from '../../libs/BaseCommand.js'

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'owner',
            category: 'general',
            description: {
                content: 'Shows the bot owner',
                usage: '!owner'
            },
            dm: true
        })
    }

    exec = async (M) => {
        const ownerInfo = `
🌌 *my darling ᥴꫝꫀꪗ-𝙎𝙖𝙣💫🌙✨* 🌌  

🔭 💫 🌱 I’m currently learning Everything 💜 🎀  
📸 How to reach me Insta 🆔 its_chey7⚡  
💓 Fun fact: I like gaming, music, K-pop or drama, anime, and you✨💓  
        `;

        return void (await M.reply(ownerInfo));
    }
}

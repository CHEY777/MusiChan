import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import CommandHandler from './libs/CommandHandler.js';

// Connection manager
async function connectToWhatsApp() {
    console.log(chalk.yellow('\n🌸 Starting Chey-San Music Bot...'));

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const handler = new CommandHandler();

    const sock = makeWASocket({
        auth: state,
        logger: { level: 'silent' },
        printQRInTerminal: true,
        browser: ['Chey-San Bot', 'Desktop', '1.0.0'],
        markOnlineOnConnect: true
    });

    // QR Code Handler (Double Verification)
    sock.ev.on('connection.update', ({ qr }) => {
        if (qr) {
            console.log(chalk.blue('\n🔍 Scan this QR code within 30 seconds:'));
            qrcode.generate(qr, { small: true });
        }
    });

    // Credentials Saver
    sock.ev.on('creds.update', saveCreds);

    // Connection Status
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.green('\n✅ Connected to WhatsApp!'));
            console.log(chalk.magenta('   Type ".menu" for commands'));
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red(`\n❌ Connection closed. ${shouldReconnect ? 'Reconnecting...' : 'Please restart bot.'}`));
            if (shouldReconnect) setTimeout(connectToWhatsApp, 5000);
        }
    });

    // Message Handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        try {
            const M = {
                from: msg.key.remoteJid,
                body: msg.message.conversation || msg.message.extendedTextMessage?.text || '',
                urls: (msg.message.extendedTextMessage?.matchedText || '').match(/(https?:\/\/[^\s]+)/g) || [],
                reply: (text) => sock.sendMessage(msg.key.remoteJid, { text }),
                replyRaw: (content) => sock.sendMessage(msg.key.remoteJid, content)
            };
            await handler.handle(M);
        } catch (e) {
            console.log(chalk.red('Command error:'), e.message);
        }
    });
}

// Start with error handling
connectToWhatsApp().catch(err => {
    console.log(chalk.red('Startup error:'), err.message);
    setTimeout(connectToWhatsApp, 10000);
});

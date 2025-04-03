import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import CommandHandler from './libs/CommandHandler.js';

// 🌸 Cute console styling
const successLog = (text) => console.log(chalk.green(`✨ ${text}`));
const errorLog = (text) => console.log(chalk.red(`❌ ${text}`));
const infoLog = (text) => console.log(chalk.blue(`ℹ️ ${text}`));

async function connectToWhatsApp() {
  try {
    // 🎀 Initialize auth state
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const handler = new CommandHandler();

    // ✨ Create connection
    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // We'll make our own QR
      browser: ['Chey-San Bot', 'Safari', '3.0'],
      markOnlineOnConnect: true
    });

    // 💖 QR Code Generator
    sock.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        infoLog('Scan this QR with WhatsApp:');
        qrcode.generate(qr, { small: true });
      }
    });

    // 🎀 Save credentials when updated
    sock.ev.on('creds.update', saveCreds);

    // 🌸 Connection status handler
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        errorLog(`Connection closed. ${shouldReconnect ? 'Reconnecting...' : 'Please restart bot.'}`);
        if (shouldReconnect) setTimeout(connectToWhatsApp, 5000);
      } else if (connection === 'open') {
        successLog('Successfully connected to WhatsApp!');
      }
    });

    // 📩 Message handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const M = {
          from: msg.key.remoteJid,
          sender: msg.key.participant || msg.key.remoteJid,
          body: msg.message.conversation || 
                msg.message.extendedTextMessage?.text || '',
          urls: (msg.message.extendedTextMessage?.matchedText || '')
                .match(/(https?:\/\/[^\s]+)/g) || [],
          reply: (content, type = 'text') => {
            if (type === 'text') return sock.sendMessage(msg.key.remoteJid, { text: content });
            if (type === 'image') return sock.sendMessage(msg.key.remoteJid, { image: { url: content } });
            if (type === 'video') return sock.sendMessage(msg.key.remoteJid, { video: { url: content } });
          },
          replyRaw: (content) => sock.sendMessage(msg.key.remoteJid, content)
        };

        await handler.handle(M);
      } catch (e) {
        errorLog(`Message handling error: ${e.message}`);
      }
    });

  } catch (err) {
    errorLog(`Connection error: ${err.message}`);
    setTimeout(connectToWhatsApp, 10000); // Reconnect after 10 seconds
  }
}

// 🎀 Startup banner
console.log(chalk.yellow(`
╔════════════════════════════╗
║                            ║
║   🌸 Chey-San Music Bot 🎶  ║
║                            ║
╚════════════════════════════╝
`));

// Start the bot
connectToWhatsApp();

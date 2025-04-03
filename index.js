import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import CommandHandler from './libs/CommandHandler.js';

// 🌸 Cute connection messages
const cuteLog = (text) => console.log(chalk.magenta(`🌸 ${text} ✨`));
const errorLog = (text) => console.log(chalk.red(`❌ ${text} 💔`));

async function connectToWhatsApp() {
  // 🎀 Initialize auth and command handler
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const handler = new CommandHandler();

  // ✨ Create socket with cute logger
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }), // No annoying logs!
    printQRInTerminal: false, // We'll make our own cute QR!
    browser: ['Chey-San Bot', 'Safari', '1.0.0']
  });

  // 🎀 QR Code Generator (cuter than default!)
  sock.ev.on('connection.update', ({ qr }) => {
    if (qr) {
      cuteLog('Scan this QR with WhatsApp~ 🎀');
      qrcode.generate(qr, { small: true });
    }
  });

  // 💖 Save session when credentials update
  sock.ev.on('creds.update', saveCreds);

  // 🌸 Handle connection events
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      errorLog(`Disconnected! ${shouldReconnect ? 'Reconnecting...' : 'Please restart bot.'}`);
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === 'open') {
      cuteLog('Successfully connected to WhatsApp! 💌');
    }
  });

  // 🎀 Message handler (with cute replies!)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const M = {
      from: msg.key.remoteJid,
      body: msg.message.conversation || msg.message.extendedTextMessage?.text || '',
      reply: (text) => sock.sendMessage(msg.key.remoteJid, { text }),
      replyRaw: (content) => sock.sendMessage(msg.key.remoteJid, content)
    };

    try {
      await handler.handle(M);
    } catch (e) {
      errorLog(`Command failed: ${e.message}`);
      M.reply('❌ Oops! Something went wrong~ 💔\n' + e.message);
    }
  });
}

// 🎀 Start with cute splash text
console.log(chalk.yellow(`
🌸✨🎀 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗖𝗵𝗲𝘆-𝗦𝗮𝗻'𝘀 𝗕𝗼𝘁! 🎀✨🌸
`));

connectToWhatsApp().catch(err => errorLog(`Startup failed: ${err.message}`));

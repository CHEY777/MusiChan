import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Command handler
class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.loadCommands();
    }

    async loadCommands() {
        const commandsDir = path.join(__dirname, 'commands');
        const categories = fs.readdirSync(commandsDir);
        
        for (const category of categories) {
            const categoryPath = path.join(commandsDir, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(categoryPath, file);
                const { default: Command } = await import(filePath);
                const command = new Command();
                this.commands.set(command.config.command, command);
                
                if (command.config.aliases) {
                    command.config.aliases.forEach(alias => {
                        this.commands.set(alias, command);
                    });
                }
            }
        }
    }

    async handle(M) {
        const text = M.body || '';
        const command = text.split(' ')[0].toLowerCase();
        const args = text.split(' ').slice(1).join(' ');
        
        if (this.commands.has(command)) {
            const cmd = this.commands.get(command);
            try {
                await cmd.exec(M, { text: args, args: args.split(' ') });
            } catch (error) {
                console.error(error);
                await M.reply('❌ An error occurred while executing the command');
            }
        }
    }
}

// WhatsApp connection
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: { level: 'silent' }
    });

    const handler = new CommandHandler();

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect));
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Connected to WhatsApp'));
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const M = {
            from: msg.key.remoteJid,
            sender: msg.key.participant || msg.key.remoteJid,
            body: msg.message.conversation || msg.message.extendedTextMessage?.text || '',
            urls: (msg.message.extendedTextMessage?.matchedText || '').match(/(https?:\/\/[^\s]+)/g) || [],
            reply: async (content, type = 'text') => {
                if (type === 'text') {
                    return sock.sendMessage(msg.key.remoteJid, { text: content });
                } else if (type === 'video') {
                    return sock.sendMessage(msg.key.remoteJid, { video: content });
                }
            },
            replyRaw: async (content) => {
                return sock.sendMessage(msg.key.remoteJid, content);
            }
        };

        await handler.handle(M);
    });
}

connectToWhatsApp().catch(err => console.error(chalk.red('Connection error:', err)));

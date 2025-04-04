import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

// Simple connection handler
async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: { level: 'silent' }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ qr, connection }) => {
    if (qr) {
      console.log('\n🔍 Scan QR Code:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') console.log('\n✅ Bot Ready! Use .menu');
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    // Command handling logic here
  });
}

connect().catch(err => console.log('Connection error:', err));

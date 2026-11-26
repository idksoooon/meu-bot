const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('BOT PRONTO!');
});

const ignorar = [
    '5511999999999@c.us',
    '5511888888888@c.us',
    '13135550002@c.us', // Meta AI - ignora nossa conversa
    'status@broadcast', // ignora Status
];

const nomesManuais = {
    '5511999999999@c.us': 'Rian (você)', // TROCA PELO SEU NÚMERO
};

client.on('message', async (msg) => {
    if (!msg.body || msg.body.trim() === '') {
        return; // ignora mensagem vazia, tipo as minhas
    }
    if (ignorar.includes(msg.from)) {
        console.log('Ignorado (pais/empresa):', msg.from);
        return;
    }

    // Pega nome sem travar o bot se der erro
    let nomeSalvo = nomesManuais[msg.from] || null;
    let nomePerfil = '';
    try {
        const contato = await msg.getContact();
        if (!nomeSalvo) nomeSalvo = contato.name;
        nomePerfil = contato.pushname || '';
    } catch (e) {
        // se não achar contato, segue só com o número
    }

    const quem = nomeSalvo ? `${nomeSalvo} (${msg.from})` : `${nomePerfil ? nomePerfil + ' ' : ''}(${msg.from})`;
    console.log(`Mensagem de ${quem}: ${msg.body}`);

    const texto = msg.body.toLowerCase();
    const textoOriginal = msg.body;

    if (texto === 'oi') {
        const nomePraFalar = nomeSalvo || nomePerfil || 'tudo bem?';
        msg.reply(`Olá ${nomePraFalar}! Bot funcionando!`);
    }

    if (texto === '?frança') {
        msg.reply('🇫🇷 França! Capital: Paris.');
    }

    if (texto.startsWith('!wiki ')) {
        const termo = textoOriginal.slice(6).trim();
        if (!termo) {
            msg.reply('Manda assim: !wiki França');
            return;
        }
        msg.reply('Pesquisando na Wikipedia... 🔎');
        try {
            const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
            const dados = await res.json();
            if (dados.extract) {
                msg.reply(`📚 *${dados.title}*\n\n${dados.extract.slice(0, 800)}\n\nFonte: ${dados.content_urls.desktop.page}`);
            } else {
                msg.reply(`Não achei "${termo}" na Wikipedia.`);
            }
        } catch (e) {
            msg.reply('Deu erro na pesquisa, tenta de novo.');
        }
    }

    if (texto.startsWith('!google ')) {
        const termo = textoOriginal.slice(8).trim();
        msg.reply(`🔎 Pesquisa no Google:\nhttps://www.google.com/search?q=${encodeURIComponent(termo)}`);
    }
});

client.initialize();

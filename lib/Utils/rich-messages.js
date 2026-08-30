'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.generateLinkContent = exports.generateCodeBlockContent = exports.generateListContent = exports.generateTableContent = exports.sendLink = exports.sendCodeBlock = exports.sendList = exports.sendTable = void 0;

// ─────────────────────────────────────────────
// HELPER: build botForwardedMessage contextInfo
// ─────────────────────────────────────────────
function buildBotContext(options = {}) {
    return {
        isSampled: false,
        botMessageSharingInfo: {
            botType: 'COMPANION',
            botJid: options.botJid || '867051314767696@bot',
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: options.newsletterJid || '0@newsletter',
            serverMessageId: 1,
            newsletterName: options.newsletterName || 'WhatsApp',
            contentType: 'UPDATE',
        },
        isForwarded: true,
        forwardingScore: options.forwardingScore || 1,
    };
}

// ─────────────────────────────────────────────
// CODE TOKENIZER
// ─────────────────────────────────────────────
const JS_KEYWORDS = new Set([
    'const','let','var','function','return','if','else','for','while',
    'class','new','import','export','default','from','async','await',
    'try','catch','throw','typeof','instanceof','true','false','null',
    'undefined','this','super','extends','switch','case','break','continue',
    'do','in','of','delete','void','yield','static','get','set'
]);

const PYTHON_KEYWORDS = new Set([
    'def','return','if','elif','else','for','while','class','import',
    'from','as','try','except','finally','with','pass','break','continue',
    'and','or','not','in','is','True','False','None','lambda','yield',
    'global','nonlocal','raise','del','assert','async','await'
]);

function tokenizeCode(code, language = 'javascript') {
    const tokens = [];
    const keywords = language === 'python' ? PYTHON_KEYWORDS : JS_KEYWORDS;
    let i = 0;

    while (i < code.length) {
        // Comment //
        if (code[i] === '/' && code[i+1] === '/') {
            let j = i;
            while (j < code.length && code[j] !== '\n') j++;
            tokens.push({ highlightType: 5, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        // Comment /* */
        if (code[i] === '/' && code[i+1] === '*') {
            let j = i + 2;
            while (j < code.length && !(code[j] === '*' && code[j+1] === '/')) j++;
            j += 2;
            tokens.push({ highlightType: 5, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        // Python comment #
        if (language === 'python' && code[i] === '#') {
            let j = i;
            while (j < code.length && code[j] !== '\n') j++;
            tokens.push({ highlightType: 5, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        // String
        if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
            const quote = code[i];
            let j = i + 1;
            while (j < code.length && code[j] !== quote) {
                if (code[j] === '\\') j++;
                j++;
            }
            j++;
            tokens.push({ highlightType: 3, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        // Number
        if (/[0-9]/.test(code[i])) {
            let j = i;
            while (j < code.length && /[0-9a-fA-FxXoObB_.]/.test(code[j])) j++;
            tokens.push({ highlightType: 4, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        // Identifier / keyword / method
        if (/[a-zA-Z_$]/.test(code[i])) {
            let j = i;
            while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
            const word = code.slice(i, j);
            let k = j;
            while (k < code.length && code[k] === ' ') k++;
            if (code[k] === '(') {
                tokens.push({ highlightType: 2, codeContent: word });
            } else if (keywords.has(word)) {
                tokens.push({ highlightType: 1, codeContent: word });
            } else {
                tokens.push({ highlightType: 0, codeContent: word });
            }
            i = j; continue;
        }
        tokens.push({ highlightType: 0, codeContent: code[i] });
        i++;
    }
    return tokens;
}

// ─────────────────────────────────────────────
// GENERATE TABLE CONTENT
// ─────────────────────────────────────────────
const generateTableContent = (title, headers, rows, options = {}) => {
    const tableRows = [];
    if (headers && headers.length > 0) {
        tableRows.push({ items: headers.map(h => String(h)), isHeading: true });
    }
    for (const row of rows) {
        tableRows.push({ items: row.map(cell => String(cell)), isHeading: false });
    }
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.headerText ? { header: { text: options.headerText } } : {}),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: [{ messageType: 4, tableMetadata: { title: title || '', rows: tableRows } }],
                },
            },
        },
    };
};
exports.generateTableContent = generateTableContent;

// ─────────────────────────────────────────────
// GENERATE LIST CONTENT
// ─────────────────────────────────────────────
const generateListContent = (title, rows, options = {}) => {
    const tableRows = rows.map(([key, val]) => ({
        items: [String(key), String(val)],
        isHeading: false,
    }));
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: [{ messageType: 4, tableMetadata: { title: title || '', rows: tableRows } }],
                },
            },
        },
    };
};
exports.generateListContent = generateListContent;

// ─────────────────────────────────────────────
// GENERATE CODE BLOCK CONTENT
// ─────────────────────────────────────────────
const generateCodeBlockContent = (code, options = {}) => {
    const language = options.language || 'javascript';
    const codeBlocks = tokenizeCode(code, language);
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.title ? { header: { text: options.title } } : {}),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: [{
                        messageType: 5,
                        codeMetadata: { codeLanguage: language, codeBlocks },
                    }],
                },
            },
        },
    };
};
exports.generateCodeBlockContent = generateCodeBlockContent;

// ─────────────────────────────────────────────
// GENERATE LINK CONTENT
// ─────────────────────────────────────────────
const generateLinkContent = (text, urls, options = {}) => {
    const citations = (options.citations || []).map((c, i) => ({
        sourceQuery: c.sourceQuery || '',
        faviconCdnUrl: c.faviconCdnUrl || '',
        citationNumber: c.citationNumber ?? (i + 1),
        sourceTitle: c.sourceTitle || '',
    }));

    const contextInfo = {
        ...buildBotContext(options),
        ...(citations.length > 0 ? { citations } : {}),
        ...(options.proofs ? { proofs: options.proofs } : {}),
    };

    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo,
                    ...(options.headerText ? { header: { text: options.headerText } } : {}),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: [{
                        messageType: 2,
                        messageText: text,
                        inlineEmbeds: urls.map((url, i) => ({
                            index: i,
                            url: typeof url === 'string' ? url : url.url,
                        })),
                    }],
                },
            },
        },
    };
};
exports.generateLinkContent = generateLinkContent;

// ─────────────────────────────────────────────
// SEND TABLE
// ─────────────────────────────────────────────
/**
 * await sock.sendTable(jid, 'Judul', ['Col1','Col2'], [['A','B']], quoted, { headerText: 'Header', footer: 'Footer' })
 */
const sendTable = async (sock, jid, title, headers, rows, quoted, options = {}) => {
    return await sock.sendMessage(jid, generateTableContent(title, headers, rows, options), { quoted });
};
exports.sendTable = sendTable;

// ─────────────────────────────────────────────
// SEND LIST
// ─────────────────────────────────────────────
/**
 * await sock.sendList(jid, 'Judul', [['Key','Value']], quoted, { footer: 'Footer' })
 */
const sendList = async (sock, jid, title, rows, quoted, options = {}) => {
    return await sock.sendMessage(jid, generateListContent(title, rows, options), { quoted });
};
exports.sendList = sendList;

// ─────────────────────────────────────────────
// SEND CODE BLOCK
// ─────────────────────────────────────────────
/**
 * await sock.sendCodeBlock(jid, `const x = 1`, quoted, { language: 'javascript', title: 'Kode', footer: 'Footer' })
 */
const sendCodeBlock = async (sock, jid, code, quoted, options = {}) => {
    return await sock.sendMessage(jid, generateCodeBlockContent(code, options), { quoted });
};
exports.sendCodeBlock = sendCodeBlock;

// ─────────────────────────────────────────────
// SEND LINK
// ─────────────────────────────────────────────
/**
 * await sock.sendLink(jid,
 *   'Hasil upload:\n🔗 {{IE_0}}klik disini{{/IE_0}}',
 *   ['https://example.com'],
 *   quoted,
 *   { headerText: '📁 Uploader', footer: '✨ Selesai!', citations: [{ sourceTitle: 'Example' }] }
 * )
 */
const sendLink = async (sock, jid, text, urls, quoted, options = {}) => {
    return await sock.sendMessage(jid, generateLinkContent(text, urls, options), { quoted });
};
exports.sendLink = sendLink;

// ─────────────────────────────────────────────
// SEND RICH MESSAGE
// ─────────────────────────────────────────────
/**
 * await sock.sendRichMessage(jid, [
 *   { messageType: 2, messageText: 'Penjelasan:' },
 *   { messageType: 4, tableMetadata: { title: 'Tabel', rows: [{ items: ['A','B'], isHeading: true }] } },
 *   { messageType: 2, messageText: 'Kodenya:' },
 *   { messageType: 5, codeMetadata: { codeLanguage: 'javascript', codeBlocks: [{ highlightType: 0, codeContent: 'console.log("ok")' }] } },
 * ], quoted, { footer: 'KhyzTzyy' })
 *
 * messageType:
 *   2 = TEXT
 *   4 = TABLE
 *   5 = CODE
 */
const sendRichMessage = async (sock, jid, subMessages, quoted, options = {}) => {
    // Auto-tokenize kalau codeMetadata isinya string
    const processed = subMessages.map(sub => {
        if (sub.messageType === 5 && sub.codeMetadata) {
            const lang = sub.codeMetadata.codeLanguage || 'javascript';
            const blocks = sub.codeMetadata.codeBlocks;
            // Kalau codeBlocks isinya string, tokenize dulu
            if (typeof blocks === 'string') {
                return {
                    ...sub,
                    codeMetadata: {
                        codeLanguage: lang,
                        codeBlocks: tokenizeCode(blocks, lang),
                    },
                };
            }
        }
        return sub;
    });

    const content = {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.headerText ? { header: { text: options.headerText } } : {}),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: processed,
                },
            },
        },
    };

    return await sock.sendMessage(jid, content, { quoted });
};
exports.sendRichMessage = sendRichMessage;

// ─────────────────────────────────────────────
// RICH MESSAGE CARD (khyz-baileys 3.0.0)
// One send.sendMessage(jid, { richMessage: {...} }) call that combines
// title/text/code/table/image/images/footer into a single native
// AIRichResponse card (botForwardedMessage.richResponseMessage), plus
// `video` and `suggestions` (quick-reply buttons) as accompanying native
// messages -- WhatsApp's rich-card format and its interactive-buttons
// format are two different message kinds at the protocol level, so they
// cannot be merged into one wire message; this helper still sends them
// together as one logical call and returns all resulting message objects.
// ─────────────────────────────────────────────
const generateRichCardContent = (rich, options = {}) => {
    const subMessages = [];
    if (rich.text) {
        subMessages.push({ messageType: 2, messageText: rich.text });
    }
    if (rich.table && Array.isArray(rich.table)) {
        const rows = rich.table.map((row, i) => ({
            items: (Array.isArray(row) ? row : [row]).map(String),
            isHeading: i === 0 && !!rich.tableHasHeader
        }));
        subMessages.push({ messageType: 4, tableMetadata: { title: rich.title || '', rows } });
    }
    if (rich.code && (rich.code.code || typeof rich.code === 'string')) {
        const codeText = typeof rich.code === 'string' ? rich.code : rich.code.code;
        const language = (typeof rich.code === 'object' && rich.code.language) || 'javascript';
        subMessages.push({
            messageType: 5,
            codeMetadata: { codeLanguage: language, codeBlocks: tokenizeCode(codeText, language) }
        });
    }
    if (rich.image) {
        const url = typeof rich.image === 'string' ? rich.image : rich.image.url;
        subMessages.push({
            messageType: 3,
            imageMetadata: {
                imageUrl: { imagePreviewUrl: url, imageHighResUrl: url, sourceUrl: url },
                imageText: (typeof rich.image === 'object' && rich.image.caption) || ''
            }
        });
    }
    if (rich.images && Array.isArray(rich.images) && rich.images.length) {
        const urls = rich.images.map(img => {
            const url = typeof img === 'string' ? img : img.url;
            return { imagePreviewUrl: url, imageHighResUrl: url, sourceUrl: url };
        });
        subMessages.push({
            messageType: 1,
            gridImageMetadata: { gridImageUrl: urls[0], imageUrls: urls }
        });
    }
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(rich.title ? { header: { text: rich.title } } : {}),
                    ...(rich.footer ? { footer: { text: rich.footer } } : {}),
                    subMessages,
                },
            },
        },
    };
};
exports.generateRichCardContent = generateRichCardContent;

/**
 * sock.sendMessage(jid, {
 *   richMessage: {
 *     title: 'Judul Kartu',
 *     text: 'Isi teks utama',
 *     code: { language: 'js', code: 'console.log(1)' },
 *     table: [['Col1','Col2'], ['A','B']],
 *     image: 'https://...',            // satu gambar utama
 *     images: ['https://...', '...'],  // galeri
 *     video: 'https://...',            // dikirim sbg pesan video terpisah
 *     suggestions: [{ id: 'yes', displayText: 'Ya' }],
 *     footer: 'KhyzTzyy'
 *   }
 * }, { quoted })
 */
const sendRichMessageCard = async (sock, jid, rich, options = {}) => {
    const { quoted } = options;
    const results = {};
    results.card = await sock.sendMessage(jid, generateRichCardContent(rich, options), { quoted });
    if (rich.video) {
        const url = typeof rich.video === 'string' ? rich.video : rich.video.url;
        results.video = await sock.sendMessage(jid, { video: { url }, caption: (typeof rich.video === 'object' && rich.video.caption) || undefined });
    }
    if (rich.suggestions && Array.isArray(rich.suggestions) && rich.suggestions.length) {
        results.suggestions = await sock.sendMessage(jid, {
            text: rich.suggestionsPrompt || '\u200e',
            footer: rich.footer,
            buttons: rich.suggestions
        });
    }
    return results;
};
exports.sendRichMessageCard = sendRichMessageCard;

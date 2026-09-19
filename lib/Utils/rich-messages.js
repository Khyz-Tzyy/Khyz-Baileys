'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.generateLinkContent = exports.generateCodeBlockContent = exports.generateListContent = exports.generateTableContent = exports.sendLink = exports.sendCodeBlock = exports.sendList = exports.sendTable = void 0;
exports.JS_KEYWORDS = exports.PYTHON_KEYWORDS = exports.BASH_KEYWORDS = exports.GO_KEYWORDS = exports.LUA_KEYWORDS = exports.LANGUAGE_KEYWORDS = exports.tokenizeCode = void 0;
exports.generateLatexContent = exports.generateLatexImageContent = exports.generateLatexInlineImageContent = exports.sendLatex = exports.sendLatexImage = void 0;

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

const BASH_KEYWORDS = new Set([
    'if','then','else','elif','fi','for','while','until','do','done',
    'case','esac','function','return','exit','break','continue','in',
    'echo','export','local','readonly','shift','trap','source','set','unset'
]);

const GO_KEYWORDS = new Set([
    'func','return','if','else','for','range','switch','case','default',
    'break','continue','package','import','var','const','type','struct',
    'interface','map','chan','go','defer','select','fallthrough','goto',
    'true','false','nil','iota'
]);

const LUA_KEYWORDS = new Set([
    'function','end','local','return','if','then','else','elseif','for',
    'while','do','repeat','until','break','and','or','not','nil','true',
    'false','in','require'
]);

const LANGUAGE_KEYWORDS = {
    javascript: JS_KEYWORDS,
    js: JS_KEYWORDS,
    python: PYTHON_KEYWORDS,
    py: PYTHON_KEYWORDS,
    bash: BASH_KEYWORDS,
    sh: BASH_KEYWORDS,
    shell: BASH_KEYWORDS,
    go: GO_KEYWORDS,
    golang: GO_KEYWORDS,
    lua: LUA_KEYWORDS,
};

function tokenizeCode(code, language = 'javascript') {
    const tokens = [];
    const keywords = LANGUAGE_KEYWORDS[language] || JS_KEYWORDS;
    const isLineComment = language === 'python' || language === 'py'
        || language === 'bash' || language === 'sh' || language === 'shell'
        ? '#' : null;
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
        // Line comment (# for python/bash, -- for lua)
        if (isLineComment && code[i] === isLineComment) {
            let j = i;
            while (j < code.length && code[j] !== '\n') j++;
            tokens.push({ highlightType: 5, codeContent: code.slice(i, j) });
            i = j; continue;
        }
        if ((language === 'lua') && code[i] === '-' && code[i+1] === '-') {
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
exports.tokenizeCode = tokenizeCode;
exports.JS_KEYWORDS = JS_KEYWORDS;
exports.PYTHON_KEYWORDS = PYTHON_KEYWORDS;
exports.BASH_KEYWORDS = BASH_KEYWORDS;
exports.GO_KEYWORDS = GO_KEYWORDS;
exports.LUA_KEYWORDS = LUA_KEYWORDS;
exports.LANGUAGE_KEYWORDS = LANGUAGE_KEYWORDS;

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

// ─────────────────────────────────────────────
// LATEX CONTENT (math expressions rendered natively by WhatsApp)
// ─────────────────────────────────────────────
/**
 * generateLatexContent('E = mc^2', [{ latexExpression: 'E = mc^2', url: '...', width: 200, height: 60 }], { headerText: 'Rumus', footer: 'KhyzTzyy' })
 * `url` di tiap expression harus nunjuk ke gambar hasil render LaTeX yang udah di-upload duluan (dipakai kalau kamu udah punya gambarnya).
 */
const generateLatexContent = (text, expressions, options = {}) => {
    const latexExpressions = expressions.map((expr) => {
        const entry = {
            latexExpression: expr.latexExpression,
            url: expr.url,
            width: expr.width,
            height: expr.height,
        };
        if (expr.fontHeight !== undefined) entry.fontHeight = expr.fontHeight;
        if (expr.imageTopPadding !== undefined) entry.imageTopPadding = expr.imageTopPadding;
        if (expr.imageLeadingPadding !== undefined) entry.imageLeadingPadding = expr.imageLeadingPadding;
        if (expr.imageBottomPadding !== undefined) entry.imageBottomPadding = expr.imageBottomPadding;
        if (expr.imageTrailingPadding !== undefined) entry.imageTrailingPadding = expr.imageTrailingPadding;
        return entry;
    });
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.headerText ? { header: { text: options.headerText } } : {}),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages: [{ messageType: 8, latexMetadata: { text: text || '', expressions: latexExpressions } }],
                },
            },
        },
    };
};
exports.generateLatexContent = generateLatexContent;

/**
 * Render tiap ekspresi LaTeX jadi gambar dulu (kamu suplai fungsi render & upload-nya sendiri),
 * baru dikirim. Berguna kalau kamu belum punya URL gambar hasil render.
 *
 * await generateLatexImageContent('Rumus:', [{ latexExpression: 'x^2+y^2=r^2' }], { footer: 'KhyzTzyy' },
 *   async (buffer, type) => sock.waUploadToServer(buffer, { mediaType: type }),
 *   async (latex) => ({ buffer: pngBuffer, width: 300, height: 80 })  // render LaTeX -> PNG sendiri (mis. pake API/lib eksternal)
 * )
 */
const generateLatexImageContent = async (text, expressions, options = {}, uploadFn, renderLatexToPng) => {
    const latexExpressions = await Promise.all(expressions.map(async (expr) => {
        const { buffer, width, height } = await renderLatexToPng(expr.latexExpression);
        const uploadResult = await uploadFn(buffer, 'image');
        const imageUrl = uploadResult.url || uploadResult.directPath;
        return { latexExpression: expr.latexExpression, url: imageUrl, width, height };
    }));
    return generateLatexContent(text, latexExpressions, options);
};
exports.generateLatexImageContent = generateLatexImageContent;

/**
 * Sama kayak generateLatexImageContent, tapi teks & tiap gambar rumus dikirim sebagai
 * sub-message terpisah berurutan (inline di antara teks), bukan digabung jadi satu latexMetadata.
 */
const generateLatexInlineImageContent = async (text, expressions, options = {}, uploadFn, renderLatexToPng) => {
    const subMessages = [];
    if (options.headerText) {
        subMessages.push({ messageType: 2, messageText: options.headerText });
    }
    if (text) {
        subMessages.push({ messageType: 2, messageText: text });
    }
    for (const expr of expressions) {
        const { buffer, width, height } = await renderLatexToPng(expr.latexExpression);
        const uploadResult = await uploadFn(buffer, 'image');
        const imageUrl = uploadResult.url || uploadResult.directPath;
        subMessages.push({
            messageType: 3,
            imageMetadata: {
                imageUrl: { imagePreviewUrl: imageUrl, imageHighResUrl: imageUrl, sourceUrl: imageUrl },
                imageText: expr.latexExpression || ''
            }
        });
    }
    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    contextInfo: buildBotContext(options),
                    ...(options.footer ? { footer: { text: options.footer } } : {}),
                    subMessages,
                },
            },
        },
    };
};
exports.generateLatexInlineImageContent = generateLatexInlineImageContent;

const sendLatex = async (sock, jid, text, expressions, quoted, options = {}) => {
    return await sock.sendMessage(jid, generateLatexContent(text, expressions, options), { quoted });
};
exports.sendLatex = sendLatex;

const sendLatexImage = async (sock, jid, text, expressions, quoted, options = {}, uploadFn, renderLatexToPng) => {
    const content = await generateLatexImageContent(text, expressions, options, uploadFn || sock.waUploadToServer, renderLatexToPng);
    return await sock.sendMessage(jid, content, { quoted });
};
exports.sendLatexImage = sendLatexImage;

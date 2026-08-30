'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.sendOrderMessage = exports.sendCatalogMessage = exports.sendPaymentRequest = exports.sendStoreMessage = void 0;

// ─────────────────────────────────────────────
// SEND STORE MESSAGE
// Kirim pesan toko/bisnis dengan info produk
// ─────────────────────────────────────────────
/**
 * await sock.sendStoreMessage(jid, {
 *   title: 'Toko KhyzTzyy',
 *   body: 'Selamat datang di toko kami!',
 *   footer: '© KhyzTzyy Shop',
 *   thumbnail: 'https://example.com/thumb.jpg',
 *   businessJid: '628xxx@s.whatsapp.net',
 *   buttons: [
 *     { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Lihat Katalog', url: 'https://example.com' }) }
 *   ]
 * }, quoted)
 */
const sendStoreMessage = async (sock, jid, options = {}, quoted) => {
    const {
        title = '',
        body = '',
        footer = '',
        thumbnail,
        businessJid = '0@s.whatsapp.net',
        buttons = [],
        image,
        video,
    } = options;

    return await sock.sendMessage(jid, {
        interactiveMessage: {
            title: body,
            footer,
            thumbnail,
            image,
            video,
            header: title,
            contextInfo: {
                externalAdReply: {
                    title,
                    body,
                    mediaType: 1,
                    showAdAttribution: true,
                }
            },
            buttons,
        }
    }, { quoted });
};
exports.sendStoreMessage = sendStoreMessage;

// ─────────────────────────────────────────────
// SEND PAYMENT REQUEST
// Kirim permintaan pembayaran
// ─────────────────────────────────────────────
/**
 * await sock.sendPaymentRequest(jid, {
 *   amount: 50000,
 *   currency: 'IDR',
 *   note: 'Pembayaran order #123',
 *   from: '628xxx@s.whatsapp.net',
 *   expiry: 0
 * }, quoted)
 */
const sendPaymentRequest = async (sock, jid, options = {}, quoted) => {
    const {
        amount = 0,
        currency = 'IDR',
        note = '',
        from = '0@s.whatsapp.net',
        expiry = 0,
        background,
    } = options;

    return await sock.sendMessage(jid, {
        requestPaymentMessage: {
            amount: amount * 1000, // amount1000
            currency,
            note,
            from,
            expiry,
            background,
        }
    }, { quoted });
};
exports.sendPaymentRequest = sendPaymentRequest;

// ─────────────────────────────────────────────
// SEND CATALOG MESSAGE
// Kirim pesan produk dari katalog bisnis
// ─────────────────────────────────────────────
/**
 * await sock.sendCatalogMessage(jid, {
 *   title: 'Wireless Headphones',
 *   description: 'Headphone bluetooth kualitas tinggi',
 *   productId: 'PROD-001',
 *   retailerId: 'khyz-shop',
 *   url: 'https://example.com/product',
 *   price: 299000,
 *   currency: 'IDR',
 *   thumbnail: 'https://example.com/product.jpg',
 *   body: 'Cek produk ini!',
 *   footer: 'Khyz Shop',
 *   buttons: []
 * }, quoted)
 */
const sendCatalogMessage = async (sock, jid, options = {}, quoted) => {
    const {
        title = '',
        description = '',
        productId = '',
        retailerId = '',
        url = '',
        price = 0,
        currency = 'IDR',
        thumbnail,
        body = '',
        footer = '',
        buttons = [],
    } = options;

    return await sock.sendMessage(jid, {
        productMessage: {
            title,
            description,
            productId,
            retailerId,
            url,
            priceAmount1000: price * 1000,
            currencyCode: currency,
            thumbnail: thumbnail ? { url: thumbnail } : undefined,
            body,
            footer,
            buttons: buttons.length > 0 ? buttons : [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🛒 Beli Sekarang',
                        id: `buy_${productId}`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Lihat Detail',
                        url: url || 'https://wa.me'
                    })
                }
            ]
        }
    }, { quoted });
};
exports.sendCatalogMessage = sendCatalogMessage;

// ─────────────────────────────────────────────
// SEND ORDER MESSAGE
// Kirim pesan status order
// ─────────────────────────────────────────────
/**
 * await sock.sendOrderMessage(jid, {
 *   orderId: 'ORDER-123',
 *   itemCount: 2,
 *   status: 'ACCEPTED',
 *   orderTitle: 'Order #123',
 *   message: 'Pesanan kamu sudah diterima!',
 *   sellerJid: '628xxx@s.whatsapp.net',
 *   totalAmount: 150000,
 *   currency: 'IDR',
 *   thumbnail: Buffer | null
 * }, quoted)
 */
const sendOrderMessage = async (sock, jid, options = {}, quoted) => {
    const {
        orderId = `ORDER-${Date.now()}`,
        itemCount = 1,
        status = 'ACCEPTED',
        orderTitle = '',
        message = '',
        sellerJid = '0@s.whatsapp.net',
        totalAmount = 0,
        currency = 'IDR',
        thumbnail = null,
        token = '',
    } = options;

    return await sock.sendMessage(jid, {
        orderMessage: {
            orderId,
            thumbnail,
            itemCount,
            status,
            surface: 'CATALOG',
            message,
            orderTitle,
            sellerJid,
            token: token || orderId,
            totalAmount1000: totalAmount * 1000,
            totalCurrencyCode: currency,
            messageVersion: 2,
        }
    }, { quoted });
};
exports.sendOrderMessage = sendOrderMessage;

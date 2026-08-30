'use strict';

const WAProto = require('../../WAProto').proto;
const Utils_1 = require('../Utils');
const crypto = require('crypto');

class imup {
    constructor(utils, waUploadToServer, relayMessageFn) {
        this.utils = utils;
        this.relayMessage = relayMessageFn;
        this.waUploadToServer = waUploadToServer;
    }

    // ─────────────────────────────────────────────
    // DETECT TYPE
    // ─────────────────────────────────────────────
    detectType(content) {
        if (content.requestPaymentMessage) return 'PAYMENT';
        if (content.productMessage)        return 'PRODUCT';
        if (content.interactiveMessage)    return 'INTERACTIVE';
        if (content.albumMessage)          return 'ALBUM';
        if (content.eventMessage)          return 'EVENT';
        if (content.pollResultMessage)     return 'POLL_RESULT';
        if (content.statusMentionMessage)  return 'STATUS_MENTION';
        if (content.orderMessage)          return 'ORDER';
        if (content.groupStatus)           return 'GROUP_STATUS';
        return null;
    }

    // ─────────────────────────────────────────────
    // INTERACTIVE MESSAGES
    // ─────────────────────────────────────────────
    async handleInteractive(content, jid, quoted) {
        const {
            title,
            footer,
            thumbnail,
            image,
            video,
            document,
            mimetype,
            fileName,
            jpegThumbnail,
            contextInfo,
            externalAdReply,
            buttons = [],
            nativeFlowMessage,
            header: headerTitle,
        } = content.interactiveMessage;

        let media = null;

        if (thumbnail) {
            media = await this.utils.prepareWAMessageMedia(
                { image: { url: thumbnail } },
                { upload: this.waUploadToServer }
            );
        } else if (image) {
            media = await this.utils.prepareWAMessageMedia(
                { image: typeof image === 'object' && image.url ? { url: image.url } : image },
                { upload: this.waUploadToServer }
            );
        } else if (video) {
            media = await this.utils.prepareWAMessageMedia(
                { video: typeof video === 'object' && video.url ? { url: video.url } : video },
                { upload: this.waUploadToServer }
            );
        } else if (document) {
            const docPayload = { document };
            if (jpegThumbnail) {
                docPayload.jpegThumbnail = typeof jpegThumbnail === 'object' && jpegThumbnail.url
                    ? { url: jpegThumbnail.url }
                    : jpegThumbnail;
            }
            media = await this.utils.prepareWAMessageMedia(docPayload, { upload: this.waUploadToServer });
            if (fileName) media.documentMessage.fileName = fileName;
            if (mimetype) media.documentMessage.mimetype = mimetype;
        }

        let interactiveMessage = {
            body:   { text: title || '' },
            footer: { text: footer || '' },
        };

        // Header — media atau teks
        if (media) {
            interactiveMessage.header = { title: '', hasMediaAttachment: true, ...media };
        } else {
            interactiveMessage.header = { title: headerTitle || '', hasMediaAttachment: false };
        }

        // Buttons / nativeFlowMessage
        if (buttons && buttons.length > 0) {
            interactiveMessage.nativeFlowMessage = { buttons };
            if (nativeFlowMessage) {
                interactiveMessage.nativeFlowMessage = {
                    ...interactiveMessage.nativeFlowMessage,
                    ...nativeFlowMessage,
                };
            }
        } else if (nativeFlowMessage) {
            interactiveMessage.nativeFlowMessage = nativeFlowMessage;
        }

        // contextInfo
        let finalContextInfo = {};
        if (contextInfo) {
            finalContextInfo = {
                mentionedJid: contextInfo.mentionedJid || [],
                forwardingScore: contextInfo.forwardingScore || 0,
                isForwarded: contextInfo.isForwarded || false,
                ...contextInfo,
            };
        }
        if (externalAdReply) {
            finalContextInfo.externalAdReply = {
                title: '',
                body: '',
                mediaType: 1,
                thumbnailUrl: '',
                mediaUrl: '',
                sourceUrl: '',
                showAdAttribution: false,
                renderLargerThumbnail: false,
                ...externalAdReply,
            };
        }
        if (Object.keys(finalContextInfo).length > 0) {
            interactiveMessage.contextInfo = finalContextInfo;
        }

        return { interactiveMessage };
    }

    // ─────────────────────────────────────────────
    // ALBUM MESSAGES
    // ─────────────────────────────────────────────
    async handleAlbum(content, jid, quoted) {
        const array = content.albumMessage;

        const album = await this.utils.generateWAMessageFromContent(jid, {
            messageContextInfo: {
                messageSecret: crypto.randomBytes(32),
            },
            albumMessage: {
                expectedImageCount: array.filter(a => a.hasOwnProperty('image')).length,
                expectedVideoCount: array.filter(a => a.hasOwnProperty('video')).length,
            },
        }, {
            userJid: this.utils.generateMessageID().split('@')[0] + '@s.whatsapp.net',
            quoted,
            upload: this.waUploadToServer,
        });

        await this.relayMessage(jid, album.message, { messageId: album.key.id });

        for (const item of array) {
            const img = await this.utils.generateWAMessage(jid, item, {
                upload: this.waUploadToServer,
            });

            img.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key,
                },
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast',
                forwardingScore: 99999,
                isForwarded: true,
                mentionedJid: [jid],
                starred: true,
                isHighlighted: true,
                businessMessageForwardInfo: { businessOwnerJid: jid },
                dataSharingContext: { showMmDisclosure: true },
            };

            img.message.forwardedNewsletterMessageInfo = {
                newsletterJid: '0@newsletter',
                serverMessageId: 1,
                newsletterName: 'WhatsApp',
                contentType: 'UPDATE',
            };

            img.message.disappearingMode = {
                initiator: 3,
                trigger: 4,
                initiatorDeviceJid: jid,
                initiatedByExternalService: true,
                initiatedByUserDevice: true,
                initiatedBySystem: true,
                initiatedByServer: true,
                initiatedByAdmin: true,
                initiatedByUser: true,
                initiatedByApp: true,
                initiatedByBot: true,
                initiatedByMe: true,
            };

            await this.relayMessage(jid, img.message, {
                messageId: img.key.id,
                quoted: {
                    key: {
                        remoteJid: album.key.remoteJid,
                        id: album.key.id,
                        fromMe: true,
                        participant: this.utils.generateMessageID().split('@')[0] + '@s.whatsapp.net',
                    },
                    message: album.message,
                },
            });
        }

        return album;
    }

    // ─────────────────────────────────────────────
    // PAYMENT MESSAGES
    // ─────────────────────────────────────────────
    async handlePayment(content, quoted) {
        const data = content.requestPaymentMessage;
        let notes = {};

        if (data.sticker?.stickerMessage) {
            notes = {
                stickerMessage: {
                    ...data.sticker.stickerMessage,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message,
                    },
                },
            };
        } else if (data.note) {
            notes = {
                extendedTextMessage: {
                    text: data.note,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message,
                    },
                },
            };
        }

        return {
            requestPaymentMessage: WAProto.Message.RequestPaymentMessage.fromObject({
                expiryTimestamp: data.expiry || 0,
                amount1000: data.amount || 0,
                currencyCodeIso4217: data.currency || 'IDR',
                requestFrom: data.from || '0@s.whatsapp.net',
                noteMessage: notes,
                background: data.background ?? {
                    id: 'DEFAULT',
                    placeholderArgb: 0xFFF0F0F0,
                },
            }),
        };
    }

    // ─────────────────────────────────────────────
    // PRODUCT MESSAGES
    // ─────────────────────────────────────────────
    async handleProduct(content, jid, quoted) {
        const {
            title,
            description,
            thumbnail,
            productId,
            retailerId,
            url,
            body = '',
            footer = '',
            buttons = [],
            priceAmount1000 = null,
            currencyCode = 'IDR',
        } = content.productMessage;

        let productImage;

        if (Buffer.isBuffer(thumbnail)) {
            const { imageMessage } = await this.utils.generateWAMessageContent(
                { image: thumbnail },
                { upload: this.waUploadToServer }
            );
            productImage = imageMessage;
        } else if (typeof thumbnail === 'object' && thumbnail?.url) {
            const { imageMessage } = await this.utils.generateWAMessageContent(
                { image: { url: thumbnail.url } },
                { upload: this.waUploadToServer }
            );
            productImage = imageMessage;
        }

        return {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: body },
                        footer: { text: footer },
                        header: {
                            title,
                            hasMediaAttachment: true,
                            productMessage: {
                                product: {
                                    productImage,
                                    productId,
                                    title,
                                    description,
                                    currencyCode,
                                    priceAmount1000,
                                    retailerId,
                                    url,
                                    productImageCount: 1,
                                },
                                businessOwnerJid: '0@s.whatsapp.net',
                            },
                        },
                        nativeFlowMessage: { buttons },
                    },
                },
            },
        };
    }

    // ─────────────────────────────────────────────
    // EVENT MESSAGES
    // ─────────────────────────────────────────────
    async handleEvent(content, jid, quoted) {
        const eventData = content.eventMessage;

        const msg = await this.utils.generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                        messageSecret: crypto.randomBytes(32),
                        supportPayload: JSON.stringify({
                            version: 2,
                            is_ai_message: true,
                            should_show_system_message: true,
                            ticket_id: crypto.randomBytes(16).toString('hex'),
                        }),
                    },
                    eventMessage: {
                        contextInfo: {
                            mentionedJid: [jid],
                            participant: jid,
                            remoteJid: 'status@broadcast',
                            forwardedNewsletterMessageInfo: {
                                newsletterName: eventData.newsletterName || 'Update',
                                newsletterJid: eventData.newsletterJid || '120363401718869058@newsletter',
                                serverMessageId: 1,
                            },
                        },
                        isCanceled: eventData.isCanceled || false,
                        name: eventData.name,
                        description: eventData.description,
                        location: eventData.location || {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: 'Location',
                        },
                        joinLink: eventData.joinLink || '',
                        startTime: typeof eventData.startTime === 'string'
                            ? parseInt(eventData.startTime)
                            : eventData.startTime || Date.now(),
                        endTime: typeof eventData.endTime === 'string'
                            ? parseInt(eventData.endTime)
                            : eventData.endTime || Date.now() + 3600000,
                        extraGuestsAllowed: eventData.extraGuestsAllowed !== false,
                    },
                },
            },
        }, { quoted });

        await this.relayMessage(jid, msg.message, { messageId: msg.key.id });
        return msg;
    }

    // ─────────────────────────────────────────────
    // POLL RESULT
    // ─────────────────────────────────────────────
    async handlePollResult(content, jid, quoted) {
        const pollData = content.pollResultMessage;

        const msg = await this.utils.generateWAMessageFromContent(jid, {
            pollResultSnapshotMessage: {
                name: pollData.name,
                pollVotes: pollData.pollVotes.map(vote => ({
                    optionName: vote.optionName,
                    optionVoteCount: typeof vote.optionVoteCount === 'number'
                        ? vote.optionVoteCount.toString()
                        : vote.optionVoteCount,
                })),
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1,
                    forwardedNewsletterMessageInfo: {
                        newsletterName: pollData.newsletter?.newsletterName || 'Newsletter',
                        newsletterJid: pollData.newsletter?.newsletterJid || '120363401718869058@newsletter',
                        serverMessageId: 1000,
                        contentType: 'UPDATE',
                    },
                },
            },
        }, {
            userJid: this.utils.generateMessageID().split('@')[0] + '@s.whatsapp.net',
            quoted,
        });

        await this.relayMessage(jid, msg.message, { messageId: msg.key.id });
        return msg;
    }

    // ─────────────────────────────────────────────
    // STATUS MENTION (bug fixed)
    // ─────────────────────────────────────────────
    async handleStMention(content, jid, quoted) {
        const data = content.statusMentionMessage;
        let media = null;
        let mediaType = null;

        if (data.image) {
            media = await this.utils.prepareWAMessageMedia(
                { image: typeof data.image === 'object' && data.image.url ? { url: data.image.url } : data.image },
                { upload: this.waUploadToServer }
            );
            mediaType = 'image';
        } else if (data.video) {
            media = await this.utils.prepareWAMessageMedia(
                { video: typeof data.video === 'object' && data.video.url ? { url: data.video.url } : data.video },
                { upload: this.waUploadToServer }
            );
            mediaType = 'video';
        }

        const mentions = Array.isArray(data.mentions) ? data.mentions : [data.mentions].filter(Boolean);

        const msg = await this.relayMessage('status@broadcast', { ...media }, {
            statusJidList: [...mentions],
            additionalNodes: [{
                tag: 'meta',
                attrs: {},
                content: [{
                    tag: 'mentioned_users',
                    attrs: {},
                    content: mentions.map(m => ({
                        tag: 'to',
                        attrs: { jid: m },
                        content: undefined,
                    })),
                }],
            }],
        });

        const xontols = await this.utils.generateWAMessageFromContent(jid, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        messageId: msg.key,
                        type: 'STATUS_MENTION_MESSAGE',
                    },
                },
            },
        }, {
            additionalNodes: [{
                tag: 'meta',
                attrs: { is_status_mention: 'true' },
                content: undefined,
            }],
        });

        await this.relayMessage(jid, xontols.message, { messageId: xontols.key.id });
        return xontols;
    }

    // ─────────────────────────────────────────────
    // ORDER MESSAGE
    // ─────────────────────────────────────────────
    async handleOrderMessage(content, jid, quoted) {
        const orderData = content.orderMessage;

        const msg = await this.utils.generateWAMessageFromContent(jid, {
            orderMessage: {
                orderId: orderData.orderId || '7EPPELI25022008',
                thumbnail: orderData.thumbnail || null,
                itemCount: orderData.itemCount || 0,
                status: orderData.status || 'ACCEPTED',
                surface: 'CATALOG',
                message: orderData.message,
                orderTitle: orderData.orderTitle,
                sellerJid: orderData.sellerJid || '0@whatsapp.net',
                token: orderData.token || '7EPPELI_EXAMPLE_TOKEN',
                totalAmount1000: orderData.totalAmount1000 || 0,
                totalCurrencyCode: orderData.totalCurrencyCode || 'IDR',
                messageVersion: 2,
            },
        }, { quoted });

        await this.relayMessage(jid, msg.message, {});
        return msg;
    }

    // ─────────────────────────────────────────────
    // GROUP STORY
    // ─────────────────────────────────────────────
    async handleGroupStory(content, jid, quoted) {
        const storyData = content.groupStatus;
        let messageContent;

        if (storyData.message) {
            messageContent = storyData;
        } else {
            messageContent = await this.utils.generateWAMessageContent(storyData, {
                upload: this.waUploadToServer,
            });
        }

        const msg = {
            message: {
                groupStatusMessageV2: {
                    message: messageContent.message || messageContent,
                },
            },
        };

        return await this.relayMessage(jid, msg.message, {
            messageId: this.utils.generateMessageID(),
        });
    }

    // ─────────────────────────────────────────────
    // NEWSLETTER HELPERS
    // ─────────────────────────────────────────────

    /**
     * Generic newsletter action
     * action: 'follow' | 'unfollow' | 'mute' | 'unmute'
     */
    async newsletterAction(sock, jid, action) {
        return await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { queryId: 'GetNewsletterViewerAction' },
                content: JSON.stringify({ newsletter_id: jid, action }),
            }],
        });
    }

    async newsletterFollow(sock, jid) {
        return this.newsletterAction(sock, jid, 'follow');
    }

    async newsletterUnfollow(sock, jid) {
        return this.newsletterAction(sock, jid, 'unfollow');
    }

    async newsletterMute(sock, jid) {
        return this.newsletterAction(sock, jid, 'mute');
    }

    async newsletterUnmute(sock, jid) {
        return this.newsletterAction(sock, jid, 'unmute');
    }

    /**
     * Bulk follow multiple newsletters
     * jids: space-separated string or array
     */
    async newsletterMultipleFollow(sock, jids) {
        const list = Array.isArray(jids) ? jids : jids.split(' ').filter(Boolean);
        const results = [];
        for (const jid of list) {
            try {
                results.push(await this.newsletterFollow(sock, jid));
            } catch (e) {
                results.push({ jid, error: e.message });
            }
        }
        return results;
    }

    /**
     * Resolve channel URL to JID/metadata
     */
    async cekIDSaluran(sock, url) {
        const result = await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { queryId: 'GetNewsletterCreationMetadata' },
                content: JSON.stringify({ url }),
            }],
        });
        return result;
    }

    /**
     * Fetch all subscribed newsletters
     */
    async newsletterFetchAllSubscribe(sock) {
        const result = await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { queryId: 'GetNewsletterSubscriptions' },
                content: '{}',
            }],
        });
        return result;
    }

    /**
     * Get subscriber count
     */
    async newsletterSubscribers(sock, jid) {
        const result = await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:mex' },
            content: [{
                tag: 'query',
                attrs: { queryId: 'GetNewsletterSubscriberCount' },
                content: JSON.stringify({ newsletter_id: jid }),
            }],
        });
        return result;
    }

    /**
     * React to a newsletter message
     */
    async newsletterReactMessage(sock, jid, serverId, emoji) {
        return await sock.query({
            tag: 'iq',
            attrs: { to: jid, type: 'set', xmlns: 'w:newsletter:reaction' },
            content: [{
                tag: 'reaction',
                attrs: { 'server-id': String(serverId), code: emoji },
                content: undefined,
            }],
        });
    }
}

module.exports = imup;
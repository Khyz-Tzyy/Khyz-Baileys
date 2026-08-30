"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferDevice = exports.jidNormalizedUser = exports.isJidBot = exports.isHostedLidUser = exports.isHostedPnUser = exports.isJidNewsletter = exports.isJidNewsLetter = exports.isJidStatusBroadcast = exports.isJidGroup = exports.isJidBroadcast = exports.isLidUser = exports.isPnUser = exports.isJidUser = exports.isJidMetaAI = exports.areJidsSameUser = exports.getServerFromDomainType = exports.jidDecode = exports.jidEncode = exports.WAJIDDomains = exports.META_AI_JID = exports.STORIES_JID = exports.PSA_WID = exports.SERVER_JID = exports.OFFICIAL_BIZ_JID = exports.S_WHATSAPP_NET = void 0;
exports.S_WHATSAPP_NET = '@s.whatsapp.net';
exports.OFFICIAL_BIZ_JID = '16505361212@c.us';
exports.SERVER_JID = 'server@c.us';
exports.PSA_WID = '0@c.us';
exports.STORIES_JID = 'status@broadcast';
exports.META_AI_JID = '13135550002@c.us';
// Ported from official WhiskeySockets/Baileys `jid-utils.ts` -- adds full
// support for `@lid` (linked device id), `@hosted` and `@hosted.lid` JID
// domains, not just plain `@s.whatsapp.net` / `@g.us`.
var WAJIDDomains;
(function (WAJIDDomains) {
    WAJIDDomains[WAJIDDomains["WHATSAPP"] = 0] = "WHATSAPP";
    WAJIDDomains[WAJIDDomains["LID"] = 1] = "LID";
    WAJIDDomains[WAJIDDomains["HOSTED"] = 128] = "HOSTED";
    WAJIDDomains[WAJIDDomains["HOSTED_LID"] = 129] = "HOSTED_LID";
})(WAJIDDomains = exports.WAJIDDomains || (exports.WAJIDDomains = {}));
const getServerFromDomainType = (initialServer, domainType) => {
    switch (domainType) {
        case WAJIDDomains.LID:
            return 'lid';
        case WAJIDDomains.HOSTED:
            return 'hosted';
        case WAJIDDomains.HOSTED_LID:
            return 'hosted.lid';
        case WAJIDDomains.WHATSAPP:
        default:
            return initialServer;
    }
};
exports.getServerFromDomainType = getServerFromDomainType;
const jidEncode = (user, server, device, agent) => {
    return `${user || ''}${!!agent ? `_${agent}` : ''}${!!device ? `:${device}` : ''}@${server}`;
};
exports.jidEncode = jidEncode;
const jidDecode = (jid) => {
    const sepIdx = typeof jid === 'string' ? jid.indexOf('@') : -1;
    if (sepIdx < 0) {
        return undefined;
    }
    const server = jid.slice(sepIdx + 1);
    const userCombined = jid.slice(0, sepIdx);
    const [userAgent, device] = userCombined.split(':');
    const [user, agent] = userAgent.split('_');
    let domainType = WAJIDDomains.WHATSAPP;
    if (server === 'lid') {
        domainType = WAJIDDomains.LID;
    }
    else if (server === 'hosted') {
        domainType = WAJIDDomains.HOSTED;
    }
    else if (server === 'hosted.lid') {
        domainType = WAJIDDomains.HOSTED_LID;
    }
    else if (agent) {
        domainType = parseInt(agent);
    }
    return {
        server,
        user,
        domainType,
        device: device ? +device : undefined
    };
};
exports.jidDecode = jidDecode;
const areJidsSameUser = (jid1, jid2) => (0, exports.jidDecode)(jid1)?.user === (0, exports.jidDecode)(jid2)?.user;
exports.areJidsSameUser = areJidsSameUser;
const isJidMetaAI = (jid) => jid?.endsWith('@bot');
exports.isJidMetaAI = isJidMetaAI;
const isJidUser = (jid) => jid?.endsWith('@s.whatsapp.net');
exports.isJidUser = isJidUser;
exports.isPnUser = exports.isJidUser;
const isLidUser = (jid) => jid?.endsWith('@lid');
exports.isLidUser = isLidUser;
const isJidBroadcast = (jid) => jid?.endsWith('@broadcast');
exports.isJidBroadcast = isJidBroadcast;
const isJidGroup = (jid) => jid?.endsWith('@g.us');
exports.isJidGroup = isJidGroup;
const isJidStatusBroadcast = (jid) => jid === 'status@broadcast';
exports.isJidStatusBroadcast = isJidStatusBroadcast;
const isJidNewsLetter = (jid) => jid?.endsWith('@newsletter');
exports.isJidNewsLetter = isJidNewsLetter;
exports.isJidNewsletter = exports.isJidNewsLetter;
const isHostedPnUser = (jid) => jid?.endsWith('@hosted');
exports.isHostedPnUser = isHostedPnUser;
const isHostedLidUser = (jid) => jid?.endsWith('@hosted.lid');
exports.isHostedLidUser = isHostedLidUser;
const botRegexp = /^1313555\d{4}$|^131655500\d{2}$/;
const isJidBot = (jid) => jid && botRegexp.test(jid.split('@')[0]) && jid.endsWith('@c.us');
exports.isJidBot = isJidBot;
const jidNormalizedUser = (jid) => {
    const result = (0, exports.jidDecode)(jid);
    if (!result) {
        return '';
    }
    const { user, server } = result;
    return (0, exports.jidEncode)(user, server === 'c.us' ? 's.whatsapp.net' : server);
};
exports.jidNormalizedUser = jidNormalizedUser;
const transferDevice = (fromJid, toJid) => {
    const fromDecoded = (0, exports.jidDecode)(fromJid);
    const deviceId = fromDecoded?.device || 0;
    const { server, user } = (0, exports.jidDecode)(toJid);
    return (0, exports.jidEncode)(user, server, deviceId);
};
exports.transferDevice = transferDevice;

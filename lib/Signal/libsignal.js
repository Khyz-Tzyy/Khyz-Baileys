"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLibSignalRepository = makeLibSignalRepository;
const libsignal = __importStar(require("libsignal"));
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const lru_cache_1 = require("lru-cache");
const sender_key_name_1 = require("./Group/sender-key-name");
const sender_key_record_1 = require("./Group/sender-key-record");
const Group_1 = require("./Group");
const lid_mapping_1 = require("./lid-mapping");
function makeLibSignalRepository(auth, logger, pnToLIDFunc) {
    const lidMapping = new lid_mapping_1.LIDMappingStore(auth.keys, logger || console, pnToLIDFunc);
    const storage = signalStorage(auth);
    const parsedKeys = auth.keys;
    const migratedSessionCache = new lru_cache_1.LRUCache({
        ttl: 3 * 24 * 60 * 60 * 1000, // 3 hari
        ttlAutopurge: true,
        updateAgeOnGet: true
    });
    const log = logger || console;
    return {
        lidMapping,
        decryptGroupMessage({ group, authorJid, msg }) {
            const senderName = jidToSignalSenderKeyName(group, authorJid);
            const cipher = new Group_1.GroupCipher(storage, senderName);
            return cipher.decrypt(msg);
        },
        async processSenderKeyDistributionMessage({ item, authorJid }) {
            const builder = new Group_1.GroupSessionBuilder(storage);
            if (!item.groupId) {
                throw new Error('Group ID is required for sender key distribution message');
            }
            const senderName = jidToSignalSenderKeyName(item.groupId, authorJid);
            const senderMsg = new Group_1.SenderKeyDistributionMessage(null, null, null, null, item.axolotlSenderKeyDistributionMessage);
            const senderNameStr = senderName.toString();
            const { [senderNameStr]: senderKey } = await auth.keys.get('sender-key', [senderNameStr]);
            if (!senderKey) {
                await storage.storeSenderKey(senderName, new sender_key_record_1.SenderKeyRecord());
            }
            await builder.process(senderName, senderMsg);
        },
        async decryptMessage({ jid, type, ciphertext }) {
            const addr = jidToSignalProtocolAddress(jid);
            const session = new libsignal.SessionCipher(storage, addr);
            let result;
            switch (type) {
                case 'pkmsg':
                    result = await session.decryptPreKeyWhisperMessage(ciphertext);
                    break;
                case 'msg':
                    result = await session.decryptWhisperMessage(ciphertext);
                    break;
                default:
                    throw new Error(`Unknown message type: ${type}`);
            }
            return result;
        },
        async encryptMessage({ jid, data }) {
            const addr = jidToSignalProtocolAddress(jid);
            const cipher = new libsignal.SessionCipher(storage, addr);
            const { type: sigType, body } = await cipher.encrypt(data);
            const type = sigType === 3 ? 'pkmsg' : 'msg';
            return { type, ciphertext: Buffer.from(body, 'binary') };
        },
        async encryptGroupMessage({ group, meId, data }) {
            const senderName = jidToSignalSenderKeyName(group, meId);
            const builder = new Group_1.GroupSessionBuilder(storage);
            const senderNameStr = senderName.toString();
            const { [senderNameStr]: senderKey } = await auth.keys.get('sender-key', [senderNameStr]);
            if (!senderKey) {
                await storage.storeSenderKey(senderName, new sender_key_record_1.SenderKeyRecord());
            }
            const senderKeyDistributionMessage = await builder.create(senderName);
            const session = new Group_1.GroupCipher(storage, senderName);
            const ciphertext = await session.encrypt(data);
            return {
                ciphertext,
                senderKeyDistributionMessage: senderKeyDistributionMessage.serialize()
            };
        },
        async injectE2ESession({ jid, session }) {
            const cipher = new libsignal.SessionBuilder(storage, jidToSignalProtocolAddress(jid));
            await cipher.initOutgoing(session);
        },
        jidToSignalProtocolAddress(jid) {
            return jidToSignalProtocolAddress(jid).toString();
        },
        /**
         * Mindahin semua sesi signal milik satu user dari identitas nomor (PN)
         * ke identitas LID-nya, sekali mapping baru ketemu. Tanpa ini, sesi
         * lama tetep nyantol ke alamat PN — masih bisa jalan, cuma gak
         * "pindah rumah" ke LID begitu WhatsApp full privacy-mode aktif.
         */
        async migrateSession(fromJid, toJid) {
            if (!fromJid || (!(0, WABinary_1.isLidUser)(toJid) && !(0, WABinary_1.isHostedLidUser)(toJid))) {
                return { migrated: 0, skipped: 0, total: 0 };
            }
            if (!(0, WABinary_1.isPnUser)(fromJid) && !(0, WABinary_1.isHostedPnUser)(fromJid)) {
                return { migrated: 0, skipped: 0, total: 1 };
            }
            const { user } = (0, WABinary_1.jidDecode)(fromJid);
            log.debug?.({ fromJid }, 'bulk device migration - loading all user devices');
            const { [user]: userDevices } = await parsedKeys.get('device-list', [user]);
            if (!userDevices) {
                return { migrated: 0, skipped: 0, total: 0 };
            }
            const { device: fromDevice } = (0, WABinary_1.jidDecode)(fromJid);
            const fromDeviceStr = fromDevice?.toString() || '0';
            if (!userDevices.includes(fromDeviceStr)) {
                userDevices.push(fromDeviceStr);
            }
            const uncachedDevices = userDevices.filter((device) => !migratedSessionCache.has(`${user}.${device}`));
            const deviceSessionKeys = uncachedDevices.map((device) => `${user}.${device}`);
            const existingSessions = await parsedKeys.get('session', deviceSessionKeys);
            const deviceJids = [];
            for (const [sessionKey, sessionData] of Object.entries(existingSessions)) {
                if (sessionData) {
                    const deviceStr = sessionKey.split('.')[1];
                    if (!deviceStr) continue;
                    const deviceNum = parseInt(deviceStr);
                    let jid = deviceNum === 0 ? `${user}@s.whatsapp.net` : `${user}:${deviceNum}@s.whatsapp.net`;
                    if (deviceNum === 99) jid = `${user}:99@hosted`;
                    deviceJids.push(jid);
                }
            }
            log.debug?.({ fromJid, totalDevices: userDevices.length, devicesWithSessions: deviceJids.length }, 'bulk device migration complete');
            return parsedKeys.transaction(async () => {
                const migrationOps = deviceJids.map((jid) => {
                    const lidWithDevice = (0, WABinary_1.transferDevice)(jid, toJid);
                    const fromDecoded = (0, WABinary_1.jidDecode)(jid);
                    const toDecoded = (0, WABinary_1.jidDecode)(lidWithDevice);
                    return {
                        fromJid: jid,
                        toJid: lidWithDevice,
                        pnUser: fromDecoded.user,
                        lidUser: toDecoded.user,
                        deviceId: fromDecoded.device || 0,
                        fromAddr: jidToSignalProtocolAddress(jid),
                        toAddr: jidToSignalProtocolAddress(lidWithDevice)
                    };
                });
                const totalOps = migrationOps.length;
                let migratedCount = 0;
                const pnAddrStrings = Array.from(new Set(migrationOps.map((op) => op.fromAddr.toString())));
                const pnSessions = await parsedKeys.get('session', pnAddrStrings);
                const sessionUpdates = {};
                for (const op of migrationOps) {
                    const pnAddrStr = op.fromAddr.toString();
                    const lidAddrStr = op.toAddr.toString();
                    const pnSession = pnSessions[pnAddrStr];
                    if (pnSession) {
                        const fromSession = libsignal.SessionRecord.deserialize(pnSession);
                        if (fromSession.haveOpenSession()) {
                            sessionUpdates[lidAddrStr] = fromSession.serialize();
                            sessionUpdates[pnAddrStr] = null;
                            migratedCount++;
                        }
                    }
                }
                if (Object.keys(sessionUpdates).length > 0) {
                    await parsedKeys.set({ session: sessionUpdates });
                    log.debug?.({ migratedSessions: migratedCount }, 'bulk session migration complete');
                    for (const op of migrationOps) {
                        if (sessionUpdates[op.toAddr.toString()]) {
                            migratedSessionCache.set(`${op.pnUser}.${op.deviceId}`, true);
                        }
                    }
                }
                return { migrated: migratedCount, skipped: totalOps - migratedCount, total: totalOps };
            }, `migrate-${deviceJids.length}-sessions-${(0, WABinary_1.jidDecode)(toJid)?.user}`);
        }
    };
}
const jidToSignalProtocolAddress = (jid) => {
    const { user, device } = (0, WABinary_1.jidDecode)(jid);
    return new libsignal.ProtocolAddress(user, device || 0);
};
const jidToSignalSenderKeyName = (group, user) => {
    return new sender_key_name_1.SenderKeyName(group, jidToSignalProtocolAddress(user));
};
function signalStorage({ creds, keys }) {
    return {
        loadSession: async (id) => {
            const { [id]: sess } = await keys.get('session', [id]);
            if (sess) {
                return libsignal.SessionRecord.deserialize(sess);
            }
        },
        storeSession: async (id, session) => {
            await keys.set({ session: { [id]: session.serialize() } });
        },
        isTrustedIdentity: () => {
            return true;
        },
        loadPreKey: async (id) => {
            const keyId = id.toString();
            const { [keyId]: key } = await keys.get('pre-key', [keyId]);
            if (key) {
                return {
                    privKey: Buffer.from(key.private),
                    pubKey: Buffer.from(key.public)
                };
            }
        },
        removePreKey: (id) => keys.set({ 'pre-key': { [id]: null } }),
        loadSignedPreKey: () => {
            const key = creds.signedPreKey;
            return {
                privKey: Buffer.from(key.keyPair.private),
                pubKey: Buffer.from(key.keyPair.public)
            };
        },
        loadSenderKey: async (senderKeyName) => {
            const keyId = senderKeyName.toString();
            const { [keyId]: key } = await keys.get('sender-key', [keyId]);
            if (key) {
                return sender_key_record_1.SenderKeyRecord.deserialize(key);
            }
            return new sender_key_record_1.SenderKeyRecord();
        },
        storeSenderKey: async (senderKeyName, key) => {
            const keyId = senderKeyName.toString();
            const serialized = JSON.stringify(key.serialize());
            await keys.set({ 'sender-key': { [keyId]: Buffer.from(serialized, 'utf-8') } });
        },
        getOurRegistrationId: () => creds.registrationId,
        getOurIdentity: () => {
            const { signedIdentityKey } = creds;
            return {
                privKey: Buffer.from(signedIdentityKey.private),
                pubKey: (0, Utils_1.generateSignalPubKey)(signedIdentityKey.public)
            };
        }
    };
}

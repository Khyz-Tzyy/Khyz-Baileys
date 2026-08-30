// ESM wrapper for Khyz-Baileys (CJS compatibility)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load semua dari CJS
const pkg = require('./index.js');

// Re-export default
export default pkg.default || pkg.makeWASocket;

// Re-export makeWASocket explicitly
export const makeWASocket = pkg.makeWASocket;

// Export semua key lainnya secara individual
// Core auth
export const useMultiFileAuthState = pkg.useMultiFileAuthState;
export const makeCacheableSignalKeyStore = pkg.makeCacheableSignalKeyStore;
export const initAuthCreds = pkg.initAuthCreds;
export const BufferJSON = pkg.BufferJSON;
export const fetchLatestWAWebVersion = pkg.fetchLatestWAWebVersion;
export const fetchLatestBaileysVersion = pkg.fetchLatestBaileysVersion;

// JID utils
export const jidEncode = pkg.jidEncode;
export const jidDecode = pkg.jidDecode;
export const jidNormalizedUser = pkg.jidNormalizedUser;
export const areJidsSameUser = pkg.areJidsSameUser;
export const isJidGroup = pkg.isJidGroup;
export const isJidNewsletter = pkg.isJidNewsletter;
export const isJidBroadcast = pkg.isJidBroadcast;
export const isJidStatusBroadcast = pkg.isJidStatusBroadcast;
export const isLidUser = pkg.isLidUser;
export const isPnUser = pkg.isPnUser;
export const isJidBot = pkg.isJidBot;
export const isJidMetaAI = pkg.isJidMetaAI;
export const isJidUser = pkg.isJidUser;

// Message utils
export const getContentType = pkg.getContentType;
export const getContentTypeSafe = pkg.getContentTypeSafe;
export const normalizeMessageContent = pkg.normalizeMessageContent;
export const extractMessageContent = pkg.extractMessageContent;
export const generateWAMessage = pkg.generateWAMessage;
export const generateWAMessageFromContent = pkg.generateWAMessageFromContent;
export const generateWAMessageContent = pkg.generateWAMessageContent;
export const prepareWAMessageMedia = pkg.prepareWAMessageMedia;
export const generateForwardMessageContent = pkg.generateForwardMessageContent;
export const downloadMediaMessage = pkg.downloadMediaMessage;
export const downloadContentFromMessage = pkg.downloadContentFromMessage;
export const assertMediaContent = pkg.assertMediaContent;
export const updateMessageWithReaction = pkg.updateMessageWithReaction;
export const updateMessageWithReceipt = pkg.updateMessageWithReceipt;
export const updateMessageWithPollUpdate = pkg.updateMessageWithPollUpdate;
export const getAggregateVotesInPollMessage = pkg.getAggregateVotesInPollMessage;
export const aggregateMessageKeysNotFromMe = pkg.aggregateMessageKeysNotFromMe;
export const getDevice = pkg.getDevice;
export const extractUrlFromText = pkg.extractUrlFromText;
export const generateLinkPreviewIfRequired = pkg.generateLinkPreviewIfRequired;

// Proto
export const proto = pkg.proto;
export const WAProto = pkg.WAProto;

// Connection
export const DisconnectReason = pkg.DisconnectReason;
export const Browsers = pkg.Browsers;
export const ConnectionState = pkg.ConnectionState;

// Crypto
export const Curve = pkg.Curve;
export const signedKeyPair = pkg.signedKeyPair;
export const aesEncryptGCM = pkg.aesEncryptGCM;
export const aesDecryptGCM = pkg.aesDecryptGCM;
export const aesEncryptCBC = pkg.aesEncryptCBC;
export const aesDecryptCBC = pkg.aesDecryptCBC;
export const hmacSign = pkg.hmacSign;
export const sha256 = pkg.sha256;

// WABinary
export const getBinaryNodeChild = pkg.getBinaryNodeChild;
export const getBinaryNodeChildren = pkg.getBinaryNodeChildren;
export const getAllBinaryNodeChildren = pkg.getAllBinaryNodeChildren;
export const getBinaryNodeChildString = pkg.getBinaryNodeChildString;
export const getBinaryNodeChildBuffer = pkg.getBinaryNodeChildBuffer;
export const getBinaryNodeChildUInt = pkg.getBinaryNodeChildUInt;
export const assertNodeErrorFree = pkg.assertNodeErrorFree;
export const getBinaryNodeMessages = pkg.getBinaryNodeMessages;
export const reduceBinaryNodeToDictionary = pkg.reduceBinaryNodeToDictionary;
export const binaryNodeToString = pkg.binaryNodeToString;
export const encodeBinaryNode = pkg.encodeBinaryNode;
export const decodeBinaryNode = pkg.decodeBinaryNode;
export const getBinaryNodeFilter = pkg.getBinaryNodeFilter;
export const getAdditionalNode = pkg.getAdditionalNode;
export const S_WHATSAPP_NET = pkg.S_WHATSAPP_NET;
export const STORIES_JID = pkg.STORIES_JID;
export const SERVER_JID = pkg.SERVER_JID;
export const PSA_WID = pkg.PSA_WID;
export const OFFICIAL_BIZ_JID = pkg.OFFICIAL_BIZ_JID;

// Store
export const makeInMemoryStore = pkg.makeInMemoryStore;
export const makeCacheManagerStore = pkg.makeCacheManagerStore;

// Utils
export const toNumber = pkg.toNumber;
export const unixTimestampSeconds = pkg.unixTimestampSeconds;
export const delay = pkg.delay;
export const generateMessageID = pkg.generateMessageID;
export const generateMessageIDV2 = pkg.generateMessageIDV2;
export const makeMutex = pkg.makeMutex;
export const addTransactionCapability = pkg.addTransactionCapability;
export const bindWaitForConnectionUpdate = pkg.bindWaitForConnectionUpdate;
export const bindWaitForEvent = pkg.bindWaitForEvent;
export const makeEventBuffer = pkg.makeEventBuffer;
export const generateRegistrationNode = pkg.generateRegistrationNode;
export const generateLoginNode = pkg.generateLoginNode;
export const makeNoiseHandler = pkg.makeNoiseHandler;
export const getCodeFromWSError = pkg.getCodeFromWSError;
export const getErrorCodeFromStreamError = pkg.getErrorCodeFromStreamError;
export const printQRIfNecessaryListener = pkg.printQRIfNecessaryListener;
export const makeLibSignalRepository = pkg.makeLibSignalRepository;
export const getWAUploadToServer = pkg.getWAUploadToServer;
export const getUrlFromDirectPath = pkg.getUrlFromDirectPath;
export const generateThumbnail = pkg.generateThumbnail;
export const encryptMediaRetryRequest = pkg.encryptMediaRetryRequest;
export const decryptMediaRetryData = pkg.decryptMediaRetryData;
export const getStatusCodeForMediaRetry = pkg.getStatusCodeForMediaRetry;
export const prepareStream = pkg.prepareStream;
export const encryptedStream = pkg.encryptedStream;
export const getAudioDuration = pkg.getAudioDuration;
export const getAudioWaveform = pkg.getAudioWaveform;

// Defaults
export const DEFAULT_CONNECTION_CONFIG = pkg.DEFAULT_CONNECTION_CONFIG;
export const DEFAULT_CACHE_TTLS = pkg.DEFAULT_CACHE_TTLS;
export const WA_DEFAULT_EPHEMERAL = pkg.WA_DEFAULT_EPHEMERAL;
export const MEDIA_KEYS = pkg.MEDIA_KEYS;
export const URL_REGEX = pkg.URL_REGEX;
export const INITIAL_PREKEY_COUNT = pkg.INITIAL_PREKEY_COUNT;
export const MIN_PREKEY_COUNT = pkg.MIN_PREKEY_COUNT;
export const NOISE_WA_HEADER = pkg.NOISE_WA_HEADER;
export const WA_CERT_DETAILS = pkg.WA_CERT_DETAILS;

// Rich messages
export const sendTable = pkg.sendTable;
export const sendList = pkg.sendList;
export const sendCodeBlock = pkg.sendCodeBlock;
export const sendLink = pkg.sendLink;
export const sendRichMessage = pkg.sendRichMessage;
export const generateTableContent = pkg.generateTableContent;
export const generateListContent = pkg.generateListContent;
export const generateCodeBlockContent = pkg.generateCodeBlockContent;
export const generateLinkContent = pkg.generateLinkContent;

// Business
export const sendStoreMessage = pkg.sendStoreMessage;
export const sendPaymentRequest = pkg.sendPaymentRequest;
export const sendCatalogMessage = pkg.sendCatalogMessage;
export const sendOrderMessage = pkg.sendOrderMessage;

// Signal
export const makeSignalRepository = pkg.makeSignalRepository;
export const decryptGroupSignalProto = pkg.decryptGroupSignalProto;
export const decryptSignalProto = pkg.decryptSignalProto;
export const encryptSignalProto = pkg.encryptSignalProto;
export const encryptSenderKeyMsgSignalProto = pkg.encryptSenderKeyMsgSignalProto;
export const encryptGroupSignalProto = pkg.encryptGroupSignalProto;
export const processSyncAction = pkg.processSyncAction;
export const decodePatched = pkg.decodePatched;
export const decodeNewsletterMessage = pkg.decodeNewsletterMessage;
export const getNextPreKeysNode = pkg.getNextPreKeysNode;
export const getPlatformId = pkg.getPlatformId;
export const bytesToCrockford = pkg.bytesToCrockford;
export const derivePairingCodeKey = pkg.derivePairingCodeKey;
export const aesEncryptCTR = pkg.aesEncryptCTR;
export const generateMdTagPrefix = pkg.generateMdTagPrefix;
export const promiseTimeout = pkg.promiseTimeout;
export const generateProfileNodes = pkg.generateProfileNodes;
export const MEDIA_HKDF_KEY_MAPPING = pkg.MEDIA_HKDF_KEY_MAPPING;
export const MEDIA_PATH_MAP = pkg.MEDIA_PATH_MAP;

// --- khyz-baileys 3.0.0: newly restored/added exports ---
export const executeWMexQuery = pkg.executeWMexQuery;
export const extractCommunityMetadata = pkg.extractCommunityMetadata;
export const MessageRetryManager = pkg.MessageRetryManager;
export const PreKeyManager = pkg.PreKeyManager;
export const isHostedPnUser = pkg.isHostedPnUser;
export const isHostedLidUser = pkg.isHostedLidUser;
export const transferDevice = pkg.transferDevice;
export const getServerFromDomainType = pkg.getServerFromDomainType;
export const WAJIDDomains = pkg.WAJIDDomains;
export const META_AI_JID = pkg.META_AI_JID;
export const generateRichCardContent = pkg.generateRichCardContent;
export const sendRichMessageCard = pkg.sendRichMessageCard;

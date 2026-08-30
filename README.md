# Khyz-Baileys

<p align="center">
  <img src="https://files.catbox.moe/369pux.jpg" alt="Thumbnail" />
</p>

<p align="center">
  <b>Modded Baileys — Interactive Messages, Rich Responses, Albums, Newsletter & More</b><br/>
  <i>Modification by KhyzTzyy | Based on WhiskeySockets/Baileys</i>
</p>

---

Khyz-Baileys is an open-source modded build of WhiskeySockets/Baileys with native support for interactive messages, album messages, rich AI-style responses, newsletter helpers, payment messages, and additional business/community utilities.

Actively maintained and optimized for stability, fast response, and compatibility with the latest WhatsApp multi-device features.

---

## ✨ Features

| Feature | Description | Status |
|--------|-------------|--------|
| Interactive Messages | Native flow buttons, list menus, copy buttons, URL buttons | ✅ |
| Album Messages | Multi-image/video album grouped delivery | ✅ |
| Rich Response | sendTable, sendList, sendCodeBlock, sendLink, sendRichMessage | ✅ |
| Payment Messages | Request payment with note/sticker support | ✅ |
| Product / Catalog | Business product messages with buttons | ✅ |
| Event / Poll Result | Event builders and poll result snapshots | ✅ |
| Newsletter Extras | Follow, unfollow, mute, bulk follow, subscribers, URL resolve | ✅ |
| Order Messages | Order message with status and total | ✅ |
| Button Types | single_select, cta_url, cta_copy, cta_call, quick_reply, payment_info | ✅ |
| Optimized Connection | Better keepalive, auto session recreation, faster sync | ✅ |

---

## ✅ Requirements

- Node.js >= 20.0.0
- CommonJS project (no `"type": "module"` needed)

---

## 📦 Installation

```json
"dependencies": {
  "@whiskeysockets/baileys": "github:Khyz-Tzyy/Baileys"
}
```

Then run:

```bash
npm install
```

---

## 🛠️ Quick Start

### Import

```javascript
const {
  default: makeWASocket,
  // other options
} = require('@whiskeysockets/baileys');
```

### Connect with QR Code

```javascript
const { default: makeWASocket } = require('@whiskeysockets/baileys');

const sock = makeWASocket({
  browser: ['Ubuntu', 'Chrome', '20.00.1'],
  printQRInTerminal: true
});
```

### Connect with Pairing Code

```javascript
const {
  default: makeWASocket,
  fetchLatestWAWebVersion
} = require('@whiskeysockets/baileys');

const sock = makeWASocket({
  browser: ['Ubuntu', 'Chrome', '20.00.1'],
  printQRInTerminal: false,
  version: await fetchLatestWAWebVersion()
});

const number = '628XXXXXXXXX';
const code = await sock.requestPairingCode(number.trim());
// Custom pairing: sock.requestPairingCode(number, 'ABCD1234')

console.log('Pairing code: ' + code);
```

---

## 📡 Sending Messages

### Text Message

```javascript
await sock.sendMessage(jid, { text: 'Hello!' });
```

### Interactive Message (with buttons)

```javascript
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: 'Selamat datang!',
    footer: '© KhyzTzyy',
    thumbnail: 'https://example.com/thumb.jpg',
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📋 Menu',
          id: '.menu'
        })
      },
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: '📋 Salin Kode',
          copy_code: 'KHYZ2025'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🌐 Website',
          url: 'https://example.com'
        })
      }
    ]
  }
});
```

### Album Message

```javascript
await sock.sendMessage(jid, {
  albumMessage: [
    { image: { url: './photo1.jpg' }, caption: 'Foto 1' },
    { image: { url: './photo2.jpg' }, caption: 'Foto 2' },
    { video: { url: './video.mp4' }, caption: 'Video' }
  ]
});
```

### Rich Response — Table

```javascript
await sock.sendTable(
  jid,
  'Java vs JavaScript',
  ['Feature', 'Java', 'JavaScript'],
  [
    ['Type', 'Compiled', 'Interpreted'],
    ['Typing', 'Static', 'Dynamic'],
    ['Main Use', 'Enterprise', 'Web']
  ],
  quoted,
  { headerText: 'Perbandingan:', footer: 'Semoga membantu!' }
);
```

### Rich Response — List

```javascript
await sock.sendList(
  jid,
  'Info Bot',
  [
    ['Nama', 'Qin Shi'],
    ['Versi', '1.0.0'],
    ['Developer', 'KhyzTzyy']
  ],
  quoted,
  { footer: '© KhyzTzyy' }
);
```

### Rich Response — Code Block

```javascript
await sock.sendCodeBlock(
  jid,
  `const greeting = 'Hello'\nconsole.log(greeting)`,
  quoted,
  { language: 'javascript', title: '📝 Contoh Kode', footer: 'KhyzTzyy' }
);
```

### Rich Response — Link

```javascript
await sock.sendLink(
  jid,
  'Hasil upload:\n🔗 {{IE_0}}klik disini{{/IE_0}}',
  ['https://example.com'],
  quoted,
  {
    headerText: '📁 Uploader',
    footer: '✨ Selesai!',
    citations: [{ sourceTitle: 'Server', citationNumber: 1 }]
  }
);
```

### Rich Response — Combined (sendRichMessage)

```javascript
await sock.sendRichMessage(
  jid,
  [
    { messageType: 2, messageText: '📊 Perbandingan:' },
    {
      messageType: 4,
      tableMetadata: {
        title: 'Bahasa',
        rows: [
          { items: ['Bahasa', 'Use Case'], isHeading: true },
          { items: ['JavaScript', 'Web'] },
          { items: ['Python', 'AI/ML'] }
        ]
      }
    },
    { messageType: 2, messageText: 'Contoh kode:' },
    {
      messageType: 5,
      codeMetadata: {
        codeLanguage: 'javascript',
        codeBlocks: 'console.log("Hello!")' // auto-tokenize
      }
    }
  ],
  quoted,
  { footer: '© KhyzTzyy' }
);
```

### Payment Request

```javascript
await sock.sendMessage(jid, {
  requestPaymentMessage: {
    amount: 50000,
    currency: 'IDR',
    note: 'Pembayaran order #123',
    from: '628xxx@s.whatsapp.net'
  }
});
```

### Product Message

```javascript
await sock.sendMessage(jid, {
  productMessage: {
    title: 'Wireless Headphones',
    description: 'Headphone bluetooth kualitas tinggi',
    productId: 'WH-001',
    retailerId: 'khyz-shop',
    url: 'https://example.com/product',
    priceAmount1000: 299000,
    currencyCode: 'IDR',
    thumbnail: { url: 'https://example.com/product.jpg' },
    body: 'Cek produk ini!',
    footer: 'Khyz Shop',
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'Beli Sekarang',
          id: 'buy_wh001'
        })
      }
    ]
  }
});
```

### Order Message

```javascript
await sock.sendMessage(jid, {
  orderMessage: {
    orderId: 'ORDER123',
    itemCount: 3,
    status: 'ACCEPTED',
    message: 'Pesanan kamu sudah diterima!',
    orderTitle: 'Order #123',
    sellerJid: '628xxx@s.whatsapp.net',
    totalAmount1000: 150000,
    totalCurrencyCode: 'IDR'
  }
});
```

### Poll Result

```javascript
await sock.sendMessage(jid, {
  pollResultMessage: {
    name: 'Bahasa Favorit?',
    pollVotes: [
      { optionName: 'JavaScript', optionVoteCount: 42 },
      { optionName: 'Python', optionVoteCount: 38 }
    ],
    newsletter: {
      newsletterName: 'KhyzTzyy',
      newsletterJid: '120363401718869058@newsletter'
    }
  }
});
```

---

## 📡 Newsletter Methods

```javascript
// Follow channel
await sock.newsletterFollow('120363xxx@newsletter');

// Unfollow
await sock.newsletterUnfollow('120363xxx@newsletter');

// Mute / Unmute
await sock.newsletterMute('120363xxx@newsletter');
await sock.newsletterUnmute('120363xxx@newsletter');

// Bulk follow
await sock.newsletterMultipleFollow(['id1@newsletter', 'id2@newsletter']);

// Get subscriber count
const { subscribers } = await sock.newsletterSubscribers('120363xxx@newsletter');

// Resolve URL ke metadata
const info = await sock.cekIDSaluran('https://whatsapp.com/channel/xxx');
console.log(info.name, info.subscribers);

// React ke postingan
await sock.newsletterReactMessage('120363xxx@newsletter', serverId, '👍');

// Fetch semua channel yang diikuti
const channels = await sock.newsletterFetchAllSubscribe();
```

---

## 📝 Changelog — 2.3.0 → 3.0.0

### Dependencies
- `libsignal`: `github:tenka-san/libsignal-node` → `^6.0.0` (official)
- `pino`: `^7.0.0` → `^9.6`
- `music-metadata`: `^7.12.3` → `^11.12.3`
- Added: `whatsapp-rust-bridge@0.5.4`, `lru-cache@^11.1.0`, `p-queue@^9.0.0`, `fflate@^0.8.3`
- Removed: `audio-decode` (confirmed unused)
- **Not removed** (still actively used internally, despite being in the original removal list): `node-fetch`, `cache-manager`, `@cacheable/node-cache`, `libphonenumber-js`, `lodash`, `uuid`, `axios`, `futoin-hkdf`. In particular `futoin-hkdf` implements the HKDF key-derivation step of the Signal-protocol crypto in `Utils/crypto.js` — removing it without a replacement implementation would break message encryption/decryption entirely, so it was kept. Migrating these to more modern equivalents is possible but out of scope for this release; happy to do it as a dedicated follow-up.

### Restored modules (were missing in 2.3.0, ported from official WhiskeySockets/Baileys)
- `Socket/communities.ts` → `communities.js`, wired into the socket layer chain (`business → communities → registration`)
- `Socket/mex.ts` → `mex.js` (w:mex GraphQL-style query helper, available for newsletter/community features)
- `Utils/browser-utils.ts`, `companion-reg-client-utils.ts`, `identity-change-handler.ts`, `message-retry-manager.ts`, `offline-node-processor.ts`, `pre-key-manager.ts`, `reporting-utils.ts`, `stanza-ack.ts`, `sync-action-utils.ts`, `tc-token-utils.ts` — all exported from `Utils`. These are added as available building blocks; deeper auto-wiring into the core retry/pre-key flow (e.g. having `messages-recv` call `MessageRetryManager` automatically) is intentionally left for a follow-up so this release stays a safe, additive change.

### Proto & WA version
- `WAProto/WAProto.proto` + generated `index.js`/`index.d.ts` synced from the official schema. Verified: every proto type referenced anywhere in this package (42 message/enum names, including inside the custom `luxu`/rich-message code) exists in the new schema.
- `Defaults/baileys-version.json` pin updated to `[2, 3000, 1043857760]`. `fetchLatestBaileysVersion()` was already present in this fork.

### New features
- **Anti logout sender**: disconnects that look like `loggedOut` (401) but did *not* come from an explicit local `logout()` call are now flagged (`error.data.isIntentionalLogout: false`) instead of being silently treated the same as a real logout. Consumers can check this flag to decide whether to reconnect rather than deleting the session. A full internal auto-reconnect was deliberately *not* added — that decision is left to the consumer's `connection.update` handler, consistent with how the rest of the ecosystem expects Baileys to behave.
- **Anti rate limit**: `config.rateLimit = { messagesPerSecond, concurrency }` (opt-in, off by default) queues `sendMessage` calls through `p-queue`, loaded lazily via dynamic `import()` since `p-queue@9` is ESM-only and this package is CJS.
- **Full JID support**: `WABinary/jid-utils.js` now handles `@lid`, `@hosted`, `@hosted.lid` in addition to `@s.whatsapp.net`/`@g.us`, plus `isJidBot`, `isJidMetaAI`, `transferDevice`, `getServerFromDomainType`. All existing export names (e.g. `isJidNewsLetter`) were kept for backward compatibility.
- **All button types**: quick reply, CTA URL, CTA call, list, template, native flow were already supported; **carousel** support was added to `Utils/messages.js` (`content.carousel = [{ title, body, footer, image, buttons }]`) — this was missing from *both* this fork and upstream Baileys, so it's a new addition, not a port.
- **Rich message card**: `sock.sendMessage(jid, { richMessage: { title, text, code, table, image, images, video, suggestions, footer } })`. Built natively on WhatsApp's own `AIRichResponse` message schema (title/text/code/table/image/images/footer are one native message); `video` and `suggestions` are sent as accompanying native messages in the same call, because WhatsApp's rich-card and interactive-button formats are different message kinds at the protocol level and can't be merged into a single wire message.
- **`onTarget` on `relayMessage`**: `relayMessage(jid, message, { onTarget: true })` — for private chats only, skips syncing the message to the sender's own other linked devices; only the recipient gets it.
- **Stability**: message-retry and pre-key management utilities restored (see above), plus the anti-logout flagging and opt-in rate limiting above.

### Cleanup
- Removed `Socket/luxu.js.bak`, `Socket/messages-send.js.bak`
- `package.json` `files` field tightened so `.bak`/debug files can't be published again

### Known limitations of this release
- This package ships pre-compiled (no `src/` TypeScript tree was included with the 2.3.0 package this update was built from), so changes were made directly against the compiled `lib/` output rather than through a `tsc` build. Everything was validated with `node --check` across the whole package plus a require-graph check, but a real end-to-end connection test against WhatsApp's servers has not been run in this environment (no network access) — please smoke-test before rolling out to production bots.
- `axios`/`node-fetch`/`lodash`/`uuid`/`cache-manager` migrations to more modern equivalents were intentionally not attempted this release (see Dependencies above).

---

## 🙏 Credits

```javascript
const credits = new Map([
  ['KhyzTzyy', 'Modification & Maintenance'],
  ['WhiskeySockets', 'Original Baileys'],
  ['Gupong', 'Base Fork Reference']
]);
```
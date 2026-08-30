import type { BinaryNode } from '../WABinary';
/**
 * Executes a WhatsApp "w:mex" (GraphQL-over-XMPP) query — used by newer
 * WhatsApp features (e.g. newsletters, communities) that moved off the
 * classic iq/query binary-node style onto a GraphQL-style query id + variables.
 * Ported from the official WhiskeySockets/Baileys `mex.ts`.
 */
export declare const executeWMexQuery: <T = any>(variables: Record<string, unknown>, queryId: string, dataPath: string | undefined, query: (node: BinaryNode) => Promise<BinaryNode>, generateMessageTag: () => string) => Promise<T>;

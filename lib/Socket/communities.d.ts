/// <reference types="node" />
import type { GroupMetadata, GroupParticipant, ParticipantAction, SocketConfig, WAMessageKey } from '../Types';
import type { BinaryNode } from '../WABinary';
import { makeBusinessSocket } from './business';
export type CommunitiesSocket = ReturnType<typeof makeBusinessSocket> & {
    communityMetadata: (jid: string) => Promise<GroupMetadata>;
    communityCreate: (subject: string, body: string) => Promise<GroupMetadata | null>;
    communityCreateGroup: (subject: string, participants: string[], parentCommunityJid: string) => Promise<GroupMetadata | null>;
    communityLeave: (id: string) => Promise<void>;
    communityUpdateSubject: (jid: string, subject: string) => Promise<void>;
    communityLinkGroup: (groupJid: string, parentCommunityJid: string) => Promise<void>;
    communityUnlinkGroup: (groupJid: string, parentCommunityJid: string) => Promise<void>;
    communityFetchLinkedGroups: (jid: string) => Promise<{
        communityJid: string;
        isCommunity: boolean;
        linkedGroups: {
            id: string | undefined;
            subject: string;
            creation: number | undefined;
            owner: string | undefined;
            size: number | undefined;
        }[];
    }>;
    communityRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    communityRequestParticipantsUpdate: (jid: string, participants: string[], action: 'approve' | 'reject') => Promise<{
        status: string;
        jid: string;
    }[]>;
    communityParticipantsUpdate: (jid: string, participants: string[], action: ParticipantAction) => Promise<{
        status: string;
        jid: string;
        content: BinaryNode;
    }[]>;
    communityUpdateDescription: (jid: string, description?: string) => Promise<void>;
    communityInviteCode: (jid: string) => Promise<string | undefined>;
    communityRevokeInvite: (jid: string) => Promise<string | undefined>;
    communityAcceptInvite: (code: string) => Promise<string | undefined>;
    communityRevokeInviteV4: (communityJid: string, invitedJid: string) => Promise<boolean>;
    communityAcceptInviteV4: (key: string | WAMessageKey, inviteMessage: any) => Promise<string>;
    communityGetInviteInfo: (code: string) => Promise<GroupMetadata>;
    communityToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    communitySettingUpdate: (jid: string, setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked') => Promise<void>;
    communityMemberAddMode: (jid: string, mode: 'admin_add' | 'all_member_add') => Promise<void>;
    communityJoinApprovalMode: (jid: string, mode: 'on' | 'off') => Promise<void>;
    communityFetchAllParticipating: () => Promise<{
        [_: string]: GroupMetadata;
    }>;
};
export declare const makeCommunitiesSocket: (config: SocketConfig) => CommunitiesSocket;
export declare const extractCommunityMetadata: (result: BinaryNode) => GroupMetadata;

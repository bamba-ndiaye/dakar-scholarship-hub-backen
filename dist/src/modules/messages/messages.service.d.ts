import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createConversation(userId: string, dto: CreateConversationDto): Promise<{
        participants: ({
            user: {
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            conversationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findConversations(userId: string): Promise<{
        id: string;
        participants: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        lastMessage: string;
        lastMessageAt: Date;
        unreadCount: number;
    }[]>;
    findMessages(conversationId: string, userId: string): Promise<{
        id: string;
        conversationId: string;
        senderId: string;
        senderName: string;
        content: string;
        read: boolean;
        createdAt: Date;
    }[]>;
    createMessage(conversationId: string, userId: string, dto: CreateMessageDto): Promise<{
        id: string;
        conversationId: string;
        senderId: string;
        senderName: string;
        content: string;
        read: boolean;
        createdAt: Date;
    }>;
    private ensureParticipant;
}

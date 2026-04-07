import { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findConversations(user: CurrentUserData): Promise<{
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
    createConversation(user: CurrentUserData, dto: CreateConversationDto): Promise<{
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
    findMessages(user: CurrentUserData, id: string): Promise<{
        id: string;
        conversationId: string;
        senderId: string;
        senderName: string;
        content: string;
        read: boolean;
        createdAt: Date;
    }[]>;
    createMessage(user: CurrentUserData, id: string, dto: CreateMessageDto): Promise<{
        id: string;
        conversationId: string;
        senderId: string;
        senderName: string;
        content: string;
        read: boolean;
        createdAt: Date;
    }>;
}

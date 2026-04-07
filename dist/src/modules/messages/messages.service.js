"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MessagesService = class MessagesService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createConversation(userId, dto) {
        const participantIds = Array.from(new Set([userId, ...dto.participantIds]));
        return this.prisma.conversation.create({
            data: {
                participants: {
                    create: participantIds.map((participantId) => ({ userId: participantId })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, role: true } },
                    },
                },
            },
        });
    }
    async findConversations(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: { participants: { some: { userId } } },
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, role: true } },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        return conversations.map((conversation) => ({
            id: conversation.id,
            participants: conversation.participants.map((participant) => ({
                id: participant.user.id,
                name: `${participant.user.firstName} ${participant.user.lastName}`,
                role: participant.user.role,
            })),
            lastMessage: conversation.messages[0]?.content ?? '',
            lastMessageAt: conversation.messages[0]?.createdAt ?? conversation.updatedAt,
            unreadCount: 0,
        }));
    }
    async findMessages(conversationId, userId) {
        await this.ensureParticipant(conversationId, userId);
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        await this.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, read: false },
            data: { read: true },
        });
        return messages.map((message) => ({
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: `${message.sender.firstName} ${message.sender.lastName}`,
            content: message.content,
            read: message.read,
            createdAt: message.createdAt,
        }));
    }
    async createMessage(conversationId, userId, dto) {
        await this.ensureParticipant(conversationId, userId);
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content: dto.content,
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true } },
                conversation: { include: { participants: true } },
            },
        });
        const recipientIds = message.conversation.participants
            .map((participant) => participant.userId)
            .filter((participantId) => participantId !== userId);
        await Promise.all(recipientIds.map((recipientId) => this.notificationsService.createNotification({
            userId: recipientId,
            title: 'Nouveau message',
            message: 'Vous avez recu un nouveau message dans une conversation.',
            type: client_1.NotificationType.NEW_MESSAGE,
        })));
        return {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: `${message.sender.firstName} ${message.sender.lastName}`,
            content: message.content,
            read: message.read,
            createdAt: message.createdAt,
        };
    }
    async ensureParticipant(conversationId, userId) {
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map
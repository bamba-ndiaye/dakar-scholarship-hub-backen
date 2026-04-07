import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
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

  async findConversations(userId: string) {
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

  async findMessages(conversationId: string, userId: string) {
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

  async createMessage(conversationId: string, userId: string, dto: CreateMessageDto) {
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

    await Promise.all(
      recipientIds.map((recipientId) =>
        this.notificationsService.createNotification({
          userId: recipientId,
          title: 'Nouveau message',
          message: 'Vous avez recu un nouveau message dans une conversation.',
          type: NotificationType.NEW_MESSAGE,
        }),
      ),
    );

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

  private async ensureParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations for the current user' })
  findConversations(@CurrentUser() user: CurrentUserData) {
    return this.messagesService.findConversations(user.sub);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  createConversation(@CurrentUser() user: CurrentUserData, @Body() dto: CreateConversationDto) {
    return this.messagesService.createConversation(user.sub, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'List messages for a conversation' })
  findMessages(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.messagesService.findMessages(id, user.sub);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message inside a conversation' })
  createMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(id, user.sub, dto);
  }
}

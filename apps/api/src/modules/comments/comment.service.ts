import { NotFoundError, AuthorizationError, type CreateCommentInput, type UpdateCommentInput } from '@tasksaas/shared';
import { commentRepository } from './comment.repository.js';
import { taskRepository } from '../tasks/task.repository.js';

export class CommentService {
  async getComments(taskId: string, organizationId: string) {
    await this.verifyTaskExists(taskId, organizationId);
    return commentRepository.findByTaskId(taskId, organizationId);
  }

  async createComment(organizationId: string, userId: string, input: CreateCommentInput) {
    await this.verifyTaskExists(input.taskId, organizationId);

    return commentRepository.create({
      organizationId,
      taskId: input.taskId,
      userId,
      content: input.content,
      mentions: input.mentions,
    });
  }

  async updateComment(commentId: string, organizationId: string, userId: string, input: UpdateCommentInput) {
    const comment = await commentRepository.findByIdAndOrg(commentId, organizationId);
    if (!comment) {
      throw new NotFoundError('Comment', commentId);
    }

    if (comment.userId !== userId) {
      throw new AuthorizationError('You can only edit your own comments');
    }

    return commentRepository.update(commentId, organizationId, input.content, input.mentions);
  }

  async deleteComment(commentId: string, organizationId: string, userId: string, isOrgAdmin: boolean) {
    const comment = await commentRepository.findByIdAndOrg(commentId, organizationId);
    if (!comment) {
      throw new NotFoundError('Comment', commentId);
    }

    if (comment.userId !== userId && !isOrgAdmin) {
      throw new AuthorizationError('You do not have permission to delete this comment');
    }

    await commentRepository.delete(commentId, organizationId);
  }

  private async verifyTaskExists(taskId: string, organizationId: string) {
    const task = await taskRepository.findByIdAndOrg(taskId, organizationId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }
  }
}

export const commentService = new CommentService();

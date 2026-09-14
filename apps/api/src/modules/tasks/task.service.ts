import {
  NotFoundError,
  type CreateTaskInput,
  type UpdateTaskInput,
  type CreateSubtaskInput,
  type UpdateSubtaskInput,
  type ReorderTaskInput,
  type TaskStatus,
  type TaskPriority,
} from '@tasksaas/shared';
import { taskRepository, type TaskFilterParams } from './task.repository.js';
import { projectRepository } from '../projects/project.repository.js';

export class TaskService {
  async getTasks(params: TaskFilterParams) {
    return taskRepository.findMany(params);
  }

  async getTask(taskId: string, organizationId: string) {
    const task = await taskRepository.findByIdAndOrg(taskId, organizationId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }
    return task;
  }

  async createTask(organizationId: string, creatorId: string, input: CreateTaskInput) {
    // Validate project belongs to organization
    const project = await projectRepository.findByIdAndOrg(input.projectId, organizationId);
    if (!project) {
      throw new NotFoundError('Project', input.projectId);
    }

    return taskRepository.create({
      organizationId,
      projectId: input.projectId,
      creatorId,
      title: input.title,
      description: input.description,
      status: input.status as TaskStatus,
      priority: input.priority as TaskPriority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assigneeId: input.assigneeId,
      order: input.order,
      labels: input.labels,
    });
  }

  async updateTask(taskId: string, organizationId: string, input: UpdateTaskInput) {
    await this.getTask(taskId, organizationId);

    return taskRepository.update(taskId, organizationId, {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status as TaskStatus }),
      ...(input.priority && { priority: input.priority as TaskPriority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.order !== undefined && { order: input.order }),
      ...(input.labels !== undefined && { labels: input.labels }),
    });
  }

  async deleteTask(taskId: string, organizationId: string) {
    await this.getTask(taskId, organizationId);
    await taskRepository.delete(taskId, organizationId);
  }

  async reorderTask(organizationId: string, input: ReorderTaskInput) {
    await this.getTask(input.taskId, organizationId);
    return taskRepository.reorder(
      input.taskId,
      organizationId,
      input.status as TaskStatus,
      input.newOrder,
    );
  }

  // Subtask operations
  async createSubtask(organizationId: string, input: CreateSubtaskInput) {
    await this.getTask(input.taskId, organizationId);
    return taskRepository.createSubtask({
      organizationId,
      taskId: input.taskId,
      title: input.title,
      assigneeId: input.assigneeId,
      order: input.order,
    });
  }

  async updateSubtask(subtaskId: string, organizationId: string, input: UpdateSubtaskInput) {
    return taskRepository.updateSubtask(subtaskId, organizationId, input);
  }

  async deleteSubtask(subtaskId: string, organizationId: string) {
    await taskRepository.deleteSubtask(subtaskId, organizationId);
  }
}

export const taskService = new TaskService();

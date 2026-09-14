/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { aiService } from '../src/modules/ai/ai.service.js';
import { aiRepository } from '../src/modules/ai/ai.repository.js';
import { organizationRepository } from '../src/modules/organizations/organization.repository.js';
import { projectRepository } from '../src/modules/projects/project.repository.js';
import { PlanLimitError } from '@tasksaas/shared';

describe('AI Service & Quota Enforcement Tests', () => {
  it('generates task breakdown and suggestion via fallback mode when api key is not set', async () => {
    vi.spyOn(organizationRepository, 'findById').mockResolvedValueOnce({
      id: 'org-1',
      name: 'Acme Corp',
      subscription: { plan: 'FREE' },
    } as any);

    vi.spyOn(aiRepository, 'countRequestsThisMonth').mockResolvedValueOnce(0);
    vi.spyOn(aiRepository, 'logRequest').mockResolvedValueOnce({} as any);
    vi.spyOn(projectRepository, 'findByIdAndOrg').mockResolvedValueOnce({
      id: 'proj-1',
      name: 'Core Platform',
    } as any);

    const result = await aiService.generateTaskAssistant('org-1', 'user-1', {
      projectId: 'proj-1',
      taskTitle: 'Implement OAuth2 PKCE Flow',
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('suggestedPriority');
    expect(result).toHaveProperty('acceptanceCriteria');
    expect(result).toHaveProperty('suggestedSubtasks');
    expect(Array.isArray(result.suggestedSubtasks)).toBe(true);
  });

  it('enforces monthly AI request quota limit for FREE tier', async () => {
    vi.spyOn(organizationRepository, 'findById').mockResolvedValueOnce({
      id: 'org-free',
      name: 'Free Org',
      subscription: { plan: 'FREE' },
    } as any);

    // FREE tier has maxAiRequestsPerMonth = 50
    vi.spyOn(aiRepository, 'countRequestsThisMonth').mockResolvedValueOnce(50);

    await expect(
      aiService.generateTaskAssistant('org-free', 'user-1', {
        projectId: 'proj-1',
        taskTitle: 'Exceed Quota Task',
      }),
    ).rejects.toThrow(PlanLimitError);
  });

  it('calculates AI usage stats and remaining quota accurately', async () => {
    vi.spyOn(organizationRepository, 'findById').mockResolvedValueOnce({
      id: 'org-pro',
      name: 'Pro Org',
      subscription: { plan: 'PRO' },
    } as any);

    vi.spyOn(aiRepository, 'getUsageStats').mockResolvedValueOnce({
      currentMonthRequests: 120,
      featureBreakdown: {
        TASK_ASSISTANT: 80,
        PROJECT_ASSISTANT: 30,
        PRODUCTIVITY_INSIGHTS: 10,
      },
      recentRequests: [],
    });

    const usage = await aiService.getUsage('org-pro');

    expect(usage.plan).toBe('PRO');
    expect(usage.maxMonthlyQuota).toBe(500);
    expect(usage.usedThisMonth).toBe(120);
    expect(usage.remainingQuota).toBe(380);
  });
});

import type { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service.js';
import { sendSuccess } from '../../utils/response.js';

export class BillingController {
  async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const details = await billingService.getSubscriptionDetails(orgId);
      sendSuccess(res, details);
    } catch (error) {
      next(error);
    }
  }

  async createCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await billingService.createCheckoutSession(orgId, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createPortal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const result = await billingService.createCustomerPortalSession(orgId, req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const payments = await billingService.getBillingHistory(orgId);
      sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await billingService.handleWebhook(req.body, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();

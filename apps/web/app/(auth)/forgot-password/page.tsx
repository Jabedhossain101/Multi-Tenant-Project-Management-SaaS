import type { Metadata } from 'next';
import { ForgotPasswordForm } from '../../../components/auth/forgot-password-form.js';

export const metadata: Metadata = {
  title: 'Forgot Password | TaskPulse AI',
  description: 'Recover your TaskPulse AI account access',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

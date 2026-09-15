import type { Metadata } from 'next';
import { LoginForm } from '../../../components/auth/login-form.js';

export const metadata: Metadata = {
  title: 'Sign In | TaskPulse AI',
  description: 'Sign in to access your intelligent multi-tenant SaaS workspace',
};

export default function LoginPage() {
  return <LoginForm />;
}

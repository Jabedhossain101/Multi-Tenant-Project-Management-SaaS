import type { Metadata } from 'next';
import { RegisterForm } from '../../../components/auth/register-form.js';

export const metadata: Metadata = {
  title: 'Create Workspace | TaskPulse AI',
  description: 'Deploy your team workspace with intelligent multi-tenant project management',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

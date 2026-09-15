import * as React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button.js';
import { Badge } from '../../components/ui/badge.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card.js';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  Shield,
  Bot,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small teams and individual creators exploring AI project workflows.',
    features: [
      'Up to 5 team members',
      '3 active projects',
      '1GB secure cloud storage',
      'Basic Gemini AI task breakdowns (50/mo)',
      'Community support',
      'Drag-and-drop Kanban boards',
    ],
    cta: 'Start for Free',
    ctaVariant: 'outline' as const,
    popular: false,
    href: '/register',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams requiring scalable multi-tenancy, automation, and full AI acceleration.',
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      '50GB secure cloud storage',
      'Unlimited Gemini AI breakdown & insights',
      'Real-time Socket.IO collaboration',
      'Priority email & chat support',
      'Advanced analytics & deadline predictions',
      'Custom role-based permissions (RBAC)',
    ],
    cta: 'Start 14-Day Pro Trial',
    ctaVariant: 'gradient' as const,
    popular: true,
    href: '/register?plan=pro',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'Dedicated enterprise infrastructure with strict SLA, audit logs, and custom AI models.',
    features: [
      'Unlimited team members',
      'Unlimited projects & multi-tenant orgs',
      '1TB dedicated cloud storage',
      'Custom fine-tuned Gemini models',
      'Dedicated Customer Success Manager',
      '99.99% uptime SLA guarantee',
      'SSO / SAML authentication',
      'Full compliance & audit logging',
    ],
    cta: 'Deploy Enterprise',
    ctaVariant: 'default' as const,
    popular: false,
    href: '/register?plan=enterprise',
  },
];

const faqs = [
  {
    question: 'Can I change or cancel my plan at any time?',
    answer:
      'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly through the Stripe Customer Portal inside your billing settings.',
  },
  {
    question: 'How does multi-tenant data isolation work?',
    answer:
      'Every request is scoped by an Organization ID and strictly filtered at the database repository level with PostgreSQL foreign keys and Prisma middleware, ensuring zero cross-tenant data leakage.',
  },
  {
    question: 'What AI models power TaskPulse?',
    answer:
      'We leverage Google DeepMind Gemini models with structured JSON schemas to deliver task breakdowns, risk assessment, and predictive sprint analytics.',
  },
  {
    question: 'Is real-time synchronization included in all plans?',
    answer:
      'Yes, all plans include real-time multi-client updates via WebSockets (Socket.IO) for task boards, member status, and comments.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            TaskPulse <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-xs font-extrabold uppercase">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/#architecture" className="hover:text-foreground transition-colors">Architecture</Link>
          <Link href="/pricing" className="text-foreground font-semibold">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="gradient" size="sm" className="text-xs">
              Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
          <Zap className="h-3.5 w-3.5" /> Transparent Enterprise SaaS Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Scale your productivity with{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            predictable pricing
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Start for free, test AI breakdowns, and upgrade as your engineering organization scales.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col justify-between border transition-all ${
                plan.popular
                  ? 'border-blue-500/60 bg-card/90 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/40'
                  : 'border-border/80 bg-card/50 hover:border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[11px] px-3 py-0.5 shadow">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-xl font-bold flex items-center justify-between text-white">
                  {plan.name}
                  {plan.name === 'Pro' && <Bot className="h-5 w-5 text-blue-400" />}
                  {plan.name === 'Enterprise' && <Shield className="h-5 w-5 text-purple-400" />}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground min-h-[36px]">
                  {plan.description}
                </CardDescription>
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 pb-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Included Features:
                </div>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-xs text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-2">
                <Link href={plan.href} className="w-full">
                  <Button variant={plan.ctaVariant} className="w-full text-xs font-semibold h-10">
                    {plan.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <HelpCircle className="h-4 w-4" /> Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question} className="border-border/70 bg-card/40 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{faq.question}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-10 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">TaskPulse SaaS</span> © 2026. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

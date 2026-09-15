import * as React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button.js';
import { Card } from '../components/ui/card.js';
import {
  Sparkles,
  ArrowRight,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
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
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
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
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-6 text-center max-w-5xl mx-auto overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Enterprise Multi-Tenant SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent Project Management <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Engineered with Gemini AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scale cross-team engineering velocity with isolated multi-tenancy, real-time drag-and-drop Kanban boards, automated cognitive breakdown, and enterprise Stripe billing.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto text-sm h-11 px-8">
                Deploy Workspace Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm h-11 px-8">
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Enterprise-Grade SaaS Features
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Architected for production scale, reliability, and security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 hover:border-primary/50 transition-all bg-card/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Real-Time Kanban</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag-and-drop workflows powered by dnd-kit and Socket.IO with optimistic synchronization across teams.
            </p>
          </Card>

          <Card className="border-border/80 hover:border-primary/50 transition-all bg-card/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Gemini AI Assistant</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Auto-generate technical task descriptions, subtask checklists, and executive project velocity summaries.
            </p>
          </Card>

          <Card className="border-border/80 hover:border-primary/50 transition-all bg-card/60 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Strict Multi-Tenancy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Server-side organization boundary enforcement, compound indexes, IDOR prevention, and granular RBAC permissions.
            </p>
          </Card>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section id="architecture" className="py-16 px-6 border-t border-border/80 bg-card/20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase font-mono font-bold text-primary tracking-wider">
              Under The Hood
            </span>
            <h2 className="text-2xl font-bold text-foreground">Modern Full-Stack Cloud Architecture</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-xl bg-card border border-border/80">
              <p className="text-2xl font-extrabold text-foreground">100%</p>
              <span className="text-xs text-muted-foreground">Type-Safe Monorepo</span>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/80">
              <p className="text-2xl font-extrabold text-blue-400">18</p>
              <span className="text-xs text-muted-foreground">Prisma PostgreSQL Models</span>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/80">
              <p className="text-2xl font-extrabold text-purple-400">2.5 Flash</p>
              <span className="text-xs text-muted-foreground">Google Gemini AI Engine</span>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/80">
              <p className="text-2xl font-extrabold text-emerald-400">&lt;50ms</p>
              <span className="text-xs text-muted-foreground">WebSocket Sync Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/80 py-8 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">TaskPulse AI</span> • Enterprise Project Management SaaS
          </div>
          <div>© {new Date().getFullYear()} TaskPulse AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

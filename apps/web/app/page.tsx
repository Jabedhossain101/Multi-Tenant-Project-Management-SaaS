export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          ✨ Next-Gen Multi-Tenant SaaS
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Intelligent Project Management <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Powered by Gemini AI
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale your team workflows with enterprise multi-tenancy, real-time Kanban boards,
          Gemini-powered task intelligence, and seamless Stripe billing.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-white sm:text-xl">
          Portiva<span className="text-indigo-400">.</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/login"
            className="flex min-h-[40px] items-center px-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="flex min-h-[40px] items-center rounded-lg bg-white px-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:px-4"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-12 text-center sm:px-6 sm:pb-28 sm:pt-20">
        <div className="mb-5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs text-indigo-300 sm:mb-6 sm:text-sm">
          Build your website without writing code
        </div>

        <h1 className="max-w-4xl break-words text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          Your website.
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Built in minutes.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-6 sm:text-xl">
          Portiva helps creators, freelancers, students, and small businesses
          build a professional website without dealing with code, hosting, or
          complicated tools.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/signup"
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition active:scale-[0.98] sm:hover:scale-[1.02]"
          >
            Create your website →
          </Link>

          <a
            href="#how-it-works"
            className="flex min-h-[52px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            See how it works
          </a>
        </div>

        <p className="mt-4 text-xs text-slate-500 sm:mt-5">
          No credit card required
        </p>
      </section>

      {/* Preview Card */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-28">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
          {/* Fake browser header */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-slate-900 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />

            <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1.5 text-[11px] text-slate-500 sm:ml-4 sm:px-4 sm:text-xs">
              your-site.portiva
            </div>
          </div>

          {/* Fake Website Preview */}
          <div className="grid min-h-[340px] md:min-h-[400px] md:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-white/5 bg-slate-950/50 p-5 md:block">
              <p className="mb-6 text-sm font-bold">Portiva Editor</p>

              <div className="space-y-3 text-sm text-slate-500">
                <div className="rounded-lg bg-indigo-500/10 px-3 py-2 text-indigo-300">
                  Hero
                </div>
                <div className="px-3 py-2">About</div>
                <div className="px-3 py-2">Skills</div>
                <div className="px-3 py-2">Contact</div>
                <div className="px-3 py-2">Theme</div>
              </div>
            </aside>

            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center sm:p-10">
              <div className="mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                Portfolio
              </div>

              <h2 className="text-2xl font-bold sm:text-4xl">Your Name Here</h2>

              <p className="mt-3 max-w-md text-sm text-slate-400 sm:mt-4 sm:text-base">
                A beautiful website built and customized with Portiva.
              </p>

              <button className="mt-5 min-h-[40px] rounded-lg bg-indigo-500 px-5 text-sm font-medium sm:mt-6">
                Get in touch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="scroll-mt-6 border-y border-white/5 bg-white/[0.02] px-5 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-4xl">
              From idea to website in three steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Create your website"
              description="Choose a name, URL, and category to get started instantly."
            />

            <Step
              number="02"
              title="Make it yours"
              description="Customize your content, skills, contact details, and visual style."
            />

            <Step
              number="03"
              title="Publish and share"
              description="Publish your website and share it with the world."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-400">
            EVERYTHING YOU NEED
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-4xl">
            Simple tools. Professional results.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          <Feature
            icon="⚡"
            title="Fast to build"
            description="Create your website in minutes instead of spending days learning web development."
          />

          <Feature
            icon="🎨"
            title="Make it yours"
            description="Customize your content, colors, fonts, and personal information."
          />

          <Feature
            icon="🌐"
            title="Publish instantly"
            description="Turn your draft into a live website whenever you're ready."
          />

          <Feature
            icon="📱"
            title="Responsive design"
            description="Your website looks great across desktops, tablets, and mobile devices."
          />

          <Feature
            icon="🔒"
            title="Secure accounts"
            description="Authentication and account management handled securely."
          />

          <Feature
            icon="🚀"
            title="No technical setup"
            description="Focus on your website while Portiva handles the complicated parts."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 px-6 py-12 text-center sm:px-8 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-4xl">
            Your online presence starts here.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:mt-4 sm:text-base">
            Stop waiting to build your website. Create it today with Portiva.
          </p>

          <Link
            href="/signup"
            className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-7 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:mt-8 sm:w-auto"
          >
            Get started for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Portiva. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/login" className="hover:text-white">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-white">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 sm:p-7">
      <span className="text-sm font-bold text-indigo-400">{number}</span>
      <h3 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-400 sm:mt-3 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 transition hover:border-indigo-500/30 hover:bg-slate-900 sm:p-6">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-4 font-semibold sm:mt-5">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white"
        >
          Portiva<span className="text-indigo-400">.</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-28 pt-20 text-center">
        <div className="mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          Build your website without writing code
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Your website.
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Built in minutes.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          Portiva helps creators, freelancers, students, and small businesses
          build a professional website without dealing with code, hosting, or
          complicated tools.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02]"
          >
            Create your website →
          </Link>

          <a
            href="#how-it-works"
            className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            See how it works
          </a>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          No credit card required
        </p>
      </section>

      {/* Preview Card */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
          {/* Fake browser header */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-slate-900 px-5 py-4">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />

            <div className="ml-4 flex-1 rounded-md bg-white/5 px-4 py-1.5 text-xs text-slate-500">
              your-site.portiva
            </div>
          </div>

          {/* Fake Website Preview */}
          <div className="grid min-h-[400px] md:grid-cols-[220px_1fr]">
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

            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center">
              <div className="mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                Portfolio
              </div>

              <h2 className="text-4xl font-bold">
                Your Name Here
              </h2>

              <p className="mt-4 max-w-md text-slate-400">
                A beautiful website built and customized with Portiva.
              </p>

              <button className="mt-6 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium">
                Get in touch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y border-white/5 bg-white/[0.02] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-indigo-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From idea to website in three steps.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
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
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-400">
            EVERYTHING YOU NEED
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Simple tools. Professional results.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your online presence starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Stop waiting to build your website. Create it today with Portiva.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Get started for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
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
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-7">
      <span className="text-sm font-bold text-indigo-400">{number}</span>

      <h3 className="mt-5 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-relaxed text-slate-400">
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
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 transition hover:border-indigo-500/30 hover:bg-slate-900">
      <div className="text-2xl">{icon}</div>

      <h3 className="mt-5 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}
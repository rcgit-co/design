import { Bolt, Layers, Chart, Shield, Sparkles, Users } from './icons.jsx'

const features = [
  {
    icon: Layers,
    title: 'One workspace',
    body: 'Boards, docs, goals, and chat live side by side. Stop paying for five tools that barely talk to each other.',
  },
  {
    icon: Sparkles,
    title: 'AI that does the busywork',
    body: 'Auto-summarize threads, draft status updates, and turn meeting notes into tasks in a single click.',
  },
  {
    icon: Chart,
    title: 'Real-time insights',
    body: 'Dashboards update as work happens, so you always know what is on track — and what needs attention.',
  },
  {
    icon: Bolt,
    title: 'Automations',
    body: 'Build no-code rules that move cards, assign owners, and send reminders while you focus on the work.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    body: 'Granular roles, guest access, and shared views keep everyone aligned from intern to executive.',
  },
  {
    icon: Shield,
    title: 'Enterprise-grade security',
    body: 'SOC 2 Type II, SSO/SAML, and end-to-end encryption keep your data locked down by default.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Everything you need
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            One place for your team's work
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Powerful on its own, seamless together. Flowboard replaces the patchwork
            of apps your team juggles every day.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

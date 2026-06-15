const steps = [
  {
    number: '01',
    title: 'Bring your work in',
    body: 'Import from Jira, Trello, Asana, or a spreadsheet in minutes. Nothing gets left behind.',
  },
  {
    number: '02',
    title: 'Shape your workflow',
    body: 'Pick a template or build your own boards, fields, and automations — no admin required.',
  },
  {
    number: '03',
    title: 'Ship and learn',
    body: 'Track progress in live dashboards, celebrate wins, and let AI surface what to do next.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="bg-slate-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-300">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Up and running in an afternoon
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            No lengthy onboarding, no consultants. Three steps from sign-up to shipping.
          </p>
        </div>

        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-7"
            >
              <span className="text-4xl font-extrabold text-brand-400">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-300">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

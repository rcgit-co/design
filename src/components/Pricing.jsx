import { Check } from './icons.jsx'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever',
    blurb: 'For individuals and small side projects.',
    features: ['Up to 3 members', 'Unlimited tasks', '2 boards', 'Mobile apps'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Team',
    price: '$12',
    cadence: 'per user / month',
    blurb: 'For growing teams that need to move fast.',
    features: [
      'Unlimited members',
      'Unlimited boards & docs',
      'Automations & AI summaries',
      'Dashboards & reporting',
      'Priority support',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'let’s talk',
    blurb: 'For organizations with advanced needs.',
    features: [
      'SSO / SAML & SCIM',
      'Advanced permissions',
      'Audit logs & data residency',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start free. Upgrade when your team grows. No hidden fees, ever.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.featured
                  ? 'relative rounded-2xl border-2 border-brand-600 bg-white p-8 shadow-xl shadow-brand-600/10 lg:-mt-4'
                  : 'rounded-2xl border border-slate-200 bg-white p-8'
              }
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500">{plan.cadence}</span>
              </div>

              <a
                href="#"
                className={
                  plan.featured
                    ? 'mt-6 block cursor-pointer rounded-xl bg-accent-500 px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600'
                    : 'mt-6 block cursor-pointer rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-brand-400 hover:text-brand-600'
                }
              >
                {plan.cta}
              </a>

              <ul className="mt-7 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

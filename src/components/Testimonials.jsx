import { Star } from './icons.jsx'

const testimonials = [
  {
    quote:
      'We replaced three tools with Flowboard in a week. Our team finally has one source of truth — and standups are half as long.',
    name: 'Maya Chen',
    role: 'Head of Product, Lumina',
    initials: 'MC',
  },
  {
    quote:
      'The AI summaries alone save each manager a few hours a week. It feels like we hired an extra ops person.',
    name: 'David Okafor',
    role: 'COO, Quanta',
    initials: 'DO',
  },
  {
    quote:
      'Onboarding 40 people was effortless. Within a day everyone knew exactly what they owned and what was next.',
    name: 'Sofia Marchetti',
    role: 'Eng Lead, Vertex',
    initials: 'SM',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Loved by teams
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Don't take our word for it
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7"
            >
              <div className="flex text-accent-500" aria-label="Rated 5 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5" />
                ))}
              </div>
              <blockquote className="mt-4 grow text-[15px] leading-relaxed text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {t.name}
                  </span>
                  <span className="block text-sm text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

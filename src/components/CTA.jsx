import { ArrowRight } from './icons.jsx'

export default function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl"
          />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to put your team in flow?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-50">
            Join 2,000+ teams shipping more with less chaos. Free for 14 days.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              Start free
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/10 sm:w-auto"
            >
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

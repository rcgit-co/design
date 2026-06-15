const companies = ['Northwind', 'Acme Co', 'Lumina', 'Quanta', 'Hyperion', 'Vertex']

export default function LogoCloud() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/60 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium text-slate-500">
          Trusted by fast-moving teams at
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <li
              key={name}
              className="text-lg font-bold tracking-tight text-slate-400 transition-colors duration-200 hover:text-slate-600"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

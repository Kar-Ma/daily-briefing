export default function Home() {
  const now = new Date();
  const dateString = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <main className="mx-auto max-w-2xl space-y-6">
        <header className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Good morning, Karthik
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{dateString}</p>
        </header>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Weather
          </h2>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-5xl">☀️</span>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Sunny
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                High 18° · Low 9° · Rotterdam
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Top Headlines
          </h2>
          <ol className="mt-3 space-y-3 text-zinc-900 dark:text-zinc-100">
            <li className="flex gap-3">
              <span className="text-zinc-400 font-mono text-sm pt-0.5">1</span>
              <span>Placeholder headline number one will go here.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 font-mono text-sm pt-0.5">2</span>
              <span>Placeholder headline number two will go here.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 font-mono text-sm pt-0.5">3</span>
              <span>Placeholder headline number three will go here.</span>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Today
          </h2>
          <ul className="mt-3 space-y-3 text-zinc-900 dark:text-zinc-100">
            <li className="flex gap-4">
              <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400 w-24 shrink-0 pt-0.5">
                15:30–16:00
              </span>
              <span>Weekly Finance Update</span>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400 w-24 shrink-0 pt-0.5">
                18:00–20:00
              </span>
              <span>Envision Monthly Webinars</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

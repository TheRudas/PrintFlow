export default function CargandoPanel() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <div className="h-7 w-16 animate-pulse rounded-lg bg-superficie-alta" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-superficie-alta" />
      </div>

      <section className="grid w-full max-w-2xl grid-cols-3 gap-3">
        {[0, 1, 2].map((indice) => (
          <div
            key={indice}
            className="h-24 animate-pulse rounded-2xl bg-superficie-alta"
          />
        ))}
      </section>

      <div className="h-40 w-full max-w-2xl animate-pulse rounded-2xl bg-superficie-alta" />
      <div className="h-40 w-full max-w-2xl animate-pulse rounded-2xl bg-superficie-alta" />
    </main>
  );
}

export default function CargandoInicio() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-6">
      <div className="flex w-full max-w-md items-center justify-between">
        <div className="h-7 w-28 animate-pulse rounded-lg bg-superficie-alta" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-superficie-alta" />
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((indice) => (
          <div
            key={indice}
            className="h-24 animate-pulse rounded-2xl bg-superficie-alta"
          />
        ))}
      </div>
    </main>
  );
}

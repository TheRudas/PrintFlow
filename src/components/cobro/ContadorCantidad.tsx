interface Props {
  cantidad: number;
  onCambiarCantidad: (cantidad: number) => void;
}

export default function ContadorCantidad({
  cantidad,
  onCambiarCantidad,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border-2 border-zinc-200 bg-white p-2">
      <button
        type="button"
        onClick={() => onCambiarCantidad(cantidad - 1)}
        disabled={cantidad <= 1}
        className="btn-feedback flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-2xl font-bold text-zinc-800 hover:bg-zinc-200 disabled:opacity-40"
      >
        −
      </button>
      <div className="text-center">
        <div className="text-3xl font-bold text-zinc-900">{cantidad}</div>
        <div className="text-xs text-zinc-500">hojas</div>
      </div>
      <button
        type="button"
        onClick={() => onCambiarCantidad(cantidad + 1)}
        className="btn-feedback flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-2xl font-bold text-zinc-800 hover:bg-zinc-200"
      >
        +
      </button>
    </div>
  );
}

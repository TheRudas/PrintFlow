interface Props {
  children: React.ReactNode;
}

export default function TituloSeccion({ children }: Props) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
      <span className="gradiente-marca h-4 w-1 rounded-full" />
      <span className="gradiente-marca bg-clip-text text-transparent">
        {children}
      </span>
    </h2>
  );
}

export function colorServicio(clave: string): string {
  const n = clave
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (n.includes("fotocopia") && n.includes("color")) return "#6b7280";
  if (n.includes("fotocopia")) return "#ec4899";
  if (n.includes("color")) return "#84cc16";
  return "#7c3aed";
}

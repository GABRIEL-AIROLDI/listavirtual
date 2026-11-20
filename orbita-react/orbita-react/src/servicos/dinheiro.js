export function centavosExatos(valor) {
  if (typeof valor === "number") {
    if (!Number.isSafeInteger(valor) || valor < 0) throw new Error("Valor monetário inválido.");
    return BigInt(valor);
  }
  if (typeof valor === "bigint" && valor >= 0n) return valor;
  if (typeof valor === "string" && /^[0-9]+$/.test(valor)) return BigInt(valor);
  throw new Error("Valor monetário inválido.");
}

export function multiplicarCentavos(valor, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
    throw new Error("Quantidade inválida.");
  }
  return (centavosExatos(valor) * BigInt(quantidade)).toString();
}

export function formatarMoeda(valor) {
  // O arredondamento é apenas visual; pedidos e valores legados mantêm a precisão original.
  const inteiro = (centavosExatos(valor) + 50n) / 100n;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(inteiro);
}

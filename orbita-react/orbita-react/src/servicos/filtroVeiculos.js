const normalizar = (valor) => String(valor ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR")
  .trim();

export function filtrarVeiculos(produtos, busca, somenteAntigos = false) {
  const termos = normalizar(busca).split(/\s+/).filter(Boolean);
  return produtos.filter((produto) => {
    if (somenteAntigos && produto.categoria !== "Carros antigos") return false;
    const texto = normalizar([produto.marca, produto.nome, produto.ano].filter(v => v != null).join(" "));
    return termos.every(termo => texto.includes(termo));
  });
}

import { centavosExatos, multiplicarCentavos } from "./dinheiro.js";
export { formatarMoeda, multiplicarCentavos } from "./dinheiro.js";
export const limiteSacola = (produto) => ["dolphin","sandero","corolla","hilux","haval","song","fusca","mustang"].includes(produto.desenho) ? 1 : Number(produto.estoque);
export const calcularTotal = (itens) =>
  itens.reduce(
    (total, item) => total + centavosExatos(multiplicarCentavos(item.produto.preco_centavos, item.quantidade)),
    0n,
  ).toString();
export function adicionarItem(itens, produto) {
  const atual = itens.find((item) => item.produto.id === produto.id);
  if ((atual?.quantidade ?? 0) >= limiteSacola(produto))
    throw new Error("Este item já atingiu o limite da sacola.");
  return atual
    ? itens.map((item) =>
        item.produto.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item,
      )
    : [...itens, { produto, quantidade: 1 }];
}
export function alterarQuantidade(itens, identificador, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 0)
    throw new Error("Quantidade inválida.");
  if (quantidade === 0)
    return itens.filter((item) => item.produto.id !== identificador);
  return itens.map((item) => {
    if (item.produto.id !== identificador) return item;
    if (quantidade > limiteSacola(item.produto))
      throw new Error("Este item já atingiu o limite da sacola.");
    return { ...item, quantidade };
  });
}

import test from "node:test";
import assert from "node:assert/strict";
import { centavosExatos, formatarMoeda, multiplicarCentavos } from "../src/servicos/dinheiro.js";
import { calcularTotal, adicionarItem } from "../src/servicos/carrinho.js";

test("aceita sacola legada com números inteiros seguros e API com strings", () => {
  assert.equal(centavosExatos(24990), 24990n);
  assert.equal(centavosExatos("00024990"), 24990n);
  assert.equal(calcularTotal([{produto:{preco_centavos:24990},quantidade:2},
    {produto:{preco_centavos:"100"},quantidade:1}]), "50080");
});
test("exibe inteiros com arredondamento somente na apresentação", () => {
  for (const [centavos, inteiro] of [["24949","249"],["24950","250"],["24990","250"],["10000","100"],["0","0"]]) {
    const texto = formatarMoeda(centavos).replace(/\s/g," ");
    assert.equal(texto, "R$ "+inteiro);
    assert.equal(texto.includes(","), false);
  }
});
test("não perde precisão acima de Number.MAX_SAFE_INTEGER", () => {
  assert.equal(multiplicarCentavos("9007199254740993",2), "18014398509481986");
  assert.equal(calcularTotal([{produto:{preco_centavos:"9007199254740993"},quantidade:2}]),"18014398509481986");
  assert.equal(formatarMoeda("900719925474099350").replace(/\s/g," "), "R$ 9.007.199.254.740.994");
});
test("trata o limite BIGINT UNSIGNED sem converter para Number", () => {
  assert.equal(centavosExatos("18446744073709551615"),18446744073709551615n);
  assert.equal(formatarMoeda("18446744073709551615").replace(/\s/g," "), "R$ 184.467.440.737.095.516");
});
test("recusa valores corrompidos e números já imprecisos", () => {
  for (const valor of [-1,1.5,NaN,Infinity,9007199254740992,null,undefined,"-1","1.5","1e3","",{}]) {
    assert.throws(()=>centavosExatos(valor));
  }
  for (const quantidade of [0,-1,1.5,100,"2"]) assert.throws(()=>multiplicarCentavos("100",quantidade));
});
test("JSON e persistência mantêm strings; adição não altera o preço", () => {
  const produto={id:11,desenho:"dolphin",preco_centavos:"9007199254740993",estoque:0};
  const itens=adicionarItem([],produto);
  const restaurados=JSON.parse(JSON.stringify(itens));
  assert.equal(restaurados[0].produto.preco_centavos,produto.preco_centavos);
  assert.equal(calcularTotal(restaurados),produto.preco_centavos);
  assert.throws(()=>adicionarItem(itens,produto));
});
test("total é arredondado após somar os valores exatos", () => {
  const total=calcularTotal([{produto:{preco_centavos:"149"},quantidade:2}]);
  assert.equal(total,"298");
  assert.equal(formatarMoeda(total).replace(/\s/g," "),"R$ 3");
});

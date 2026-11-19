import React from "react";
import { formatarMoeda, calcularTotal } from "../servicos/carrinho.js";
import DesenhoProduto from "./DesenhoProduto.jsx";
export default function Carrinho({ itens, aoAlterar, aoAvancar, aoFechar }) {
  return (
    <>
      <button className="fechar" onClick={aoFechar} aria-label="Fechar sacola">
        ×
      </button>
      <p className="sobretitulo">SUAS ESCOLHAS</p>
      <h2 id="titulo-dialogo">Sua sacola</h2>
      {itens.length === 0 ? (
        <div className="estado">
          <p>Sua sacola ainda está vazia.</p>
          <button className="botao principal" onClick={aoFechar}>
            Explorar veículos
          </button>
        </div>
      ) : (
        <>
          <ul className="itens-sacola">
            {itens.map(({ produto, quantidade }) => (
              <li key={produto.id}>
                <div className="miniatura">
                  <DesenhoProduto tipo={produto.desenho} cor={produto.cor} />
                </div>
                <div className="item-dados">
                  <div className="item-titulo"><strong>{produto.nome}</strong><button className="excluir-veiculo" onClick={() => aoAlterar(produto.id, 0)} aria-label={"Retirar " + produto.nome + " da sacola"} title="Retirar da sacola">×</button></div><span>Ano {produto.ano ?? "a confirmar"}</span>
                  <span>{Number(produto.preco_centavos) > 0 ? formatarMoeda(produto.preco_centavos) : "Preço a confirmar"}</span>
                  
                </div>
              </li>
            ))}
          </ul>
          <div className="resumo">
            
            <p className="total">
              Total <strong>{itens.some(i => Number(i.produto.preco_centavos) <= 0) ? "A confirmar" : formatarMoeda(calcularTotal(itens))}</strong>
            </p>
          </div>
          <p className="texto-apoio">
            Os veículos selecionados ficam salvos nesta sacola. Confirme preço e disponibilidade antes de comprar.
          </p>
          <button className="botao principal largura" disabled={itens.some(i => Number(i.produto.preco_centavos) <= 0 || Number(i.produto.estoque) < i.quantidade)} onClick={aoAvancar}>
            {itens.some(i => Number(i.produto.preco_centavos) <= 0) ? "Aguardando preço e disponibilidade" : "Continuar compra →"}
          </button>
        </>
      )}
    </>
  );
}



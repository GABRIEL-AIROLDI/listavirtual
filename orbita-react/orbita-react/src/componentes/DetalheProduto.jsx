import React from "react";
import DesenhoProduto from "./DesenhoProduto.jsx";
import { formatarMoeda } from "../servicos/carrinho.js";
export default function DetalheProduto({ produto, aoAdicionar, aoFechar }) {
  return (
    <>
      <button
        className="fechar"
        onClick={aoFechar}
        aria-label="Fechar detalhes"
      >
        ×
      </button>
      <div
        className="detalhe-imagem"
        style={{ background: produto.cor + "55" }}
      >
        <DesenhoProduto tipo={produto.desenho} cor={produto.cor} />
      </div>
      <p className="sobretitulo">{produto.categoria}</p>
      <h2 id="titulo-dialogo">{produto.nome}</h2>
      <p>{produto.descricao}</p>
      <p>{["dolphin","sandero","corolla","hilux","haval","song","fusca","mustang"].includes(produto.desenho) ? "Disponibilidade a confirmar" : produto.estoque + " unidades disponíveis"}</p>
      <p className="total">{["dolphin","sandero","corolla","hilux","haval","song","fusca","mustang"].includes(produto.desenho) && Number(produto.preco_centavos) === 0 ? "Preço a confirmar" : formatarMoeda(produto.preco_centavos)}</p>
      <button
        disabled={!produto.estoque && !["dolphin","sandero","corolla","hilux","haval","song","fusca","mustang"].includes(produto.desenho)}
        className="botao principal largura"
        onClick={() => {
          aoAdicionar(produto);
          aoFechar();
        }}
      >
        Adicionar à sacola
      </button>
    </>
  );
}






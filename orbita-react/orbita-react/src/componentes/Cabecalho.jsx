import React from "react";
export default function Cabecalho({ quantidade, aoAbrirCarrinho }) {
  return (
    <>
      <div className="faixa">
        UPD AUTOMÓVEIS <span>Seu próximo carro começa aqui</span>
        <a href="#catalogo">Ver veículos ↗</a>
      </div>
      <header className="cabecalho">
        <a className="marca" href="/" aria-label="UPD Automóveis início">
          <img src="/imagens/logo.png" alt="UPD Automóveis" className="logo-upd" />
          <span className="marca-pequena">Seu próximo carro</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#catalogo">Explorar veículos</a>
          <a href="#catalogo">Catálogo ↗</a>
          <button className="botao-carrinho" onClick={aoAbrirCarrinho}>
            Sacola <span>{quantidade}</span>
          </button>
        </nav>
      </header>
    </>
  );
}



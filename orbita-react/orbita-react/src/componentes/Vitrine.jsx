import React, { useState } from "react";
import CartaoProduto from "./CartaoProduto.jsx";
import { filtrarVeiculos } from "../servicos/filtroVeiculos.js";
import DesenhoProduto from "./DesenhoProduto.jsx";
export default function Vitrine({
  produtos,
  carregando,
  erro,
  aoRecarregar,
  aoAdicionar,
  aoDetalhar,
}) {
  const [busca, definirBusca] = useState("");
  const [somenteAntigos, definirSomenteAntigos] = useState(false);

  const visiveis = filtrarVeiculos(produtos, busca, somenteAntigos);
  return (
    <>
      <section className="abertura">
        <div className="abertura-texto">
          <p className="sobretitulo">
            <span /> CURADORIA PARA O DIA A DIA
          </p>
          <h1>
            Seu próximo carro.
            <br />
            Sua próxima
            <br />
            <em>conquista.</em>
          </h1>
          <p>
            Veículos para acompanhar sua história.
            <br />
            Conheça nossos modelos.
          </p>
          <a href="#catalogo" className="botao principal">
            Explorar a coleção <span>↗</span>
          </a>
          <div className="nota-abertura">
            UPD AUTOMÓVEIS{" "}
            <span>Encontre o carro que combina com você.</span>
          </div>
        </div>
        <div className="abertura-visual">
          <div className="orbita-decorativa" />
          <span className="rotulo-visual">UPD / VEÍCULOS</span>
          <img src="/imagens/dolphin.png" alt="BYD Dolphin Mini" style={{width:"100%"}} />
          <div className="destaque-produto">
            <div>
              <small>DESTAQUE DA COLEÇÃO</small>
              <strong>BYD Dolphin Mini</strong>
              <span>2026 • Preço a confirmar.</span>
            </div>
            <button aria-label="Ver BYD Dolphin Mini" disabled={!produtos.some(p => p.desenho === "dolphin")} onClick={() => aoDetalhar(produtos.find(p => p.desenho === "dolphin")?.id)}>
              ↗
            </button>
          </div>
          <span className="selo">
            Novos caminhos.
            <br />
            Novas histórias.
          </span>
        </div>
      </section>
      <div className="beneficios">
        <p>
          <b>01</b> Estilo em cada detalhe
        </p>
        <p>
          <b>02</b> Suas escolhas na sacola
        </p>
        <p>
          <b>03</b> Veículos selecionados
        </p>
      </div>
      <section id="catalogo" className="catalogo">
        <div className="titulo-catalogo">
          <div>
            <p className="sobretitulo">ESCOLHAS QUE FAZEM SENTIDO</p>
            <h2>Encontre seu próximo essencial.</h2>
          </div>
          <span>{visiveis.length} produtos</span>
        </div>
        <div className="ferramentas">
          <div className="categorias" aria-label="Filtrar veículos"><button className="filtro-veiculos" aria-pressed={!somenteAntigos} onClick={() => definirSomenteAntigos(false)}>Veículos</button><label className="filtro-antigos"><input type="checkbox" checked={somenteAntigos} onChange={evento => definirSomenteAntigos(evento.target.checked)} /> Carros antigos</label></div>
          <label className="busca">
            <span>Buscar</span>
            <input
              value={busca}
              onChange={(evento) => definirBusca(evento.target.value)}
              placeholder="Marca, modelo ou ano"
              type="search"
            />
          </label>
        </div>
        {carregando ? (
          <p role="status" className="estado">
            Consultando o catálogo…
          </p>
        ) : erro ? (
          <div role="alert" className="estado erro">
            <p>{erro}</p>
            <button className="botao" onClick={aoRecarregar}>
              Tentar novamente
            </button>
          </div>
        ) : visiveis.length ? (
          <div className="grade-produtos">
            {visiveis.map((produto) => (
              <CartaoProduto
                key={produto.id}
                produto={produto}
                aoAdicionar={aoAdicionar}
                aoDetalhar={aoDetalhar}
              />
            ))}
          </div>
        ) : (
          <p role="status" className="estado">
            Nenhum produto encontrado. Experimente outro nome ou categoria.
          </p>
        )}
      </section>
    </>
  );
}

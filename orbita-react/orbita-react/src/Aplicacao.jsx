import React, { useState, useEffect, useRef } from "react";
import Cabecalho from "./componentes/Cabecalho.jsx";
import Vitrine from "./componentes/Vitrine.jsx";
import Carrinho from "./componentes/Carrinho.jsx";
import DetalheProduto from "./componentes/DetalheProduto.jsx";
import Finalizacao from "./componentes/Finalizacao.jsx";
import {
  listarProdutos,
  buscarProduto,
} from "./servicos/api.js";
import { adicionarItem, alterarQuantidade } from "./servicos/carrinho.js";
export default function Aplicacao() {
  const [produtos, definirProdutos] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState("");
  const [itens, definirItens] = useState(() => { try { const salvos = JSON.parse(localStorage.getItem("upd-sacola") || "[]"); return Array.isArray(salvos) ? salvos.filter(i => i?.produto?.id && Number.isInteger(i.quantidade) && i.quantidade > 0) : []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem("upd-sacola", JSON.stringify(itens)); } catch {} }, [itens]);
  const [tela, definirTela] = useState(null);
  const [produto, definirProduto] = useState(null);
  const [mensagem, definirMensagem] = useState("");
  const [recarga, definirRecarga] = useState(0);
  const dialogo = useRef(null);
  const ultimoFoco = useRef(null);// Sincroniza o componente com um serviço externo; as dependências controlam a repetição.
  useEffect(() => {// Permite cancelar a consulta quando o componente desmontar.
    const controle = new AbortController();
    definirCarregando(true);
    definirErro("");
    listarProdutos(controle.signal)
      .then(dados => { const veiculos = dados.filter(p => ["dolphin", "sandero", "corolla", "hilux", "haval", "song", "fusca", "mustang"].includes(p.desenho)); definirProdutos(veiculos); definirItens(anteriores => anteriores.map(item => ({...item, produto: veiculos.find(p => p.id === item.produto.id) ?? item.produto}))); })
      .catch((falha) => {
        if (falha.name !== "AbortError") definirErro(falha.message);
      })
      .finally(() => {
        if (!controle.signal.aborted) definirCarregando(false);
      });// Cancela a consulta pendente na limpeza do efeito.
    return () => controle.abort();
  }, [recarga]);// Sincroniza o componente com um serviço externo; as dependências controlam a repetição.
  useEffect(() => {
    if (tela && !dialogo.current.open) {
      ultimoFoco.current = document.activeElement;// Abre o diálogo nativo com gerenciamento de foco.
      dialogo.current.showModal();
    } else if (!tela && dialogo.current.open) {
      dialogo.current.close();// Devolve o foco ao controle que abriu o diálogo.
      ultimoFoco.current?.focus();
    }
  }, [tela]);
  function adicionar(produto) {
    try {
      definirItens(adicionarItem(itens, produto));
      definirMensagem(`${produto.nome} adicionado à sacola.`);
    } catch (falha) {
      definirMensagem(falha.message);
    }
  }
  function alterar(identificador, quantidade) {
    try {
      definirItens(alterarQuantidade(itens, identificador, quantidade));
    } catch (falha) {
      definirMensagem(falha.message);
    }
  }
  async function detalhar(identificador) {
    try {
      definirProduto(await buscarProduto(identificador));
      definirTela("detalhe");
    } catch (falha) {
      definirMensagem(falha.message);
    }
  }
  function concluir() {
    definirItens([]);
    definirRecarga((valor) => valor + 1);
  }
  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho
        quantidade={itens.reduce((soma, item) => soma + item.quantidade, 0)}
        aoAbrirCarrinho={() => definirTela("carrinho")}
      />
      <main id="conteudo">
        
        <Vitrine
          produtos={produtos}
          carregando={carregando}
          erro={erro}
          aoRecarregar={() => definirRecarga((valor) => valor + 1)}
          aoAdicionar={adicionar}
          aoDetalhar={detalhar}
        />
        <section className="convite">
          <div>
            <p className="sobretitulo">DO PRIMEIRO COMPONENTE À COMPRA</p>
            <h2>
              Gostou da loja?
              <br />
              Encontre seu próximo carro.
            </h2>
          </div>
          <a className="botao principal" href="#catalogo">
            Ver veículos ↗
          </a>
        </section>
      </main>
      <footer>
        <a className="marca" href="/">
          UPD Automóveis
        </a>
        <p>
          UPD Automóveis
          <br />
          Seu próximo carro começa aqui.
        </p>
        <a href="#catalogo">Apresentação do projeto ↗</a>
      </footer>
      <div className="mensagem" role="status">
        {mensagem && (
          <>
            <span>{mensagem}</span>
            <button
              onClick={() => definirMensagem("")}
              aria-label="Dispensar mensagem"
            >
              ×
            </button>
          </>
        )}
      </div>
      <dialog
        ref={dialogo}
        aria-labelledby="titulo-dialogo"
        onCancel={() => definirTela(null)}
        onClose={() => {
          definirTela(null);// Devolve o foco ao controle que abriu o diálogo.
          ultimoFoco.current?.focus();
        }}
      >
        <div className="conteudo-dialogo" key={tela}>
          {tela === "carrinho" && (
            <Carrinho
              itens={itens}
              aoAlterar={alterar}
              aoAvancar={() => definirTela("finalizacao")}
              aoFechar={() => definirTela(null)}
            />
          )}{" "}
          {tela === "detalhe" && produto && (
            <DetalheProduto
              produto={produto}
              aoAdicionar={adicionar}
              aoFechar={() => definirTela(null)}
            />
          )}{" "}
          {tela === "finalizacao" && (
            <Finalizacao
              itens={itens}
              aoConcluir={concluir}
              aoVoltar={() => definirTela("carrinho")}
              aoFechar={() => definirTela(null)}
            />
          )}
        </div>
      </dialog>
    </>
  );
}







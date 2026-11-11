const enderecoApi = (import.meta.env.VITE_ENDERECO_API
    ?? 'http://localhost/orbita-api').replace(/\/$/, '');
 
async function requisitar(caminho, opcoes = {}) {
    let resposta;
 
    try {// Envia a requisição à API e aguarda a resposta HTTP.
        resposta = await fetch(`${enderecoApi}${caminho}`, {
            ...opcoes,
            headers: {
                ...(opcoes.body ? {'Content-Type': 'application/json'} : {}),
                ...opcoes.headers,
            },
        });
    } catch (erro) {
        if (erro.name === 'AbortError') {
            throw erro;
        }
        throw new Error('Não foi possível conectar à API. Confirme o endereço com o professor.');
    }
 // Converte a resposta JSON da API para valores JavaScript.
    const dados = await resposta.json().catch(() => ({}));// Status HTTP de erro não rejeita fetch automaticamente; valide a resposta.
    if (!resposta.ok) {
        throw new Error(dados.mensagem ?? `Erro HTTP ${resposta.status}.`);
    }
    return dados;
}
 
export const listarCategorias = () =>
    requisitar('/api/categorias.php');
 
export const listarProdutos = (sinal) =>
    requisitar('/api/produtos.php', {signal: sinal});
 
export const buscarProduto = (id) =>// Codifica o parâmetro para compor a URL com segurança.
    requisitar(`/api/produtos.php?id=${encodeURIComponent(id)}`);
 
export const criarPedido = (dados) =>
    requisitar('/api/pedidos.php', {
        method: 'POST',// Serializa os dados enviados no corpo da requisição.
        body: JSON.stringify(dados),
    });
 
export const consultarPedido = (codigo) =>// Codifica o parâmetro para compor a URL com segurança.
    requisitar(`/api/pedidos.php?codigo=${encodeURIComponent(codigo)}`);
 
export const simularPagamento = (codigo, resultado) =>// Codifica o parâmetro para compor a URL com segurança.
    requisitar(`/api/pagamentos.php?codigo=${encodeURIComponent(codigo)}`, {
        method: 'POST',// Serializa os dados enviados no corpo da requisição.
        body: JSON.stringify({resultado}),
    });

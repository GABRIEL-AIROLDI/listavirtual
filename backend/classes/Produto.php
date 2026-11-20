<?php
require_once __DIR__ . "/ModeloBase.php";
require_once __DIR__ . "/Dinheiro.php";

class Produto extends ModeloBase
{
    // O nome da categoria vem do relacionamento, sem repetir texto em produtos.
    private $consultaBase = 'SELECT produtos.*, categorias.nome AS categoria
                            FROM produtos
                            INNER JOIN categorias ON categorias.id = produtos.categoria_id';

    public function __construct(?PDO $conexao = null)
    {
        if ($conexao !== null) {
            $this->conexao = $conexao;
        } else {
            parent::__construct();
        }
    }

    private function preparar(array $produto): array
    {
        $produto["preco_centavos"] = Dinheiro::normalizar($produto["preco_centavos"]);
        return $produto;
    }

    public function listar($categoriaId = null)
    {
        $sql = $this->consultaBase;
        $parametros = [];

        if ($categoriaId !== null) {
            $sql .= " WHERE produtos.categoria_id = ?";
            $parametros[] = $categoriaId;
        }

        $sql .= " ORDER BY produtos.id";
        $consulta = $this->conexao->prepare($sql);
        $consulta->execute($parametros);
        return array_map(fn(array $produto): array => $this->preparar($produto), $consulta->fetchAll());
    }

    public function buscar($id, $bloquear = false)
    {
        $sql = $this->consultaBase . " WHERE produtos.id = ?";

        if ($bloquear) {
            $sql .= " FOR UPDATE";
        }

        $consulta = $this->conexao->prepare($sql);
        $consulta->execute([$id]);
        $produto = $consulta->fetch();

        if (!$produto) {
            throw new ErroHttp("Produto não encontrado.", 404);
        }

        return $this->preparar($produto);
    }
    // Compartilha a transação de um pedido ao bloquear estoque.
    public function usarConexao($conexao)
    {
        $this->conexao = $conexao;
    }
}

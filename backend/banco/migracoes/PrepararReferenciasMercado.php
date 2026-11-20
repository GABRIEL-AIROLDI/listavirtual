<?php
declare(strict_types=1);

final class PrepararReferenciasMercado
{
    public static function exigirCopia(PDO $banco): void
    {
        $nome = (string) $banco->query('SELECT DATABASE()')->fetchColumn();
        if (!preg_match('/^upd_sim_2a_[a-f0-9]{12}$/D', $nome)) {
            throw new RuntimeException('Migração de referências permitida somente em cópia de simulação.');
        }
    }

    public static function aplicar(PDO $banco): void
    {
        self::exigirCopia($banco);
        $banco->exec('ALTER TABLE produtos MODIFY preco_centavos BIGINT UNSIGNED NOT NULL');
        $banco->exec('ALTER TABLE itens_pedido MODIFY preco_centavos BIGINT UNSIGNED NOT NULL');
        // DDL faz commit implícito no MariaDB; a retomada depende de operações repetíveis.
        $banco->exec("CREATE TABLE IF NOT EXISTS importacoes_referencias (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            chave CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
            fonte ENUM('FIPE','CLASSIC.COM') NOT NULL,
            politica ENUM('somente_referencias') NOT NULL DEFAULT 'somente_referencias',
            criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $banco->exec("CREATE TABLE IF NOT EXISTS referencias_mercado (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            produto_id INT UNSIGNED NOT NULL,
            importacao_id BIGINT UNSIGNED NOT NULL,
            chave CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
            fonte ENUM('FIPE','CLASSIC.COM') NOT NULL,
            codigo_fonte VARCHAR(255) NOT NULL,
            url_fonte VARCHAR(2048) NOT NULL,
            tipo ENUM('media_fipe','cmb','venda_concluida','preco_pedido') NOT NULL,
            estado ENUM('confirmada','ambigua','sem_cobertura','fonte_indisponivel') NOT NULL,
            valor_original DECIMAL(20,2) NULL,
            moeda CHAR(3) CHARACTER SET ascii NOT NULL,
            competencia DATE NULL,
            observado_em DATETIME(6) NOT NULL,
            coletado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            data_evento DATE NULL,
            mercado VARCHAR(100) NOT NULL,
            versao VARCHAR(255) NULL,
            combustivel VARCHAR(80) NULL,
            ano_inicio SMALLINT UNSIGNED NULL,
            ano_fim SMALLINT UNSIGNED NULL,
            observacoes TEXT NULL,
            FOREIGN KEY (produto_id) REFERENCES produtos(id),
            FOREIGN KEY (importacao_id) REFERENCES importacoes_referencias(id),
            CONSTRAINT ref_moeda CHECK (moeda IN ('BRL','USD','EUR','GBP')),
            CONSTRAINT ref_valor CHECK (valor_original IS NULL OR valor_original > 0),
            CONSTRAINT ref_confirmada CHECK (estado <> 'confirmada' OR valor_original IS NOT NULL),
            CONSTRAINT ref_competencia CHECK (competencia IS NULL OR DAY(competencia)=1),
            CONSTRAINT ref_fipe CHECK (fonte <> 'FIPE' OR (tipo='media_fipe' AND moeda='BRL')),
            CONSTRAINT ref_classic CHECK (fonte <> 'CLASSIC.COM' OR tipo <> 'media_fipe'),
            CONSTRAINT ref_fipe_confirmada CHECK (fonte <> 'FIPE' OR estado <> 'confirmada' OR competencia IS NOT NULL),
            CONSTRAINT ref_venda CHECK (tipo <> 'venda_concluida' OR estado <> 'confirmada' OR data_evento IS NOT NULL),
            CONSTRAINT ref_anos CHECK (ano_inicio IS NULL OR ano_fim IS NULL OR ano_inicio <= ano_fim),
            INDEX ref_produto_data (produto_id, observado_em)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public static function reverterVazia(PDO $banco): void
    {
        self::exigirCopia($banco);
        foreach (['referencias_mercado', 'importacoes_referencias'] as $tabela) {
            if ((int) $banco->query("SELECT COUNT(*) FROM $tabela")->fetchColumn() !== 0) {
                throw new RuntimeException('Reversão exige exportação e tratamento prévio das referências.');
            }
        }
        foreach (['produtos', 'itens_pedido'] as $tabela) {
            if ((int) $banco->query("SELECT COUNT(*) FROM $tabela WHERE preco_centavos > 4294967295")->fetchColumn() !== 0) {
                throw new RuntimeException('Reversão recusada para evitar truncamento de valores.');
            }
        }
        $banco->exec('DROP TABLE referencias_mercado');
        $banco->exec('DROP TABLE importacoes_referencias');
        $banco->exec('ALTER TABLE itens_pedido MODIFY preco_centavos INT UNSIGNED NOT NULL');
        $banco->exec('ALTER TABLE produtos MODIFY preco_centavos INT UNSIGNED NOT NULL');
    }
}

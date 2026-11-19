USE orbita_simples;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ano SMALLINT UNSIGNED NULL;
START TRANSACTION;
UPDATE produtos SET ano=2026, descricao='BYD Dolphin Mini rosa, ano 2026. Preço e disponibilidade a confirmar.' WHERE desenho='dolphin';
UPDATE produtos SET ano=2020, descricao='Renault Sandero R.S. branco, ano 2020. Preço e disponibilidade a confirmar.' WHERE desenho='sandero';
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'Toyota Corolla',id,0,0,'corolla','#eeeeee','Toyota Corolla branco, ano 2026. Preço e disponibilidade a confirmar.',2026 FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='corolla');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'Toyota Hilux',id,0,0,'hilux','#eeeeee','Toyota Hilux branca, ano 2026. Preço e disponibilidade a confirmar.',2026 FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='hilux');
UPDATE produtos SET ano=2026 WHERE desenho IN ('corolla','hilux');
COMMIT;

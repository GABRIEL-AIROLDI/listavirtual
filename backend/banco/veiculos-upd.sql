USE orbita_simples;
START TRANSACTION;
INSERT INTO categorias (nome) SELECT 'Veículos' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome='Veículos');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao)
SELECT 'BYD Dolphin Mini',id,0,0,'dolphin','#efd0de','BYD Dolphin Mini rosa. Ano, preço e disponibilidade a confirmar.' FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='dolphin');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao)
SELECT 'Renault Sandero R.S.',id,0,0,'sandero','#eeeeee','Renault Sandero R.S. branco: identificação provável pela imagem. Versão, ano, preço e disponibilidade a confirmar.' FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='sandero');
COMMIT;

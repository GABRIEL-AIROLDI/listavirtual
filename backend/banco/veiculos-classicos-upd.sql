USE orbita_simples;
START TRANSACTION;
INSERT INTO categorias (nome) SELECT 'Carros antigos' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome='Carros antigos');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'Haval H6',id,0,0,'haval','#edf1fa','Haval H6 azul, ano 2025. Preço e disponibilidade a confirmar.',2025 FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='haval');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'BYD Song Plus',id,0,0,'song','#eeeeee','BYD Song Plus cinza, ano 2026. Preço e disponibilidade a confirmar.',2026 FROM categorias WHERE nome='Veículos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='song');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'Volkswagen Fusca',id,0,0,'fusca','#f3ebd7','Volkswagen Fusca, ano 1953. Preço e disponibilidade a confirmar.',1953 FROM categorias WHERE nome='Carros antigos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='fusca');
INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,desenho,cor,descricao,ano)
SELECT 'Ford Mustang Mach 1',id,0,0,'mustang','#f4d5d5','Ford Mustang Mach 1 vermelho, ano 1969. Preço e disponibilidade a confirmar.',1969 FROM categorias WHERE nome='Carros antigos' AND NOT EXISTS (SELECT 1 FROM produtos WHERE desenho='mustang');
COMMIT;

<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../classes/Dinheiro.php';
require_once __DIR__ . '/../classes/Produto.php';
require_once __DIR__ . '/../classes/Pedido.php';

function conferir(bool $ok, string $nome): void {
    if (!$ok) throw new RuntimeException("Falhou: $nome");
    echo "OK: $nome\n";
}
function deveFalhar(callable $acao, string $nome): void {
    try { $acao(); } catch (ErroHttp $erro) {
        conferir(in_array($erro->situacao,[409,422],true),$nome);
        return;
    }
    throw new RuntimeException("Não bloqueou: $nome");
}
function retrato(PDO $b): array {
    $r=[];
    foreach (['categorias','produtos','pedidos','itens_pedido'] as $t) {
        $r[$t]=$b->query("SELECT * FROM $t ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
    }
    return $r;
}
conferir(Dinheiro::normalizar(24990)==='24990','compatibilidade com preço legado');
conferir(Dinheiro::normalizar('00024990')==='24990','normalização textual');
conferir(Dinheiro::somar('9007199254740993','1')==='9007199254740994','soma acima da precisão JS');
conferir(Dinheiro::multiplicar('9007199254740993',2)==='18014398509481986','multiplicação exata');
conferir(Dinheiro::normalizar('18446744073709551615')==='18446744073709551615','limite unsigned');
deveFalhar(fn()=>Dinheiro::somar('18446744073709551615','1'),'overflow na soma');
deveFalhar(fn()=>Dinheiro::multiplicar('9223372036854775808',2),'overflow na multiplicação');
foreach ([-1,1.5,null,true,'1e3','-1','1.5','', '18446744073709551616'] as $v) {
    deveFalhar(fn()=>Dinheiro::normalizar($v),'entrada inválida '.get_debug_type($v));
}
deveFalhar(fn()=>Dinheiro::multiplicar('1',100),'limite da quantidade');

$nome=$argv[1]??'';
if (!preg_match('/^upd_sim_2a_[a-f0-9]{12}$/D',$nome)) {
    throw new RuntimeException('Informe a cópia isolada de referências de mercado.');
}
$c=require __DIR__.'/../config/configuracao.php';
$abrir=fn($db)=>new PDO("mysql:host={$c['servidor']};port={$c['porta']};dbname=$db;charset=utf8mb4",
    $c['usuario'],$c['senha'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
$b=$abrir($nome);
$origem=$abrir($c['banco']);
$lojaAntes=retrato($origem);
$copiaAntes=retrato($b);
$produtoId=null;
$pedidos=[];
try {
    $categoria=(int)$b->query('SELECT MIN(id) FROM categorias')->fetchColumn();
    $b->exec("INSERT INTO produtos (nome,categoria_id,preco_centavos,estoque,descricao,desenho,cor,ano)
        VALUES ('Teste de precisão monetária',$categoria,24990,99,'Dado sintético','teste_monetario','#ffffff',2026)");
    $produtoId=(int)$b->lastInsertId();
    $servico=new Pedido($b);
    $modelo=new Produto($b);
    $criar=function(int $quantidade) use($servico,$produtoId,&$pedidos):array {
        $p=$servico->criar(['nome'=>'Teste isolado','email'=>'teste@example.invalid',
            'itens'=>[['produto_id'=>$produtoId,'quantidade'=>$quantidade]]]);
        $pedidos[]=$p['codigo'];
        return $p;
    };
    $historico=$criar(2);
    conferir($historico['total_centavos']==='49980','pedido legado em string exata');
    $atualizar=$b->prepare('UPDATE produtos SET preco_centavos=?,estoque=? WHERE id=?');
    $atualizar->execute(['9007199254740993',99,$produtoId]);
    conferir($modelo->buscar($produtoId)['preco_centavos']==='9007199254740993','detalhe serializa preço alto');
    $catalogo=array_column($modelo->listar(),'preco_centavos','id');
    conferir($catalogo[$produtoId]==='9007199254740993','catálogo serializa preço alto');
    $alto=$criar(2);
    conferir($alto['total_centavos']==='18014398509481986','pedido calcula total alto exato');
    $json=json_decode(json_encode($alto,JSON_THROW_ON_ERROR),true,512,JSON_THROW_ON_ERROR);
    conferir($json['itens'][0]['preco_centavos']==='9007199254740993','JSON preserva todos os dígitos');
    conferir($servico->consultar($historico['codigo'])===$historico,'pedido antigo preserva preço histórico');
    $atualizar->execute(['18446744073709551615',99,$produtoId]);
    $maximo=$criar(1);
    conferir($maximo['total_centavos']==='18446744073709551615','pedido suporta unsigned acima do limite PHP');
    $contagem=(int)$b->query('SELECT COUNT(*) FROM pedidos')->fetchColumn();
    deveFalhar(fn()=>$criar(2),'pedido bloqueia overflow antes de gravar');
    conferir((int)$b->query('SELECT COUNT(*) FROM pedidos')->fetchColumn()===$contagem,'overflow não cria pedido parcial');
    $atualizar->execute(['0',99,$produtoId]);
    deveFalhar(fn()=>$criar(1),'preço zero bloqueado no servidor mesmo com estoque');
    $atualizar->execute(['10000',0,$produtoId]);
    deveFalhar(fn()=>$criar(1),'estoque zero bloqueado no servidor');
    conferir((int)$b->query('SELECT COUNT(*) FROM pedidos')->fetchColumn()===$contagem,'bloqueios preservam quantidade de pedidos');
} finally {
    $b->beginTransaction();
    foreach($pedidos as $codigo) {
        $q=$b->prepare('SELECT id FROM pedidos WHERE codigo=?'); $q->execute([$codigo]); $id=$q->fetchColumn();
        if($id!==false) {
            $q=$b->prepare('DELETE FROM itens_pedido WHERE pedido_id=?'); $q->execute([$id]);
            $q=$b->prepare('DELETE FROM pedidos WHERE id=?'); $q->execute([$id]);
        }
    }
    if($produtoId!==null) {
        $q=$b->prepare('DELETE FROM produtos WHERE id=?'); $q->execute([$produtoId]);
    }
    $b->commit();
}
conferir(retrato($b)===$copiaAntes,'dados de teste removidos da cópia');
conferir(retrato($origem)===$lojaAntes,'dados da loja preservados');

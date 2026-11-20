<?php
declare(strict_types=1);
require_once __DIR__ . '/ErroHttp.php';

final class Dinheiro
{
    private const MAXIMO = '18446744073709551615';

    public static function normalizar(mixed $valor): string
    {
        if ((!is_int($valor) && !is_string($valor)) || !preg_match('/^[0-9]+$/D', (string) $valor)) {
            throw new ErroHttp('Valor monetário inválido.', 422);
        }
        $texto = ltrim((string) $valor, '0');
        $texto = $texto === '' ? '0' : $texto;
        if (strlen($texto) > strlen(self::MAXIMO) ||
            (strlen($texto) === strlen(self::MAXIMO) && strcmp($texto, self::MAXIMO) > 0)) {
            throw new ErroHttp('Valor monetário acima do limite permitido.', 422);
        }
        return $texto;
    }

    // Strings evitam overflow do PHP e perda de centavos ao transportar JSON para o navegador.
    public static function somar(mixed $a, mixed $b): string
    {
        $a = self::normalizar($a);
        $b = self::normalizar($b);
        $resultado = '';
        $vaiUm = 0;
        for ($i = strlen($a) - 1, $j = strlen($b) - 1; $i >= 0 || $j >= 0 || $vaiUm; $i--, $j--) {
            $soma = ($i >= 0 ? (int) $a[$i] : 0) + ($j >= 0 ? (int) $b[$j] : 0) + $vaiUm;
            $resultado = (string) ($soma % 10) . $resultado;
            $vaiUm = intdiv($soma, 10);
        }
        return self::normalizar($resultado);
    }

    public static function multiplicar(mixed $valor, int $quantidade): string
    {
        if ($quantidade < 1 || $quantidade > 99) {
            throw new ErroHttp('Quantidade inválida para cálculo monetário.', 422);
        }
        $valor = self::normalizar($valor);
        $resultado = '';
        $resto = 0;
        for ($i = strlen($valor) - 1; $i >= 0; $i--) {
            $parcial = (int) $valor[$i] * $quantidade + $resto;
            $resultado = (string) ($parcial % 10) . $resultado;
            $resto = intdiv($parcial, 10);
        }
        if ($resto > 0) $resultado = (string) $resto . $resultado;
        return self::normalizar($resultado);
    }
}

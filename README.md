## Instruções de instalação

```bash
git clone <url-do-repositorio>
cd nest-cep
```

```bash
npm install
```

## Como executar o projeto

Defina a porta no arquivo `.env`:

```env
PORT=3000
```

```bash
npm run start:dev
```

## Como testar o endpoint

Endpoint:

```text
GET /ceps/radius?cep={cep}&raioKm={raioKm}
```

Exemplo com `curl`:

```bash
curl "http://localhost:3000/ceps/radius?cep=69005010&raioKm=5"
```

Exemplo de resposta:

```json
{
  "cepOrigem": "69005010",
  "raioKm": 5,
  "total": 3,
  "ceps": ["69005110", "69010060", "69010300"]
}
```

Validações esperadas:

- `400` para parâmetros inválidos (`cep` inválido, `raioKm <= 0`)
- `404` para CEP inexistente na base

## Testar com o frontend React

Para testar a busca no navegador, você pode usar o frontend do projeto [`Frompaje/react-cep`](https://github.com/Frompaje/react-cep).

1. Inicie a API do Nest.
2. No projeto React, configure a variável `VITE_API_URL` apontando para o backend:

```env
VITE_API_URL=http://localhost:3000
```

3. Inicie o frontend e use a tela de busca.

## CEPs disponíveis para teste

Use qualquer um destes CEPs no parâmetro `cep`:

- `69005010` - Manaus/AM - Centro
- `69005110` - Manaus/AM - Centro
- `69010060` - Manaus/AM - Praca 14 de Janeiro
- `69010300` - Manaus/AM - Cachoeirinha
- `69020010` - Manaus/AM - Educandos
- `69025020` - Manaus/AM - Adrianopolis
- `69027010` - Manaus/AM - Aleixo
- `69035090` - Manaus/AM - Chapada
- `69036040` - Manaus/AM - Flores
- `69043010` - Manaus/AM - Cidade Nova
- `69050010` - Manaus/AM - Parque 10 de Novembro
- `69053020` - Manaus/AM - Novo Aleixo
- `69057020` - Manaus/AM - Coroado
- `69067090` - Manaus/AM - Jorge Teixeira
- `69073010` - Manaus/AM - Cidade de Deus
- `69083000` - Manaus/AM - Distrito Industrial II
- `69086010` - Manaus/AM - Gilberto Mestrinho
- `69087020` - Manaus/AM - Sao Jose Operario
- `69093000` - Manaus/AM - Taruma Acu
- `69097000` - Manaus/AM - Ponta Negra

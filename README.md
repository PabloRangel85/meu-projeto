# ViaCEP + SQLite Address API

Aplicação em Next.js com arquitetura em camadas para consultar CEPs via ViaCEP, persistir os dados em SQLite e expor endpoints REST para consulta e registro.

## Funcionalidades

- Consulta de CEP via ViaCEP
- Validação de CEP antes da chamada externa
- Persistência de registros em SQLite
- Endpoints para criação e listagem de endereços
- Casos de uso cobertos por testes unitários com Vitest

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
npm install
```

## Executar testes

```bash
npm test
```

Os testes usam mocks para ViaCEP e repositório e não realizam requisições reais à rede durante a suíte automatizada.

## Executar a aplicação localmente

```bash
npm run dev
```

A aplicação fica disponível em http://localhost:3000.

## Mapa aéreo

A busca geográfica usa o serviço público [Nominatim](https://nominatim.openstreetmap.org/), sem chave de API. A aplicação consulta o endereço completo somente quando o usuário abre o mapa; não use essa instância pública para autocomplete ou alto volume. Respeite a [política de uso do Nominatim](https://operations.osmfoundation.org/policies/nominatim/), incluindo o limite de uso e a identificação do aplicativo. A atribuição da geocodificação é © OpenStreetMap contributors.

A imagem aérea usa os tiles Esri World Imagery no endpoint:

```text
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```

Mantenha visível a atribuição: `Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`. Os serviços são externos e sujeitos a disponibilidade e políticas dos respectivos provedores. A área desenhada é uma estimativa da projeção horizontal e não inclui inclinação do telhado.

## Endpoints

### POST /api/addresses

Cria um endereço consultando o CEP no ViaCEP e gravando o registro no SQLite.

```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Content-Type: application/json" \
  -d '{"cep":"01001000"}'
```

### GET /api/addresses

Lista os endereços persistidos.

```bash
curl http://localhost:3000/api/addresses
```

## Banco SQLite

O banco local é criado automaticamente em:

```bash
./local.db
```

O schema de dados é gerenciado com Drizzle ORM em:

- infrastructure/db/schema.ts
- infrastructure/db/client.ts

## Spec documentada

A especificação principal do recurso de endereço está em:

- openspec/specs/address-registration.md

## Repositório GitHub

Este projeto já está conectado a um repositório remoto configurado em:

```bash
git remote -v
```

Para publicar alterações locais, use:

```bash
git add .
git commit -m "feat: add address flow"
git push origin HEAD
```

# Tasks

## 1. Provedores gratuitos

- [x] 1.1 Substituir o SDK/tipos do Google por Leaflet e Leaflet Draw compatíveis com o projeto; verificar instalação e `npx tsc --noEmit`.
- [x] 1.2 Atualizar o README com endpoint Nominatim correto, limites de uso, atribuição OSM/Esri, URL de tiles correta e ausência de chave/faturamento; verificar que não há segredo versionado.
- [x] 1.3 Implementar a busca Nominatim sob demanda para o endereço completo, cache em memória e erros de endereço não encontrado/limite/falha; cobrir com testes Vitest mockando `fetch`.

## 2. Endereço e mapa aéreo

- [x] 2.1 Manter o campo de número/identificador alfanumérico associado ao resultado ativo; verificar validação de campo vazio e limpeza ao consultar outro CEP.
- [x] 2.2 Substituir o mapa por Leaflet com tiles Esri World Imagery, zoom inicial adequado, marcador, coordenadas, estados de tiles e atribuição visível; verificar em viewport desktop e móvel.
- [x] 2.3 Manter o botão Mapa no resultado ativo, descartar mapa/medição quando CEP ou número mudar e informar que o histórico só permite buscas aproximadas; verificar o fluxo no navegador.

## 3. Medição do telhado

- [x] 3.1 Reimplementar desenho, edição e remoção do polígono com o controle nativo Leaflet Draw; verificar que menos de três vértices não finaliza a medição.
- [x] 3.2 Preservar e testar o cálculo esférico de área projetada em m² após criação/edição/remoção e manter o aviso sobre inclinação; verificar com `npm test`.

## 4. Verificação integrada

- [x] 4.1 Validar ponta a ponta sem chave Google: CEP, endereço não encontrado, geocodificação Nominatim, tiles Esri/atribuição, desenho/edição/limpeza e estados de erro; verificar `npm test`, `npx tsc --noEmit`, `npm run lint` e `npm run build`.
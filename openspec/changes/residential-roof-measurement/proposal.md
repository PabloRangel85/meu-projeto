# Proposal

## Why

Projetos fotovoltaicos residenciais exigem uma avaliação inicial do telhado, mas a consulta atual retorna apenas o logradouro associado ao CEP e o mapa da tela é uma busca aproximada. Informar o número da residência e inspecionar a imagem aérea com uma medição manual torna essa avaliação mais útil sem depender de uma API com faturamento obrigatório.

## What Changes

- Adicionar o número da residência ao endereço consultado e usá-lo para localizar o ponto geográfico do imóvel.
- Trocar o link de mapa aproximado por uma visualização aérea interativa, aberta pelo botão Mapa e centrada no endereço completo.
- Permitir desenhar o contorno do telhado na imagem e exibir sua área aproximada em metros quadrados.
- Geocodificar o endereço completo com Nominatim e exibir a imagem aérea em um mapa Leaflet usando os tiles Esri World Imagery, sem chave ou faturamento do Google Maps Platform.
- Manter o desenho editável do telhado, o cálculo aproximado da área horizontal e o aviso sobre inclinação.
- Indicar que a medição pela imagem é uma estimativa para avaliação preliminar, não um levantamento técnico.

## Capabilities

### New Capabilities
- `residential-roof-mapping`: localizar uma residência pelo CEP e número, visualizar sua imagem aérea e estimar a área do telhado por desenho manual.

### Modified Capabilities
- Nenhuma.

## Impact

- Interface CEP em `app/page.tsx`, cliente Nominatim, componente Leaflet e testes Vitest.
- Dependências Leaflet, React Leaflet e Leaflet Draw; remoção do SDK e dos tipos do Google Maps.
- Nominatim público e tiles Esri não exigem chave de API nesta integração; ambos continuam sujeitos às políticas de uso, disponibilidade e atribuição de seus provedores.
- O contorno e a área são estimativas visuais dependentes da resolução, perspectiva e disponibilidade da imagem, e não substituem medição em campo.
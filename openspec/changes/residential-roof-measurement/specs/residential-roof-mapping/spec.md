# Spec Delta

## Purpose

Permite localizar uma residência pelo CEP e número, inspecionar sua imagem aérea e estimar manualmente a projeção horizontal do telhado para uma avaliação fotovoltaica preliminar.

## ADDED Requirements

### Requirement: Informar número da residência
O sistema SHALL permitir que o usuário informe o número ou identificador da residência junto ao CEP consultado, incluindo valores alfanuméricos e a indicação de endereço sem número.

#### Scenario: Preparar endereço para visualização
- **WHEN** o usuário consulta um CEP e informa o número da residência
- **THEN** o sistema SHALL manter o número associado ao resultado atual e habilitar a ação de abrir o mapa para esse endereço completo

#### Scenario: Número ausente
- **WHEN** o usuário tenta abrir o mapa sem informar o número ou identificador da residência
- **THEN** o sistema SHALL solicitar essa informação e SHALL NOT localizar o mapa usando somente o CEP

### Requirement: Geocodificar o endereço completo
O sistema SHALL resolver o endereço completo informado pelo usuário em coordenadas geográficas usando o serviço Nominatim do OpenStreetMap, solicitar essa geocodificação somente quando o usuário abrir o mapa e SHALL NOT substituir um resultado não encontrado pelo centro do CEP.

#### Scenario: Endereço localizado
- **WHEN** o usuário abre o mapa para um endereço completo que o serviço consegue localizar
- **THEN** o sistema SHALL apresentar a latitude e longitude retornadas e centralizar o mapa nesse ponto

#### Scenario: Endereço não localizado
- **WHEN** o serviço não retorna resultado para o endereço completo
- **THEN** o sistema SHALL informar que não foi possível localizar a residência e SHALL NOT apresentar o centro do CEP como se fosse o ponto exato

#### Scenario: Serviço de geocodificação indisponível
- **WHEN** o serviço de geocodificação limita ou não consegue atender à solicitação
- **THEN** o sistema SHALL preservar o endereço informado e exibir uma mensagem que permita tentar novamente mais tarde

### Requirement: Exibir imagem aérea atribuída
O sistema SHALL apresentar, sob demanda, uma imagem aérea centrada nas coordenadas geocodificadas, permitir inspeção em zoom adequado ao imóvel e exibir a atribuição exigida pelo provedor de imagens.

#### Scenario: Tiles de satélite carregados
- **WHEN** as coordenadas são localizadas e os tiles de satélite estão disponíveis
- **THEN** o sistema SHALL exibir a camada aérea e a atribuição "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"

#### Scenario: Tiles de satélite indisponíveis
- **WHEN** a camada aérea não consegue carregar os tiles para o mapa
- **THEN** o sistema SHALL informar que a imagem aérea não está disponível e SHALL NOT permitir iniciar uma medição sobre tiles não carregados

### Requirement: Não exigir chave de API paga
O sistema SHALL permitir geocodificar e exibir o mapa sem exigir uma chave de Google Maps Platform ou faturamento associado a essa plataforma.

#### Scenario: Abrir mapa sem credencial Google
- **WHEN** o usuário solicita o mapa e não há chave Google Maps configurada
- **THEN** o sistema SHALL continuar o fluxo usando os serviços públicos definidos para geocodificação e imagens

### Requirement: Medir contorno do telhado
O sistema SHALL permitir que o usuário desenhe, finalize, edite e limpe um polígono sobre a imagem aérea e SHALL calcular e exibir sua área projetada aproximada em metros quadrados.

#### Scenario: Polígono válido finalizado
- **WHEN** o usuário finaliza um polígono com pelo menos três vértices distintos
- **THEN** o sistema SHALL exibir o contorno sobre o mapa e sua área projetada aproximada em m²

#### Scenario: Contorno alterado ou removido
- **WHEN** o usuário altera os vértices do contorno ou limpa a medição
- **THEN** o sistema SHALL recalcular a área para o contorno atualizado ou remover o resultado quando a medição for limpa

#### Scenario: Polígono incompleto
- **WHEN** o usuário marcou menos de três vértices e ainda não finalizou um contorno
- **THEN** o sistema SHALL NOT exibir uma área como medição concluída

### Requirement: Comunicar precisão da estimativa
O sistema SHALL identificar a área medida como uma estimativa da projeção horizontal do telhado e SHALL informar que ela depende da resolução e perspectiva da imagem, não considera a inclinação da cobertura e não substitui levantamento técnico.

#### Scenario: Usuário consulta uma área medida
- **WHEN** o sistema exibe uma área de telhado calculada a partir do polígono
- **THEN** o sistema SHALL apresentar a unidade m² e avisar que o valor é uma estimativa visual da projeção horizontal, não inclui a inclinação do telhado e não é uma medição técnica
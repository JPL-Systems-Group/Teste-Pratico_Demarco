# Decisões de Arquitetura e Padrões Adotados

Este documento descreve as principais decisões técnicas tomadas no projeto TechsysLog, com a justificativa de cada escolha.

---

## 1. Arquitetura em Camadas (Layered Architecture)

**O que é:** O backend foi organizado em camadas bem definidas — Controllers, Services, Models, DTOs e Configuration — onde cada camada tem uma responsabilidade única.

**Por que foi adotado:** Mantém o código organizado e facilita a manutenção. Os controllers são responsáveis apenas por receber requisições HTTP e devolver respostas; toda a lógica de negócio fica nos Services. Isso evita que o código cresça de forma descontrolada e torna mais fácil testar cada parte de forma isolada.

---

## 2. DTO (Data Transfer Object)

**O que é:** Criação de classes específicas para entrada e saída de dados (ex: `CreateOrderRequest`, `OrderResponse`), separadas dos modelos de banco de dados.

**Por que foi adotado:** Evita expor diretamente a estrutura interna do banco de dados para o cliente. Permite que os campos retornados ao frontend sejam exatamente os necessários, sem expor dados sensíveis como hashes de senha ou IDs internos desnecessários. Também facilita a evolução do banco de dados sem quebrar a API.

---

## 3. MongoDB com Documento Embedado (Embedded Document)

**O que é:** O endereço de entrega (`Address`) é armazenado diretamente dentro do documento do pedido (`Order`), sem ser uma coleção separada.

**Por que foi adotado:** Em bancos NoSQL orientados a documentos como o MongoDB, embutir dados que são lidos juntos com frequência é uma prática recomendada. O endereço do pedido não faz sentido sem o pedido em si, então mantê-los juntos elimina a necessidade de joins e melhora a performance de leitura.

---

## 4. Desnormalização nas Entregas

**O que é:** O documento de entrega armazena o número do pedido (`OrderNumber`) além do ID do pedido (`OrderId`).

**Por que foi adotado:** MongoDB não suporta joins nativos de forma eficiente. Armazenar o `OrderNumber` diretamente na entrega permite exibir os dados de entrega sem precisar buscar o pedido correspondente a cada consulta, o que melhora a performance.

---

## 5. Autenticação com JWT (JSON Web Token)

**O que é:** Após o login, o servidor emite um token JWT assinado que o cliente armazena e envia em cada requisição no cabeçalho `Authorization: Bearer`.

**Por que foi adotado:** JWT é stateless — o servidor não precisa armazenar sessões, o que simplifica a arquitetura e permite escalabilidade horizontal. É o padrão de mercado para APIs REST modernas. O token expira em 24 horas, equilibrando segurança e usabilidade.

---

## 6. BCrypt para Hash de Senha

**O que é:** As senhas dos usuários são armazenadas como hash usando o algoritmo BCrypt com work factor 12.

**Por que foi adotado:** BCrypt é um algoritmo de hash projetado especificamente para senhas. Diferente de MD5 ou SHA, ele é propositalmente lento e inclui um "salt" automático, o que o torna resistente a ataques de força bruta e rainbow tables. Work factor 12 é o valor recomendado para sistemas modernos.

---

## 7. SignalR para Notificações em Tempo Real

**O que é:** Um hub SignalR (`NotificationHub`) transmite eventos para todos os clientes conectados no momento em que um pedido é criado ou uma entrega é registrada.

**Por que foi adotado:** A especificação exige notificações em tempo real. SignalR é a solução oficial do ecossistema ASP.NET para WebSockets, abstraindo a complexidade do protocolo e oferecendo fallback automático para ambientes que não suportam WebSocket nativo. A autenticação JWT é repassada via query string (`?access_token=`), pois o protocolo WebSocket não suporta cabeçalhos HTTP customizados na abertura da conexão.

---

## 8. Padrão de Notificação: Broadcast com Persistência por Usuário

**O que é:** Ao ocorrer um evento, o sistema cria um registro de notificação individual para cada usuário cadastrado no banco e, em seguida, transmite o evento via SignalR para todos os conectados no momento.

**Por que foi adotado:** Garantir que todos os usuários tenham acesso ao histórico de notificações, mesmo os que estavam offline no momento do evento. O registro individual por usuário permite rastrear quem leu cada notificação (campo `ReadAt`), atendendo ao requisito de log de leitura.

---

## 9. Separação de DTO Interno para Integração com ViaCEP

**O que é:** A resposta da API ViaCEP é desserializada em um objeto interno (`ViaCepApiResponse`) com os nomes originais em português (`logradouro`, `bairro`, etc.), e então mapeada para um DTO público (`ViaCepResponse`) com nomes em inglês (`Street`, `City`, etc.).

**Por que foi adotado:** O serializador JSON do .NET usa os nomes das propriedades C# para serializar a resposta. Se os campos da API interna e externa compartilhassem o mesmo objeto, o JSON retornado ao Angular chegaria com os nomes em português, causando incompatibilidade. A separação isola o contrato externo do contrato interno.

---

## 10. Angular com Componentes Standalone e Lazy Loading

**O que é:** O frontend usa a arquitetura de componentes standalone do Angular 17, sem NgModules, com carregamento lazy das rotas principais.

**Por que foi adotado:** Componentes standalone reduzem o boilerplate e tornam o código mais direto. Lazy loading garante que o bundle inicial carregado pelo usuário seja menor, melhorando o tempo de carregamento da aplicação.

---

## 11. Interceptor HTTP para Injeção do Token JWT

**O que é:** Um interceptor Angular injeta automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições HTTP autenticadas.

**Por que foi adotado:** Centraliza a lógica de autenticação em um único ponto. Sem o interceptor, seria necessário adicionar o cabeçalho manualmente em cada chamada de serviço, o que seria repetitivo e propenso a erros.

---

## 12. Guard Funcional para Proteção de Rotas

**O que é:** Rotas protegidas do Angular verificam se o usuário está autenticado antes de renderizar o componente, redirecionando para o login caso contrário.

**Por que foi adotado:** Impede que usuários não autenticados acessem páginas protegidas diretamente pela URL. Usa a sintaxe funcional (`canActivateFn`) introduzida no Angular 15+, que é mais simples e dispensa a criação de uma classe separada.

---

## 13. Docker Compose para MongoDB

**O que é:** Um arquivo `docker-compose.yml` na raiz do projeto sobe uma instância do MongoDB localmente com um único comando.

**Por que foi adotado:** Elimina a necessidade de instalar o MongoDB diretamente na máquina do avaliador. Garante que o ambiente de banco de dados seja idêntico para qualquer pessoa que execute o projeto, evitando problemas de configuração.

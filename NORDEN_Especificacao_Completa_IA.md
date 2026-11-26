# NORDEN — Especificação funcional e técnica para construção do zero

**Produto:** NORDEN | Salão Inteligente Masculino  
**Idioma:** português do Brasil (pt-BR)  
**Público do salão:** exclusivamente masculino  
**Natureza do documento:** briefing de produto, requisitos, arquitetura sugerida e roteiro de implementação  
**Status:** projeto planejado; não pressupõe código existente, salão em operação ou integrações ativas.  
**Destinatários:** Figma, Gemini, Antigravity, Lovable e demais agentes de design e desenvolvimento.

> Use este documento como fonte principal. Construa um projeto novo e independente. Não reutilize nem altere o Aurora Studio ou qualquer outro repositório. O nome NORDEN e o público masculino são decisões estabelecidas. Os serviços, preços, produtos, profissionais, tarifas e demais configurações comerciais usados para demonstração são exemplos, não informações oficiais.

## 1. Missão para a IA

Crie uma aplicação web responsiva completa de um salão masculino inteligente, reunindo experiência pública, conta do cliente, agendamento, agenda profissional, acompanhamento dos procedimentos, loja de produtos e administração. O sistema deve conectar o antes, durante e depois do atendimento, com dados persistentes e regras coerentes entre os módulos.

Não entregue apenas uma landing page, um e-commerce isolado ou telas estáticas sem conexão. Para agentes de programação, implemente os fluxos de ponta a ponta, validações, autenticação, banco, autorização, estados de interface e testes. Para ferramentas de design, represente esses mesmos fluxos em protótipos navegáveis e anote as regras que dependem do backend; não afirme que o protótipo executa pagamentos, protege dados ou persiste registros reais.

### 1.1. Diretrizes de execução

- Trabalhar em etapas sequenciais. Ao concluir uma etapa, testar seus requisitos, corrigir falhas e prosseguir para a próxima etapa dentro da execução disponível.
- Separar layout, componentes, regras de negócio, dados e integrações. Evitar duplicar entidades e lógica.
- Nenhum botão principal deve ser decorativo. Implementar ações reais ou identificar explicitamente uma simulação ou funcionalidade indisponível.
- Usar dados fictícios claramente marcados apenas no ambiente de demonstração; nunca criar avaliações, clientes, estoque ou vendas apresentadas como reais.
- Documentar decisões, pendências, dependências externas e testes executados. Não declarar algo concluído sem verificação.
- Não ativar cobrança real, disparar mensagens a terceiros, publicar em produção ou usar dados pessoais reais sem autorização específica.
- Se faltar uma definição comercial não crítica, usar um parâmetro configurável e documentar o valor ilustrativo. Não inventar políticas oficiais. Para decisões sensíveis de privacidade, pagamentos e publicação, manter bloqueio seguro até configuração adequada.

## 2. Visão e proposta de valor

O NORDEN não é somente uma barbearia digital ou uma agenda online. É uma plataforma integrada de cuidados masculinos que permite ao cliente descobrir serviços, personalizar seu atendimento, consultar sua evolução, receber um manual de cuidados e adquirir os produtos efetivamente utilizados ou recomendados pelo profissional.

Para o gestor, o sistema facilita a organização da agenda, sugere aproveitamento de horários liberados por cancelamentos, registra os procedimentos, conecta o histórico à loja e acompanha pedidos e estoque.

**Slogan sugerido:** Seu estilo. Sua evolução.  
**Assinatura sugerida:** Men's Care & Experience.  
Não tratar essas assinaturas como obrigatórias ou como marca registrada.

### 2.1. Problemas que o produto pretende resolver

- Agendamento fragmentado e dependência de conversas manuais para encontrar horários.
- Horários ociosos quando um atendimento é cancelado.
- Falta de registro acessível dos procedimentos e produtos utilizados.
- Esquecimento das orientações de manutenção e cuidados em casa.
- Dificuldade de adquirir os produtos recomendados após o atendimento.
- Retrabalho operacional na gestão de agenda, serviços, clientes, produtos e pedidos.

Esses problemas são hipóteses de produto a validar, não resultados comprovados de pesquisa.

### 2.2. Módulos do MVP

| Módulo | Escopo obrigatório desta especificação |
|---|---|
| Site público | Landing page, serviços, profissionais, galeria, produtos, contato, login e cadastro |
| Conta e perfil | Identidade, preferências, alergias/sensibilidades, endereços e privacidade |
| Agenda | Serviço, profissional, duração, disponibilidade, preferência opcional de produto e reserva |
| NORDEN Flow | Sugestões de realocação e encaixes após cancelamentos, com aprovação |
| Atendimento | Consulta de alertas pertinentes, execução, produtos usados, conclusão e cuidados |
| NORDEN Journey | Linha do tempo e detalhes de cada procedimento concluído |
| NORDEN Care | Manual de cuidados revisado pelo profissional, vinculado ao atendimento |
| NORDEN Store | Catálogo, produtos, recomendações, carrinho, checkout, pedidos e estoque |
| Entregas | Retirada ou entrega, taxa por km, acompanhamento de status |
| Gestão | Dashboard, agenda, clientes, profissionais, serviços, produtos, estoque, manuais e pedidos |
| Segurança | Autenticação, autorização por papel e registro, proteção de dados e auditoria básica |

A loja e a entrega simplificada passam a integrar a entrega obrigatória desta especificação, por solicitação atual, embora tenham sido classificadas como secundárias em uma versão anterior do MVP. Pagamentos reais, mapas/rotas, IA generativa, fidelidade e notificações externas avançadas continuam como evoluções opcionais. Não omitir os fluxos básicos de compra e entrega.

## 3. Personas e Matriz CSD

### 3.1. Lucas Martins — cliente (persona hipotética)

Homem de 28 anos, analista administrativo, habituado a resolver tarefas pelo celular. Quer agendar rapidamente, conhecer preço e duração, saber quais produtos foram usados, preservar o resultado e comprar produtos com comodidade. Valoriza privacidade, clareza e personalização.

### 3.2. Rafael Almeida — profissional e gestor (persona hipotética)

Homem de 36 anos, barbeiro/cabeleireiro masculino e gestor. Precisa reduzir retrabalho, aproveitar cancelamentos, administrar horários e serviços, registrar produtos rapidamente e controlar pedidos e estoque. Prioriza clareza e eficiência operacional.

Ambas as personas são fictícias e derivadas da CSD; não representam entrevistas realizadas.

### 3.3. Matriz CSD de referência (9 itens por coluna)

| Certezas de escopo | Suposições a validar | Dúvidas a resolver |
|---|---|---|
| Landing page | Clientes valorizam histórico digital | Serviços iniciais |
| Cadastro e login | Realocação reduz ociosidade | Dados obrigatórios |
| Alergias e sensibilidades | Recomendações aumentam interesse em compras | Proteção de dados sensíveis |
| Agendamento online | Manuais ajudam a preservar resultados | Regras e aceite de remarcação |
| Linha do tempo | Personalização favorece fidelização | Controle de estoque |
| Registro de produtos usados | Preferência pelo celular | Cálculo da taxa de entrega |
| Manual pós-serviço | Entrega amplia conveniência | Formas de pagamento |
| Sugestões de reagendamento | Integração facilita a gestão | Autoria e revisão dos manuais |
| Loja com retirada ou entrega | Clientes utilizam recomendações | Prioridades da primeira versão |

O painel profissional/gestor é transversal a todas as certezas. Não tratar hipóteses como evidências de mercado.

## 4. Direção de UX/UI e marca

Crie uma identidade séria, masculina, moderna, minimalista e premium. Evite a estética genérica de templates de barbearia, excesso de ornamentos, gradientes chamativos, cartões gigantes e efeitos que prejudiquem desempenho ou leitura.

### 4.1. Direção criativa

- Nome em destaque: NORDEN. Logo definitivo ainda não aprovado; usar wordmark temporário e substituível, sem apresentar como marca registrada.
- Visual editorial, hierarquia tipográfica forte, contraste, alinhamento preciso e áreas de respiro.
- Fotografias autorizadas ou ilustrações de referência de cortes, barba, cuidados, profissionais e ambientes masculinos contemporâneos. Não apresentar imagens ilustrativas como salão real.
- Landing page com movimento sutil ao rolar, transições leves, imagens amplas, interação em botões e navegação clara. Respeitar preferência por movimento reduzido.
- Área do cliente acolhedora e rápida; área de gestão compacta, operacional, com listas, tabelas e calendário.
- Design mobile-first, com layouts distintos quando necessário para desktop, tablet e celular. Evitar tabelas impossíveis de usar em telas estreitas.
- Estados de carregamento, vazio, erro, sucesso, indisponibilidade, sessão expirada e confirmação de ações destrutivas.
- Contraste e foco visível, rótulos de campos, teclado, textos alternativos e alvos de toque adequados. Buscar WCAG 2.2 AA como meta, sem alegar certificação.

### 4.2. Paletas de referência (ainda não escolhidas)

| Paleta | Cores |
|---|---|
| Grafite Premium | `#1F1F23` `#0B0B0D` `#8C8176` `#8E6B47` `#E7E2DB` |
| Azul Urbano | `#1A2330` `#6C727C` `#A3A9B1` `#D9D6D1` `#F4F2EE` |
| Couro & Metal | `#202124` `#4C3D34` `#9A6B49` `#CBB8A3` `#F1ECE5` |

Para não bloquear a implementação, usar Azul Urbano como direção provisória sugerida e organizar todas as cores como tokens substituíveis. Não assumir aprovação definitiva. Ajustar os pares de cores para contraste de texto e componentes; cor sozinha não indica status.

## 5. Perfis de acesso e permissões

| Recurso | Visitante | Cliente | Profissional | Gestor |
|---|---|---|---|---|
| Site e catálogo público | Sim | Sim | Sim | Sim |
| Criar conta cliente | Sim | — | — | — |
| Perfil e reservas | — | Somente próprios | Reservas atribuídas | Gestão autorizada |
| Dados de saúde/alertas | — | Próprios | Necessários ao atendimento atribuído | Somente se necessário e autorizado |
| Concluir atendimento | — | — | Atribuídos | Quando autorizado a atuar como profissional |
| Linha do tempo | — | Própria | Atendimentos autorizados | Acesso operacional necessário |
| Ofertas de realocação | — | Aceitar/recusar próprias | Agenda atribuída | Gerenciar |
| Loja e pedidos | Catálogo | Próprios pedidos | Consulta de produtos | Gerenciar pedidos e estoque |
| Catálogos, equipe, regras | — | — | Consulta necessária | Gerenciar |
| Auditoria | — | — | — | Restrita |

O MVP pode combinar profissional e gestor na mesma conta, como a persona Rafael, desde que as permissões sejam verificadas no servidor e a arquitetura permita separação. Cadastro público cria apenas cliente; contas administrativas são convidadas/provisionadas pelo gestor. Nunca permitir escolher papel administrativo no cadastro público. Não confiar em esconder botões como mecanismo de segurança.

## 6. Mapa de telas e navegação

Rotas sugeridas (podem ser adaptadas à tecnologia escolhida; manter todos os destinos funcionais).

| Área | Rotas/telas |
|---|---|
| Pública | `/`, `/servicos`, `/servicos/:slug`, `/profissionais`, `/galeria`, `/loja`, `/loja/:slug`, `/contato`, `/privacidade`, `/termos`, `/login`, `/cadastro`, `/recuperar-senha` |
| Cliente | `/app`, `/app/perfil`, `/app/agendar`, `/app/agendamentos`, `/app/agendamentos/:id`, `/app/realocacoes`, `/app/jornada`, `/app/jornada/:id`, `/app/cuidados/:id`, `/app/carrinho`, `/app/checkout`, `/app/pedidos`, `/app/pedidos/:id`, `/app/notificacoes` |
| Profissional/gestor | `/gestao`, `/gestao/agenda`, `/gestao/flow`, `/gestao/atendimentos/:id`, `/gestao/clientes`, `/gestao/clientes/:id`, `/gestao/profissionais`, `/gestao/servicos`, `/gestao/produtos`, `/gestao/estoque`, `/gestao/manuais`, `/gestao/pedidos`, `/gestao/pedidos/:id`, `/gestao/configuracoes`, `/gestao/auditoria` |

Navegação do cliente em celular: início, agenda, jornada, loja e perfil como destinos prioritários. Pedidos e notificações acessíveis pelo início/perfil. Gestão: navegação lateral em desktop e menu compacto em celular. A navegação pública deve manter uma chamada de agendamento clara e acesso à loja.

## 7. Landing page e área pública

### 7.1. Página inicial

A página inicial apresenta a marca e explica o conceito de salão inteligente. Incluir:

- Cabeçalho com NORDEN, serviços, profissionais, loja, acesso à conta e CTA Agendar.
- Hero de alto impacto, com título claro, fotografia/arte de referência e ação de agendamento.
- Catálogo resumido de serviços com nome, descrição, preço ou indicação de orçamento quando aplicável, duração e CTA.
- Profissionais com especialidades, breve apresentação, foto autorizada e acesso ao agendamento.
- Seção Antes / Durante / Depois explicando a jornada e o histórico digital.
- Apresentação dos diferenciais NORDEN Flow, Journey, Care e Store.
- Vitrine de produtos em destaque, com acesso à loja.
- Galeria de trabalhos e resultados autorizados; avaliações reais/moderadas, se houver. Ocultar seção sem conteúdo em vez de inventar depoimentos.
- Endereço, contato, horários e perguntas frequentes configuráveis. Não inventar endereço ou telefone oficial.
- Rodapé com links úteis, privacidade, termos e contato.

### 7.2. Serviços e profissionais

Página de serviço: descrição, preço, duração, profissionais compatíveis, produtos elegíveis, orientações gerais e botão Agendar. Permitir iniciar agendamento com serviço pré-selecionado. Página de profissionais: especialidades, disponibilidade consultável pelo fluxo de agenda e serviços realizados. Serviços inativos não podem gerar novas reservas; dados históricos devem permanecer.

## 8. Cadastro, login e perfil do cliente

### 8.1. Cadastro proposto

Campos essenciais: nome completo, e-mail, telefone, senha e confirmação (quando autenticação por senha). Data de nascimento opcional nesta primeira especificação, até definição da equipe. Solicitar somente os dados necessários. Endereço deve ser solicitado para entrega, não como obstáculo ao cadastro inicial.

Ficha de preferências e segurança:

- Preferências de corte, barba ou outros serviços e produtos (opcionais).
- Pergunta sobre alergias/sensibilidades: Sim / Não / Não sei / Prefiro informar ao profissional.
- Se Sim, permitir detalhar substâncias/produtos conhecidos, sem exigir diagnóstico ou histórico clínico completo.
- Outros cuidados relevantes ao procedimento, opcionais e restritos ao necessário.
- Informar finalidade, acesso e retenção de dados sensíveis. Registrar consentimento específico quando essa for a base adequada, separado de marketing. A base legal e a política de retenção precisam de definição antes de uso real.
- Não interpretar ausência de informação como ausência de alergia. Permitir atualizar o perfil e solicitar correção/exclusão.

### 8.2. Autenticação e conta

Login, logout, recuperação de senha, validação de e-mail conforme provedor, sessão expirada, proteção de rotas e perfil editável. Não usar login administrativo de demonstração em produção. Caso a ferramenta não tenha autenticação real, identificar a alternância de perfis como demonstração e não coletar dados reais.

### 8.3. Início do cliente

Mostrar próxima reserva, ações rápidas de agendamento, ofertas de realocação pendentes, último atendimento, acesso ao manual correspondente, produtos relacionados e pedidos recentes. Não replicar dados em registros separados: utilizar as entidades de origem. Se não houver atendimento, apresentar estado vazio com CTA Agendar.

## 9. Agendamento — fluxo completo

### 9.1. Etapas

1. Selecionar serviço ativo e consultar preço e duração.
2. Selecionar profissional habilitado para o serviço ou consultar opções disponíveis.
3. Escolher produtos de preferência (opcional) entre os compatíveis. Exibir descrição, preço de venda e possível custo adicional do procedimento apenas se configurado. Permitir pular. Produtos selecionados aqui não são compras automáticas nem confirmação de uso.
4. Escolher data e horário conforme disponibilidade e duração efetiva do serviço, intervalos e bloqueios.
5. Revisar serviço, profissional, horário, duração, preço, preferências e regras de cancelamento. Solicitar confirmação.
6. Registrar reserva e mostrar confirmação ou status pendente, conforme regra configurada. Oferecer acesso a Meus agendamentos.

Se a pessoa não estiver autenticada, permitir explorar o catálogo e preservar escolhas não sensíveis ao encaminhar para login/cadastro. Revalidar as escolhas depois da autenticação.

### 9.2. Regras de agenda

- Disponibilidade é calculada a partir de horário de trabalho, habilitação profissional, duração, intervalos, bloqueios e reservas que ocupam a agenda.
- Intervalos de reserva são semiabertos `[início, fim)`: o próximo pode começar no fim do anterior apenas se não houver intervalo adicional.
- Reservas pendentes que bloqueiam horário precisam de prazo/expiração configurado; se não houver fluxo de confirmação pendente, confirmar diretamente após validação.
- Armazenar datas de forma consistente, com fuso do estabelecimento (proposta: America/Sao_Paulo) e apresentar horário local. Não confiar na hora do navegador.
- Impedir reserva duplicada e sobreposição mesmo em requisições simultâneas. Checar novamente e gravar atomicamente no banco.
- Congelar preço, duração e descrição essenciais no momento da confirmação; alterações do catálogo não modificam reservas existentes silenciosamente.
- Cancelamento e solicitação de remarcação seguem regras configuráveis. Informar antes de confirmar. Registrar motivo opcional, autor e data.
- Não disponibilizar horários passados nem profissionais inativos. Não apagar histórico de uma reserva cancelada.

### 9.3. Estados sugeridos

`PENDENTE` → `CONFIRMADO` → `EM_ATENDIMENTO` → `CONCLUIDO`.

`PENDENTE` ou `CONFIRMADO` podem ir para `CANCELADO` segundo as regras; `CONFIRMADO` pode virar `NAO_COMPARECEU` após o horário, por ação autorizada. Remarcação atualiza data/horário com evento de histórico, não duplica o atendimento. Não permitir conclusão de reserva cancelada sem fluxo administrativo explícito de correção auditada.

## 10. NORDEN Flow — motor de realocação inteligente

Diferencial central. Deve funcionar por regras determinísticas no MVP, sem depender de LLM.

### 10.1. Gatilhos e resultado

Ao cancelar uma reserva do dia ou da semana, liberar a janela correspondente e recalcular encaixes possíveis. Mostrar no painel: janela liberada, profissional, duração disponível, reservas elegíveis, motivo da sugestão, horário original e proposto. O gestor pode oferecer o horário a um cliente; não alterar reservas automaticamente.

### 10.2. Algoritmo funcional sugerido

```text
receber evento de cancelamento confirmado
recalcular intervalos livres do profissional dentro do horizonte configurado
para cada janela livre:
  localizar reservas futuras elegíveis no horizonte
  excluir canceladas, concluídas, em atendimento e faltas
  excluir reservas do próprio horário e clientes que recusaram essa oferta
  verificar habilitação do profissional e duração total com intervalos
  verificar jornada de trabalho, bloqueios e conflitos
  verificar preferência/disponibilidade do cliente quando conhecida
  somente sugerir antecipação se o novo horário preceder o atual
  ordenar por critérios explícitos e configuráveis
mostrar sugestões e razões ao gestor
```

Priorizar, como proposta inicial, compatibilidade, antecedência aceitável, preferência do cliente e aproveitamento da janela. Não usar dados sensíveis como critério de ranking. Não inventar disponibilidade do cliente. Mudança de profissional apenas se permitida e explicitamente aceita. Um intervalo de 60 min aceita um serviço de 45 min que caiba com intervalos, mas não um de 90 min.

### 10.3. Aceitação e concorrência

- Gestor seleciona candidato e envia oferta interna contendo os dois horários, serviço e profissional.
- Cliente aceita, recusa ou deixa expirar. A reserva original permanece válida enquanto pendente.
- No aceite, exigir aprovação operacional já registrada e revalidar horário original, novo intervalo e validade da oferta.
- Efetivar troca em transação única; manter registro do horário anterior e encerrar ofertas concorrentes que se tornaram inválidas.
- Se a janela foi preenchida ou a reserva mudou, expirar oferta e preservar reserva original; avisar ambas as partes.
- Não criar reserva dupla, não encadear alterações automaticamente e não deslocar outros clientes sem aceite.
- Estados da oferta: `SUGERIDA`, `OFERTADA`, `ACEITA`, `RECUSADA`, `EXPIRADA`, `EFETIVADA`, `INVALIDADA`. O aceite e a efetivação podem ocorrer na mesma transação; não mostrar sucesso antes do commit.

### 10.4. Tela do gestor e cliente

Agenda com janelas livres, indicadores de cancelamento, aba de sugestões com comparação lado a lado e filtros por dia/semana. Cliente vê notificações, motivo da oferta, horário atual e alternativo, prazo e botões Aceitar/Recusar. Ofertas sem resposta não devem cancelar a reserva original.

## 11. Atendimento profissional

### 11.1. Preparação e execução

O profissional abre a reserva e consulta cliente, serviço, horário, preferências, produtos solicitados e alertas pertinentes de alergias/sensibilidades. Mostrar de forma discreta, sem expor informações sensíveis em calendários compartilhados. Confirmar os produtos adequados antes de iniciar; preferência não substitui avaliação profissional.

Ao iniciar, registrar status e hora. Durante o atendimento, permitir registrar:

- Serviço/procedimento efetivamente realizado.
- Produtos realmente utilizados: escolher do catálogo ou registrar item manual não comercializado, com nome e observação; quantidade/unidade quando aplicável.
- Produtos que o profissional recomenda para manutenção, distinguindo dos utilizados.
- Observações visíveis ao cliente e notas internas em campos separados.
- Fotos antes/depois opcionais, com autorização específica e armazenamento privado.
- Orientação de retorno, quando adequada.

### 11.2. Conclusão

Antes de concluir, revisar procedimento, produtos usados (ou opção explícita Nenhum produto utilizado), recomendações, manual de cuidados e notas compartilháveis. Exigir validação profissional do manual. Concluir atomicamente, impedir duplicação em cliques/retries e atualizar a linha do tempo. Registrar profissional e data da finalização.

O cliente recebe aviso interno e consegue abrir o atendimento. Alterações posteriores exigem permissão e histórico de correção; preservar o conteúdo originalmente fornecido quando houver revisão de manual ou catálogo. Não disponibilizar anotações internas ao cliente por acidente.

## 12. NORDEN Journey — linha do tempo

Construir como uma visão dos atendimentos concluídos e suas relações, não como uma segunda base duplicada.

### 12.1. Interface

Linha do tempo cronológica, mais recentes primeiro, com filtro por serviço e período. Cada evento exibe data, procedimento, profissional, breve resumo e acesso ao detalhe. No detalhe:

- Serviço realizado, duração e profissional.
- Produtos realmente utilizados, com nome e detalhes relevantes; botão Ver produto para itens disponíveis na loja.
- Recomendações complementares separadas, com justificativa e indicação de que não foram necessariamente utilizadas.
- Manual de cuidados referente àquela sessão.
- Observações autorizadas e fotos privadas, quando existentes.
- Próxima manutenção sugerida e CTA Reagendar.
- Possibilidade de avaliar atendimento, se o módulo de avaliação estiver habilitado.

Reservas futuras, cancelamentos e faltas pertencem à lista de agendamentos, não ao histórico de procedimentos concluídos. Não criar evento de atendimento que não aconteceu. Produtos desativados devem continuar identificáveis no histórico, mas sem compra indisponível.

## 13. NORDEN Care — manual de cuidados

### 13.1. Biblioteca e personalização

Gestor/profissional cadastra modelos de orientação por tipo de serviço, com título, versão, instruções, cuidados nas primeiras horas/dias, o que evitar, manutenção, produtos relacionados e data de revisão. Permitir editar o conteúdo para o atendimento específico e pré-visualizar antes de publicar.

Ao finalizar, o profissional valida e vincula uma versão/snapshot do manual ao atendimento. Mudanças no modelo não alteram silenciosamente as orientações de atendimentos antigos. Permitir correção auditada e notificação quando apropriado.

### 13.2. Experiência do cliente

Exibir manual no detalhe da linha do tempo, legível em celular, com seções simples, ações práticas, links de produtos e opção de retornar ao atendimento. As recomendações devem ser compatíveis com o contexto e revisadas pelo profissional. Não diagnosticar condições, prometer segurança ou prescrever tratamentos. Caso haja dúvida/reação, orientar contato com profissional adequado. IA generativa, se adicionada futuramente, deve produzir rascunhos sujeitos a revisão humana, nunca publicar automaticamente.

## 14. NORDEN Store — loja integrada (obrigatória)

A loja é um módulo de comércio completo no escopo do MVP demonstrável. Não confundir com uma seção de produtos meramente decorativa na landing page.

### 14.1. Catálogo e produto

- Categorias exemplificativas: cabelo, barba, pele e acessórios/cuidados masculinos. Configuráveis.
- Produto: nome, descrição, marca, SKU, categoria, fotos, preço, preço promocional opcional, tamanho/unidade, ingredientes/informações do fabricante quando disponíveis, orientações de uso autorizadas, serviços compatíveis, estoque e status ativo/inativo.
- Lista de produtos com pesquisa, filtros por categoria e disponibilidade, ordenação simples e paginação quando necessário.
- Página de produto com preço, quantidade, disponibilidade, descrição, modo de uso fornecido/revisado, alertas aplicáveis e botão Adicionar ao carrinho.
- Permitir navegar publicamente; exigir login para confirmar pedido e acessar histórico.
- Não ocultar indisponibilidade. Não vender produto inativo ou sem estoque. Não afirmar que um produto é hipoalergênico/seguro sem evidência.

### 14.2. Integração com serviços

Distinguir três registros:

| Registro | Origem | Efeito |
|---|---|---|
| Preferência de produto | Cliente durante agendamento | Sugestão ao profissional; não gera compra nem consumo |
| Produto utilizado | Profissional durante atendimento | Histórico real da execução; pode gerar consumo de estoque se configurado |
| Produto recomendado | Profissional ao concluir/manual | Sugestão de manutenção e link para compra voluntária |

O sistema pode sugerir produtos compatíveis com o serviço no agendamento, mostrar os efetivamente utilizados depois e recomendar complementares aprovados. Não adicionar ao carrinho sem ação do cliente. Mostrar alertas de incompatibilidade conhecida e encaminhar dúvidas para revisão. Dados de alergia não devem ser enviados a serviços externos de recomendação ou expostos a terceiros.

### 14.3. Carrinho

- Adicionar, remover, aumentar/diminuir quantidade e recalcular subtotal.
- Persistir carrinho do cliente autenticado; visitantes podem usar carrinho temporário sem dados sensíveis.
- Revalidar preço, promoção, quantidade e disponibilidade no servidor antes do checkout. Se mudou, informar e solicitar confirmação.
- Mostrar subtotal, taxa de entrega quando aplicável e total. Valores monetários em centavos inteiros (BRL), sem cálculos em ponto flutuante.
- Não cobrar duas vezes; criar pedido com identificador idempotente.

### 14.4. Checkout e modalidade de recebimento

Etapas: revisar carrinho → identificar destinatário → escolher retirada/entrega → calcular e exibir taxa → revisar total → confirmar pedido → apresentar confirmação e acompanhar pedido.

**Retirada:** taxa zero, local e instruções configuráveis, aviso de pedido pronto.  
**Entrega:** endereço completo (CEP, rua, número, complemento opcional, bairro, cidade, UF), distância considerada, taxa e cobertura. Permitir usar endereço salvo ou novo endereço. Exibir valores e modalidade antes da confirmação.

MVP: registrar pedido com pagamento simulado claramente identificado ou opção de pagamento presencial, se configurada. Não apresentar pagamento simulado como dinheiro recebido. Não coletar cartão real. Gateway real futuro exige configuração, verificação de webhook, idempotência e tratamento de estornos.

### 14.5. Taxa por quilômetro

Parâmetros configuráveis pelo gestor: tarifa em centavos/km, distância máxima, taxa base ou mínima opcional e regra de arredondamento. Sugestão de fórmula, a validar:

```text
taxa = max(taxa_minima, taxa_base + arredondar(distancia_km * tarifa_centavos_por_km))
retirada = 0
se distancia > raio_de_cobertura: bloquear entrega e oferecer retirada
```

Exemplo exclusivamente ilustrativo: 4 km a R$ 2,50/km, sem taxa base/mínima, resulta em R$ 10,00. Não adotar como tarifa oficial. No MVP, usar distância informada/fixture demonstrativa claramente marcada como estimativa; em operação real, distância deve ser validada por gestor ou fonte confiável antes da confirmação do valor. Não fingir integração com mapas ou cálculo por rota. Congelar endereço, distância, tarifa e total no pedido. Se a cotação mudar antes de confirmar, mostrar diferença e pedir nova aprovação.

### 14.6. Pedidos e estados

Estados operacionais sugeridos:

`RECEBIDO` → `EM_PREPARACAO` → `PRONTO_RETIRADA` → `CONCLUIDO` (retirada)

`RECEBIDO` → `EM_PREPARACAO` → `SAIU_ENTREGA` → `CONCLUIDO` (entrega)

`CANCELADO` conforme política, estoque e estágio do pedido. Bloquear transições incompatíveis com a modalidade. Manter histórico de eventos, data, autor e motivo. Status financeiro separado do operacional (`NAO_PAGO`, `SIMULADO`, `PAGO` somente se confirmado por mecanismo autorizado, `ESTORNADO` quando aplicável). Não misturar pedido de produtos com reserva de serviço; vincular origem da recomendação opcionalmente.

Cliente: Meus pedidos, detalhe, itens, quantidade, valores, modalidade, instruções, status e histórico. Gestor: fila de pedidos, filtros, preparação, alteração de status permitida e cancelamento. Não disponibilizar rastreamento geográfico ao vivo sem integração real.

### 14.7. Estoque e gestão comercial

- Cadastro/edição de produto, SKU único, preço, categoria, imagens, compatibilidade e estoque.
- Controlar saldo físico, quantidade reservada e disponível (disponível = físico - reservado).
- Na criação do pedido, reservar estoque atomicamente; bloquear quantidade insuficiente e concorrência de compras. Na expedição/retirada, consumir reserva e baixar saldo uma única vez; no cancelamento antes da baixa, liberar a reserva uma única vez.
- Após expedição, devolução/reposição exige ação específica e conferência, sem repor automaticamente itens não devolvidos.
- Movimentos: entrada, ajuste, reserva, liberação, saída de venda, consumo em procedimento (quando configurado). Registrar responsável, motivo, origem e data.
- Consumo de produtos do salão pode usar estoque separado ou unidade de consumo compatível. Não subtrair uma embalagem inteira por uso parcial sem regra definida. Se consumo não for controlado no MVP, manter registro de uso sem baixa automática.
- Indicadores: produtos disponíveis, baixo estoque por limite configurável, pedidos por estado e vendas efetivamente registradas. Não contar pedidos simulados como receita real.

## 15. Painel de gestão do NORDEN

### 15.1. Dashboard

Visão compacta e operacional: próximos atendimentos, horários livres, cancelamentos recentes, sugestões de realocação pendentes, atendimentos concluídos, pedidos em preparação, pedidos prontos e alertas de estoque. Filtros por período e profissional. Cada indicador deve abrir a lista filtrada correspondente. Usar contagens calculadas a partir dos registros reais do ambiente, com distinção explícita de demonstração e operação real.

### 15.2. Agenda e clientes

- Agenda por dia e semana, e visão mensal resumida; filtros por profissional e estado. Mostrar duração e intervalos de cada atendimento.
- Criar agendamento manual em nome do cliente autorizado, cancelar, solicitar remarcação, iniciar atendimento e consultar detalhes.
- Configurar disponibilidade semanal, folgas, férias, feriados e bloqueios excepcionais.
- Busca de clientes por nome ou contato, conforme permissões. Ficha com dados essenciais, reservas, atendimentos, preferências e alertas autorizados. Não expor alergias em listas gerais.
- Separar dados compartilhados com cliente de notas internas e histórico de auditoria.

### 15.3. Administração de catálogos

- Serviços: nome, descrição, categoria, preço, duração, intervalos, profissionais habilitados, produtos compatíveis, modelo de cuidados e status.
- Profissionais: nome, especialidades, foto autorizada, serviços habilitados, disponibilidade e status. Conta vinculada por convite administrativo.
- Produtos e estoque: CRUD, categorias, preços, imagens, SKU, compatibilidade, inventário e movimentações conforme seção 14.
- Conteúdo público: textos, galeria, contatos, horários, perguntas frequentes e avaliações quando legítimas.
- Manuais: modelos, versões, revisão e ativação por serviço.
- Pedidos: fila, detalhe, estado operacional, modalidade, valores e cancelamento.
- Configurações: parâmetros de agendamento, políticas, entrega, estoque, dados do salão, fuso horário, meios de pagamento demonstrativos e canais de notificação.

Registros relacionados a reservas, atendimentos, pedidos e estoque não devem ser destruídos ao desativar um item de catálogo. Usar desativação lógica quando necessário para preservar integridade e cumprir as regras de retenção.

## 16. Notificações e avaliações

### 16.1. Notificações internas

Implementar uma central de notificações com contagem de não lidas, data, tipo e link para o registro correspondente. Tipos mínimos: agendamento confirmado/cancelado, oferta de realocação, resultado da oferta, atendimento concluído, manual disponível, pedido recebido, pedido pronto, saiu para entrega e pedido concluído. Para gestão: cancelamento, sugestão disponível, novo pedido e estoque baixo. Não mostrar detalhes sensíveis em notificações de tela bloqueada ou mensagens externas.

Notificações devem respeitar permissões e ser idempotentes. E-mail, WhatsApp, push e SMS são opcionais, sujeitos a credenciais, consentimentos quando aplicáveis, custos e configuração. Não confundir botão que abre mensagem preparada com integração oficial de envio automatizado.

### 16.2. Avaliações

Como aprimoramento, permitir nota e comentário após atendimento concluído, uma avaliação por atendimento, edição conforme política e moderação para publicação pública. Exibir somente depoimentos reais autorizados; separar feedback privado da publicação. Não gerar avaliações fictícias como prova de satisfação. Se não houver dados, usar estado vazio.

## 17. Arquitetura técnica de referência

A escolha de framework não foi determinada pela equipe. Preferir tecnologias suportadas pela ferramenta utilizada, mantendo o mesmo comportamento funcional. Uma combinação sugerida para agentes de código é React/TypeScript (Next.js ou Vite conforme hospedagem), componentes acessíveis, CSS organizado/Tailwind, backend com autorização e PostgreSQL ou banco relacional equivalente. Autenticação e armazenamento podem usar serviços gerenciados, desde que as permissões sejam efetivamente aplicadas. Não exigir uma plataforma específica se houver alternativa viável.

### 17.1. Camadas

1. **Interface:** telas, componentes reutilizáveis, navegação, formulários e estados.
2. **Domínio:** regras de disponibilidade, reservas, realocação, atendimento, manual, catálogo, preço, estoque e pedido.
3. **Persistência:** banco relacional, migrations, chaves estrangeiras, transações e índices.
4. **Acesso:** autenticação, permissões por papel e por registro, validação de entradas e políticas no servidor/banco.
5. **Integrações:** adaptadores independentes para notificações, pagamento, distância e arquivos; versões simuladas explicitamente identificadas.

Não colocar chaves privadas no frontend ou no repositório. Usar arquivo de exemplo de variáveis de ambiente sem segredos. Se utilizar serviços de banco acessíveis pelo cliente, aplicar políticas de segurança por linha ou mecanismo equivalente; não depender apenas das regras da interface. Operações críticas devem passar por funções autorizadas e transacionais.

### 17.2. Modelo de dados sugerido

IDs estáveis; datas de criação/atualização; relações e constraints apropriadas. Nomes ilustrativos em inglês para facilitar implementação. Adaptar à convenção da ferramenta.

| Entidade | Campos ou relações essenciais |
|---|---|
| `users` | id, e-mail único, identidade do provedor, papel, estado |
| `client_profiles` | user_id único, nome, telefone, nascimento opcional, preferências |
| `client_safety` | client_id, estado de alergia, detalhes mínimos, acesso restrito, updated_at |
| `privacy_consents` | user_id, finalidade, versão, aceite/retirada, data |
| `addresses` | client_id, CEP, endereço, cidade, UF, complemento |
| `professionals` | user_id, nome, especialidades, estado |
| `services` | nome, slug, preço_centavos, duração_min, intervalos, categoria, estado |
| `professional_services` | professional_id, service_id (par único) |
| `working_hours` | professional_id, dia da semana, início, fim |
| `schedule_blocks` | professional_id, início, fim, motivo administrativo |
| `bookings` | client_id, professional_id, service_id, início/fim, status, preço e duração congelados |
| `booking_product_preferences` | booking_id, product_id, observações |
| `booking_events` | booking_id, tipo, valores anteriores/novos necessários, autor e data |
| `reschedule_offers` | booking_id, horário original/proposto, profissional, estado, expiração, aprovações |
| `appointments` | booking_id único, início real, fim real, profissional, resumo, notas compartilháveis, status |
| `appointment_private_notes` | appointment_id, autor, texto protegido |
| `appointment_products` | appointment_id, product_id opcional, nome/descrição preservados, quantidade/unidade |
| `appointment_recommendations` | appointment_id, product_id, motivo, revisão profissional |
| `care_templates` | service_id, versão, conteúdo, autor/revisor, estado |
| `appointment_care` | appointment_id, template/version opcional, conteúdo revisado congelado, profissional, data |
| `appointment_media` | appointment_id, arquivo privado, tipo, autorização e visibilidade |
| `product_categories` | nome, slug, estado |
| `products` | SKU único, slug, categoria, nome, preço, descrição, imagens, ingredientes disponíveis, estado |
| `service_products` | service_id, product_id, finalidade de compatibilidade |
| `inventory` | product_id, quantidade física, reservada, limite de alerta |
| `inventory_movements` | produto, tipo, quantidade, unidade, referência, autor, data |
| `carts` / `cart_items` | client_id, product_id, quantidade; item único por carrinho/produto |
| `orders` | client_id, código, estado operacional/financeiro, modalidade, subtotal, taxa, total, endereço e cotação congelados |
| `order_items` | order_id, product_id, quantidade, preço e nome congelados, origem opcional |
| `order_events` | order_id, transição, autor, data, motivo |
| `delivery_settings` | tarifa_centavos_km, cobertura, taxa base/mínima, modo de cálculo |
| `notifications` | user_id, tipo, referência, data, lida_em, deduplicação |
| `reviews` | appointment_id único, client_id, nota, comentário, moderação |
| `business_settings` | dados do salão, fuso, parâmetros de reserva, políticas e configurações |
| `audit_logs` | autor, ação, entidade, id, data e contexto minimizado |

A linha do tempo é uma consulta/visão sobre `appointments` concluídos com produtos, recomendações e manual; não criar tabela de histórico duplicada. Preferências, produtos utilizados e recomendações são relações distintas. A exclusão ou desativação de produto não deve impedir leitura de seu nome no atendimento/pedido histórico. Estoque deve permanecer não negativo, com reserva menor ou igual ao saldo físico, salvo modelo específico de inventário devidamente documentado.

### 17.3. Interfaces de API ou ações de backend sugeridas

| Domínio | Operações |
|---|---|
| Auth | cadastrar cliente, autenticar, recuperar senha, atualizar perfil, sair |
| Catálogo | listar serviços/profissionais/produtos ativos; gestão autorizada |
| Agenda | consultar disponibilidade por serviço/profissional/data; criar e cancelar reserva; consultar próprias reservas |
| Flow | gerar/listar sugestões; oferecer; aceitar/recusar; invalidar/expirar |
| Atendimento | iniciar; registrar itens usados; revisar manual; concluir; consultar próprio histórico |
| Loja | carrinho; cotação de entrega; criar pedido idempotente; consultar pedidos próprios |
| Gestão | configurar disponibilidade; catálogo; estoque; pedidos; manuais; métricas |
| Notificações | consultar próprias, marcar lida |

Validar propriedade, papel, estado atual e transições em cada operação. Não confiar em IDs ou preços enviados pelo cliente. Retornar erros claros de validação, conflito, não autorizado e indisponibilidade; não expor stack traces ou dados de terceiros.

## 18. Segurança, privacidade e consistência

- Utilizar autenticação confiável e hash adequado quando o aplicativo gerenciar senhas. Sessões seguras, proteção contra tentativas abusivas, CSRF quando aplicável, cookies seguros quando utilizados, recuperação de senha com token de expiração e uso único.
- Autorizar todas as operações no servidor/banco. Cliente A nunca pode acessar perfil, alergias, atendimento, fotos, pedido ou endereço de Cliente B, nem alterando IDs ou URLs. Profissional deve ter acesso limitado aos atendimentos autorizados. Testar privilégios de gestor e profissional separadamente se forem perfis distintos.
- Tratar alergias e sensibilidades como dados sensíveis: minimização, segregação, criptografia/proteção adequada, acesso registrado, finalidade explícita, revisão da base legal, política de retenção, correção e exclusão. Não incluir detalhes de saúde em logs, analytics, URL, e-mail promocional ou dados fictícios baseados em pessoas reais.
- Fotografias privadas com controle de acesso e URLs temporárias quando aplicável. Autorizações distintas para armazenamento no histórico e publicação em galeria. Validar tipo/tamanho de arquivo e evitar exposição por URLs públicas previsíveis.
- Usar validação de entrada, consultas parametrizadas, proteção contra XSS, limites de upload, erros sem segredos e dependências atualizadas.
- Registrar mudanças críticas de agenda, status de pedido, estoque, permissões e correções, sem copiar dados sensíveis no log.
- Reservas e pedidos concorrentes: transações, locks ou constraints que impeçam duplicidade e saldo inconsistente. Idempotência nas operações sujeitas a repetição.
- Definir procedimento de backup/restauração, migrations e rollback antes de produção. Ambiente de teste separado do ambiente real.
- Não afirmar conformidade integral com LGPD sem validação jurídica e operacional. Não diagnosticar alergias nem garantir compatibilidade médica de produtos.

## 19. Requisitos não funcionais

- Layout responsivo de celular a desktop, sem overflow horizontal nas áreas principais.
- Carregamento progressivo, imagens otimizadas, paginação e consultas eficientes. Evitar recarregar toda a aplicação a cada interação.
- Feedback imediato e consistente; desabilitar ações repetidas enquanto pendentes sem impedir recuperação de falhas.
- Acessibilidade: teclado, foco, rótulos, semântica, contraste, leitores de tela, mensagens de erro associadas aos campos e movimento reduzido.
- Formatação brasileira de valores em reais, datas e horários; textos consistentes em pt-BR.
- Código modular e tipado quando a stack permitir; documentação clara de setup; testes das regras de negócio mais críticas.
- Em protótipo de design, representar variantes de estados, sem alegar execução real das regras.

## 20. Plano de implementação por etapas

A IA deve respeitar a ordem de dependências. Ao terminar cada etapa, executar verificações disponíveis, registrar resultados e corrigir problemas críticos antes de prosseguir. Não marcar como testado aquilo que não conseguiu executar. Se a plataforma tiver limite técnico, documentar exatamente qual funcionalidade permanece simulada ou não implementada.

| Etapa | Entregas | Verificação antes de avançar |
|---|---|---|
| 1 — Fundação | Estrutura independente, design system, rotas, layout público e privado, modelo inicial do banco | Build, navegação, responsividade, tokens e ambientes |
| 2 — Identidade e catálogo | Login/cadastro, perfis, segurança, landing, profissionais, serviços, produtos | Autorização, formulários, CRUD, visibilidade de itens ativos |
| 3 — Agenda | Disponibilidade, reserva, painel, cancelamento, bloqueios e estados | Conflitos, duração, fuso, concorrência e propriedade |
| 4 — Atendimento e Journey/Care | Início/conclusão, registro de produtos, manual revisado e linha do tempo | Registro único, dados corretos, histórico privado e preservação de versões |
| 5 — Flow | Sugestões por cancelamento, aprovação, recusa, expiração e troca atômica | Janela compatível, aceite, conflitos simultâneos e preservação da reserva original |
| 6 — Store | Catálogo detalhado, carrinho, estoque, checkout, pedidos, entrega simulada e painel | Preços, estoque, estados, retirada, entrega por km e idempotência |
| 7 — Integração e acabamento | Notificações internas, dashboard, UX, conteúdo, estados vazios, testes de ponta a ponta | Jornada completa cliente/gestor, segurança e regressões |
| 8 — Entrega | README, configuração, dados demo, instruções de execução, checklist e pendências | Instalação reproduzível, build/testes, revisão final e relatório de escopo |

Não publicar em produção sem autorização. Uma prévia de desenvolvimento pode ser disponibilizada se o usuário solicitar, com dados fictícios e ambiente isolado.

## 21. Cenários obrigatórios de QA e critérios de aceite

| ID | Cenário | Resultado esperado |
|---|---|---|
| QA-01 | Acessar landing em desktop e celular | Conteúdo legível, navegação funcional e CTA de agendamento/loja |
| QA-02 | Cadastrar cliente e entrar | Conta criada como cliente; perfil acessível e validação de campos |
| QA-03 | Tentar criar conta de gestor pelo cadastro público | Elevação de privilégio impedida |
| QA-04 | Cliente A tenta consultar dados de cliente B | Acesso negado no servidor/banco |
| QA-05 | Cadastrar serviço de 45 min e profissional habilitado | Serviço aparece no fluxo de agendamento correto |
| QA-06 | Reservar horário livre | Reserva criada uma única vez e aparece nos dois painéis |
| QA-07 | Duas requisições reservam o mesmo horário | Apenas a reserva compatível/primeira confirmada é aceita; sem sobreposição |
| QA-08 | Bloquear horário ou desativar profissional | Novas reservas incompatíveis impedidas |
| QA-09 | Escolher produto opcional durante agendamento | Preferência registrada sem compra nem confirmação de uso |
| QA-10 | Cancelar reserva de 60 min com candidatos de 45 e 90 min | Candidato de 45 min elegível se cumprir demais regras; 90 min excluído |
| QA-11 | Recusar ou deixar expirar oferta de realocação | Reserva original preservada |
| QA-12 | Aceitar oferta após outra pessoa ocupar horário | Troca bloqueada; reserva original preservada |
| QA-13 | Aceitar oferta válida | Novo horário confirmado atomicamente; histórico e notificação atualizados |
| QA-14 | Concluir atendimento com produtos diferentes dos preferidos | Histórico mostra produtos realmente usados e separa preferências/recomendações |
| QA-15 | Concluir duas vezes por clique/retry | Um único atendimento e manual vinculado |
| QA-16 | Editar modelo de manual depois da conclusão | Atendimento anterior mantém versão registrada |
| QA-17 | Abrir Journey como cliente | Apenas procedimentos próprios concluídos; sem notas internas |
| QA-18 | Comprar produto utilizado via timeline | Página/carrinho correto; adição voluntária |
| QA-19 | Tentar comprar item inativo ou quantidade acima do estoque | Operação rejeitada e mensagem clara |
| QA-20 | Alterar preço no frontend ou mudar preço no catálogo durante checkout | Servidor recalcula; informa mudanças antes de confirmar |
| QA-21 | Finalizar compra com retirada | Taxa zero; pedido registrado e estoque reservado |
| QA-22 | Finalizar entrega de 4 km a R$ 2,50/km em cenário demo | Taxa R$ 10,00 sem mínimos/base; estimativa identificada; total correto |
| QA-23 | Endereço fora da cobertura | Entrega bloqueada e retirada oferecida |
| QA-24 | Dois clientes tentam comprar última unidade | Uma única reserva de estoque válida |
| QA-25 | Cancelar pedido antes de expedir | Estoque reservado liberado uma única vez |
| QA-26 | Expedir pedido e repetir ação | Estoque baixado apenas uma vez; status válido |
| QA-27 | Pedido de retirada tenta estado saiu para entrega | Transição incompatível bloqueada |
| QA-28 | Consultar dashboard com pedidos simulados | Simulações identificadas e não tratadas como receita real |
| QA-29 | Falha de rede ou sessão expirada | Feedback, recuperação segura e nenhuma confirmação falsa |
| QA-30 | Navegação com teclado, celular e estados vazios | Ações acessíveis, legíveis e sem quebra de layout |

Registrar cada teste como aprovado, reprovado ou não executado, com evidência, ambiente e motivo. Prototipagem visual pode validar navegação e compreensão; não substitui testes de backend, concorrência ou autorização.

## 22. Roteiro de demonstração ponta a ponta

Usar dados fictícios criados para demonstração, identificados como tais. Serviços, preços, profissionais e itens não são catálogo oficial.

**Demonstração 1 — Jornada completa:** acessar landing → cadastrar cliente fictício → escolher serviço e preferência opcional → agendar → entrar no painel profissional → iniciar atendimento → registrar produtos realmente usados → revisar manual → concluir → entrar como cliente → abrir Journey → consultar Care → escolher produto relacionado → adicionar ao carrinho → optar por retirada ou entrega → confirmar pedido demonstrativo → acompanhar status → atualizar pedido no painel e conferir estoque.

**Demonstração 2 — NORDEN Flow:** configurar janela de 60 minutos e reservas futuras elegíveis de 45 e 90 minutos → cancelar a reserva que ocupava a janela → verificar sugestões compatíveis → gestor oferece → cliente aceita → confirmar troca → validar que horário anterior foi liberado e não houve conflito. Repetir com recusa e com ocupação concorrente da janela.

**Demonstração 3 — Segurança:** entrar com dois clientes diferentes e tentar acessar URLs/IDs alheios; provar que a autorização não depende apenas da navegação. Verificar que alertas sensíveis e notas internas não aparecem em áreas indevidas.

## 23. Orientações específicas por ferramenta

### Figma / FigJam / Figma Make

Priorizar experiência e prototipagem. Criar estrutura de páginas para: design system, site público, cliente, profissional/gestor, loja e fluxos críticos. Criar componentes, variantes, tokens, Auto Layout e layouts desktop/mobile. Conectar telas em protótipo navegável, incluindo cenários de erro, vazios, confirmação e sucesso. Anotar validações de backend, estados e permissões. Se usar Figma Make com capacidade de gerar código, aplicar os requisitos de implementação pertinentes e indicar o que é apenas simulação. Não entregar somente um conjunto de imagens sem fluxos.

### Gemini

Usar este arquivo como briefing mestre; gerar arquitetura, estrutura de arquivos e implementação compatível com o ambiente de código disponível. Caso o ambiente só permita gerar código ou protótipos locais, fornecer instruções de execução e separar claramente as integrações simuladas. Revisar regras, testes e consistência antes de avançar. Não substituir o projeto por apresentação ou resumo.

### Antigravity

Criar workspace/repositório independente. Planejar tarefas por etapa e implementar código, migrations, testes e documentação. Executar build/lint/testes e verificar a navegação local quando os recursos estiverem disponíveis. Evitar alterações fora do projeto, segredos em arquivos e publicação automática. Registrar resultados e bloqueios, incluindo serviços que dependem de configuração externa.

### Lovable

Construir uma aplicação full-stack com telas e fluxos integrados, usando backend/autenticação/banco disponíveis na plataforma. Quando houver banco acessado pelo cliente, configurar políticas de autorização por registro e funções/ações transacionais para operações críticas. Criar um ambiente demonstrativo com dados fictícios e sem cobranças reais. Verificar todas as rotas, CRUD, agenda, linha do tempo, loja, carrinho, estoque e checkout; não deixar botões que apenas simulam sucesso sem explicar a limitação. Manter design responsivo e consistente.

Em qualquer ferramenta, se um recurso não puder ser implementado, representar a experiência apenas quando necessário, identificar o limite e fornecer um plano concreto de implementação. Não prometer recursos que a ferramenta não oferece.

## 24. Entregáveis finais e definição de pronto

Para implementação funcional:

- Código-fonte completo organizado, sem dependência do Aurora Studio.
- README com pré-requisitos, setup, variáveis de ambiente, migrations, seed demo, comandos de desenvolvimento, testes e build.
- Modelo de banco e migrations versionadas; contas de demonstração segregadas de produção e sem credenciais públicas permanentes.
- Aplicação com site público, área cliente, área profissional/gestor, Journey, Care, Flow, Store e pedidos.
- Catálogos e configurações editáveis; checkout demonstrativo ou presencial conforme configuração, com entrega por distância estimada identificada.
- Testes e relatório de QA; lista de funcionalidades implementadas, simuladas e pendentes.
- Registro das decisões técnicas tomadas, limitações e integrações externas que exigem autorização/configuração.

Para entrega de design: design system, telas desktop/mobile, protótipos dos fluxos críticos, variantes de estados, especificações e documentação para handoff.

O MVP só deve ser considerado funcional quando os fluxos essenciais puderem ser executados de ponta a ponta, os dados persistirem quando apropriado e as verificações críticas de autorização, agenda e estoque tiverem sido executadas com sucesso. Se a entrega for apenas um protótipo, classificá-la explicitamente como tal.

## 25. Decisões abertas e itens fora do escopo imediato

| Decisão | Tratamento inicial sugerido |
|---|---|
| Logo e paleta definitiva | Wordmark temporário; Azul Urbano provisório e tokens substituíveis |
| Catálogo de serviços e produtos | Exemplos fictícios editáveis; validar com a equipe |
| Quantidade de profissionais | Suportar um ou mais no modelo; testar pelo menos dois em demo |
| Dados obrigatórios e retenção | Minimização e segurança; confirmar antes de uso real |
| Cancelamentos, faltas e intervalos | Parâmetros editáveis; sem multas reais por padrão |
| Regras de estoque de consumo interno | Registro de uso; baixa apenas com regra/unidade definida |
| Taxa de entrega e cobertura | Parâmetros demonstrativos; sem tarifa oficial inventada |
| Gateway, mapas e envio externo | Integração futura ou adaptador opcional; não fingir funcionamento |
| IA generativa | Futuro, com revisão profissional; Flow usa lógica determinística |
| Fidelidade, marketplace e múltiplas unidades | Fora do MVP atual; não expandir sem aprovação |

## 26. Validação com usuários

A CSD e as personas são hipóteses. Testar com potenciais clientes homens e profissionais/gestores; observar execução de tarefas de cadastro, agendamento, conclusão, consulta ao histórico, reagendamento e compra. Registrar dificuldades, tempo de tarefa e compreensão, sem inventar métricas ou alegar que resultados comerciais já foram alcançados. Revisar requisitos com base em evidências antes de expandir o projeto.

---

## Comando final para a IA executora

> Construa o NORDEN do zero utilizando esta especificação como contrato funcional. Entregue uma experiência premium, masculina, moderna e responsiva. Não omita a landing page, cadastro/login, agenda inteligente, painel profissional, linha do tempo, manuais, produtos realmente utilizados, loja integrada, estoque, carrinho, pedidos e modalidades de retirada e entrega. Implemente por etapas, verifique cada etapa antes de avançar e não confunda simulação com integração real. Preserve segurança, consistência dos dados e clareza para os usuários. Ao final, apresente o que foi construído, os testes realizados e as limitações, com instruções para continuidade. Não modifique projetos existentes nem publique em produção sem autorização.

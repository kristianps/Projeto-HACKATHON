# NORDEN — Salão Inteligente Masculino (protótipo front-end)

Protótipo navegável do NORDEN, construído com HTML, CSS e JavaScript puros (sem dependências).
Baseado em `NORDEN_Especificacao_Completa_IA.md`, `NORDEN_Personas_Masculinas.md`, na Matriz CSD e na **Paleta 1 — Grafite Premium**.

> **Demonstração:** não há servidor. Os dados são fictícios e ficam salvos **apenas no navegador** (localStorage).
> Não há autenticação real, pagamento, envio de mensagens nem integração com mapas.

## Como abrir

Abra `index.html` no navegador (duplo clique). Para entrar, use **Entrar** → *Acesso rápido de demonstração*:

| Perfil | Persona | O que acessa |
|---|---|---|
| Cliente · Lucas M. | Lucas (cliente) | Minha conta: agendamentos, ofertas, jornada, cuidados, pedidos, perfil |
| Gestão · Rafael A. | Rafael (profissional/gestor) | Gestão: painel, agenda, NORDEN Flow, estoque, pedidos, manuais |

Para voltar ao estado inicial: rodapé → **Redefinir dados de demonstração**.

## Navegação (menus suspensos)

O cabeçalho é o mesmo em todas as páginas e agrupa o conteúdo em menus:

- **O Salão** → Serviços, Profissionais, Como funciona, Contato e dúvidas
- **Loja** → Todos os produtos, Cabelo, Barba, Pele, Carrinho
- **Minha conta** (cliente) → Início, Agendamentos, Ofertas, Jornada, Pedidos, Notificações, Perfil, Sair
- **Gestão** (gestor) → Painel, Agenda, NORDEN Flow, Estoque, Pedidos, Manuais, Notificações, Sair

No celular, o menu vira um painel com grupos expansíveis. Nas áreas logadas há menu lateral (desktop) e seletor de seção (celular).

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Landing: hero, pilares, atalhos, como funciona, diferenciais, privacidade |
| `servicos.html` / `profissionais.html` | Catálogo com preço, duração e link para agendar |
| `loja.html` / `carrinho.html` | Catálogo com estoque, carrinho, retirada ou entrega com taxa por km |
| `contato.html` | FAQ, endereço e horários (a definir) |
| `login.html` / `cadastro.html` | Login, recuperar senha, cadastro em 2 etapas com alergias e consentimento |
| `agendar.html` | Serviço → profissional → produtos (opcional) → data/horário → revisão |
| `cliente.html` | Área do cliente (seções por `#hash`) |
| `gestao.html` | Área de gestão (seções por `#hash`) |

## Estrutura de código

```
css/style.css    tokens da paleta + landing
css/app.css      menus suspensos, áreas logadas, loja, tabelas, modais
css/auth.css     login e cadastro
css/agendar.css  fluxo de agendamento
js/core.js       catálogo, regras, "banco" de demonstração, sessão, cabeçalho/rodapé
js/ui.js         modal acessível e roteador por hash
js/agendar.js    agendamento        js/loja.js     loja e checkout
js/cliente.js    área do cliente    js/gestao.js   área de gestão
js/auth.js       validações de login/cadastro
js/publico.js    serviços e profissionais
js/script.js     animações da landing
```

Para trocar a paleta, edite as variáveis no topo de `css/style.css`.

Logo: `img/logo-norden.jpg` (original) e `img/simbolo-norden.svg` (símbolo vetorial usado no site, embutido em `js/core.js`).

Arquivo para compartilhar: rode `python gerar_arquivo_unico.py` para gerar `NORDEN_compartilhar.html` (site inteiro em um arquivo).

## Fluxos de ponta a ponta para demonstrar

1. **Cliente agenda:** Agendar → escolher serviço/horário → entrar como cliente → confirmar. A reserva aparece em *Meus agendamentos* e na *Agenda* da gestão.
2. **NORDEN Flow:** Gestão → Agenda → cancelar um atendimento anterior ao do Lucas → NORDEN Flow → *Enviar oferta* ao cliente demo → entrar como cliente → *Ofertas de horário* → Aceitar. A reserva é antecipada sem conflito.
3. **Atendimento:** Gestão → Agenda → atendimento do Lucas → Iniciar → Concluir (produtos usados + manual revisado). O estoque é reduzido e o manual aparece em *Minha jornada*.
4. **Loja:** adicionar produto → carrinho → entrega (distância em km) → confirmar. A gestão avança o status e o cliente acompanha em *Meus pedidos*.

## Regras implementadas (resumo)

- Disponibilidade por duração, jornada, almoço e reservas existentes; intervalos `[início, fim)`; sem horários passados.
- Preço, duração e nome congelados na reserva; remarcação registra histórico.
- Cancelamento/remarcação pelo cliente até 2 h antes (parâmetro em `CONFIG`).
- NORDEN Flow: só antecipação, profissional habilitado, cabe na janela, sem conflito; ranking explícito com motivo; oferta não altera a reserva até o aceite; revalidação no aceite; ofertas concorrentes expiram.
- Estoque revalidado ao concluir atendimento e ao fechar pedido; cancelamento devolve unidades.
- Alergias: opções Sim / Não / Não sei / Prefiro informar; detalhe só com "Sim" e consentimento; alerta visível apenas no atendimento.

## Limitações e próximos passos

- Substituir o localStorage por backend com autenticação, autorização no servidor e transações.
- Calcular a distância de entrega por um serviço de mapas; integrar pagamento.
- Definir base legal, retenção e proteção de dados sensíveis antes de qualquer uso real.
- Validar as hipóteses das personas com 3 a 5 clientes e 2 a 3 profissionais.

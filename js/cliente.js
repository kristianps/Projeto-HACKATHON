/* =========================================================
   NORDEN — Área do cliente (persona Lucas)
   Início, agendamentos, ofertas do NORDEN Flow, jornada,
   manual de cuidados, pedidos, notificações e perfil.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (!N.exigir('cliente')) return;

  const { PRODUTOS, CONFIG, STATUS_PEDIDO, moeda, hora, duracaoTexto, dataLonga, dataCurta, paraData, hojeIso, esc } = N;
  const db = N.db();
  const area = document.getElementById('secao');
  const ID = N.CLIENTE_DEMO.id;

  // ========================= CONSULTAS =========================
  const minhas = () => db.reservas.filter(r => r.clienteId === ID);
  const ehFutura = r => r.data > hojeIso() || (r.data === hojeIso() && r.inicio + r.duracao > N.agoraMin());
  const proximas = () => minhas().filter(r => N.ATIVAS.includes(r.status) && ehFutura(r)).sort(ordem);
  const anteriores = () => minhas().filter(r => !(N.ATIVAS.includes(r.status) && ehFutura(r))).sort(ordem).reverse();
  const concluidas = () => minhas().filter(r => r.status === 'CONCLUIDO').sort(ordem).reverse();
  const ofertasPendentes = () => db.ofertas.filter(o => o.clienteId === ID && o.status === 'PENDENTE');
  const meusPedidos = () => db.pedidos.filter(p => p.clienteId === ID);
  const minhasNotificacoes = () => db.notificacoes.filter(n => n.para === 'cliente');
  function ordem(a, b) { return a.data.localeCompare(b.data) || a.inicio - b.inicio; }

  const minutosAte = r => (paraData(r.data) - paraData(hojeIso())) / 6e4 + r.inicio - N.agoraMin();
  const podeAlterar = r => minutosAte(r) >= CONFIG.cancelamentoHoras * 60;

  // Expira ofertas cuja janela já passou
  db.ofertas.forEach(o => {
    if (o.status === 'PENDENTE' && (o.novaData < hojeIso() || (o.novaData === hojeIso() && o.novoInicio <= N.agoraMin()))) o.status = 'EXPIRADA';
  });

  // ======================== COMPONENTES ========================
  function itemReserva(r, acoes = true) {
    const d = paraData(r.data);
    const alteravel = N.ATIVAS.includes(r.status) && r.status !== 'EM_ATENDIMENTO' && ehFutura(r);
    return `
      <li class="item-linha">
        <div class="item-data"><small>${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><strong>${d.getDate()}</strong></div>
        <div>
          <h3>${esc(r.servicoNome)} ${N.selo(r.status)}</h3>
          <p>${hora(r.inicio)} – ${hora(r.inicio + r.duracao)} · ${esc(N.profissional(r.profId).nome)} · ${moeda(r.preco)} · ${r.codigo}</p>
        </div>
        <div class="item-acoes">
          ${acoes && alteravel ? (podeAlterar(r)
            ? `<button type="button" class="btn btn-contorno-escuro btn-pequeno" data-remarcar="${r.id}">Remarcar</button>
               <button type="button" class="btn btn-perigo btn-pequeno" data-cancelar="${r.id}">Cancelar</button>`
            : `<small class="texto-suave">Alterações só até ${CONFIG.cancelamentoHoras}h antes</small>`) : ''}
          ${r.status === 'CONCLUIDO' ? `<a href="#cuidados/${r.id}" class="btn btn-escuro btn-pequeno">Ver cuidados</a>` : ''}
        </div>
      </li>`;
  }

  function ligarAcoesReserva() {
    area.querySelectorAll('[data-cancelar]').forEach(b => b.addEventListener('click', () => cancelar(b.dataset.cancelar)));
    area.querySelectorAll('[data-remarcar]').forEach(b => b.addEventListener('click', () => remarcar(b.dataset.remarcar)));
  }

  // ========================== AÇÕES ==========================
  function cancelar(id) {
    const r = db.reservas.find(x => x.id === id);
    N.confirmar('Cancelar agendamento', `Cancelar <strong>${esc(r.servicoNome)}</strong> em ${dataLonga(r.data)} às ${hora(r.inicio)}? O horário será liberado para outros clientes.`, 'Cancelar agendamento', () => {
      if (!podeAlterar(r)) { N.toast('O prazo para cancelamento já passou.'); return; }
      r.status = 'CANCELADO';
      r.historico.push({ em: new Date().toISOString(), texto: 'Cancelado pelo cliente' });
      // Ofertas que dependiam desta reserva deixam de valer
      db.ofertas.filter(o => o.reservaId === id && o.status === 'PENDENTE').forEach(o => { o.status = 'EXPIRADA'; });
      N.notificar('gestor', `Cancelamento: ${r.servicoNome} com ${N.profissional(r.profId).nome}, ${dataCurta(r.data)} às ${hora(r.inicio)}. Veja sugestões de encaixe no NORDEN Flow.`, 'gestao.html#flow');
      N.salvar();
      N.toast('Agendamento cancelado.');
      roteador.navegar();
    });
  }

  function remarcar(id) {
    const r = db.reservas.find(x => x.id === id);
    const dias = [];
    for (let i = 0; i < CONFIG.diasExibidos; i++) {
      const iso = N.somarDias(hojeIso(), i);
      const livres = N.horariosLivres(r.profId, iso, r.duracao, r.id);
      if (livres.length) dias.push({ iso, livres });
    }
    if (!dias.length) { N.toast('Não há horários livres com este profissional nos próximos dias.'); return; }

    N.modal({
      titulo: 'Remarcar agendamento',
      corpo: `
        <p class="texto-suave">${esc(r.servicoNome)} com ${esc(N.profissional(r.profId).nome)} · ${duracaoTexto(r.duracao)}. Preço mantido: ${moeda(r.preco)}.</p>
        <div class="campo"><label for="rm-data">Nova data</label>
          <select id="rm-data">${dias.map(d => `<option value="${d.iso}">${dataLonga(d.iso)} (${d.livres.length} horários)</option>`).join('')}</select></div>
        <div class="campo"><label for="rm-hora">Novo horário</label><select id="rm-hora"></select></div>`,
      aoAbrir: dlg => {
        const sData = dlg.querySelector('#rm-data');
        const sHora = dlg.querySelector('#rm-hora');
        const preencher = () => {
          sHora.innerHTML = dias.find(d => d.iso === sData.value).livres.map(h => `<option value="${h}">${hora(h)} – ${hora(h + r.duracao)}</option>`).join('');
        };
        sData.addEventListener('change', preencher);
        preencher();
      },
      acoes: [
        { texto: 'Voltar', classe: 'btn-contorno-escuro' },
        { texto: 'Confirmar remarcação', aoClicar: (fechar, dlg) => {
          const novaData = dlg.querySelector('#rm-data').value;
          const novoInicio = Number(dlg.querySelector('#rm-hora').value);
          if (!N.livre(r.profId, novaData, novoInicio, r.duracao, r.id)) { N.toast('Horário indisponível. Escolha outro.'); return; }
          const antes = `${dataCurta(r.data)} ${hora(r.inicio)}`;
          r.data = novaData; r.inicio = novoInicio;
          r.historico.push({ em: new Date().toISOString(), texto: `Remarcado de ${antes} para ${dataCurta(novaData)} ${hora(novoInicio)}` });
          N.notificar('gestor', `Remarcação: ${r.servicoNome} (${r.codigo}) agora em ${dataCurta(novaData)} às ${hora(novoInicio)}.`, 'gestao.html#agenda');
          N.salvar();
          fechar();
          N.toast('Agendamento remarcado.');
          roteador.navegar();
        } }
      ]
    });
  }

  function responderOferta(id, aceitar) {
    const o = db.ofertas.find(x => x.id === id);
    const r = db.reservas.find(x => x.id === o.reservaId);
    if (!aceitar) {
      o.status = 'RECUSADA';
      N.notificar('gestor', `Oferta de antecipação recusada (${r.codigo}).`, 'gestao.html#flow');
      N.salvar();
      N.toast('Oferta recusada. Sua reserva original foi mantida.');
      return roteador.navegar();
    }
    // Revalida: a janela precisa continuar livre (concorrência)
    if (!N.livre(o.profId, o.novaData, o.novoInicio, r.duracao, r.id) || !N.ATIVAS.includes(r.status)) {
      o.status = 'EXPIRADA';
      N.salvar();
      N.toast('Este horário não está mais disponível. Sua reserva original foi mantida.');
      return roteador.navegar();
    }
    const antes = `${dataCurta(r.data)} ${hora(r.inicio)}`;
    r.data = o.novaData; r.inicio = o.novoInicio; r.profId = o.profId;
    r.historico.push({ em: new Date().toISOString(), texto: `Antecipado pelo NORDEN Flow de ${antes} para ${dataCurta(o.novaData)} ${hora(o.novoInicio)}` });
    o.status = 'ACEITA';
    // Outras ofertas para a mesma janela deixam de valer
    db.ofertas.filter(x => x.janelaId === o.janelaId && x.id !== o.id && x.status === 'PENDENTE').forEach(x => { x.status = 'EXPIRADA'; });
    N.notificar('gestor', `Oferta aceita: ${r.servicoNome} (${r.codigo}) antecipado para ${dataCurta(o.novaData)} às ${hora(o.novoInicio)}.`, 'gestao.html#agenda');
    N.salvar();
    N.toast('Horário antecipado com sucesso.');
    roteador.navegar();
  }

  // ========================== SEÇÕES ==========================
  const secoes = [
    { id: 'inicio', titulo: 'Início', render: inicio },
    { id: 'agendamentos', titulo: 'Meus agendamentos', render: agendamentos },
    { id: 'ofertas', titulo: 'Ofertas de horário', render: ofertas, contador: () => ofertasPendentes().length },
    { id: 'jornada', titulo: 'Minha jornada', render: jornada },
    { id: 'cuidados', titulo: 'Manual de cuidados', render: cuidados, oculta: true, pai: 'jornada' },
    { id: 'pedidos', titulo: 'Meus pedidos', render: pedidos },
    { id: 'notificacoes', titulo: 'Notificações', render: notificacoes, contador: () => N.naoLidas('cliente') },
    { id: 'perfil', titulo: 'Perfil e privacidade', render: perfil }
  ];

  function cabeca(titulo, sub) {
    return `<header><h1 class="app-titulo">${titulo}</h1>${sub ? `<p class="app-subtitulo">${sub}</p>` : ''}</header>`;
  }

  function inicio() {
    const prox = proximas()[0];
    const ultima = concluidas()[0];
    const ofs = ofertasPendentes();
    const pedidoAberto = meusPedidos().find(p => !['CONCLUIDO', 'CANCELADO'].includes(p.status));
    area.innerHTML = `
      ${cabeca(`Olá, ${esc(db.perfil.nome.split(' ')[0])}.`, 'Tudo da sua conta NORDEN em um só lugar.')}
      ${ofs.length ? `<div class="aviso-caixa"><strong>NORDEN Flow:</strong> você tem ${ofs.length} oferta${ofs.length > 1 ? 's' : ''} para antecipar seu horário. <a href="#ofertas" class="link-acao">Ver ofertas</a></div>` : ''}
      <div class="grade-2">
        <div class="cartao">
          <div class="cartao-cabeca"><h2>Próximo atendimento</h2><a href="#agendamentos">Todos</a></div>
          ${prox ? `<ul class="lista-itens">${itemReserva(prox)}</ul>` : `<div class="estado-vazio"><p>Você não tem horários marcados.</p><a href="agendar.html" class="btn btn-escuro">Agendar</a></div>`}
        </div>
        <div class="cartao">
          <div class="cartao-cabeca"><h2>Último atendimento</h2><a href="#jornada">Jornada</a></div>
          ${ultima ? `
            <p><strong>${esc(ultima.servicoNome)}</strong> · ${dataLonga(ultima.data)}</p>
            <div class="chips">${ultima.produtosUsados.map(p => `<span class="chip">${esc(PRODUTOS[p.id].nome)}</span>`).join('') || '<span class="texto-suave">Sem produtos registrados</span>'}</div>
            <div class="acoes-linha" style="margin-top:1rem">
              <a href="#cuidados/${ultima.id}" class="btn btn-escuro btn-pequeno">Manual de cuidados</a>
              <a href="agendar.html?servico=${ultima.servicoId}" class="btn btn-contorno-escuro btn-pequeno">Agendar de novo</a>
            </div>` : '<p class="texto-suave">Seus atendimentos concluídos aparecerão aqui.</p>'}
        </div>
      </div>
      <div class="grade-3">
        <a class="cartao" href="agendar.html" style="text-decoration:none"><h2>Agendar</h2><p class="texto-suave">Escolha serviço, profissional e horário.</p></a>
        <a class="cartao" href="loja.html" style="text-decoration:none"><h2>Loja</h2><p class="texto-suave">${pedidoAberto ? `Pedido ${pedidoAberto.codigo}: ${STATUS_PEDIDO[pedidoAberto.status]}` : 'Produtos usados nos seus atendimentos.'}</p></a>
        <a class="cartao" href="#perfil" style="text-decoration:none"><h2>Perfil</h2><p class="texto-suave">Preferências e alertas de segurança.</p></a>
      </div>`;
    ligarAcoesReserva();
  }

  function agendamentos() {
    const prox = proximas();
    const ant = anteriores();
    area.innerHTML = `
      ${cabeca('Meus agendamentos', `Cancelamento e remarcação sem custo até ${CONFIG.cancelamentoHoras} horas antes.`)}
      <div class="acoes-linha"><a href="agendar.html" class="btn btn-escuro btn-pequeno">Novo agendamento</a></div>
      <h2 style="font-size:1.1rem">Próximos</h2>
      ${prox.length ? `<ul class="lista-itens">${prox.map(r => itemReserva(r)).join('')}</ul>` : '<div class="estado-vazio">Nenhum agendamento futuro.</div>'}
      <h2 style="font-size:1.1rem">Anteriores</h2>
      ${ant.length ? `<ul class="lista-itens">${ant.map(r => itemReserva(r, false)).join('')}</ul>` : '<div class="estado-vazio">Nenhum agendamento anterior.</div>'}`;
    ligarAcoesReserva();
  }

  function ofertas() {
    const ofs = ofertasPendentes();
    const hist = db.ofertas.filter(o => o.clienteId === ID && o.status !== 'PENDENTE');
    const linha = o => {
      const r = db.reservas.find(x => x.id === o.reservaId);
      return `
        <li class="item-linha">
          <div class="item-data"><small>${paraData(o.novaData).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><strong>${paraData(o.novaData).getDate()}</strong></div>
          <div>
            <h3>${esc(r.servicoNome)} ${o.status !== 'PENDENTE' ? N.selo(o.status, { ACEITA: 'Aceita', RECUSADA: 'Recusada', EXPIRADA: 'Expirada' }) : ''}</h3>
            <p>De <strong>${dataCurta(o.dataOriginal)} ${hora(o.inicioOriginal)}</strong>
               para <strong>${dataCurta(o.novaData)} ${hora(o.novoInicio)}</strong> · ${esc(N.profissional(o.profId).nome)}${o.profId !== r.profId && o.status === 'PENDENTE' ? ' (outro profissional)' : ''}</p>
            ${o.status === 'PENDENTE' ? '<p><small>Motivo: um horário mais cedo foi liberado por cancelamento. Válida até o início do novo horário; sem resposta, sua reserva original continua valendo.</small></p>' : ''}
          </div>
          <div class="item-acoes">${o.status === 'PENDENTE' ? `
            <button type="button" class="btn btn-contorno-escuro btn-pequeno" data-recusar="${o.id}">Manter original</button>
            <button type="button" class="btn btn-escuro btn-pequeno" data-aceitar="${o.id}">Aceitar</button>` : ''}
          </div>
        </li>`;
    };
    area.innerHTML = `
      ${cabeca('Ofertas de horário', 'Quando um horário mais cedo fica livre, o NORDEN Flow pode te oferecer uma antecipação. Nada muda sem o seu aceite.')}
      ${ofs.length ? `<ul class="lista-itens">${ofs.map(linha).join('')}</ul>` : '<div class="estado-vazio">Nenhuma oferta pendente no momento.</div>'}
      ${hist.length ? `<h2 style="font-size:1.1rem">Histórico</h2><ul class="lista-itens">${hist.map(linha).join('')}</ul>` : ''}`;
    area.querySelectorAll('[data-aceitar]').forEach(b => b.addEventListener('click', () => responderOferta(b.dataset.aceitar, true)));
    area.querySelectorAll('[data-recusar]').forEach(b => b.addEventListener('click', () => responderOferta(b.dataset.recusar, false)));
  }

  function jornada() {
    const lista = concluidas();
    area.innerHTML = `
      ${cabeca('Minha jornada', 'Cada atendimento, com os produtos efetivamente usados e o seu manual de cuidados.')}
      ${lista.length ? `<ol class="jornada-lista">${lista.map(r => `
        <li class="jornada-item cartao">
          <div class="cartao-cabeca"><h2>${esc(r.servicoNome)}</h2><span class="texto-suave">${dataLonga(r.data)}</span></div>
          <p class="texto-suave">${esc(N.profissional(r.profId).nome)} · ${duracaoTexto(r.duracao)} · ${moeda(r.preco)}</p>
          <div class="chips">${r.produtosUsados.length ? r.produtosUsados.map(p => `
            <span class="chip">${esc(PRODUTOS[p.id].nome)} <button type="button" class="link-acao" style="background:none;border:0;cursor:pointer;padding:0 0 0 .35rem" data-comprar="${p.id}" aria-label="Comprar ${esc(PRODUTOS[p.id].nome)}">Comprar</button></span>`).join('') : '<span class="texto-suave">Nenhum produto registrado.</span>'}</div>
          <div class="acoes-linha" style="margin-top:1rem;align-items:center;justify-content:space-between">
            <a href="#cuidados/${r.id}" class="btn btn-escuro btn-pequeno">Manual de cuidados</a>
            <div>
              <span class="texto-suave" id="rotulo-aval-${r.id}">${r.avaliacao ? 'Sua avaliação' : 'Avalie o atendimento'}</span>
              <span class="estrelas" role="group" aria-labelledby="rotulo-aval-${r.id}">${[1, 2, 3, 4, 5].map(n =>
                `<button type="button" data-avaliar="${r.id}" data-nota="${n}" class="${r.avaliacao && r.avaliacao.nota >= n ? 'ativa' : ''}" aria-label="${n} de 5" aria-pressed="${!!(r.avaliacao && r.avaliacao.nota === n)}">★</button>`).join('')}</span>
            </div>
          </div>
        </li>`).join('')}</ol>`
        : '<div class="estado-vazio"><p>Sua jornada começa no primeiro atendimento.</p><a href="agendar.html" class="btn btn-escuro">Agendar</a></div>'}`;
    area.querySelectorAll('[data-comprar]').forEach(b => b.addEventListener('click', () => N.adicionarAoCarrinho(b.dataset.comprar)));
    area.querySelectorAll('[data-avaliar]').forEach(b => b.addEventListener('click', () => {
      const r = db.reservas.find(x => x.id === b.dataset.avaliar);
      r.avaliacao = { nota: Number(b.dataset.nota), comentario: '' };
      N.salvar();
      N.toast('Obrigado pela avaliação!');
      jornada();
    }));
  }

  function cuidados(id) {
    const r = db.reservas.find(x => x.id === id && x.clienteId === ID);
    if (!r || !r.cuidados) {
      area.innerHTML = `${cabeca('Manual de cuidados')}<div class="estado-vazio">Manual não encontrado. <a href="#jornada">Voltar à jornada</a></div>`;
      return;
    }
    area.innerHTML = `
      <a href="#jornada" class="link-acao">← Voltar à jornada</a>
      ${cabeca(esc(r.cuidados.titulo), `${esc(r.servicoNome)} · ${dataLonga(r.data)} · ${esc(N.profissional(r.profId).nome)}`)}
      <article class="manual">
        <h2 style="font-size:1rem">Orientações revisadas pelo profissional</h2>
        <ol>${r.cuidados.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ol>
      </article>
      ${r.produtosUsados.length ? `
        <div class="cartao">
          <h2>Produtos usados neste atendimento</h2>
          <ul class="lista-itens" style="margin-top:1rem">${r.produtosUsados.map(p => `
            <li class="item-linha" style="grid-template-columns:1fr auto">
              <div><h3>${esc(PRODUTOS[p.id].nome)}</h3><p>${esc(PRODUTOS[p.id].desc)}</p></div>
              <div class="item-acoes"><strong>${moeda(PRODUTOS[p.id].preco)}</strong>
                <button type="button" class="btn btn-escuro btn-pequeno" data-comprar="${p.id}" ${(db.estoque[p.id] || 0) === 0 ? 'disabled' : ''}>${(db.estoque[p.id] || 0) === 0 ? 'Indisponível' : 'Adicionar'}</button></div>
            </li>`).join('')}</ul>
        </div>` : ''}
      <p class="texto-suave">Estas orientações não substituem avaliação médica. Em caso de reação, interrompa o uso e procure um profissional de saúde.</p>`;
    area.querySelectorAll('[data-comprar]').forEach(b => b.addEventListener('click', () => N.adicionarAoCarrinho(b.dataset.comprar)));
  }

  function pedidos() {
    const lista = meusPedidos();
    area.innerHTML = `
      ${cabeca('Meus pedidos', 'Compras da loja NORDEN.')}
      ${lista.length ? `<ul class="lista-itens">${lista.map(p => `
        <li class="item-linha" style="grid-template-columns:1fr auto">
          <div>
            <h3>${p.codigo} ${N.selo(p.status, STATUS_PEDIDO)}</h3>
            <p>${p.itens.map(i => `${i.qtd}× ${esc(PRODUTOS[i.id].nome)}`).join(', ')}</p>
            <p>${p.modalidade === 'entrega' ? `Entrega (${p.km} km) · taxa ${moeda(p.taxa)}` : 'Retirada no salão'} · ${new Date(p.criadoEm).toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="item-acoes">
            <strong>${moeda(p.total)}</strong>
            ${p.status === 'RECEBIDO' ? `<button type="button" class="btn btn-perigo btn-pequeno" data-cancelar-pedido="${p.id}">Cancelar</button>` : ''}
          </div>
        </li>`).join('')}</ul>`
        : '<div class="estado-vazio"><p>Você ainda não fez pedidos.</p><a href="loja.html" class="btn btn-escuro">Ir para a loja</a></div>'}`;
    area.querySelectorAll('[data-cancelar-pedido]').forEach(b => b.addEventListener('click', () => {
      const p = db.pedidos.find(x => x.id === b.dataset.cancelarPedido);
      N.confirmar('Cancelar pedido', `Cancelar o pedido <strong>${p.codigo}</strong>?`, 'Cancelar pedido', () => {
        if (p.status !== 'RECEBIDO') { N.toast('O pedido já está em separação e não pode mais ser cancelado.'); return; }
        p.status = 'CANCELADO';
        p.itens.forEach(i => { db.estoque[i.id] += i.qtd; });
        p.historico.push({ em: new Date().toISOString(), texto: 'Cancelado pelo cliente' });
        N.notificar('gestor', `Pedido ${p.codigo} cancelado pelo cliente.`, 'gestao.html#pedidos');
        N.salvar();
        N.toast('Pedido cancelado.');
        pedidos();
      });
    }));
  }

  function notificacoes() {
    const lista = minhasNotificacoes();
    area.innerHTML = `
      ${cabeca('Notificações')}
      ${lista.some(n => !n.lida) ? '<div class="acoes-linha"><button type="button" class="btn btn-contorno-escuro btn-pequeno" id="marcar-lidas">Marcar todas como lidas</button></div>' : ''}
      ${lista.length ? `<ul class="lista-itens">${lista.map(n => `
        <li class="item-linha" style="grid-template-columns:1fr auto${n.lida ? ';opacity:.7' : ''}">
          <div><h3 style="font-size:.95rem">${n.lida ? '' : '<span class="selo selo-pendente">Nova</span> '}${esc(n.texto)}</h3>
          <p>${new Date(n.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p></div>
          <div class="item-acoes">${n.link ? `<a href="${n.link}" class="btn btn-contorno-escuro btn-pequeno" data-ler="${n.id}">Abrir</a>` : ''}</div>
        </li>`).join('')}</ul>` : '<div class="estado-vazio">Nenhuma notificação.</div>'}`;
    const marcar = document.getElementById('marcar-lidas');
    if (marcar) marcar.addEventListener('click', () => { lista.forEach(n => { n.lida = true; }); N.salvar(); roteador.navegar(); });
    area.querySelectorAll('[data-ler]').forEach(a => a.addEventListener('click', () => {
      db.notificacoes.find(n => n.id === a.dataset.ler).lida = true;
      N.salvar();
    }));
  }

  function perfil() {
    const p = db.perfil;
    const opcoes = [['sim', 'Sim'], ['nao', 'Não'], ['nao-sei', 'Não sei'], ['informar-profissional', 'Prefiro informar ao profissional'], ['nao-informado', 'Ainda não informado']];
    area.innerHTML = `
      ${cabeca('Perfil e privacidade', 'Seus dados de demonstração ficam apenas neste navegador.')}
      <form class="cartao form-grade duas" id="form-perfil" novalidate>
        <h2 class="inteiro">Dados pessoais</h2>
        <div class="campo"><label for="pf-nome">Nome</label><input id="pf-nome" value="${esc(p.nome)}" autocomplete="name"><p class="campo-erro" id="pf-nome-erro"></p></div>
        <div class="campo"><label for="pf-tel">Celular</label><input id="pf-tel" value="${esc(p.telefone)}" inputmode="numeric" autocomplete="tel-national"></div>
        <div class="campo inteiro"><label for="pf-email">E-mail</label><input id="pf-email" value="${esc(p.email)}" disabled><p class="texto-suave">A alteração de e-mail exige verificação e não está disponível na demonstração.</p></div>
        <fieldset class="inteiro" style="border:0;padding:0;margin:0"><legend style="font-weight:600;font-size:.88rem;margin-bottom:.6rem">Serviços de interesse</legend>
          <div class="chips">${N.SERVICOS.filter(s => s.id !== 'pezinho').map(s => `
            <label class="chip" style="cursor:pointer"><input type="checkbox" name="pf-pref" value="${s.id}" ${p.preferencias.includes(s.id) ? 'checked' : ''}> ${esc(s.nome)}</label>`).join('')}</div>
        </fieldset>
        <div class="inteiro"><button type="submit" class="btn btn-escuro">Salvar dados</button></div>
      </form>

      <form class="cartao form-grade" id="form-alergia" novalidate>
        <h2>Alergias e sensibilidades</h2>
        <p class="texto-suave">Visível apenas para o profissional do seu atendimento. Não informar não significa ausência de alergia: avise o profissional se tiver dúvida.</p>
        <div class="campo"><label for="pf-alergia">Você tem alergia ou sensibilidade a produtos?</label>
          <select id="pf-alergia">${opcoes.map(([v, t]) => `<option value="${v}" ${p.alergia === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="campo" id="pf-detalhe-campo" ${p.alergia === 'sim' ? '' : 'hidden'}><label for="pf-detalhe">Quais substâncias ou produtos?</label>
          <textarea id="pf-detalhe" maxlength="300">${esc(p.alergiaDetalhe)}</textarea><p class="campo-erro" id="pf-detalhe-erro"></p></div>
        <div class="acoes-linha">
          <button type="submit" class="btn btn-escuro">Salvar alerta</button>
          <button type="button" class="btn btn-perigo" id="pf-remover">Remover informação</button>
        </div>
      </form>

      <div class="cartao">
        <h2>Dados de demonstração</h2>
        <p class="texto-suave" style="margin:.5rem 0 1rem">Apaga agendamentos, pedidos e alterações desta demonstração e restaura os dados iniciais.</p>
        <div class="acoes-linha">
          <button type="button" class="btn btn-contorno-escuro" id="pf-redefinir">Redefinir demonstração</button>
          <button type="button" class="btn btn-contorno-escuro" id="pf-sair">Sair</button>
        </div>
      </div>`;

    const sel = document.getElementById('pf-alergia');
    sel.addEventListener('change', () => { document.getElementById('pf-detalhe-campo').hidden = sel.value !== 'sim'; });

    document.getElementById('form-perfil').addEventListener('submit', e => {
      e.preventDefault();
      const nome = document.getElementById('pf-nome').value.trim();
      if (nome.length < 2) { document.getElementById('pf-nome-erro').textContent = 'Informe seu nome.'; return; }
      p.nome = nome;
      p.telefone = document.getElementById('pf-tel').value.trim();
      p.preferencias = [...area.querySelectorAll('input[name="pf-pref"]:checked')].map(i => i.value);
      N.salvar();
      N.toast('Dados salvos.');
    });

    document.getElementById('form-alergia').addEventListener('submit', e => {
      e.preventDefault();
      const detalhe = document.getElementById('pf-detalhe').value.trim();
      if (sel.value === 'sim' && detalhe.length < 3) { document.getElementById('pf-detalhe-erro').textContent = 'Descreva brevemente a substância ou o produto.'; return; }
      p.alergia = sel.value;
      p.alergiaDetalhe = sel.value === 'sim' ? detalhe : '';
      N.salvar();
      N.toast('Alerta atualizado.');
    });

    document.getElementById('pf-remover').addEventListener('click', () =>
      N.confirmar('Remover informação', 'Remover sua informação sobre alergias e sensibilidades?', 'Remover', () => {
        p.alergia = 'nao-informado'; p.alergiaDetalhe = '';
        N.salvar(); N.toast('Informação removida.'); perfil();
      }));
    document.getElementById('pf-redefinir').addEventListener('click', () =>
      N.confirmar('Redefinir demonstração', 'Todos os dados desta demonstração voltarão ao estado inicial.', 'Redefinir', () => { N.redefinir(); location.reload(); }));
    document.getElementById('pf-sair').addEventListener('click', N.sair);
  }

  // ========================= ROTEADOR =========================
  const roteador = N.roteador({
    secoes, padrao: 'inicio',
    aoMudar: (secao, param) => {
      document.title = secao.titulo + ' — NORDEN';
      secao.render(param);
      N.salvar();
    }
  });
  roteador.navegar();
});

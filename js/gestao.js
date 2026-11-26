/* =========================================================
   NORDEN — Gestão do salão (persona Rafael)
   Painel, agenda, atendimento, NORDEN Flow, estoque,
   pedidos, manuais de cuidados e notificações.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (!N.exigir('gestor')) return;

  const { PRODUTOS, PROFISSIONAIS, CONFIG, STATUS_PEDIDO, STATUS_RESERVA, moeda, hora, duracaoTexto, dataLonga, dataCurta, hojeIso, somarDias, esc } = N;
  const db = N.db();
  const area = document.getElementById('secao');
  const agora = () => new Date().toISOString();

  const estadoAgenda = { data: hojeIso(), prof: 'todos' };

  // ========================= CONSULTAS =========================
  const reservasDoDia = (iso, profId) => db.reservas
    .filter(r => r.data === iso && (!profId || r.profId === profId))
    .sort((a, b) => a.inicio - b.inicio);

  const ehDemo = r => r.clienteId === N.CLIENTE_DEMO.id;
  const pedidosAbertos = () => db.pedidos.filter(p => !['CONCLUIDO', 'CANCELADO'].includes(p.status));
  const estoqueBaixo = () => Object.keys(PRODUTOS).filter(id => (db.estoque[id] || 0) <= CONFIG.estoqueBaixo);

  // Janelas liberadas por cancelamento que ainda estão livres e no futuro
  function janelas() {
    const hoje = hojeIso();
    return db.reservas
      .filter(r => r.status === 'CANCELADO' && (r.data > hoje || (r.data === hoje && r.inicio > N.agoraMin())))
      .filter(r => N.livre(r.profId, r.data, r.inicio, r.duracao))
      // A janela corresponde ao horário cancelado (seção 10.1)
      .map(r => ({ id: r.id, profId: r.profId, data: r.data, inicio: r.inicio, fim: r.inicio + r.duracao, origem: r }))
      .sort((a, b) => a.data.localeCompare(b.data) || a.inicio - b.inicio);
  }

  function ocupacao(iso) {
    let total = 0, ocupado = 0;
    PROFISSIONAIS.forEach(p => {
      if (!p.dias.includes(N.paraData(iso).getDay())) return;
      total += N.fechamentoDo(iso) - CONFIG.abertura - (CONFIG.almoco[1] - CONFIG.almoco[0]);
      ocupado += N.reservasAtivas(p.id, iso).reduce((s, r) => s + r.duracao, 0)
        + db.reservas.filter(r => r.profId === p.id && r.data === iso && r.status === 'CONCLUIDO').reduce((s, r) => s + r.duracao, 0);
    });
    return total ? Math.round(ocupado / total * 100) : null;
  }

  // ========================= COMPONENTES =========================
  const cabeca = (titulo, sub, extra = '') =>
    `<header class="cartao-cabeca" style="margin:0"><div><h1 class="app-titulo">${titulo}</h1>${sub ? `<p class="app-subtitulo">${sub}</p>` : ''}</div>${extra}</header>`;

  function linhaReserva(r) {
    return `
      <li class="item-linha">
        <div class="item-data"><small>${dataCurta(r.data)}</small><strong style="font-size:1rem">${hora(r.inicio)}</strong></div>
        <div>
          <h3>${esc(r.servicoNome)} ${N.selo(r.status)}</h3>
          <p>${esc(r.clienteNome)} · ${esc(N.profissional(r.profId).nome)} · ${duracaoTexto(r.duracao)}</p>
        </div>
        <div class="item-acoes"><button type="button" class="btn btn-contorno-escuro btn-pequeno" data-abrir="${r.id}">Detalhes</button></div>
      </li>`;
  }

  function ligarAbrir() {
    area.querySelectorAll('[data-abrir]').forEach(b => b.addEventListener('click', () => detalheReserva(b.dataset.abrir)));
  }

  // ===================== DETALHE E AÇÕES DA RESERVA =====================
  function detalheReserva(id) {
    const r = db.reservas.find(x => x.id === id);
    const prefs = r.produtosPref.map(p => PRODUTOS[p].nome);
    // Alerta de alergia: visível apenas no atendimento atribuído (aqui, somente para o cliente demo)
    const perfil = db.perfil;
    const alerta = ehDemo(r) ? ({
      'sim': `<div class="aviso-caixa erro"><strong>Alerta de sensibilidade:</strong> ${esc(perfil.alergiaDetalhe)}</div>`,
      'nao': '<p class="texto-suave">Cliente informou não ter alergias conhecidas.</p>',
      'nao-sei': '<div class="aviso-caixa"><strong>Atenção:</strong> cliente não sabe se tem alergias. Confirme antes de aplicar produtos.</div>',
      'informar-profissional': '<div class="aviso-caixa"><strong>Atenção:</strong> cliente prefere informar alergias pessoalmente. Pergunte antes do atendimento.</div>',
      'nao-informado': '<div class="aviso-caixa"><strong>Sem informação de alergias.</strong> Ausência de informação não significa ausência de alergia.</div>'
    })[perfil.alergia] : '<p class="texto-suave">Cliente fictício: sem dados de saúde na demonstração.</p>';

    const acoes = [{ texto: 'Fechar', classe: 'btn-contorno-escuro' }];
    if (r.status === 'CONFIRMADO') {
      acoes.push({ texto: 'Cancelar reserva', classe: 'btn-perigo', aoClicar: f => { f(); cancelarReserva(r); } });
      acoes.push({ texto: 'Não compareceu', classe: 'btn-contorno-escuro', aoClicar: f => { f(); mudarStatus(r, 'NAO_COMPARECEU', 'Marcado como não compareceu'); } });
      acoes.push({ texto: 'Iniciar atendimento', aoClicar: f => { f(); mudarStatus(r, 'EM_ATENDIMENTO', 'Atendimento iniciado'); detalheReserva(r.id); } });
    }
    if (r.status === 'EM_ATENDIMENTO') acoes.push({ texto: 'Concluir atendimento', aoClicar: f => { f(); concluir(r); } });

    N.modal({
      titulo: esc(r.servicoNome),
      corpo: `
        <dl class="revisao">
          <div><dt>Status</dt><dd>${N.selo(r.status)}</dd></div>
          <div><dt>Cliente</dt><dd>${esc(r.clienteNome)}</dd></div>
          <div><dt>Profissional</dt><dd>${esc(N.profissional(r.profId).nome)}</dd></div>
          <div><dt>Data</dt><dd>${dataLonga(r.data)}</dd></div>
          <div><dt>Horário</dt><dd>${hora(r.inicio)} – ${hora(r.inicio + r.duracao)}</dd></div>
          <div><dt>Valor</dt><dd>${moeda(r.preco)}</dd></div>
          <div><dt>Código</dt><dd>${r.codigo}</dd></div>
        </dl>
        ${alerta}
        ${prefs.length ? `<p><strong>Produtos de preferência:</strong> ${esc(prefs.join(', '))} <small class="texto-suave">(verifique se são adequados)</small></p>` : ''}
        ${r.obs ? `<p><strong>Observação do cliente:</strong> ${esc(r.obs)}</p>` : ''}
        ${r.produtosUsados.length ? `<p><strong>Produtos usados:</strong> ${r.produtosUsados.map(p => `${p.qtd}× ${esc(PRODUTOS[p.id].nome)}`).join(', ')}</p>` : ''}
        <details><summary style="cursor:pointer;font-weight:600">Histórico</summary>
          <ul style="margin-top:.5rem;display:grid;gap:.3rem">${r.historico.map(h => `<li class="texto-suave">${new Date(h.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} — ${esc(h.texto)}</li>`).join('')}</ul>
        </details>
        ${r.status === 'CONFIRMADO' && r.data > hojeIso() ? '<p class="texto-suave">Demonstração: o início antecipado é permitido para testar o fluxo. Em produção, apenas no dia do atendimento.</p>' : ''}`,
      acoes
    });
  }

  function mudarStatus(r, status, texto) {
    r.status = status;
    r.historico.push({ em: agora(), texto });
    N.salvar();
    N.toast(texto + '.');
    roteador.navegar();
  }

  function cancelarReserva(r) {
    N.confirmar('Cancelar reserva', `Cancelar ${esc(r.servicoNome)} de ${esc(r.clienteNome)} em ${dataCurta(r.data)} às ${hora(r.inicio)}? O NORDEN Flow vai sugerir clientes para ocupar a janela.`, 'Cancelar reserva', () => {
      r.status = 'CANCELADO';
      r.historico.push({ em: agora(), texto: 'Cancelado pela gestão' });
      db.ofertas.filter(o => o.reservaId === r.id && o.status === 'PENDENTE').forEach(o => { o.status = 'EXPIRADA'; });
      if (ehDemo(r)) N.notificar('cliente', `Sua reserva ${r.codigo} (${r.servicoNome}, ${dataCurta(r.data)}) foi cancelada pelo salão.`, 'cliente.html#agendamentos');
      N.salvar();
      N.toast('Reserva cancelada. <a href="gestao.html#flow">Ver sugestões de encaixe</a>');
      roteador.navegar();
    });
  }

  // Conclusão: produtos efetivamente usados + manual revisado
  function concluir(r) {
    const s = N.servico(r.servicoId);
    const ordenados = [...s.produtos, ...Object.keys(PRODUTOS).filter(id => !s.produtos.includes(id))];
    const manual = db.manuais[r.servicoId];
    N.modal({
      titulo: 'Concluir atendimento',
      corpo: `
        <p class="texto-suave">${esc(r.servicoNome)} · ${esc(r.clienteNome)}</p>
        <fieldset style="border:0;padding:0;margin:0;display:grid;gap:.5rem">
          <legend style="font-weight:600;margin-bottom:.5rem">Produtos efetivamente usados</legend>
          ${ordenados.map(id => `
            <div class="item-linha" style="grid-template-columns:auto 1fr auto;padding:.6rem .8rem">
              <input type="checkbox" id="usado-${id}" value="${id}" ${r.produtosPref.includes(id) ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--onix)">
              <label for="usado-${id}">${esc(PRODUTOS[id].nome)}${s.produtos.includes(id) ? '' : ' <small class="texto-suave">(fora do padrão do serviço)</small>'}<br><small class="texto-suave">Estoque: ${db.estoque[id]}</small></label>
              <input type="number" min="1" max="${Math.max(1, db.estoque[id])}" value="1" id="qtd-${id}" aria-label="Quantidade de ${esc(PRODUTOS[id].nome)}" style="width:64px;min-height:38px;padding:.3rem;border:1px solid var(--borda-campo);border-radius:4px">
            </div>`).join('')}
        </fieldset>
        <div class="campo">
          <label for="manual-titulo">Título do manual de cuidados</label>
          <input id="manual-titulo" value="${esc(manual.titulo)}">
        </div>
        <div class="campo">
          <label for="manual-itens">Orientações (uma por linha) — revise antes de publicar</label>
          <textarea id="manual-itens" rows="5">${esc(manual.itens.join('\n'))}</textarea>
        </div>
        <p class="campo-erro" id="concluir-erro" role="alert"></p>`,
      acoes: [
        { texto: 'Voltar', classe: 'btn-contorno-escuro' },
        { texto: 'Concluir e publicar', aoClicar: (fechar, dlg) => {
          const usados = ordenados.filter(id => dlg.querySelector('#usado-' + id).checked)
            .map(id => ({ id, qtd: Math.max(1, parseInt(dlg.querySelector('#qtd-' + id).value, 10) || 1) }));
          const semEstoque = usados.filter(u => u.qtd > (db.estoque[u.id] || 0));
          const itens = dlg.querySelector('#manual-itens').value.split('\n').map(l => l.trim()).filter(Boolean);
          const erro = dlg.querySelector('#concluir-erro');
          if (semEstoque.length) { erro.textContent = 'Estoque insuficiente: ' + semEstoque.map(u => PRODUTOS[u.id].nome).join(', ') + '. Ajuste o estoque ou a quantidade.'; return; }
          if (!itens.length) { erro.textContent = 'Inclua ao menos uma orientação de cuidado.'; return; }

          usados.forEach(u => { db.estoque[u.id] -= u.qtd; });
          r.produtosUsados = usados;
          r.cuidados = { titulo: dlg.querySelector('#manual-titulo').value.trim() || manual.titulo, itens };
          r.status = 'CONCLUIDO';
          r.historico.push({ em: agora(), texto: `Atendimento concluído (${usados.length} produto(s) registrados)` });
          if (ehDemo(r)) N.notificar('cliente', `Seu atendimento de ${r.servicoNome} foi concluído. O manual de cuidados já está na sua jornada.`, 'cliente.html#cuidados/' + r.id);
          N.salvar();
          fechar();
          N.toast('Atendimento concluído e publicado na jornada do cliente.');
          roteador.navegar();
        } }
      ]
    });
  }

  // ============================ SEÇÕES ============================
  function painel() {
    const hoje = hojeIso();
    const doDia = reservasDoDia(hoje).filter(r => r.status !== 'CANCELADO');
    const canc7 = db.reservas.filter(r => r.status === 'CANCELADO' && r.data >= hoje && r.data <= somarDias(hoje, 7)).length;
    const avals = db.reservas.filter(r => r.avaliacao).map(r => r.avaliacao.nota);
    const media = avals.length ? (avals.reduce((a, b) => a + b, 0) / avals.length).toFixed(1) : '—';
    const occ = ocupacao(hoje);
    const js = janelas();
    const baixo = estoqueBaixo();

    area.innerHTML = `
      ${cabeca('Painel', `${dataLonga(hoje)} · ${N.GESTOR_DEMO.nome}`)}
      <div class="grade-4">
        <div class="indicador"><span>Atendimentos hoje</span><strong>${doDia.length}</strong><small>${doDia.filter(r => r.status === 'CONCLUIDO').length} concluídos</small></div>
        <div class="indicador"><span>Ocupação hoje</span><strong>${occ === null ? '—' : occ + '%'}</strong><small>${occ === null ? 'Salão fechado' : 'da capacidade da equipe'}</small></div>
        <div class="indicador"><span>Cancelamentos (7 dias)</span><strong>${canc7}</strong><small>${js.length} janela(s) para encaixe</small></div>
        <div class="indicador"><span>Pedidos abertos</span><strong>${pedidosAbertos().length}</strong><small>Avaliação média: ${media}</small></div>
      </div>
      ${js.length ? `<div class="aviso-caixa"><strong>NORDEN Flow:</strong> ${js.length} horário(s) liberado(s) por cancelamento com clientes que podem antecipar. <a href="#flow" class="link-acao">Ver sugestões</a></div>` : ''}
      ${baixo.length ? `<div class="aviso-caixa erro"><strong>Estoque baixo:</strong> ${baixo.map(id => `${esc(PRODUTOS[id].nome)} (${db.estoque[id]})`).join(', ')}. <a href="#estoque" class="link-acao">Ajustar</a></div>` : ''}
      <div class="cartao">
        <div class="cartao-cabeca"><h2>Atendimentos de hoje</h2><a href="#agenda">Abrir agenda</a></div>
        ${doDia.length ? `<ul class="lista-itens">${doDia.map(linhaReserva).join('')}</ul>` : '<div class="estado-vazio">Nenhum atendimento hoje.</div>'}
      </div>`;
    ligarAbrir();
  }

  function agenda() {
    const iso = estadoAgenda.data;
    const profs = PROFISSIONAIS.filter(p => estadoAgenda.prof === 'todos' || p.id === estadoAgenda.prof);
    area.innerHTML = `
      ${cabeca('Agenda', dataLonga(iso) + (N.salaoAberto(iso) ? '' : ' · salão fechado'))}
      <div class="barra-filtros">
        <button type="button" class="btn btn-contorno-escuro btn-pequeno" id="dia-anterior" aria-label="Dia anterior">←</button>
        <div class="campo"><label for="ag-data">Data</label><input type="date" id="ag-data" value="${iso}"></div>
        <button type="button" class="btn btn-contorno-escuro btn-pequeno" id="dia-seguinte" aria-label="Dia seguinte">→</button>
        <button type="button" class="btn btn-contorno-escuro btn-pequeno" id="dia-hoje">Hoje</button>
        <div class="campo"><label for="ag-prof">Profissional</label>
          <select id="ag-prof"><option value="todos">Todos</option>${PROFISSIONAIS.map(p => `<option value="${p.id}" ${estadoAgenda.prof === p.id ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></div>
      </div>
      <p class="texto-suave">Clique em um atendimento para ver detalhes, iniciar, concluir ou cancelar. Barra bronze = cliente demo (Lucas M.).</p>
      <div class="agenda-dia" style="--colunas:${profs.length}">
        ${profs.map(p => {
          const trabalha = p.dias.includes(N.paraData(iso).getDay());
          const lista = reservasDoDia(iso, p.id);
          const ativos = lista.filter(r => r.status !== 'CANCELADO');
          let almocoInserido = false;
          const blocos = [];
          lista.forEach(r => {
            if (!almocoInserido && r.inicio >= CONFIG.almoco[0]) { blocos.push(`<div class="bloco-almoco">${hora(CONFIG.almoco[0])} – ${hora(CONFIG.almoco[1])} · Almoço</div>`); almocoInserido = true; }
            blocos.push(`
              <button type="button" class="bloco-agenda ${r.status.toLowerCase()}${ehDemo(r) ? ' demo' : ''}" data-abrir="${r.id}">
                <strong>${hora(r.inicio)} – ${hora(r.inicio + r.duracao)}</strong>
                <span>${esc(r.servicoNome)}</span>
                <small>${esc(r.clienteNome)} · ${STATUS_RESERVA[r.status]}</small>
              </button>`);
          });
          if (trabalha && !almocoInserido) blocos.push(`<div class="bloco-almoco">${hora(CONFIG.almoco[0])} – ${hora(CONFIG.almoco[1])} · Almoço</div>`);
          return `
            <section class="agenda-coluna" aria-label="Agenda de ${esc(p.nome)}">
              <h3><span>${esc(p.nome)}</span><small class="texto-suave">${trabalha ? ativos.length + ' atend.' : 'Folga'}</small></h3>
              ${trabalha ? (blocos.join('') || '<p class="texto-suave">Agenda livre.</p>') : '<p class="texto-suave">Não atende neste dia.</p>'}
            </section>`;
        }).join('')}
      </div>`;

    const ir = n => { estadoAgenda.data = somarDias(estadoAgenda.data, n); agenda(); };
    document.getElementById('dia-anterior').addEventListener('click', () => ir(-1));
    document.getElementById('dia-seguinte').addEventListener('click', () => ir(1));
    document.getElementById('dia-hoje').addEventListener('click', () => { estadoAgenda.data = hojeIso(); agenda(); });
    document.getElementById('ag-data').addEventListener('change', e => { if (e.target.value) { estadoAgenda.data = e.target.value; agenda(); } });
    document.getElementById('ag-prof').addEventListener('change', e => { estadoAgenda.prof = e.target.value; agenda(); });
    ligarAbrir();
  }

  function flow() {
    const js = janelas();
    const enviadas = db.ofertas.slice().reverse();
    area.innerHTML = `
      ${cabeca('NORDEN Flow', 'Quando um horário é cancelado, o sistema sugere reservas futuras compatíveis com a duração e o profissional. Nada muda sem a confirmação do cliente.')}
      <div class="aviso-caixa">Para testar: abra a <a href="#agenda" class="link-acao">Agenda</a>, cancele um atendimento anterior ao horário do cliente demo (Lucas M.) e volte aqui.</div>
      ${js.length ? js.map(j => {
        const sugestoes = N.sugestoesFlow(j, Infinity);
        const itemSugestao = sg => {
          const r = sg.reserva;
          const pendente = db.ofertas.some(o => o.reservaId === r.id && o.status === 'PENDENTE');
          return `
            <li class="item-linha">
              <div class="item-data"><small>${dataCurta(r.data)}</small><strong style="font-size:1rem">${hora(r.inicio)}</strong></div>
              <div>
                <h3>${esc(r.clienteNome)}${ehDemo(r) ? ' <span class="selo selo-pendente">Cliente demo</span>' : ''}</h3>
                <p>${esc(r.servicoNome)} · ${duracaoTexto(r.duracao)} · atual: ${dataCurta(r.data)} ${hora(r.inicio)} com ${esc(N.profissional(r.profId).nome)} → proposto: ${dataCurta(j.data)} ${hora(j.inicio)}</p>
                <p><small>Motivo: ${sg.motivo}</small></p>
              </div>
              <div class="item-acoes"><button type="button" class="btn btn-escuro btn-pequeno" data-ofertar="${r.id}" data-janela="${j.id}" ${pendente ? 'disabled' : ''}>${pendente ? 'Oferta enviada' : 'Enviar oferta'}</button></div>
            </li>`;
        };
        return `
          <article class="cartao">
            <div class="cartao-cabeca">
              <h2>Janela livre · ${dataCurta(j.data)} · ${hora(j.inicio)} – ${hora(j.fim)}</h2>
              <span class="texto-suave">${esc(N.profissional(j.profId).nome)} · ${duracaoTexto(j.fim - j.inicio)} livres</span>
            </div>
            <p class="texto-suave" style="margin-bottom:1rem">Liberada pelo cancelamento de ${esc(j.origem.servicoNome)} (${esc(j.origem.clienteNome)}). ${sugestoes.length} reserva(s) elegível(is).</p>
            ${sugestoes.length ? `<ul class="lista-itens">${sugestoes.slice(0, 5).map(itemSugestao).join('')}</ul>
              ${sugestoes.length > 5 ? `<details style="margin-top:.75rem"><summary style="cursor:pointer;font-weight:600">Ver mais ${sugestoes.length - 5} sugestões</summary>
                <ul class="lista-itens" style="margin-top:.75rem">${sugestoes.slice(5).map(itemSugestao).join('')}</ul></details>` : ''}`
              : '<div class="estado-vazio">Nenhuma reserva compatível para antecipar.</div>'}
          </article>`;
      }).join('') : '<div class="estado-vazio">Nenhuma janela liberada por cancelamento no momento.</div>'}

      <div class="cartao">
        <h2>Ofertas enviadas</h2>
        ${enviadas.length ? `<ul class="lista-itens" style="margin-top:1rem">${enviadas.map(o => {
          const r = db.reservas.find(x => x.id === o.reservaId);
          return `
            <li class="item-linha" style="grid-template-columns:1fr auto">
              <div><h3>${esc(r.clienteNome)} · ${esc(r.servicoNome)} ${N.selo(o.status, { PENDENTE: 'Aguardando cliente', ACEITA: 'Aceita', RECUSADA: 'Recusada', EXPIRADA: 'Expirada' })}</h3>
              <p>De ${dataCurta(o.dataOriginal)} ${hora(o.inicioOriginal)} para ${dataCurta(o.novaData)} ${hora(o.novoInicio)} · ${esc(N.profissional(o.profId).nome)}</p></div>
              <div class="item-acoes">${o.status === 'PENDENTE' && !ehDemo(r) ? `
                <button type="button" class="btn btn-contorno-escuro btn-pequeno" data-simular="${o.id}" data-resp="nao">Simular recusa</button>
                <button type="button" class="btn btn-escuro btn-pequeno" data-simular="${o.id}" data-resp="sim">Simular aceite</button>`
                : o.status === 'PENDENTE' ? '<small class="texto-suave">Responda como cliente em Minha conta → Ofertas</small>' : ''}</div>
            </li>`;
        }).join('')}</ul>` : '<p class="texto-suave" style="margin-top:.5rem">Nenhuma oferta enviada.</p>'}
      </div>`;

    area.querySelectorAll('[data-ofertar]').forEach(b => b.addEventListener('click', () => {
      const r = db.reservas.find(x => x.id === b.dataset.ofertar);
      const j = janelas().find(x => x.id === b.dataset.janela);
      if (!j || !N.livre(j.profId, j.data, j.inicio, r.duracao, r.id)) { N.toast('A janela não está mais disponível.'); return flow(); }
      db.ofertas.push({
        id: N.uid('o'), janelaId: j.id, reservaId: r.id, clienteId: r.clienteId, profId: j.profId,
        novaData: j.data, novoInicio: j.inicio, dataOriginal: r.data, inicioOriginal: r.inicio, status: 'PENDENTE', criadoEm: agora()
      });
      if (ehDemo(r)) N.notificar('cliente', `NORDEN Flow: um horário mais cedo ficou livre (${dataCurta(j.data)} às ${hora(j.inicio)}). Quer antecipar?`, 'cliente.html#ofertas');
      N.salvar();
      N.toast('Oferta enviada. A reserva só muda se o cliente aceitar.');
      flow();
    }));

    // Clientes fictícios não têm conta: a gestão simula a resposta para demonstrar o fluxo
    area.querySelectorAll('[data-simular]').forEach(b => b.addEventListener('click', () => {
      const o = db.ofertas.find(x => x.id === b.dataset.simular);
      const r = db.reservas.find(x => x.id === o.reservaId);
      if (b.dataset.resp === 'nao') { o.status = 'RECUSADA'; }
      else if (!N.livre(o.profId, o.novaData, o.novoInicio, r.duracao, r.id)) { o.status = 'EXPIRADA'; N.toast('A janela não está mais livre.'); }
      else {
        r.data = o.novaData; r.inicio = o.novoInicio; r.profId = o.profId;
        r.historico.push({ em: agora(), texto: `Antecipado pelo NORDEN Flow para ${dataCurta(o.novaData)} ${hora(o.novoInicio)}` });
        o.status = 'ACEITA';
        db.ofertas.filter(x => x.janelaId === o.janelaId && x.id !== o.id && x.status === 'PENDENTE').forEach(x => { x.status = 'EXPIRADA'; });
      }
      N.salvar();
      flow();
    }));
  }

  function estoque() {
    area.innerHTML = `
      ${cabeca('Produtos e estoque', `Alerta de estoque baixo a partir de ${CONFIG.estoqueBaixo} unidades.`)}
      <div class="tabela-wrap">
        <table class="tabela tabela-cartoes">
          <caption class="sr-only">Estoque de produtos</caption>
          <thead><tr><th scope="col">Produto</th><th scope="col">Categoria</th><th scope="col">Preço</th><th scope="col">Estoque</th><th scope="col">Ajustar</th></tr></thead>
          <tbody>${Object.keys(PRODUTOS).map(id => {
            const q = db.estoque[id] || 0;
            return `
              <tr>
                <td data-rotulo="Produto"><strong>${esc(PRODUTOS[id].nome)}</strong></td>
                <td data-rotulo="Categoria">${PRODUTOS[id].categoria}</td>
                <td data-rotulo="Preço">${moeda(PRODUTOS[id].preco)}</td>
                <td data-rotulo="Estoque">${q} ${q === 0 ? '<span class="selo selo-cancelado">Esgotado</span>' : q <= CONFIG.estoqueBaixo ? '<span class="selo selo-em_separacao">Baixo</span>' : ''}</td>
                <td data-rotulo="Ajustar">
                  <div class="qtd-controle" role="group" aria-label="Ajustar estoque de ${esc(PRODUTOS[id].nome)}">
                    <button type="button" data-ajuste="${id}" data-delta="-1" aria-label="Remover uma unidade">−</button>
                    <span>${q}</span>
                    <button type="button" data-ajuste="${id}" data-delta="1" aria-label="Adicionar uma unidade">+</button>
                  </div>
                  <button type="button" class="btn btn-contorno-escuro btn-pequeno" data-ajuste="${id}" data-delta="10">+10</button>
                </td>
              </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <p class="texto-suave">O estoque é reduzido ao concluir atendimentos (produtos usados) e ao receber pedidos da loja; cancelamentos de pedidos devolvem as unidades.</p>`;
    area.querySelectorAll('[data-ajuste]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.ajuste;
      db.estoque[id] = Math.max(0, (db.estoque[id] || 0) + Number(b.dataset.delta));
      N.salvar();
      estoque();
    }));
  }

  function pedidos() {
    const proximo = p => ({
      RECEBIDO: [['EM_SEPARACAO', 'Iniciar separação']],
      EM_SEPARACAO: [[p.modalidade === 'entrega' ? 'SAIU_ENTREGA' : 'PRONTO_RETIRADA', p.modalidade === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada']],
      PRONTO_RETIRADA: [['CONCLUIDO', 'Marcar como retirado']],
      SAIU_ENTREGA: [['CONCLUIDO', 'Marcar como entregue']]
    })[p.status] || [];
    area.innerHTML = `
      ${cabeca('Pedidos da loja', 'Atualize o status para o cliente acompanhar.')}
      ${db.pedidos.length ? `<ul class="lista-itens">${db.pedidos.map(p => `
        <li class="item-linha" style="grid-template-columns:1fr auto">
          <div>
            <h3>${p.codigo} ${N.selo(p.status, STATUS_PEDIDO)}</h3>
            <p>${esc(p.clienteNome)} · ${p.itens.map(i => `${i.qtd}× ${esc(PRODUTOS[i.id].nome)}`).join(', ')}</p>
            <p>${p.modalidade === 'entrega' ? `Entrega: ${esc(p.endereco)} (${p.km} km)` : 'Retirada no salão'} · Total ${moeda(p.total)}</p>
          </div>
          <div class="item-acoes">
            ${proximo(p).map(([st, txt]) => `<button type="button" class="btn btn-escuro btn-pequeno" data-pedido="${p.id}" data-status="${st}">${txt}</button>`).join('')}
            ${['RECEBIDO', 'EM_SEPARACAO'].includes(p.status) ? `<button type="button" class="btn btn-perigo btn-pequeno" data-cancelar-pedido="${p.id}">Cancelar</button>` : ''}
          </div>
        </li>`).join('')}</ul>` : '<div class="estado-vazio">Nenhum pedido ainda. Os pedidos feitos na loja aparecem aqui.</div>'}`;

    area.querySelectorAll('[data-pedido]').forEach(b => b.addEventListener('click', () => {
      const p = db.pedidos.find(x => x.id === b.dataset.pedido);
      p.status = b.dataset.status;
      p.historico.push({ em: agora(), texto: STATUS_PEDIDO[p.status] });
      N.notificar('cliente', `Pedido ${p.codigo}: ${STATUS_PEDIDO[p.status]}.`, 'cliente.html#pedidos');
      N.salvar();
      pedidos();
    }));
    area.querySelectorAll('[data-cancelar-pedido]').forEach(b => b.addEventListener('click', () => {
      const p = db.pedidos.find(x => x.id === b.dataset.cancelarPedido);
      N.confirmar('Cancelar pedido', `Cancelar o pedido ${p.codigo}? As unidades voltam ao estoque.`, 'Cancelar pedido', () => {
        p.status = 'CANCELADO';
        p.itens.forEach(i => { db.estoque[i.id] += i.qtd; });
        p.historico.push({ em: agora(), texto: 'Cancelado pela gestão' });
        N.notificar('cliente', `Pedido ${p.codigo} foi cancelado pelo salão.`, 'cliente.html#pedidos');
        N.salvar();
        pedidos();
      });
    }));
  }

  function manuais() {
    area.innerHTML = `
      ${cabeca('Manuais de cuidados', 'Biblioteca usada como base ao concluir atendimentos. O profissional revisa antes de publicar para o cliente.')}
      ${N.SERVICOS.map(s => {
        const m = db.manuais[s.id];
        return `
          <form class="cartao form-grade" data-manual="${s.id}">
            <h2>${esc(s.nome)}</h2>
            <div class="campo"><label for="mt-${s.id}">Título</label><input id="mt-${s.id}" value="${esc(m.titulo)}"></div>
            <div class="campo"><label for="mi-${s.id}">Orientações (uma por linha)</label><textarea id="mi-${s.id}" rows="4">${esc(m.itens.join('\n'))}</textarea></div>
            <div class="acoes-linha">
              <button type="submit" class="btn btn-escuro btn-pequeno">Salvar</button>
              <button type="button" class="btn btn-contorno-escuro btn-pequeno" data-restaurar="${s.id}">Restaurar padrão</button>
            </div>
          </form>`;
      }).join('')}`;
    area.querySelectorAll('[data-manual]').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const id = f.dataset.manual;
      const itens = f.querySelector('#mi-' + id).value.split('\n').map(l => l.trim()).filter(Boolean);
      if (!itens.length) { N.toast('Inclua ao menos uma orientação.'); return; }
      db.manuais[id] = { titulo: f.querySelector('#mt-' + id).value.trim() || db.manuais[id].titulo, itens };
      N.salvar();
      N.toast('Manual salvo.');
    }));
    area.querySelectorAll('[data-restaurar]').forEach(b => b.addEventListener('click', () => {
      db.manuais[b.dataset.restaurar] = JSON.parse(JSON.stringify(N.MANUAIS_PADRAO[b.dataset.restaurar]));
      N.salvar();
      manuais();
    }));
  }

  function notificacoes() {
    const lista = db.notificacoes.filter(n => n.para === 'gestor');
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

  // ============================ ROTEADOR ============================
  const roteador = N.roteador({
    secoes: [
      { id: 'painel', titulo: 'Painel', render: painel },
      { id: 'agenda', titulo: 'Agenda', render: agenda },
      { id: 'flow', titulo: 'NORDEN Flow', render: flow, contador: () => janelas().length },
      { id: 'estoque', titulo: 'Produtos e estoque', render: estoque, contador: () => estoqueBaixo().length },
      { id: 'pedidos', titulo: 'Pedidos da loja', render: pedidos, contador: () => pedidosAbertos().length },
      { id: 'manuais', titulo: 'Manuais de cuidados', render: manuais },
      { id: 'notificacoes', titulo: 'Notificações', render: notificacoes, contador: () => N.naoLidas('gestor') }
    ],
    padrao: 'painel',
    aoMudar: (secao, param) => { document.title = secao.titulo + ' — Gestão NORDEN'; secao.render(param); }
  });
  roteador.navegar();
});

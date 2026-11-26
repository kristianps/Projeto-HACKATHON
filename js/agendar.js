/* =========================================================
   NORDEN — Agendamento (seção 9 da especificação)
   Usa o catálogo e a agenda de demonstração de core.js.
   A reserva é gravada apenas no navegador (localStorage).
   Em produção: disponibilidade no servidor (America/Sao_Paulo)
   e gravação atômica para impedir sobreposição.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const { SERVICOS, PRODUTOS, CONFIG, moeda, hora, duracaoTexto, isoData, paraData, dataLonga, esc } = N;
  const $ = sel => document.querySelector(sel);
  const CHAVE_RASCUNHO = 'norden-agendamento-rascunho';

  // ============================ ESTADO ============================
  const estado = {
    passo: 1, servico: null, profissional: null, profissionalAtribuido: null,
    produtos: new Set(), data: null, horario: null
  };

  const servicoAtual = () => SERVICOS.find(s => s.id === estado.servico);
  const profissionaisHabilitados = () => servicoAtual() ? N.PROFISSIONAIS.filter(p => servicoAtual().profissionais.includes(p.id)) : [];

  function horariosDisponiveis(iso) {
    const s = servicoAtual();
    if (!s || !estado.profissional) return [];
    const ids = estado.profissional === 'qualquer' ? s.profissionais : [estado.profissional];
    const todos = new Set();
    ids.forEach(id => N.horariosLivres(id, iso, s.duracao).forEach(h => todos.add(h)));
    return [...todos].sort((a, b) => a - b);
  }

  const primeiroProfissionalLivre = (iso, minuto) =>
    servicoAtual().profissionais.find(id => N.horariosLivres(id, iso, servicoAtual().duracao).includes(minuto)) || null;

  const totalProdutos = () => [...estado.produtos].reduce((s, id) => s + PRODUTOS[id].preco, 0);

  // ======================== OPÇÕES (DOM) ========================
  function criarOpcaoRadio(classe, selecionado, html, aoEscolher) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = classe;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(selecionado));
    b.innerHTML = html;
    b.addEventListener('click', aoEscolher);
    return b;
  }

  function renderServicos() {
    const lista = $('#lista-servicos');
    lista.innerHTML = '';
    const pref = estado.profissionalPreferido;
    SERVICOS.filter(s => !pref || s.profissionais.includes(pref)).forEach(s => lista.appendChild(criarOpcaoRadio('opcao-cartao', estado.servico === s.id, `
      <span class="opcao-titulo">${esc(s.nome)}</span>
      <span class="opcao-desc">${esc(s.desc)}</span>
      <span class="opcao-meta"><strong>${moeda(s.preco)}</strong><span>${duracaoTexto(s.duracao)}</span></span>`,
      () => escolherServico(s.id))));
  }

  function renderProfissionais() {
    const lista = $('#lista-profissionais');
    lista.innerHTML = '';
    const habilitados = profissionaisHabilitados();
    if (habilitados.length > 1) {
      lista.appendChild(criarOpcaoRadio('opcao-cartao opcao-profissional', estado.profissional === 'qualquer', `
        <span class="avatar qualquer" aria-hidden="true">✦</span>
        <span class="opcao-titulo">Sem preferência</span>
        <span class="opcao-desc">Mostramos mais horários e atribuímos um profissional disponível.</span>`,
        () => escolherProfissional('qualquer')));
    }
    habilitados.forEach(p => lista.appendChild(criarOpcaoRadio('opcao-cartao opcao-profissional', estado.profissional === p.id, `
      <span class="avatar" aria-hidden="true">${p.sigla}</span>
      <span class="opcao-titulo">${esc(p.nome)}</span>
      <span class="tags">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>`,
      () => escolherProfissional(p.id))));
  }

  function renderProdutos() {
    const lista = $('#lista-produtos');
    const ids = servicoAtual() ? servicoAtual().produtos : [];
    lista.innerHTML = '';
    $('#produtos-vazio').hidden = ids.length > 0;
    ids.forEach(id => {
      const p = PRODUTOS[id];
      const label = document.createElement('label');
      label.className = 'produto-opcao';
      label.innerHTML = `
        <input type="checkbox" value="${id}" ${estado.produtos.has(id) ? 'checked' : ''}>
        <span><strong>${esc(p.nome)}</strong><small>${esc(p.desc)}</small></span>
        <span class="preco">${moeda(p.preco)}</span>`;
      label.querySelector('input').addEventListener('change', e => {
        e.target.checked ? estado.produtos.add(id) : estado.produtos.delete(id);
        atualizarResumo(); atualizarBotoes();
      });
      lista.appendChild(label);
    });
  }

  function renderDatas() {
    const lista = $('#lista-datas');
    lista.innerHTML = '';
    const hoje = new Date();
    for (let i = 0; i < CONFIG.diasExibidos; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const iso = isoData(d);
      const vagas = horariosDisponiveis(iso).length;
      const fechado = !N.salaoAberto(iso);
      const legenda = fechado ? 'Fechado' : vagas === 0 ? 'Sem vagas' : i === 0 ? 'Hoje' : vagas + ' vagas';
      const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const b = criarOpcaoRadio('data-opcao', estado.data === iso,
        `<small>${semana}</small><strong>${d.getDate()}</strong><span>${legenda}</span>`, () => escolherData(iso));
      b.setAttribute('aria-label', dataLonga(iso) + ' — ' + legenda);
      if (fechado || vagas === 0) b.disabled = true;
      lista.appendChild(b);
    }
  }

  function renderHorarios() {
    const lista = $('#lista-horarios');
    const vazio = $('#horarios-vazio');
    lista.innerHTML = '';
    if (!estado.data) { vazio.hidden = false; vazio.textContent = 'Escolha uma data para ver os horários disponíveis.'; return; }
    const horarios = horariosDisponiveis(estado.data);
    if (!horarios.length) { vazio.hidden = false; vazio.textContent = 'Não há horários livres nesta data. Escolha outro dia ou outro profissional.'; return; }
    vazio.hidden = true;
    [['Manhã', 0, 720], ['Tarde', 720, 1080], ['Noite', 1080, 1440]].forEach(([nome, de, ate]) => {
      const doPeriodo = horarios.filter(h => h >= de && h < ate);
      if (!doPeriodo.length) return;
      const t = document.createElement('p');
      t.className = 'grupo-periodo';
      t.textContent = nome;
      lista.appendChild(t);
      doPeriodo.forEach(h => {
        const b = criarOpcaoRadio('horario-opcao', estado.horario === h, hora(h), () => escolherHorario(h));
        b.setAttribute('aria-label', hora(h) + ' até ' + hora(h + servicoAtual().duracao));
        lista.appendChild(b);
      });
    });
  }

  function linhasRevisao(comEdicao) {
    const s = servicoAtual();
    const prof = N.profissional(estado.profissionalAtribuido || estado.profissional);
    const produtos = [...estado.produtos].map(id => PRODUTOS[id].nome);
    const editar = p => comEdicao ? ` <button type="button" class="editar" data-editar="${p}">Alterar</button>` : '';
    return `
      <div><dt>Serviço</dt><dd>${esc(s.nome)}${editar(1)}</dd></div>
      <div><dt>Profissional</dt><dd>${prof ? esc(prof.nome) : '—'}${estado.profissional === 'qualquer' ? ' <small>(atribuído)</small>' : ''}${editar(2)}</dd></div>
      <div><dt>Data</dt><dd>${dataLonga(estado.data)}${editar(4)}</dd></div>
      <div><dt>Horário</dt><dd>${hora(estado.horario)} – ${hora(estado.horario + s.duracao)}</dd></div>
      <div><dt>Duração</dt><dd>${duracaoTexto(s.duracao)}</dd></div>
      <div><dt>Produtos de preferência</dt><dd>${produtos.length ? esc(produtos.join(', ')) : 'Nenhum'}${editar(3)}</dd></div>
      <div class="total"><dt>Valor do serviço</dt><dd>${moeda(s.preco)}</dd></div>`;
  }

  function renderRevisao() {
    $('#revisao').innerHTML = linhasRevisao(true);
    $('#revisao').querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => irPara(Number(b.dataset.editar))));
    const status = $('#status-confirmacao');
    if (N.sessao() !== 'cliente') {
      status.className = 'form-status info';
      status.innerHTML = 'Para confirmar, entre na sua conta. Suas escolhas serão mantidas.';
    } else {
      status.textContent = '';
    }
  }

  // ========================== ESCOLHAS ==========================
  function escolherServico(id) {
    if (estado.servico !== id) {
      estado.servico = id;
      const s = servicoAtual();
      if (estado.profissional && estado.profissional !== 'qualquer' && !s.profissionais.includes(estado.profissional)) estado.profissional = null;
      if (estado.profissional === 'qualquer' && s.profissionais.length < 2) estado.profissional = null;
      if (s.profissionais.length === 1) estado.profissional = s.profissionais[0];
      estado.produtos = new Set([...estado.produtos].filter(p => s.produtos.includes(p)));
      estado.horario = null;
      estado.profissionalAtribuido = null;
    }
    $('#erro-passo-1').textContent = '';
    renderServicos(); atualizarResumo(); atualizarBotoes();
  }

  function escolherProfissional(id) {
    if (estado.profissional !== id) {
      estado.profissional = id;
      estado.horario = null;
      estado.profissionalAtribuido = id === 'qualquer' ? null : id;
    }
    $('#erro-passo-2').textContent = '';
    renderProfissionais(); atualizarResumo(); atualizarBotoes();
  }

  function escolherData(iso) {
    if (estado.data !== iso) { estado.data = iso; estado.horario = null; }
    if (estado.profissional === 'qualquer') estado.profissionalAtribuido = null;
    renderDatas(); renderHorarios(); atualizarResumo(); atualizarBotoes();
  }

  function escolherHorario(m) {
    estado.horario = m;
    estado.profissionalAtribuido = estado.profissional === 'qualquer' ? primeiroProfissionalLivre(estado.data, m) : estado.profissional;
    $('#erro-passo-4').textContent = '';
    renderHorarios(); atualizarResumo(); atualizarBotoes();
  }

  // =========================== RESUMO ===========================
  function atualizarResumo() {
    const s = servicoAtual();
    const profId = estado.profissionalAtribuido || estado.profissional;
    const prof = profId === 'qualquer' ? { nome: 'Sem preferência' } : N.profissional(profId);
    const produtos = [...estado.produtos].map(id => PRODUTOS[id].nome);
    const v = {
      servico: s ? s.nome : 'Nenhum serviço',
      profissional: prof ? prof.nome : '—',
      data: estado.data ? dataLonga(estado.data) : '—',
      horario: estado.horario !== null && s ? hora(estado.horario) + ' – ' + hora(estado.horario + s.duracao) : '—',
      produtos: produtos.length ? produtos.join(', ') + ' (' + moeda(totalProdutos()) + ', não cobrado agora)' : 'Nenhum',
      duracao: s ? duracaoTexto(s.duracao) : '—',
      preco: s ? moeda(s.preco) : '—'
    };
    document.querySelectorAll('[data-resumo]').forEach(el => { el.textContent = v[el.dataset.resumo]; });
  }

  // ========================= NAVEGAÇÃO =========================
  const TITULOS = { 1: 'Escolha o serviço', 2: 'Escolha o profissional', 3: 'Produtos de preferência', 4: 'Escolha data e horário', 5: 'Revise e confirme' };

  function passoMaximo() {
    if (!estado.servico) return 1;
    if (!estado.profissional) return 2;
    if (estado.horario === null) return 4;
    return 5;
  }

  function irPara(passo, focar = true) {
    passo = Math.max(1, Math.min(passo, passoMaximo()));
    estado.passo = passo;
    document.querySelectorAll('.passo').forEach(sec => { sec.hidden = Number(sec.dataset.passo) !== passo; });
    $('#titulo-etapa').textContent = TITULOS[passo];
    if (passo === 1) renderServicos();
    if (passo === 2) renderProfissionais();
    if (passo === 3) renderProdutos();
    if (passo === 4) {
      $('#intro-horario').textContent = `Horários para ${servicoAtual().nome} (${duracaoTexto(servicoAtual().duracao)}), calculados pela agenda ${estado.profissional === 'qualquer' ? 'de todos os profissionais habilitados' : 'do profissional escolhido'}.`;
      renderDatas(); renderHorarios();
    }
    if (passo === 5) renderRevisao();
    atualizarBotoes();
    if (focar) {
      $('#titulo-etapa').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function atualizarBotoes() {
    const max = passoMaximo();
    document.querySelectorAll('#etapas-agendar li').forEach(li => {
      const n = Number(li.dataset.passo);
      li.classList.toggle('ativa', n === estado.passo);
      li.classList.toggle('concluida', n < estado.passo);
      li.querySelector('button').disabled = n > max || n === estado.passo;
      if (n === estado.passo) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('#btn-voltar').hidden = estado.passo === 1;
    $('#btn-avancar').textContent =
      estado.passo === 5 ? (N.sessao() === 'cliente' ? 'Confirmar agendamento' : 'Entrar para confirmar') :
      estado.passo === 3 && estado.produtos.size === 0 ? 'Pular esta etapa' : 'Continuar';
  }

  function validarPasso() {
    if (estado.passo === 1 && !estado.servico) { $('#erro-passo-1').textContent = 'Escolha um serviço para continuar.'; return false; }
    if (estado.passo === 2 && !estado.profissional) { $('#erro-passo-2').textContent = 'Escolha um profissional ou "Sem preferência".'; return false; }
    if (estado.passo === 4 && estado.horario === null) { $('#erro-passo-4').textContent = estado.data ? 'Escolha um horário.' : 'Escolha uma data e um horário.'; return false; }
    return true;
  }

  $('#btn-avancar').addEventListener('click', () => {
    if (estado.passo === 5) return confirmar();
    if (validarPasso()) irPara(estado.passo + 1);
  });
  $('#btn-voltar').addEventListener('click', () => irPara(estado.passo - 1));
  document.querySelectorAll('#etapas-agendar button').forEach(b =>
    b.addEventListener('click', () => irPara(Number(b.closest('li').dataset.passo))));

  const aceite = $('#aceite-politica');
  aceite.addEventListener('change', () => { aceite.removeAttribute('aria-invalid'); $('#aceite-politica-erro').textContent = ''; });

  // ========================= CONFIRMAÇÃO =========================
  function salvarRascunho() {
    // Apenas escolhas não sensíveis, para retomar após o login
    try { sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({
      servico: estado.servico, profissional: estado.profissional, produtos: [...estado.produtos],
      data: estado.data, horario: estado.horario, obs: $('#observacao').value
    })); } catch { /* sem armazenamento: as escolhas não serão retomadas */ }
  }

  function confirmar() {
    if (N.sessao() !== 'cliente') {
      salvarRascunho();
      N.ir('login.html?perfil=cliente&voltar=agendar.html');
      return;
    }
    if (!aceite.checked) {
      aceite.setAttribute('aria-invalid', 'true');
      $('#aceite-politica-erro').textContent = 'Confirme que leu a política de cancelamento.';
      aceite.focus();
      return;
    }

    const botao = $('#btn-avancar');
    const status = $('#status-confirmacao');
    status.textContent = '';
    botao.disabled = true;
    botao.classList.add('carregando');
    botao.textContent = 'Confirmando';

    setTimeout(() => {
      botao.disabled = false;
      botao.classList.remove('carregando');

      // Revalida antes de gravar (no servidor isso seria uma transação)
      const s = servicoAtual();
      const profId = estado.profissional === 'qualquer' ? primeiroProfissionalLivre(estado.data, estado.horario) : estado.profissional;
      if (!profId || !N.horariosLivres(profId, estado.data, s.duracao).includes(estado.horario)) {
        status.className = 'form-status erro';
        status.textContent = 'Este horário acabou de ficar indisponível. Escolha outro horário.';
        estado.horario = null;
        atualizarBotoes();
        return;
      }

      const db = N.db();
      const reserva = N.novaReserva({
        clienteId: N.CLIENTE_DEMO.id, clienteNome: db.perfil.nome,
        servicoId: s.id, profId, data: estado.data, inicio: estado.horario,
        produtosPref: [...estado.produtos], obs: $('#observacao').value.trim()
      });
      db.reservas.push(reserva);
      N.notificar('cliente', `Reserva ${reserva.codigo} confirmada: ${s.nome}, ${N.dataCurta(estado.data)} às ${hora(estado.horario)}.`, 'cliente.html#agendamentos');
      N.notificar('gestor', `Nova reserva: ${s.nome} com ${N.profissional(profId).nome}, ${N.dataCurta(estado.data)} às ${hora(estado.horario)}.`, 'gestao.html#agenda');
      N.salvar();
      try { sessionStorage.removeItem(CHAVE_RASCUNHO); } catch { /* sem armazenamento */ }

      estado.profissionalAtribuido = profId;
      $('#confirmado-texto').innerHTML = `Código da reserva: <strong>${reserva.codigo}</strong>. Você pode cancelar ou remarcar até ${CONFIG.cancelamentoHoras} horas antes.`;
      $('#confirmado-detalhes').innerHTML = linhasRevisao(false);
      $('#area-agendamento').hidden = true;
      $('#etapas-agendar').hidden = true;
      $('#resumo-movel').hidden = true;
      $('#titulo-etapa').textContent = 'Agendamento concluído';
      $('#confirmado').hidden = false;
      $('#titulo-confirmado').focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  }

  // ======================== INICIALIZAÇÃO ========================
  const params = N.params();
  let rascunho = null;
  try { rascunho = JSON.parse(sessionStorage.getItem(CHAVE_RASCUNHO)); } catch { rascunho = null; }

  if (rascunho && rascunho.servico) {
    // Volta do login: revalida as escolhas
    escolherServico(rascunho.servico);
    if (rascunho.profissional) escolherProfissional(rascunho.profissional);
    rascunho.produtos.forEach(p => { if (servicoAtual().produtos.includes(p)) estado.produtos.add(p); });
    if (rascunho.data) estado.data = rascunho.data;
    $('#observacao').value = rascunho.obs || '';
    if (rascunho.data && rascunho.horario !== null && horariosDisponiveis(rascunho.data).includes(rascunho.horario)) {
      escolherHorario(rascunho.horario);
      irPara(5, false);
    } else {
      irPara(4, false);
      if (rascunho.horario !== null) $('#erro-passo-4').textContent = 'O horário escolhido não está mais disponível. Escolha outro.';
    }
    try { sessionStorage.removeItem(CHAVE_RASCUNHO); } catch { /* sem armazenamento */ }
  } else {
    const servicoUrl = params.get('servico');
    const profUrl = params.get('profissional');
    if (servicoUrl && SERVICOS.some(s => s.id === servicoUrl)) {
      escolherServico(servicoUrl);
      if (profUrl && servicoAtual().profissionais.includes(profUrl)) { escolherProfissional(profUrl); irPara(3, false); }
      else irPara(2, false);
    } else {
      // Agendar com um profissional: mostra apenas serviços que ele realiza
      if (profUrl && N.profissional(profUrl)) {
        estado.profissionalPreferido = profUrl;
        $('.passo[data-passo="1"] .passo-intro').textContent = `Serviços realizados por ${N.profissional(profUrl).nome}. Preço e duração exibidos antes de qualquer confirmação.`;
      }
      irPara(1, false);
    }
  }

  // Se veio da página de profissionais, pré-seleciona o profissional ao escolher o serviço
  if (estado.profissionalPreferido) {
    document.getElementById('lista-servicos').addEventListener('click', () => {
      const s = servicoAtual();
      if (s && s.profissionais.includes(estado.profissionalPreferido) && !estado.profissional) escolherProfissional(estado.profissionalPreferido);
    });
  }

  atualizarResumo();
});

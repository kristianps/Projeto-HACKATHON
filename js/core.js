/* =========================================================
   NORDEN — Núcleo compartilhado (todas as páginas)
   - Catálogo e regras de demonstração
   - "Banco" de demonstração no localStorage (somente neste navegador)
   - Sessão de demonstração (cliente / gestor), sem senha real
   - Cabeçalho com menus suspensos e rodapé
   Em produção, tudo isto é substituído por backend + autenticação real.
   ========================================================= */

const N = (() => {

  // ========================= CATÁLOGO (ilustrativo) =========================
  const SERVICOS = [
    { id: 'corte', nome: 'Corte masculino', desc: 'Tesoura e máquina, alinhado ao seu formato de rosto e rotina. Inclui finalização.', preco: 70, duracao: 45, profissionais: ['p1', 'p2'], produtos: ['pomada', 'shampoo'] },
    { id: 'barba', nome: 'Barba completa', desc: 'Modelagem, toalha quente, navalha e hidratação com óleo ou balm.', preco: 50, duracao: 30, profissionais: ['p1', 'p2'], produtos: ['oleo', 'balm'] },
    { id: 'corte-barba', nome: 'Corte + Barba', desc: 'O combo completo em um único horário, sem conflitos na agenda.', preco: 110, duracao: 75, profissionais: ['p1', 'p2'], produtos: ['pomada', 'oleo', 'balm'] },
    { id: 'capilar', nome: 'Tratamento capilar', desc: 'Limpeza profunda e hidratação do couro cabeludo.', preco: 90, duracao: 40, profissionais: ['p3'], produtos: ['shampoo', 'tonico'] },
    { id: 'pele', nome: 'Limpeza de pele', desc: 'Higienização, esfoliação e hidratação facial. Alergias informadas são consideradas.', preco: 120, duracao: 60, profissionais: ['p3'], produtos: ['hidratante'] },
    { id: 'pezinho', nome: 'Pezinho e acabamento', desc: 'Manutenção rápida do contorno entre cortes.', preco: 30, duracao: 15, profissionais: ['p1', 'p2', 'p3'], produtos: [] }
  ];

  // dias: 0 = domingo ... 6 = sábado
  const PROFISSIONAIS = [
    { id: 'p1', nome: 'Profissional 01', sigla: 'P1', bio: 'Barbeiro com foco em barba clássica e navalha.', tags: ['Barba', 'Navalha'], dias: [2, 3, 4, 5, 6] },
    { id: 'p2', nome: 'Profissional 02', sigla: 'P2', bio: 'Cabeleireiro masculino, especialista em cortes modernos e degradê.', tags: ['Degradê', 'Tesoura'], dias: [2, 3, 4, 5, 6] },
    { id: 'p3', nome: 'Profissional 03', sigla: 'P3', bio: 'Terapeuta capilar e de pele, com atendimento a peles sensíveis.', tags: ['Capilar', 'Pele'], dias: [3, 4, 5, 6] }
  ];

  const PRODUTOS = {
    pomada:     { nome: 'Pomada modeladora matte', categoria: 'Cabelo', desc: 'Fixação média, efeito seco. Aplique pouca quantidade no cabelo seco.', preco: 59.9, forma: 'pote' },
    shampoo:    { nome: 'Shampoo antirresíduo', categoria: 'Cabelo', desc: 'Limpeza profunda do couro cabeludo. Uso 2 a 3 vezes por semana.', preco: 44.9, forma: 'frasco' },
    tonico:     { nome: 'Tônico capilar', categoria: 'Cabelo', desc: 'Uso diário após o banho, no couro cabeludo.', preco: 54.9, forma: 'frasco' },
    oleo:       { nome: 'Óleo para barba', categoria: 'Barba', desc: 'Hidrata e alinha os fios. 3 a 4 gotas após o banho.', preco: 49.9, forma: 'frasco' },
    balm:       { nome: 'Balm pós-barba', categoria: 'Barba', desc: 'Acalma a pele após a navalha.', preco: 39.9, forma: 'pote' },
    hidratante: { nome: 'Hidratante facial', categoria: 'Pele', desc: 'Toque seco, sem brilho. Uso pela manhã.', preco: 64.9, forma: 'frasco' }
  };

  const MANUAIS_PADRAO = {
    'corte':       { titulo: 'Cuidados após o corte', itens: ['Lave com shampoo adequado 2 a 3 vezes por semana.', 'Finalize com pouca pomada, no cabelo seco.', 'Agende a manutenção em 3 a 4 semanas.'] },
    'barba':       { titulo: 'Cuidados com a barba', itens: ['Evite coçar a região nas primeiras 24 horas.', 'Aplique óleo para barba após o banho.', 'Use balm se houver ardência após a navalha.'] },
    'corte-barba': { titulo: 'Cuidados com corte e barba', itens: ['Cabelo: finalize com pomada no cabelo seco.', 'Barba: óleo diário após o banho.', 'Evite produtos com álcool na pele nas primeiras 24 horas.', 'Manutenção sugerida em 3 semanas.'] },
    'capilar':     { titulo: 'Cuidados após tratamento capilar', itens: ['Não lave o cabelo nas próximas 12 horas.', 'Use o tônico diariamente no couro cabeludo.', 'Evite água muito quente.'] },
    'pele':        { titulo: 'Cuidados após limpeza de pele', itens: ['Evite sol direto por 48 horas e use protetor solar.', 'Não use esfoliantes por 5 dias.', 'Hidrate a pele pela manhã e à noite.'] },
    'pezinho':     { titulo: 'Cuidados com o acabamento', itens: ['Evite produtos com álcool na nuca nas primeiras horas.', 'Próximo acabamento sugerido em 10 a 15 dias.'] }
  };

  // Parâmetros configuráveis (valores ilustrativos)
  const CONFIG = {
    abertura: 9 * 60,
    fechamento: { padrao: 19 * 60, sabado: 17 * 60 },
    almoco: [12 * 60, 13 * 60],
    passo: 15,
    intervalo: 0,
    antecedencia: 30,
    diasExibidos: 14,
    cancelamentoHoras: 2,
    entrega: { base: 5, porKm: 1.5, raioMaxKm: 15 },
    estoqueBaixo: 5
  };

  const ATIVAS = ['PENDENTE', 'CONFIRMADO', 'EM_ATENDIMENTO'];

  const STATUS_RESERVA = {
    PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', EM_ATENDIMENTO: 'Em atendimento',
    CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado', NAO_COMPARECEU: 'Não compareceu'
  };
  const STATUS_PEDIDO = {
    RECEBIDO: 'Recebido', EM_SEPARACAO: 'Em separação', PRONTO_RETIRADA: 'Pronto para retirada',
    SAIU_ENTREGA: 'Saiu para entrega', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado'
  };

  const CLIENTE_DEMO = { id: 'c-demo', nome: 'Lucas M.', email: 'lucas.demo@exemplo.com', telefone: '(00) 00000-0000' };
  const GESTOR_DEMO = { id: 'g-demo', nome: 'Rafael A.' };

  // ============================ UTILITÁRIOS ============================
  const moeda = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const hora = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const duracaoTexto = m => m < 60 ? m + ' min' : Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : '');
  const isoData = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const paraData = iso => new Date(iso + 'T00:00:00');
  const hojeIso = () => isoData(new Date());
  const somarDias = (iso, n) => { const d = paraData(iso); d.setDate(d.getDate() + n); return isoData(d); };
  const dataLonga = iso => paraData(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dataCurta = iso => paraData(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const agoraMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const uid = prefixo => prefixo + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const codigo = () => 'NRD-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const servico = id => SERVICOS.find(s => s.id === id);
  const profissional = id => PROFISSIONAIS.find(p => p.id === id);
  const fechamentoDo = iso => paraData(iso).getDay() === 6 ? CONFIG.fechamento.sabado : CONFIG.fechamento.padrao;
  const salaoAberto = iso => PROFISSIONAIS.some(p => p.dias.includes(paraData(iso).getDay()));

  function geradorSemente(texto) {
    let h = 2166136261;
    for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ======================= BANCO DE DEMONSTRAÇÃO =======================
  const CHAVE_DB = 'norden-demo-v1';
  const CHAVE_SESSAO = 'norden-sessao';
  let db = null;

  function novaReserva(dados) {
    const s = servico(dados.servicoId);
    return {
      id: uid('r'), codigo: codigo(), status: 'CONFIRMADO', produtosPref: [], obs: '',
      produtosUsados: [], cuidados: null, avaliacao: null,
      // preço, duração e nome congelados no momento da confirmação
      servicoNome: s.nome, duracao: s.duracao, preco: s.preco,
      historico: [{ em: new Date().toISOString(), texto: 'Reserva confirmada' }],
      ...dados
    };
  }

  function semear() {
    const hoje = hojeIso();
    const rnd = geradorSemente('norden-' + hoje);
    const nomes = ['Cliente A', 'Cliente B', 'Cliente C', 'Cliente D', 'Cliente E', 'Cliente F', 'Cliente G', 'Cliente H'];
    const estoque = { pomada: 14, shampoo: 9, tonico: 4, oleo: 12, balm: 3, hidratante: 7 };
    const base = { reservas: [], pedidos: [], carrinho: [], ofertas: [], notificacoes: [], estoque, manuais: JSON.parse(JSON.stringify(MANUAIS_PADRAO)), perfil: { ...CLIENTE_DEMO, preferencias: ['corte', 'barba'], alergia: 'nao-informado', alergiaDetalhe: '' }, criadoEm: new Date().toISOString() };
    db = base;

    // Reservas fictícias de outros clientes (próximos 14 dias)
    for (let i = 0; i < CONFIG.diasExibidos; i++) {
      const iso = somarDias(hoje, i);
      PROFISSIONAIS.forEach(p => {
        if (!p.dias.includes(paraData(iso).getDay())) return;
        const habilitados = SERVICOS.filter(s => s.profissionais.includes(p.id));
        const qtd = 3 + Math.floor(rnd() * 4);
        for (let k = 0; k < qtd; k++) {
          const s = habilitados[Math.floor(rnd() * habilitados.length)];
          const fim = fechamentoDo(iso);
          const inicio = CONFIG.abertura + Math.floor(rnd() * ((fim - CONFIG.abertura - s.duracao) / 30)) * 30;
          if (!livre(p.id, iso, inicio, s.duracao)) continue;
          base.reservas.push(novaReserva({ clienteId: 'outro', clienteNome: nomes[Math.floor(rnd() * nomes.length)] + ' (fictício)', servicoId: s.id, profId: p.id, data: iso, inicio }));
        }
      });
    }

    // Histórico do cliente demo: dois atendimentos concluídos
    const passado = [
      { dias: -45, servicoId: 'capilar', profId: 'p3', inicio: 10 * 60, usados: ['shampoo', 'tonico'], nota: 5 },
      { dias: -18, servicoId: 'corte-barba', profId: 'p2', inicio: 17 * 60, usados: ['pomada', 'oleo'], nota: null }
    ];
    passado.forEach(h => {
      const r = novaReserva({ clienteId: CLIENTE_DEMO.id, clienteNome: CLIENTE_DEMO.nome, servicoId: h.servicoId, profId: h.profId, data: somarDias(hoje, h.dias), inicio: h.inicio });
      r.status = 'CONCLUIDO';
      r.produtosUsados = h.usados.map(id => ({ id, qtd: 1 }));
      r.cuidados = JSON.parse(JSON.stringify(MANUAIS_PADRAO[h.servicoId]));
      r.avaliacao = h.nota ? { nota: h.nota, comentario: '' } : null;
      r.historico.push({ em: new Date().toISOString(), texto: 'Atendimento concluído' });
      base.reservas.push(r);
    });

    // Próxima reserva do cliente demo (candidata a antecipação pelo NORDEN Flow)
    let alvo = somarDias(hoje, 4);
    while (!profissional('p2').dias.includes(paraData(alvo).getDay())) alvo = somarDias(alvo, 1);
    let inicioDemo = 18 * 60 + 30;
    if (paraData(alvo).getDay() === 6) inicioDemo = 15 * 60;
    base.reservas = base.reservas.filter(r => !(r.profId === 'p2' && r.data === alvo && r.inicio < inicioDemo + 45 && inicioDemo < r.inicio + r.duracao));
    base.reservas.push(novaReserva({ clienteId: CLIENTE_DEMO.id, clienteNome: CLIENTE_DEMO.nome, servicoId: 'corte', profId: 'p2', data: alvo, inicio: inicioDemo, produtosPref: ['pomada'] }));

    base.notificacoes.push({ id: uid('n'), para: 'cliente', texto: 'Bem-vindo ao NORDEN! Seu manual de cuidados do último atendimento está disponível.', link: 'cliente.html#jornada', lida: false, em: new Date().toISOString() });
    salvar();
  }

  function carregar() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(CHAVE_DB)); } catch { db = null; }
    if (!db) semear();
    return db;
  }

  function salvar() {
    try { localStorage.setItem(CHAVE_DB, JSON.stringify(db)); } catch { /* armazenamento indisponível: segue em memória */ }
  }

  function redefinir() {
    try { localStorage.removeItem(CHAVE_DB); } catch { /* sem armazenamento */ }
    db = null;
    carregar();
  }

  // ============================== SESSÃO ==============================
  // Sessão guardada no navegador; se o armazenamento estiver bloqueado, vale só nesta aba
  let sessaoMemoria = null;
  const sessao = () => { try { return localStorage.getItem(CHAVE_SESSAO) || sessaoMemoria; } catch { return sessaoMemoria; } }; // 'cliente' | 'gestor' | null
  function entrar(perfil) { sessaoMemoria = perfil; try { localStorage.setItem(CHAVE_SESSAO, perfil); } catch { /* sem armazenamento */ } }
  function sair() { sessaoMemoria = null; try { localStorage.removeItem(CHAVE_SESSAO); } catch { /* sem armazenamento */ } ir('index.html'); }

  // ======================= NAVEGAÇÃO ENTRE PÁGINAS =======================
  // No site normal usa o endereço do navegador. No arquivo único (NORDEN_compartilhar.html)
  // cada página roda dentro de um quadro e a navegação é feita pelo arquivo principal.
  const params = () => new URLSearchParams(window.__NORDEN_QUERY ?? location.search);
  const paginaAtual = () => window.__NORDEN_PAGINA || location.pathname.split('/').pop() || 'index.html';
  function ir(url, substituir) {
    if (window.__NORDEN_NAV) return window.__NORDEN_NAV(url);
    if (substituir) location.replace(url); else location.href = url;
  }

  // Protege páginas: em produção, a autorização é verificada no servidor
  function exigir(perfil) {
    if (sessao() === perfil) return true;
    const destino = encodeURIComponent(paginaAtual() + (window.__NORDEN_QUERY ?? location.search) + location.hash);
    ir('login.html?perfil=' + perfil + '&voltar=' + destino, true);
    return false;
  }

  // ============================== AGENDA ==============================
  function reservasAtivas(profId, iso, ignorarId) {
    return carregar().reservas.filter(r => r.profId === profId && r.data === iso && ATIVAS.includes(r.status) && r.id !== ignorarId);
  }

  // Intervalos semiabertos [início, fim)
  function livre(profId, iso, inicio, duracao, ignorarId) {
    const fim = inicio + duracao + CONFIG.intervalo;
    const [aIni, aFim] = CONFIG.almoco;
    if (inicio < aFim && aIni < fim) return false;
    if (inicio < CONFIG.abertura || inicio + duracao > fechamentoDo(iso)) return false;
    return !reservasAtivas(profId, iso, ignorarId).some(r => inicio < r.inicio + r.duracao + CONFIG.intervalo && r.inicio < fim);
  }

  function horariosLivres(profId, iso, duracao, ignorarId) {
    const prof = profissional(profId);
    if (!prof || !prof.dias.includes(paraData(iso).getDay())) return [];
    const hoje = hojeIso();
    if (iso < hoje) return [];
    const minimo = iso === hoje ? agoraMin() + CONFIG.antecedencia : 0;
    const lista = [];
    for (let ini = CONFIG.abertura; ini + duracao <= fechamentoDo(iso); ini += CONFIG.passo) {
      if (ini >= minimo && livre(profId, iso, ini, duracao, ignorarId)) lista.push(ini);
    }
    return lista;
  }

  // NORDEN Flow (seção 10.2): reservas futuras que caberiam em uma janela liberada.
  // Critérios explícitos: mesmo profissional > aproveitamento da janela > maior antecipação.
  function sugestoesFlow(janela, limite = 8) {
    const tamanho = janela.fim - janela.inicio;
    const d = carregar();
    return d.reservas
      .filter(r => r.status === 'CONFIRMADO')                                                   // exclui canceladas, concluídas, faltas
      .filter(r => r.data > janela.data || (r.data === janela.data && r.inicio > janela.inicio)) // só antecipação
      .filter(r => r.duracao + CONFIG.intervalo <= tamanho)                                     // cabe na janela
      .filter(r => servico(r.servicoId).profissionais.includes(janela.profId))                  // profissional habilitado
      .filter(r => livre(janela.profId, janela.data, janela.inicio, r.duracao, r.id))           // sem conflitos
      .filter(r => !d.ofertas.some(o => o.reservaId === r.id && o.janelaId === janela.id && o.status === 'RECUSADA')) // recusou esta janela
      .filter(r => !d.ofertas.some(o => o.reservaId === r.id && o.status === 'PENDENTE' && o.janelaId !== janela.id))
      .map(r => {
        const ganhoDias = Math.round((paraData(r.data) - paraData(janela.data)) / 864e5);
        const aproveitamento = Math.round(r.duracao / tamanho * 100);
        const mesmoProf = r.profId === janela.profId;
        const motivos = [mesmoProf ? 'mesmo profissional' : 'profissional habilitado (troca exige aceite)',
          `ocupa ${aproveitamento}% da janela`, ganhoDias ? `antecipa ${ganhoDias} dia(s)` : 'antecipa no mesmo dia'];
        return { reserva: r, ganhoDias, aproveitamento, mesmoProf, motivo: motivos.join(' · ') };
      })
      .sort((a, b) => (b.mesmoProf - a.mesmoProf) || (b.aproveitamento - a.aproveitamento) || (b.ganhoDias - a.ganhoDias) || (a.reserva.inicio - b.reserva.inicio))
      .slice(0, limite);
  }

  // =========================== NOTIFICAÇÕES ===========================
  function notificar(para, texto, link) {
    carregar().notificacoes.unshift({ id: uid('n'), para, texto, link: link || '', lida: false, em: new Date().toISOString() });
  }
  const naoLidas = para => carregar().notificacoes.filter(n => n.para === para && !n.lida).length;

  // ============================= CARRINHO =============================
  function adicionarAoCarrinho(produtoId, qtd = 1) {
    const d = carregar();
    const item = d.carrinho.find(i => i.id === produtoId);
    const atual = item ? item.qtd : 0;
    const disponivel = d.estoque[produtoId] || 0;
    if (atual + qtd > disponivel) {
      toast('Quantidade indisponível em estoque.');
      return false;
    }
    if (item) item.qtd += qtd; else d.carrinho.push({ id: produtoId, qtd });
    salvar();
    atualizarContadorCarrinho();
    toast('<strong>' + esc(PRODUTOS[produtoId].nome) + '</strong> adicionado ao carrinho. <a href="carrinho.html">Ver carrinho</a>');
    return true;
  }
  const itensCarrinho = () => carregar().carrinho.reduce((s, i) => s + i.qtd, 0);

  function taxaEntrega(km) {
    const { base, porKm, raioMaxKm } = CONFIG.entrega;
    if (!(km > 0) || km > raioMaxKm) return null;
    return Math.round((base + porKm * km) * 100) / 100;
  }

  // ============================== TOAST ==============================
  let timerToast;
  function toast(html) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.classList.add('visivel');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => el.classList.remove('visivel'), 3600);
  }

  // ===================== CABEÇALHO COM MENUS SUSPENSOS =====================
  function menus() {
    const perfil = sessao();
    const notif = perfil ? naoLidas(perfil) : 0;
    const grupos = [
      { id: 'salao', titulo: 'O Salão', itens: [
        ['servicos.html', 'Serviços', 'Preços, durações e detalhes'],
        ['profissionais.html', 'Profissionais', 'Especialidades da equipe'],
        ['index.html#como-funciona', 'Como funciona', 'Antes, durante e depois'],
        ['contato.html', 'Contato e dúvidas', 'Horários, endereço e FAQ']
      ] },
      { id: 'loja', titulo: 'Loja', itens: [
        ['loja.html', 'Todos os produtos', 'Retirada no salão ou entrega'],
        ['loja.html?cat=Cabelo', 'Cabelo', ''],
        ['loja.html?cat=Barba', 'Barba', ''],
        ['loja.html?cat=Pele', 'Pele', ''],
        ['carrinho.html', 'Carrinho', 'Revise e finalize seu pedido']
      ] }
    ];
    if (perfil === 'cliente') grupos.push({ id: 'conta', titulo: 'Minha conta', itens: [
      ['cliente.html#inicio', 'Início', 'Resumo da sua conta'],
      ['cliente.html#agendamentos', 'Meus agendamentos', 'Próximos e anteriores'],
      ['cliente.html#ofertas', 'Ofertas de horário', 'Antecipações do NORDEN Flow'],
      ['cliente.html#jornada', 'Minha jornada', 'Histórico e cuidados'],
      ['cliente.html#pedidos', 'Meus pedidos', 'Compras da loja'],
      ['cliente.html#notificacoes', 'Notificações' + (notif ? ' (' + notif + ')' : ''), ''],
      ['cliente.html#perfil', 'Perfil e privacidade', 'Dados, preferências e alertas'],
      ['#sair', 'Sair', '']
    ] });
    if (perfil === 'gestor') grupos.push({ id: 'gestao', titulo: 'Gestão', itens: [
      ['gestao.html#painel', 'Painel', 'Indicadores do dia'],
      ['gestao.html#agenda', 'Agenda', 'Atendimentos por profissional'],
      ['gestao.html#flow', 'NORDEN Flow', 'Encaixes após cancelamentos'],
      ['gestao.html#estoque', 'Produtos e estoque', 'Disponibilidade e ajustes'],
      ['gestao.html#pedidos', 'Pedidos da loja', 'Separação e entrega'],
      ['gestao.html#manuais', 'Manuais de cuidados', 'Biblioteca por serviço'],
      ['gestao.html#notificacoes', 'Notificações' + (notif ? ' (' + notif + ')' : ''), ''],
      ['#sair', 'Sair', '']
    ] });
    return grupos;
  }

  function cabecalho() {
    const alvo = document.getElementById('topo');
    if (!alvo) return;
    const perfil = sessao();
    const nomePerfil = perfil === 'cliente' ? carregar().perfil.nome : perfil === 'gestor' ? GESTOR_DEMO.nome : '';
    const grupos = menus();

    const htmlGrupo = g => `
      <li class="menu-grupo">
        <button type="button" class="menu-gatilho" aria-expanded="false" aria-controls="menu-${g.id}">
          ${g.titulo}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <ul class="menu-suspenso" id="menu-${g.id}" hidden>
          ${g.itens.map(([href, txt, sub]) => `<li><a href="${href}"${href === '#sair' ? ' data-sair' : ''}><span>${txt}</span>${sub ? `<small>${sub}</small>` : ''}</a></li>`).join('')}
        </ul>
      </li>`;

    alvo.className = 'cabecalho';
    alvo.innerHTML = `
      <div class="container">
        <a href="index.html" class="marca" aria-label="NORDEN — página inicial">
          <span class="marca-nome">NORDEN</span>
          <span class="marca-sub">Salão masculino premium</span>
        </a>
        <nav class="nav-menus" id="nav-menus" aria-label="Navegação principal">
          <ul class="menu-raiz">${grupos.map(htmlGrupo).join('')}</ul>
          <div class="nav-movel-extra">
            <a href="agendar.html" class="btn btn-primario btn-bloco" style="margin-bottom:1rem">Agendar horário</a>
            ${perfil ? `<p class="sessao-info">Conectado como <strong>${esc(nomePerfil)}</strong> · demonstração</p>` : '<a href="login.html" class="btn btn-contorno btn-bloco">Entrar</a>'}
          </div>
        </nav>
        <div class="acoes-cabecalho">
          ${perfil ? `<span class="sessao-chip" title="Sessão de demonstração">${perfil === 'gestor' ? 'Gestão' : 'Cliente'} · ${esc(nomePerfil)}</span>` : '<a href="login.html" class="link-entrar">Entrar</a>'}
          <a href="carrinho.html" class="btn-carrinho" aria-label="Carrinho">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16l-1.5 13h-13z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
            <span class="contador-carrinho" data-contador-carrinho hidden>0</span>
          </a>
          <a href="agendar.html" class="btn btn-primario">Agendar</a>
          <button class="btn-menu" type="button" aria-expanded="false" aria-controls="nav-menus" aria-label="Abrir menu"><span></span></button>
        </div>
      </div>`;

    // Abrir/fechar menus suspensos
    const gatilhos = alvo.querySelectorAll('.menu-gatilho');
    const fecharTodos = exceto => gatilhos.forEach(g => {
      if (g === exceto) return;
      g.setAttribute('aria-expanded', 'false');
      document.getElementById(g.getAttribute('aria-controls')).hidden = true;
    });
    gatilhos.forEach(g => g.addEventListener('click', e => {
      e.stopPropagation();
      const aberto = g.getAttribute('aria-expanded') === 'true';
      fecharTodos(g);
      g.setAttribute('aria-expanded', String(!aberto));
      document.getElementById(g.getAttribute('aria-controls')).hidden = aberto;
    }));
    document.addEventListener('click', e => { if (!alvo.contains(e.target)) fecharTodos(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const aberto = alvo.querySelector('.menu-gatilho[aria-expanded="true"]');
      fecharTodos();
      if (aberto) aberto.focus();
    });
    alvo.querySelectorAll('.menu-suspenso a').forEach(a => a.addEventListener('click', () => {
      fecharTodos();
      alvo.querySelector('.nav-menus').classList.remove('aberto');
      alvo.querySelector('.btn-menu').setAttribute('aria-expanded', 'false');
    }));

    // Menu móvel
    const btnMenu = alvo.querySelector('.btn-menu');
    btnMenu.addEventListener('click', () => {
      const aberto = btnMenu.getAttribute('aria-expanded') === 'true';
      btnMenu.setAttribute('aria-expanded', String(!aberto));
      btnMenu.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
      alvo.querySelector('.nav-menus').classList.toggle('aberto', !aberto);
    });

    alvo.querySelectorAll('[data-sair]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); sair(); }));
    atualizarContadorCarrinho();
  }

  function atualizarContadorCarrinho() {
    const n = itensCarrinho();
    document.querySelectorAll('[data-contador-carrinho]').forEach(el => { el.textContent = n; el.hidden = n === 0; });
  }

  function rodape() {
    const alvo = document.getElementById('rodape');
    if (!alvo) return;
    alvo.className = 'rodape';
    alvo.innerHTML = `
      <div class="container">
        <div class="rodape-grade">
          <div class="rodape-sobre">
            <a href="index.html" class="marca" aria-label="NORDEN — página inicial">
              <span class="marca-nome">NORDEN</span>
              <span class="marca-sub">Salão masculino premium</span>
            </a>
            <p>Salão inteligente masculino: agendamento, histórico, cuidados e loja em um só lugar.</p>
          </div>
          <div><h4>O Salão</h4><ul>
            <li><a href="servicos.html">Serviços</a></li><li><a href="profissionais.html">Profissionais</a></li>
            <li><a href="index.html#como-funciona">Como funciona</a></li><li><a href="contato.html">Contato e dúvidas</a></li></ul></div>
          <div><h4>Loja</h4><ul>
            <li><a href="loja.html">Produtos</a></li><li><a href="carrinho.html">Carrinho</a></li>
            <li><a href="agendar.html">Agendar</a></li><li><a href="login.html">Entrar</a></li></ul></div>
          <div><h4>Demonstração</h4><ul>
            <li><a href="index.html#privacidade">Privacidade</a></li>
            <li><a href="#" data-redefinir>Redefinir dados de demonstração</a></li></ul></div>
        </div>
        <div class="rodape-base">
          <span>© ${new Date().getFullYear()} NORDEN — projeto acadêmico em desenvolvimento.</span>
          <span>Wordmark provisório · dados fictícios salvos apenas neste navegador.</span>
        </div>
      </div>`;
    alvo.querySelector('[data-redefinir]').addEventListener('click', e => {
      e.preventDefault();
      confirmarAcao('Redefinir demonstração', 'Apagar agendamentos, pedidos e alterações feitas nesta demonstração e voltar aos dados iniciais?', 'Redefinir', () => {
        redefinir();
        location.reload();
      });
    });
  }

  // ===================== MODAL ACESSÍVEL (sem confirm() nativo) =====================
  // acoes: [{ texto, classe, aoClicar(fechar, dlg) }]
  function modal({ titulo, corpo, acoes = [], aoAbrir }) {
    const dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.setAttribute('aria-labelledby', 'modal-titulo');
    dlg.innerHTML = `
      <div class="modal-cabeca">
        <h2 id="modal-titulo">${titulo}</h2>
        <button type="button" class="modal-fechar" aria-label="Fechar">×</button>
      </div>
      <div class="modal-corpo">${corpo}</div>
      <div class="modal-acoes"></div>`;
    const fechar = () => { dlg.close(); dlg.remove(); };
    dlg.querySelector('.modal-fechar').addEventListener('click', fechar);
    dlg.addEventListener('cancel', e => { e.preventDefault(); fechar(); });
    const areaAcoes = dlg.querySelector('.modal-acoes');
    acoes.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + (a.classe || 'btn-escuro');
      b.textContent = a.texto;
      b.addEventListener('click', () => a.aoClicar ? a.aoClicar(fechar, dlg) : fechar());
      areaAcoes.appendChild(b);
    });
    document.body.appendChild(dlg);
    dlg.showModal();
    if (aoAbrir) aoAbrir(dlg, fechar);
    return { dlg, fechar };
  }

  function confirmarAcao(titulo, texto, rotuloConfirmar, aoConfirmar) {
    modal({
      titulo, corpo: `<p>${texto}</p>`,
      acoes: [
        { texto: 'Voltar', classe: 'btn-contorno-escuro' },
        { texto: rotuloConfirmar, classe: 'btn-perigo', aoClicar: fechar => { fechar(); aoConfirmar(); } }
      ]
    });
  }

  // ============================== LOGO ==============================
  // Símbolo NORDEN (vetor redesenhado a partir de img/logo-norden.jpg)
  const SIMBOLO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" aria-hidden="true" focusable="false"><defs><linearGradient id="nb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E2C29C"/><stop offset=".45" stop-color="#B9895C"/><stop offset="1" stop-color="#8E6B47"/></linearGradient></defs><polygon fill="url(#nb)" points="50,2 63,34 55,30 50,42 45,30 37,34"/><g fill="none" stroke="url(#nb)" stroke-width="4.4" stroke-linejoin="miter"><path d="M34 48 L8 100 L29 83"/><path d="M66 48 L92 100 L71 83"/><path d="M22 22 L63.5 92"/><path d="M78 22 L36.5 92"/><circle cx="32" cy="100.5" r="7.2" stroke-width="3.8"/><circle cx="68" cy="100.5" r="7.2" stroke-width="3.8"/><path d="M26 105.5 Q23.5 113 15.5 114" stroke-width="3" stroke-linecap="round"/><path d="M74 105.5 Q76.5 113 84.5 114" stroke-width="3" stroke-linecap="round"/></g><circle cx="50" cy="68.6" r="1.7" fill="#0B0B0D"/></svg>';

  // Cada cópia recebe um id de gradiente próprio (um gradiente dentro de elemento oculto não pinta as demais)
  let contadorLogo = 0;
  const simbolo = () => { const id = 'nb' + (++contadorLogo); return SIMBOLO_SVG.replace('id="nb"', `id="${id}"`).replaceAll('url(#nb)', `url(#${id})`); };

  function aplicarLogo() {
    // Ao lado do nome em todas as marcas (cabeçalho, rodapé, login, cadastro)
    document.querySelectorAll('.marca').forEach(m => {
      if (m.querySelector('.marca-simbolo')) return;
      m.insertAdjacentHTML('afterbegin', '<span class="marca-simbolo">' + simbolo() + '</span>');
    });
    // Versões grandes marcadas com data-logo
    document.querySelectorAll('[data-logo]').forEach(el => { if (!el.innerHTML.trim()) el.innerHTML = simbolo(); });
    // Ícone da aba
    if (!document.querySelector('link[rel="icon"]')) {
      const icone = document.createElement('link');
      icone.rel = 'icon';
      icone.type = 'image/svg+xml';
      icone.href = 'data:image/svg+xml,' + encodeURIComponent(SIMBOLO_SVG);
      document.head.appendChild(icone);
    }
  }

  // Selo de status acessível (texto + cor, nunca só cor)
  const selo = (status, mapa) => `<span class="selo selo-${status.toLowerCase()}">${(mapa || STATUS_RESERVA)[status] || status}</span>`;

  document.addEventListener('DOMContentLoaded', () => { carregar(); cabecalho(); rodape(); aplicarLogo(); });

  return {
    SERVICOS, PROFISSIONAIS, PRODUTOS, MANUAIS_PADRAO, CONFIG, STATUS_RESERVA, STATUS_PEDIDO, CLIENTE_DEMO, GESTOR_DEMO, ATIVAS,
    moeda, hora, duracaoTexto, isoData, paraData, hojeIso, somarDias, dataLonga, dataCurta, agoraMin, uid, codigo, esc,
    servico, profissional, fechamentoDo, salaoAberto,
    db: carregar, salvar, redefinir, novaReserva,
    sessao, entrar, sair, exigir, ir, params, paginaAtual,
    reservasAtivas, livre, horariosLivres, sugestoesFlow,
    notificar, naoLidas, adicionarAoCarrinho, itensCarrinho, taxaEntrega, atualizarContadorCarrinho,
    toast, selo, cabecalho, modal, confirmar: confirmarAcao
  };
})();

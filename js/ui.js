/* =========================================================
   NORDEN — Utilitários de interface das áreas logadas
   Navegação por seções (hash); o modal fica em core.js
   ========================================================= */

// Roteador simples por hash: #secao ou #secao/parametro
N.roteador = function ({ secoes, padrao, aoMudar }) {
  const lateral = document.getElementById('app-lateral');
  const seletor = document.getElementById('seletor-secao');

  function montarMenus() {
    const itens = secoes.filter(s => !s.oculta);
    lateral.innerHTML = `<p>${lateral.dataset.titulo}</p>` + itens.map(s =>
      `<a href="#${s.id}" data-secao="${s.id}">${s.titulo}${s.contador && s.contador() ? `<span class="contador">${s.contador()}</span>` : ''}</a>`).join('');
    seletor.innerHTML = `
      <label class="sr-only" for="seletor">Ir para a seção</label>
      <div class="campo"><select id="seletor">${itens.map(s =>
        `<option value="${s.id}">${s.titulo}${s.contador && s.contador() ? ` (${s.contador()})` : ''}</option>`).join('')}</select></div>`;
    seletor.querySelector('select').addEventListener('change', e => { location.hash = e.target.value; });
  }

  function navegar() {
    const [id, param] = location.hash.replace('#', '').split('/');
    const secao = secoes.find(s => s.id === id) || secoes.find(s => s.id === padrao);
    montarMenus();
    const ativo = secao.oculta ? secao.pai : secao.id;
    lateral.querySelectorAll('a').forEach(a => {
      if (a.dataset.secao === ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    seletor.querySelector('select').value = ativo;
    aoMudar(secao, param);
  }

  window.addEventListener('hashchange', () => { navegar(); window.scrollTo({ top: 0 }); });
  return { navegar, atualizarMenus: montarMenus };
};

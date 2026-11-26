/* =========================================================
   NORDEN — Login, cadastro e recuperação de senha
   MODO DEMONSTRAÇÃO: valida apenas no navegador.
   Nenhum dado é enviado, salvo ou guardado em localStorage.
   A autenticação real deve ser feita no servidor.
   ========================================================= */

// ---------------- Utilitários de validação ----------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarErro(campo, mensagem) {
  const erro = document.getElementById(campo.id + '-erro');
  campo.setAttribute('aria-invalid', 'true');
  if (erro) erro.textContent = mensagem;
}

function limparErro(campo) {
  const erro = document.getElementById(campo.id + '-erro');
  campo.removeAttribute('aria-invalid');
  if (erro) erro.textContent = '';
}

// Aplica uma regra a um campo; retorna true se válido
function validar(campo, regra) {
  const mensagem = regra(campo.value.trim());
  if (mensagem) { mostrarErro(campo, mensagem); return false; }
  limparErro(campo);
  return true;
}

const regras = {
  email: v => !v ? 'Informe seu e-mail.' : !EMAIL_REGEX.test(v) ? 'Digite um e-mail válido, como nome@exemplo.com.' : '',
  senhaLogin: v => !v ? 'Informe sua senha.' : '',
  nome: v => !v ? 'Informe seu nome completo.' : v.split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : '',
  telefone: v => {
    const digitos = v.replace(/\D/g, '');
    if (!digitos) return 'Informe seu celular.';
    return digitos.length < 10 || digitos.length > 11 ? 'Digite o número com DDD, como (48) 99999-9999.' : '';
  },
  nascimento: v => {
    if (!v) return '';
    const data = new Date(v + 'T00:00:00');
    return data > new Date() ? 'A data de nascimento não pode estar no futuro.' : '';
  },
  senhaNova: v => {
    if (!v) return 'Crie uma senha.';
    return checarSenha(v).every(Boolean) ? '' : 'A senha não atende a todos os requisitos abaixo.';
  }
};

function checarSenha(v) {
  return [v.length >= 8, /[A-Za-zÀ-ÿ]/.test(v), /\d/.test(v)];
}

// Erros somem enquanto a pessoa corrige; aparecem ao sair do campo
function ligarValidacao(campo, regra) {
  if (!campo) return;
  campo.addEventListener('blur', () => { if (campo.value.trim()) validar(campo, regra); });
  campo.addEventListener('input', () => { if (campo.getAttribute('aria-invalid')) validar(campo, regra); });
}

function focarPrimeiroErro(container) {
  const invalido = container.querySelector('[aria-invalid="true"]');
  if (invalido) invalido.focus();
}

function definirStatus(form, mensagem, tipo) {
  const status = form.querySelector('.form-status');
  if (!status) return;
  status.className = 'form-status' + (tipo ? ' ' + tipo : '');
  status.innerHTML = mensagem;
}

// Simula a espera de uma requisição para exibir o estado de carregamento
function simularEnvio(botao, aoConcluir) {
  const texto = botao.textContent;
  botao.disabled = true;
  botao.classList.add('carregando');
  botao.textContent = 'Aguarde';
  setTimeout(() => {
    botao.disabled = false;
    botao.classList.remove('carregando');
    botao.textContent = texto;
    aoConcluir();
  }, 800);
}

// ---------------- Mostrar / ocultar senha ----------------
document.querySelectorAll('.btn-ver-senha').forEach(botao => {
  botao.addEventListener('click', () => {
    const campo = document.getElementById(botao.getAttribute('aria-controls'));
    const visivel = campo.type === 'text';
    campo.type = visivel ? 'password' : 'text';
    botao.textContent = visivel ? 'Mostrar' : 'Ocultar';
    botao.setAttribute('aria-pressed', String(!visivel));
  });
});

// ---------------- Aviso de telas futuras ----------------
const toast = document.getElementById('toast');
let timerToast;
document.querySelectorAll('[data-em-breve]').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    if (!toast) return;
    toast.innerHTML = '<strong>' + el.dataset.emBreve + '</strong> — tela em construção nas próximas etapas do projeto.';
    toast.classList.add('visivel');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove('visivel'), 3200);
  })
);

/* =========================================================
   LOGIN + RECUPERAR SENHA (login.html)
   ========================================================= */
const formLogin = document.getElementById('form-login');

if (formLogin) {
  const painelLogin = document.getElementById('painel-login');
  const painelRecuperar = document.getElementById('painel-recuperar');
  const formRecuperar = document.getElementById('form-recuperar');

  const loginEmail = document.getElementById('login-email');
  const loginSenha = document.getElementById('login-senha');
  const recuperarEmail = document.getElementById('recuperar-email');

  ligarValidacao(loginEmail, regras.email);
  ligarValidacao(loginSenha, regras.senhaLogin);
  ligarValidacao(recuperarEmail, regras.email);

  function abrirPainel(nome, focar) {
    const recuperar = nome === 'recuperar';
    painelLogin.hidden = recuperar;
    painelRecuperar.hidden = !recuperar;
    document.title = (recuperar ? 'Recuperar senha' : 'Entrar') + ' — NORDEN';
    if (recuperar && loginEmail.value && !recuperarEmail.value) recuperarEmail.value = loginEmail.value;
    if (focar) (recuperar ? document.getElementById('titulo-recuperar') : loginEmail).focus();
  }

  document.querySelectorAll('[data-abrir-painel]').forEach(link =>
    link.addEventListener('click', e => {
      e.preventDefault();
      const nome = link.dataset.abrirPainel;
      history.replaceState(null, '', '#' + nome);
      abrirPainel(nome, true);
    })
  );

  if (location.hash === '#recuperar') abrirPainel('recuperar', false);

  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    definirStatus(formLogin, '');
    const ok = [validar(loginEmail, regras.email), validar(loginSenha, regras.senhaLogin)].every(Boolean);
    if (!ok) { focarPrimeiroErro(formLogin); return; }

    simularEnvio(formLogin.querySelector('[type="submit"]'), () => {
      // Sem servidor de autenticação: entra com o perfil fictício de cliente
      definirStatus(formLogin,
        '<strong>Dados válidos.</strong> Modo demonstração: entrando com a conta fictícia de cliente. Nada foi enviado.',
        'info');
      loginSenha.value = '';
      setTimeout(() => entrarDemo('cliente'), 900);
    });
  });

  // Acesso rápido por perfil de demonstração
  const params = N.params();
  function entrarDemo(perfil) {
    N.entrar(perfil);
    const voltar = params.get('voltar');
    const seguro = voltar && /^[a-z]+\.html([?#][^:]*)?$/i.test(voltar); // apenas páginas locais
    N.ir(seguro ? voltar : (perfil === 'gestor' ? 'gestao.html' : 'cliente.html'));
  }
  document.querySelectorAll('[data-entrar-demo]').forEach(b =>
    b.addEventListener('click', () => entrarDemo(b.dataset.entrarDemo)));

  // Chegou aqui por uma página protegida: explica o motivo
  if (params.get('perfil')) {
    definirStatus(formLogin, params.get('perfil') === 'gestor'
      ? 'Esta área é exclusiva da equipe. Entre com o perfil de gestão.'
      : 'Entre na sua conta para continuar.', 'info');
  }

  formRecuperar.addEventListener('submit', e => {
    e.preventDefault();
    definirStatus(formRecuperar, '');
    if (!validar(recuperarEmail, regras.email)) { recuperarEmail.focus(); return; }

    simularEnvio(formRecuperar.querySelector('[type="submit"]'), () => {
      // Mensagem neutra: não revela se o e-mail possui conta
      definirStatus(formRecuperar,
        'Se houver uma conta com este e-mail, você receberá as instruções em instantes. <br><small>Demonstração: nenhum e-mail foi enviado.</small>',
        'info');
    });
  });
}

/* =========================================================
   CADASTRO EM DUAS ETAPAS (cadastro.html)
   ========================================================= */
const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
  const etapas = formCadastro.querySelectorAll('.etapa-form');
  const indicadores = document.querySelectorAll('.etapas-form li');
  const titulo = document.getElementById('titulo-cadastro');

  const nome = document.getElementById('cad-nome');
  const email = document.getElementById('cad-email');
  const telefone = document.getElementById('cad-telefone');
  const nascimento = document.getElementById('cad-nascimento');
  const senha = document.getElementById('cad-senha');
  const confirmar = document.getElementById('cad-confirmar');

  const detalheAlergia = document.getElementById('detalhe-alergia');
  const alergiaDetalhe = document.getElementById('cad-alergia-detalhe');
  const consentimentoSaude = document.getElementById('cad-consentimento-saude');
  const avisoNaoSei = document.getElementById('aviso-nao-sei');
  const termos = document.getElementById('cad-termos');

  const regraConfirmar = v => !v ? 'Repita a senha.' : v !== senha.value ? 'As senhas não coincidem.' : '';

  ligarValidacao(nome, regras.nome);
  ligarValidacao(email, regras.email);
  ligarValidacao(telefone, regras.telefone);
  ligarValidacao(nascimento, regras.nascimento);
  ligarValidacao(senha, regras.senhaNova);
  ligarValidacao(confirmar, regraConfirmar);

  // Não permite data futura no seletor
  nascimento.max = new Date().toISOString().split('T')[0];

  // Máscara de celular: (00) 00000-0000
  telefone.addEventListener('input', () => {
    const d = telefone.value.replace(/\D/g, '').slice(0, 11);
    let r = d;
    if (d.length > 2) r = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) r = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    telefone.value = r;
  });

  // Checklist da senha ao vivo
  const itensRegra = document.querySelectorAll('#cad-senha-regras li');
  senha.addEventListener('input', () => {
    checarSenha(senha.value).forEach((ok, i) => itensRegra[i].classList.toggle('ok', ok));
    if (confirmar.value) validar(confirmar, regraConfirmar);
  });

  // Navegação entre etapas
  function irParaEtapa(numero) {
    etapas.forEach(et => { et.hidden = et.dataset.etapa !== String(numero); });
    indicadores.forEach((li, i) => {
      const n = i + 1;
      li.classList.toggle('ativa', n === numero);
      li.classList.toggle('concluida', n < numero);
      if (n === numero) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    titulo.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validarEtapa1() {
    const ok = [
      validar(nome, regras.nome),
      validar(email, regras.email),
      validar(telefone, regras.telefone),
      validar(nascimento, regras.nascimento),
      validar(senha, regras.senhaNova),
      validar(confirmar, regraConfirmar)
    ].every(Boolean);
    if (!ok) focarPrimeiroErro(etapas[0]);
    return ok;
  }

  formCadastro.querySelectorAll('[data-ir-etapa]').forEach(botao =>
    botao.addEventListener('click', () => {
      const destino = Number(botao.dataset.irEtapa);
      if (destino === 2 && !validarEtapa1()) return;
      irParaEtapa(destino);
    })
  );

  // Alergias: campos condicionais
  const radiosAlergia = formCadastro.querySelectorAll('input[name="alergia"]');
  const erroAlergia = document.getElementById('cad-alergia-erro');

  radiosAlergia.forEach(radio =>
    radio.addEventListener('change', () => {
      const valor = radio.value;
      erroAlergia.textContent = '';
      detalheAlergia.hidden = valor !== 'sim';
      avisoNaoSei.hidden = valor !== 'nao-sei';
      if (valor !== 'sim') {
        // Não manter dado sensível que a pessoa decidiu não informar
        alergiaDetalhe.value = '';
        consentimentoSaude.checked = false;
        limparErro(alergiaDetalhe);
        limparErro(consentimentoSaude);
      }
    })
  );

  ligarValidacao(alergiaDetalhe, v => v.length < 3 ? 'Descreva brevemente a substância ou o produto.' : '');
  consentimentoSaude.addEventListener('change', () => limparErro(consentimentoSaude));
  termos.addEventListener('change', () => limparErro(termos));

  function validarEtapa2() {
    let ok = true;
    const alergia = formCadastro.querySelector('input[name="alergia"]:checked');

    if (!alergia) {
      erroAlergia.textContent = 'Escolha uma opção. Você pode responder "Prefiro informar ao profissional".';
      ok = false;
    } else if (alergia.value === 'sim') {
      if (!validar(alergiaDetalhe, v => v.length < 3 ? 'Descreva brevemente a substância ou o produto.' : '')) ok = false;
      if (!consentimentoSaude.checked) {
        mostrarErro(consentimentoSaude, 'Para registrar a alergia, precisamos da sua autorização.');
        ok = false;
      }
    }

    if (!termos.checked) {
      mostrarErro(termos, 'Aceite os termos e a política de privacidade para criar a conta.');
      ok = false;
    }

    if (!ok) {
      if (!alergia) radiosAlergia[0].focus(); else focarPrimeiroErro(etapas[1]);
    }
    return ok;
  }

  formCadastro.addEventListener('submit', e => {
    e.preventDefault();
    definirStatus(formCadastro, '');

    // Garante que a etapa 1 continua válida antes de concluir
    if (!validarEtapa1()) { irParaEtapa(1); return; }
    if (!validarEtapa2()) return;

    simularEnvio(formCadastro.querySelector('[type="submit"]'), () => {
      const primeiroNome = nome.value.trim().split(/\s+/)[0];
      document.getElementById('sucesso-nome').textContent = primeiroNome;
      formCadastro.reset(); // descarta todos os dados digitados
      document.getElementById('area-cadastro').hidden = true;
      const sucesso = document.getElementById('cadastro-sucesso');
      sucesso.hidden = false;
      document.getElementById('titulo-sucesso').focus();
    });
  });
}

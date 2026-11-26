/* NORDEN — Efeitos das páginas públicas (landing e contato) */
document.body.classList.remove('sem-js');

// Revelação sutil ao rolar (desativada com movimento reduzido)
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const itensRevelar = document.querySelectorAll('.revelar');
if (reduzirMovimento || !('IntersectionObserver' in window)) {
  itensRevelar.forEach(el => el.classList.add('visivel'));
} else {
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });
  itensRevelar.forEach(el => observador.observe(el));
}

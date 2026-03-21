function go(id, el) {
  ['home', 'projects', 'writing'].forEach(p => {
    document.getElementById('p-' + p).classList.toggle('on', p === id);
  });
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('on'));
  el.classList.add('on');
}

function toggle(card) {
  const body = card.querySelector('.pc-body');
  const tog = card.querySelector('.pc-toggle');
  const blurb = card.querySelector('.pc-blurb');
  const open = body.classList.toggle('on');
  tog.textContent = open ? '[-]' : '[+]';
  blurb.style.visibility = open ? 'hidden' : 'visible';
}

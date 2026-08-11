const actions={
  codex:()=>window.open('https://chatgpt.com/codex','_blank','noopener,noreferrer'),
  files:()=>alert('Repository file inspection is ready to be wired to the authenticated server endpoint.'),
  branches:()=>alert('Branch management is ready to be wired to the authenticated server endpoint.'),
  pulls:()=>alert('Pull-request review is ready to be wired to the authenticated server endpoint.')
};
document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>actions[el.dataset.action]?.()));

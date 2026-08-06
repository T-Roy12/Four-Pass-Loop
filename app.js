const navButtons = [...document.querySelectorAll('.bottom-nav button')];
const views = [...document.querySelectorAll('.view')];
const dayButtons = [...document.querySelectorAll('.day-switcher button')];
const dayPanels = [...document.querySelectorAll('.day-panel')];
const boxes = [...document.querySelectorAll('input[type="checkbox"][data-key]')];
const gearBoxes = boxes.filter(box => box.dataset.key.startsWith('gear-'));
const milestoneBoxes = boxes.filter(box => box.dataset.key.startsWith('photo-') || box.dataset.key.startsWith('d1-') || box.dataset.key.startsWith('d2-'));

function showView(id) {
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.view === id));
  views.forEach(view => view.classList.toggle('active', view.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.getElementById('startTodayBtn')?.addEventListener('click', () => showView('today'));

dayButtons.forEach(button => button.addEventListener('click', () => {
  dayButtons.forEach(item => item.classList.toggle('active', item === button));
  dayPanels.forEach(panel => panel.classList.toggle('active', panel.id === button.dataset.day));
}));

function updateTaskCounts() {
  document.querySelectorAll('.camp-checks').forEach(section => {
    const items = [...section.querySelectorAll('input[type="checkbox"]')];
    const done = items.filter(item => item.checked).length;
    section.querySelector('.task-count').textContent = `${done} / ${items.length}`;
  });
}

function updateProgress() {
  const gearDone = gearBoxes.filter(box => box.checked).length;
  const gearPct = gearBoxes.length ? Math.round(gearDone / gearBoxes.length * 100) : 0;
  document.getElementById('gearCount').textContent = `${gearDone} / ${gearBoxes.length} packed`;
  const gearRing = document.getElementById('gearRing');
  gearRing.textContent = `${gearPct}%`;
  gearRing.style.background = `conic-gradient(var(--pine) ${gearPct}%, #e4ebe6 0)`;

  const done = milestoneBoxes.filter(box => box.checked).length;
  const pct = milestoneBoxes.length ? Math.round(done / milestoneBoxes.length * 100) : 0;
  document.getElementById('milestoneCount').textContent = `${done} / ${milestoneBoxes.length}`;
  document.getElementById('tripProgressBar').style.width = `${pct}%`;
  document.getElementById('tripPercent').textContent = `${pct}%`;
  document.querySelector('.trip-ring').style.background = `conic-gradient(var(--pine) ${pct}%, #e4ebe6 0)`;
  updateTaskCounts();
}

boxes.forEach(box => {
  box.checked = localStorage.getItem(box.dataset.key) === 'true';
  box.addEventListener('change', () => {
    localStorage.setItem(box.dataset.key, String(box.checked));
    updateProgress();
  });
});

document.querySelectorAll('textarea[data-note]').forEach(area => {
  area.value = localStorage.getItem(area.dataset.note) || '';
  area.addEventListener('input', () => localStorage.setItem(area.dataset.note, area.value));
});

document.querySelectorAll('.waypoint').forEach(button => button.addEventListener('click', () => {
  const detail = document.getElementById('routeDetail');
  detail.querySelector('h3').textContent = button.querySelector('strong').textContent;
  detail.querySelector('p').textContent = button.dataset.detail;
  detail.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

document.getElementById('resetBtn')?.addEventListener('click', () => {
  boxes.forEach(box => {
    box.checked = false;
    localStorage.removeItem(box.dataset.key);
  });
  updateProgress();
});

updateProgress();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}

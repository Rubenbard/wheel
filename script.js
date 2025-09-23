const chartSection = document.getElementById('chart-section');
let chartInstance = null;

const categories = [
  {
    label: 'Work & career',
    subtitle:
      'To what extent are you satisfied with your job? Is it the job you had in mind, or would you prefer to pursue a different career? Does your work bring you happiness and fulfillment? Do you earn enough to cover your living expenses? And so on.'
  },
  {
    label: 'FInances',
    subtitle:
      'Is your income sufficient to meet all your basic and other needs? Are you free from reliance on loans? Are you debt-free? Is money the only thing that makes you happy? And so on.'
  },
  {
    label: 'Health',
    subtitle:
      'How physically and mentally healthy are you? How do you feel? Are you satisfied with your appearance and weight? Do you struggle with physical discomfort? To what extent are you engaged in exercise and sport? And so on.'
  },
  {
    label: 'Family & friends',
    subtitle:
      'Are your family and/or friends supportive, unconditional, and trustworthy? Can you rely on your friendships and always turn to them? To what extent do you spend leisure time with family and/or friends? And so on.'
  },
  {
    label: 'Love & romance',
    subtitle:
      'Have you found happiness in love? Do you have a new partner or a steady partner you can rely on? And so on.'
  },
  {
    label: 'Personal growth & development',
    subtitle:
      'How do you approach personal growth? Are you open to new experiences and willing to learn? Are you connected to both your inner and outer worlds? And so on.'
  },
  {
    label: 'Relaxation & fun',
    subtitle:
      'Do you enjoy life? Do you pursue hobbies or take part in sports? How do you spend your free time—do you do the things you like? And so on.'
  },
  {
    label: 'Social contribution',
    subtitle:
      'Do you help others? Do you do volunteer work or provide informal care (caregiving)? To what extent are you active in (sports) clubs, in your neighborhood, or in supporting family?'
  }
];

const wizardState = {
  currentIndex: 0,
  values: new Array(categories.length).fill(null)
};

const stepNumEl = document.getElementById('step-num');
const stepTotalEl = document.getElementById('step-total');
const titleEl = document.getElementById('category-title');
const subtitleEl = document.getElementById('category-subtitle');
const scaleGridEl = document.getElementById('scale-grid');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');

stepTotalEl.textContent = String(categories.length);

function renderScale(selected) {
  scaleGridEl.innerHTML = '';
  for (let i = 0; i <= 10; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scale-btn';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(selected === i));
    btn.textContent = String(i);
    btn.addEventListener('click', () => {
      wizardState.values[wizardState.currentIndex] = i;
      renderScale(i);
      nextBtn.disabled = false;
      submitBtn.disabled = false;
    });
    scaleGridEl.appendChild(btn);
  }
}

function renderStep() {
  const idx = wizardState.currentIndex;
  const { label, subtitle } = categories[idx];
  titleEl.textContent = label;
  subtitleEl.textContent = subtitle;
  stepNumEl.textContent = String(idx + 1);

  const currentValue = wizardState.values[idx];
  renderScale(currentValue);

  backBtn.disabled = idx === 0;
  const isLast = idx === categories.length - 1;
  nextBtn.hidden = isLast;
  submitBtn.hidden = !isLast;
  nextBtn.disabled = currentValue == null;
  submitBtn.disabled = currentValue == null;
}

function renderChart(labels, values) {
  const ctx = document.getElementById('wheelChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Your Wheel',
          data: values,
          fill: true,
          backgroundColor: 'rgba(110, 168, 254, 0.25)',
          borderColor: 'rgba(110, 168, 254, 1)',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: 'rgba(0, 0, 0, 0.2)',
          pointHoverBackgroundColor: '#0a122a',
          pointHoverBorderColor: 'rgba(255, 255, 255, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#9aa3c7'
          },
          pointLabels: {
            color: '#ecf0ff',
            font: { weight: '600' }
          },
          grid: { color: 'rgba(255,255,255,0.15)' },
          angleLines: { color: 'rgba(255,255,255,0.12)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#ecf0ff' } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
          }
        }
      }
    }
  });
}

// Wizard navigation
nextBtn.addEventListener('click', () => {
  if (wizardState.values[wizardState.currentIndex] == null) return;
  wizardState.currentIndex += 1;
  renderStep();
});

backBtn.addEventListener('click', () => {
  if (wizardState.currentIndex === 0) return;
  wizardState.currentIndex -= 1;
  renderStep();
});

submitBtn.addEventListener('click', () => {
  if (wizardState.values.some((v) => v == null)) return;
  const labels = categories.map((c) => c.label);
  const values = wizardState.values.slice();
  chartSection.hidden = false;
  renderChart(labels, values);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

resetBtn.addEventListener('click', () => {
  wizardState.currentIndex = 0;
  wizardState.values = new Array(categories.length).fill(null);
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartSection.hidden = true;
  renderStep();
});

// Initial render
renderStep();



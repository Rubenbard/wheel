const formElement = document.getElementById('wheel-form');
const chartSection = document.getElementById('chart-section');
const resetButton = document.getElementById('reset-btn');
const valueBadges = Array.from(document.querySelectorAll('.value'));

// Live update numeric value labels under sliders
Array.from(document.querySelectorAll('input[type="range"]')).forEach((input) => {
  const badge = document.querySelector(`.value[data-for="${input.id}"]`);
  const update = () => { badge.textContent = String(input.value); };
  input.addEventListener('input', update);
  update();
});

let chartInstance = null;

function buildDatasetFromForm(form) {
  const labels = [];
  const values = [];
  Array.from(form.querySelectorAll('input[type="range"]')).forEach((input) => {
    labels.push(input.name);
    values.push(Number(input.value));
  });
  return { labels, values };
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

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const { labels, values } = buildDatasetFromForm(formElement);
  chartSection.hidden = false;
  renderChart(labels, values);
});

resetButton.addEventListener('click', () => {
  Array.from(formElement.querySelectorAll('input[type="range"]')).forEach((input) => {
    input.value = '5';
    const badge = document.querySelector(`.value[data-for="${input.id}"]`);
    badge.textContent = '5';
  });
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  chartSection.hidden = true;
});



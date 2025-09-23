const chartSection = document.getElementById('chart-section');
let chartInstance = null;

const categories = [
  {
    label: 'Work & career',
    subtitle:
      'To what extent are you satisfied with your job? Is it the job you had in mind, or would you prefer to pursue a different career? Does your work bring you happiness and fulfillment? Do you earn enough to cover your living expenses? And so on.'
  },
  {
    label: 'Finances',
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

// Per-category colors
const categoryColors = [
  '#6EA8FE', // Work & career
  '#F59E0B', // Finances
  '#10B981', // Health
  '#EC4899', // Family & friends
  '#8B5CF6', // Love & romance
  '#06B6D4', // Personal growth & development
  '#F43F5E', // Relaxation & fun
  '#A3E635'  // Social contribution
];

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
      // Auto-generate chart when the last step is answered
      const isLast = wizardState.currentIndex === categories.length - 1;
      if (isLast) {
        const labels = categories.map((c) => c.label);
        const values = wizardState.values.slice();
        chartSection.hidden = false;
        try {
          renderChart(labels, values);
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } catch (err) {
          console.error('Chart render error', err);
          alert('Unable to render chart. Please refresh and try again.');
        }
      }
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

  // Plugin to paint colored sectors for each category
  const sectorPlugin = {
    id: 'categorySectors',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      const rScale = chart.scales.r;
      if (!rScale) return;
      const centerX = rScale.xCenter;
      const centerY = rScale.yCenter;
      const radius = rScale.drawingArea;
      ctx.save();
      for (let i = 0; i < labels.length; i += 1) {
        const start = rScale.getIndexAngle(i);
        const end = rScale.getIndexAngle(i + 1);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();
        const color = categoryColors[i % categoryColors.length];
        ctx.fillStyle = hexToRgba(color, 0.12);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  function hexToRgba(hex, alpha) {
    const v = hex.replace('#','');
    const bigint = parseInt(v, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
          pointBackgroundColor: categoryColors,
          pointBorderColor: 'rgba(0, 0, 0, 0.2)',
          pointHoverBackgroundColor: '#0a122a',
          pointHoverBorderColor: 'rgba(255, 255, 255, 0.8)'
        }
      ]
    },
    options: {
      responsive: false,
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
    },
    plugins: [sectorPlugin]
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
  try {
    renderChart(labels, values);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  } catch (err) {
    console.error('Chart render error', err);
    alert('Unable to render chart. Please refresh and try again.');
  }
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

// Download buttons
const downloadPngBtn = document.getElementById('download-png');
const downloadPdfBtn = document.getElementById('download-pdf');
const coachEmailInputId = 'coach-email-input';
const sendBtnId = 'send-to-coach';

function downloadPNG() {
  if (!chartInstance) return;
  const link = document.createElement('a');
  link.download = 'wheel-of-life.png';
  link.href = chartInstance.canvas.toDataURL('image/png');
  link.click();
}

function downloadPDF() {
  if (!chartInstance) return;
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('PDF generator not loaded'); return; }
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 36;
  const imgData = chartInstance.canvas.toDataURL('image/png');
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = imgWidth; // canvas is square
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Wheel of Life Results', margin, margin);
  pdf.addImage(imgData, 'PNG', margin, margin + 10, imgWidth, imgHeight);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  const startY = margin + imgHeight + 28;
  const labels = categories.map(c => c.label);
  const values = wizardState.values.map(v => (v == null ? '-' : String(v)));
  let y = startY;
  for (let i = 0; i < labels.length; i += 1) {
    const color = categoryColors[i % categoryColors.length];
    pdf.setTextColor(0);
    pdf.text(`${labels[i]}: ${values[i]}`, margin, y);
    // small color square
    pdf.setFillColor(color);
    pdf.rect(pageWidth - margin - 14, y - 9, 10, 10, 'F');
    y += 18;
  }
  pdf.save('wheel-of-life.pdf');
}

if (downloadPngBtn) downloadPngBtn.addEventListener('click', downloadPNG);
if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadPDF);

// Send to coach (backend integration)
const sendBtn = document.getElementById(sendBtnId);
const coachEmailInput = document.getElementById(coachEmailInputId);
async function sendToCoach() {
  const labels = categories.map((c) => c.label);
  const values = wizardState.values.slice();
  if (values.some((v) => v == null)) { alert('Please complete all steps first.'); return; }
  const chartBase64 = chartInstance ? chartInstance.canvas.toDataURL('image/png') : null;
  try {
    const supabaseUrl = 'https://dspekkajcbdwpylneqgq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcGVra2FqY2Jkd3B5bG5lcWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjY3NzUsImV4cCI6MjA3NDIwMjc3NX0.W0wkI0ZJfTD94cL2s282AbK3AVXbAfMe4yIG6xpaTck';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Ensure storage bucket exists (one-time in dashboard ideally). We'll assume `charts` exists.
    let chartUrl = null;
    if (chartBase64) {
      const { data: uploadData, error: uploadError } = await supabase.storage.from('charts').upload(
        `charts/${Date.now()}.png`,
        chartBase64.split(',')[1],
        { contentType: 'image/png', upsert: true }
      );
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from('charts').getPublicUrl(uploadData.path);
      chartUrl = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from('submissions').insert({
      client_name: null,
      client_email: (coachEmailInput && coachEmailInput.value) || null,
      categories: labels,
      values,
      chart_url: chartUrl
    });
    if (insertError) throw insertError;
    alert('Saved to Supabase');
  } catch (e) {
    console.error(e);
    alert('Could not save to Supabase. Please check configuration.');
  }
}
if (sendBtn) sendBtn.addEventListener('click', sendToCoach);



import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';
import PDFDocument from 'pdfkit';

const app = express();
const port = process.env.PORT || 3001;
const adminApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// DB init
const db = new Database('data.db');
db.pragma('journal_mode = WAL');
db.prepare(`CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  client_email TEXT,
  client_name TEXT,
  categories TEXT NOT NULL,
  values TEXT NOT NULL
)`).run();

// Email transporter (configure via env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

function createPdfBuffer({ clientName, categories, values, chartBase64 }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks = [];
    doc.on('data', (d) => chunks.push(d));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Wheel of Life Results', { align: 'left' });
    if (clientName) doc.moveDown(0.2).fontSize(12).text(`Client: ${clientName}`);
    doc.moveDown(0.5).fontSize(10).text(new Date().toLocaleString());

    if (chartBase64) {
      try {
        const img = chartBase64.replace(/^data:image\/(png|jpeg);base64,/, '');
        const imgBuffer = Buffer.from(img, 'base64');
        doc.moveDown(0.5);
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const imgWidth = pageWidth;
        const imgHeight = imgWidth;
        doc.image(imgBuffer, { width: imgWidth, height: imgHeight });
      } catch (e) {
        doc.moveDown().fontSize(10).fillColor('red').text('Chart image could not be embedded.');
        doc.fillColor('black');
      }
    }

    doc.moveDown(0.8).fontSize(12).text('Scores');
    doc.moveDown(0.3);
    doc.fontSize(11);
    for (let i = 0; i < categories.length; i += 1) {
      doc.text(`${categories[i]}: ${values[i]}`);
    }

    doc.end();
  });
}

app.post('/api/submissions', async (req, res) => {
  try {
    const { clientEmail, clientName, categories, values, chartBase64 } = req.body || {};
    if (!Array.isArray(categories) || !Array.isArray(values) || categories.length !== values.length) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO submissions (created_at, client_email, client_name, categories, values) VALUES (?, ?, ?, ?, ?)')
      .run(createdAt, clientEmail || null, clientName || null, JSON.stringify(categories), JSON.stringify(values));

    // Create PDF
    const pdf = await createPdfBuffer({ clientName, categories, values, chartBase64 });

    // Email to coach
    const toAddress = process.env.COACH_EMAIL;
    if (toAddress && transporter) {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: toAddress,
        subject: 'New Wheel of Life Submission',
        text: `Client: ${clientName || 'Unknown'}\nEmail: ${clientEmail || '-'}\nScores: ${values.join(', ')}`,
        attachments: [{ filename: 'wheel-of-life.pdf', content: pdf }]
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/submissions', (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== adminApiKey) return res.status(401).json({ error: 'Unauthorized' });
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  return res.json(rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    clientEmail: r.client_email,
    clientName: r.client_name,
    categories: JSON.parse(r.categories),
    values: JSON.parse(r.values)
  })));
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});



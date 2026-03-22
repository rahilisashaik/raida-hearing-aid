import { FREQS } from './constants.js';

const PAD = { l: 52, r: 24, t: 28, b: 44 };

/**
 * Draw a single-ear audiogram on canvas (threshold dB HL vs log frequency).
 */
export function drawAudiogramCanvas(canvas, thresholds, title = 'Audiogram') {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const pw = w - PAD.l - PAD.r;
    const ph = h - PAD.t - PAD.b;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#222';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.fillText(title, PAD.l, 22);

    // Grid + axes (y: -10 top .. 120 bottom)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let db = -10; db <= 120; db += 10) {
        const y = PAD.t + ((db - -10) / 130) * ph;
        ctx.beginPath();
        ctx.moveTo(PAD.l, y);
        ctx.lineTo(PAD.l + pw, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(PAD.l, PAD.t, pw, ph);

    ctx.fillStyle = '#555';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Frequency (Hz)', PAD.l + pw / 2 - 40, h - 12);
    ctx.save();
    ctx.translate(16, PAD.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Threshold (dB HL)', -50, 0);
    ctx.restore();

    FREQS.forEach((f) => {
        const lx = Math.log10(f);
        const lx0 = Math.log10(200);
        const lx1 = Math.log10(10000);
        const x = PAD.l + ((lx - lx0) / (lx1 - lx0)) * pw;
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(x, PAD.t);
        ctx.lineTo(x, PAD.t + ph);
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(String(f), x - 10, PAD.t + ph + 18);
    });

    for (let db = -10; db <= 120; db += 20) {
        const y = PAD.t + ((db - -10) / 130) * ph;
        ctx.fillStyle = '#666';
        ctx.fillText(String(db), 8, y + 4);
    }

    // Plot
    const pts = FREQS.map((f, i) => {
        const lx = Math.log10(f);
        const lx0 = Math.log10(200);
        const lx1 = Math.log10(10000);
        const x = PAD.l + ((lx - lx0) / (lx1 - lx0)) * pw;
        const th = thresholds[i];
        const y = PAD.t + ((th - -10) / 130) * ph;
        return { x, y };
    });

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#667eea';
    pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Draw prescribed gain vs frequency (log x).
 */
export function drawGainProfileCanvas(canvas, result, title) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const pw = w - PAD.l - PAD.r;
    const ph = h - PAD.t - PAD.b;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const gains = result.gain;
    const ymax = Math.max(...gains, 1) + 5;

    ctx.fillStyle = '#222';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText(title, PAD.l, 22);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(PAD.l, PAD.t, pw, ph);

    ctx.fillStyle = '#555';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Frequency (Hz)', PAD.l + pw / 2 - 40, h - 12);
    ctx.save();
    ctx.translate(16, PAD.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Gain (dB)', -25, 0);
    ctx.restore();

    const lx0 = Math.log10(200);
    const lx1 = Math.log10(10000);
    for (let i = 0; i <= 5; i++) {
        const g = (ymax * i) / 5;
        const y = PAD.t + ph - (g / ymax) * ph;
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(PAD.l, y);
        ctx.lineTo(PAD.l + pw, y);
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.fillText(g.toFixed(0), 8, y + 4);
    }

    FREQS.forEach((f) => {
        const lx = Math.log10(f);
        const x = PAD.l + ((lx - lx0) / (lx1 - lx0)) * pw;
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(x, PAD.t);
        ctx.lineTo(x, PAD.t + ph);
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(String(f), x - 10, PAD.t + ph + 18);
    });

    const pts = FREQS.map((f, i) => {
        const lx = Math.log10(f);
        const x = PAD.l + ((lx - lx0) / (lx1 - lx0)) * pw;
        const g = gains[i];
        const y = PAD.t + ph - (g / ymax) * ph;
        return { x, y };
    });

    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#764ba2';
    pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

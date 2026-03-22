import { FREQS } from './constants.js';

/**
 * Port of api/derive.py derive_gain_profile_from_row for one ear.
 * @param {number[]} thresholds - length 6, order matches FREQS
 * @param {'min'|'median_mid'|'pta4'} reference
 * @param {number} compressionRatio
 * @param {number} maxGain
 * @param {'none'|'ma3'} smoothing
 */
export function deriveGainProfile(
    thresholds,
    reference,
    compressionRatio = 0.5,
    maxGain = 25,
    smoothing = 'ma3'
) {
    if (thresholds.length !== 6) {
        throw new Error('thresholds must have 6 values');
    }

    const t = thresholds.map(Number);

    let tref;
    if (reference === 'min') {
        tref = Math.min(...t);
    } else if (reference === 'median_mid') {
        const mids = [t[1], t[2], t[3]]; // 500, 1000, 2000
        const sorted = [...mids].sort((a, b) => a - b);
        tref = sorted[1];
    } else if (reference === 'pta4') {
        tref = (t[1] + t[2] + t[3] + t[4]) / 4; // 500–4000
    } else {
        throw new Error('reference must be min, median_mid, or pta4');
    }

    let gain = t.map((tf) => {
        const deficit = Math.max(0, tf - tref);
        return Math.min(maxGain, compressionRatio * deficit);
    });

    if (smoothing === 'ma3') {
        const g = [...gain];
        const sm = [];
        for (let i = 0; i < g.length; i++) {
            const left = i - 1 >= 0 ? g[i - 1] : g[i];
            const mid = g[i];
            const right = i + 1 < g.length ? g[i + 1] : g[i];
            sm.push((left + mid + right) / 3);
        }
        gain = sm;
    } else if (smoothing !== 'none') {
        throw new Error('smoothing must be none or ma3');
    }

    return {
        freq_hz: [...FREQS],
        gain: gain.map((x) => Math.round(x * 100) / 100),
        reference_threshold: Math.round(tref * 1000) / 1000,
        compression_ratio: compressionRatio,
        max_gain: maxGain,
        reference_method: reference,
        smoothing,
    };
}

import { FrequencySlider } from './components/frequency-slider.js';
import { VolumeSlider } from './components/volume-slider.js';
import { PlayButton } from './components/play-button.js';
import { FREQS } from './js/constants.js';
import { deriveGainProfile } from './js/derive.js';
import { drawAudiogramCanvas, drawGainProfileCanvas } from './js/charts.js';

const COMPRESSION = 0.5;
const MAX_GAIN = 25;

class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.frequency = 1000;
        this.volume = -10;
        this.isPlaying = false;

        /** @type {number[]} */
        this.experimentThresholds = [];
        this.experimentStep = 0;
        this.experimentActive = false;
        this.currentSlide = 0;

        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.showStatus('Error: Web Audio API not supported in this browser', 'error');
            return;
        }

        const frequencyContainer = document.getElementById('frequency-slider-container');
        const volumeContainer = document.getElementById('volume-slider-container');
        const playButtonContainer = document.getElementById('play-button-container');

        this.frequencySlider = new FrequencySlider(frequencyContainer, 1000, (value) => {
            if (this.experimentActive) return;
            this.frequency = value;
            this.updateFrequency(value);
            this.updateStatus(`Frequency: ${value} Hz, Volume: ${this.volume.toFixed(1)} dB`);
        });

        this.volumeSlider = new VolumeSlider(volumeContainer, -10, (value) => {
            this.volume = value;
            this.updateVolume(value);
            this.updateStatus(`Frequency: ${this.frequency} Hz, Volume: ${value.toFixed(1)} dB`);
        });

        this.playButton = new PlayButton(playButtonContainer, () => this.togglePlayback());

        this.bindExperimentUI();
        this.bindResultsSlides();

        this.updateStatus('Ready. Adjust frequency and volume, or enable Raida\'s Experiment.');
    }

    bindExperimentUI() {
        const toggle = document.getElementById('raidas-experiment-toggle');
        const submit = document.getElementById('threshold-submit');
        const input = document.getElementById('threshold-input');

        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                this.startExperiment();
            } else {
                this.cancelExperiment();
            }
        });

        submit.addEventListener('click', () => this.submitExperimentThreshold());

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitExperimentThreshold();
            }
        });
    }

    bindResultsSlides() {
        const modal = document.getElementById('results-modal');
        const closeBtn = document.getElementById('results-close');
        const backdrop = document.getElementById('results-backdrop');
        const prev = document.getElementById('slide-prev');
        const next = document.getElementById('slide-next');

        const close = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', close);

        prev.addEventListener('click', () => this.goToSlide(this.currentSlide - 1));
        next.addEventListener('click', () => this.goToSlide(this.currentSlide + 1));
    }

    startExperiment() {
        this.experimentActive = true;
        this.experimentStep = 0;
        this.experimentThresholds = [];

        document.getElementById('experiment-wizard').classList.remove('hidden');
        this.frequencySlider.setDisabled(true);

        const input = document.getElementById('threshold-input');
        input.value = '';
        input.focus();

        this.renderExperimentStep();
    }

    cancelExperiment() {
        this.experimentActive = false;
        this.experimentStep = 0;
        this.experimentThresholds = [];
        document.getElementById('experiment-wizard').classList.add('hidden');
        this.frequencySlider.setDisabled(false);
    }

    renderExperimentStep() {
        const hz = FREQS[this.experimentStep];
        document.getElementById('experiment-step-title').textContent =
            `Step ${this.experimentStep + 1} of ${FREQS.length}`;
        document.getElementById('current-freq-label').textContent = String(hz);
        document.getElementById('experiment-help').textContent =
            `The tone is set to ${hz} Hz. Use Play and the volume slider to find the quietest level (dB) at which you can just hear the tone for ONE ear. Enter that number and click Submit.`;
        document.getElementById('experiment-progress').textContent =
            `Current test: ${hz} Hz (${this.experimentStep + 1} / ${FREQS.length})`;

        this.frequency = hz;
        this.frequencySlider.setValue(hz, true);
        this.updateFrequency(hz);
        this.updateStatus(`Experiment: ${hz} Hz — set volume, play, then enter threshold (dB).`);
    }

    submitExperimentThreshold() {
        if (!this.experimentActive) return;

        const input = document.getElementById('threshold-input');
        const raw = parseFloat(input.value);
        if (Number.isNaN(raw)) {
            this.showStatus('Enter a valid number for threshold (dB).', 'error');
            return;
        }
        if (raw < -20 || raw > 130) {
            this.showStatus('Threshold should be roughly between -20 and 130 dB.', 'error');
            return;
        }

        this.experimentThresholds[this.experimentStep] = raw;
        this.experimentStep += 1;
        input.value = '';

        if (this.experimentStep < FREQS.length) {
            this.renderExperimentStep();
            input.focus();
        } else {
            this.completeExperiment();
        }
    }

    completeExperiment() {
        this.experimentActive = false;
        document.getElementById('experiment-wizard').classList.add('hidden');
        this.frequencySlider.setDisabled(false);

        const thresholds = this.experimentThresholds;
        const gainMin = deriveGainProfile(thresholds, 'min', COMPRESSION, MAX_GAIN, 'none');
        const gainMedian = deriveGainProfile(thresholds, 'median_mid', COMPRESSION, MAX_GAIN, 'none');
        const gainPta4 = deriveGainProfile(thresholds, 'pta4', COMPRESSION, MAX_GAIN, 'none');
        const gainSmoothed = deriveGainProfile(thresholds, 'pta4', COMPRESSION, MAX_GAIN, 'ma3');

        const ca = document.getElementById('chart-audiogram');
        drawAudiogramCanvas(ca, thresholds, 'Your threshold audiogram');

        drawGainProfileCanvas(
            document.getElementById('chart-gain-min'),
            gainMin,
            `Gain (reference = min, t_ref ≈ ${gainMin.reference_threshold} dB)`
        );
        drawGainProfileCanvas(
            document.getElementById('chart-gain-median'),
            gainMedian,
            `Gain (reference = median_mid, t_ref ≈ ${gainMedian.reference_threshold} dB)`
        );
        drawGainProfileCanvas(
            document.getElementById('chart-gain-pta4'),
            gainPta4,
            `Gain (reference = PTA4, t_ref ≈ ${gainPta4.reference_threshold} dB)`
        );
        drawGainProfileCanvas(
            document.getElementById('chart-gain-smoothed'),
            gainSmoothed,
            `Smoothed gain (PTA4 + 3-point average)`
        );

        this.currentSlide = 0;
        this.goToSlide(0);

        const modal = document.getElementById('results-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        this.updateStatus('Experiment complete. Review your audiogram and gain profiles in the viewer.');
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('#slides-container .slide');
        const n = slides.length;
        if (index < 0 || index >= n) return;

        this.currentSlide = index;
        slides.forEach((el, i) => {
            el.classList.toggle('slide--active', i === index);
        });

        document.getElementById('slide-indicator').textContent = `${index + 1} / ${n}`;
        document.getElementById('slide-prev').disabled = index === 0;
        document.getElementById('slide-next').disabled = index === n - 1;
    }

    dbToGain(db) {
        const minDb = -10;
        const maxDb = 120;
        const clampedDb = Math.max(minDb, Math.min(maxDb, db));
        if (clampedDb <= minDb) {
            return 0;
        }
        const dbRange = maxDb - minDb;
        const normalizedDb = (clampedDb - minDb) / dbRange;
        return Math.pow(normalizedDb, 3);
    }

    startPlayback() {
        if (this.isPlaying) {
            return;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

            this.gainNode = this.audioContext.createGain();
            const gainValue = this.dbToGain(this.volume);
            this.gainNode.gain.setValueAtTime(gainValue, this.audioContext.currentTime);

            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            this.oscillator.start();
            this.isPlaying = true;
            this.playButton.setPlaying(true);

            this.updateStatus(`Playing: ${this.frequency} Hz at ${this.volume.toFixed(1)} dB`);

            this.oscillator.onended = () => {
                this.isPlaying = false;
                this.playButton.setPlaying(false);
                this.updateStatus('Playback stopped.');
            };
        } catch (error) {
            console.error('Error starting playback:', error);
            this.showStatus('Error starting playback: ' + error.message, 'error');
        }
    }

    stopPlayback() {
        if (!this.isPlaying || !this.oscillator) {
            return;
        }

        try {
            this.oscillator.stop();
            this.oscillator = null;
            this.gainNode = null;
            this.isPlaying = false;
            this.playButton.setPlaying(false);
            this.updateStatus('Playback stopped.');
        } catch (error) {
            console.error('Error stopping playback:', error);
        }
    }

    updateFrequency(frequency) {
        if (this.isPlaying && this.oscillator) {
            try {
                this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            } catch (error) {
                console.error('Error updating frequency:', error);
            }
        }
    }

    updateVolume(volumeDb) {
        if (this.isPlaying && this.gainNode) {
            try {
                const gainValue = this.dbToGain(volumeDb);
                this.gainNode.gain.setValueAtTime(gainValue, this.audioContext.currentTime);
            } catch (error) {
                console.error('Error updating volume:', error);
            }
        }
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    updateStatus(message) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status';
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status ${type}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioGenerator();
});

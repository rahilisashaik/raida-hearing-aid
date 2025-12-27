import { FrequencySlider } from './components/frequency-slider.js';
import { VolumeSlider } from './components/volume-slider.js';
import { PlayButton } from './components/play-button.js';

class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.frequency = 1000; // Hz
        this.volume = 0; // dB
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.showStatus('Error: Web Audio API not supported in this browser', 'error');
            return;
        }

        // Initialize components
        const frequencyContainer = document.getElementById('frequency-slider-container');
        const volumeContainer = document.getElementById('volume-slider-container');
        const playButtonContainer = document.getElementById('play-button-container');

        this.frequencySlider = new FrequencySlider(
            frequencyContainer,
            1000,
            (value) => {
                this.frequency = value;
                this.updateStatus(`Frequency: ${value} Hz, Volume: ${this.volume.toFixed(1)} dB`);
            }
        );

        this.volumeSlider = new VolumeSlider(
            volumeContainer,
            0,
            (value) => {
                this.volume = value;
                this.updateStatus(`Frequency: ${this.frequency} Hz, Volume: ${value.toFixed(1)} dB`);
            }
        );

        this.playButton = new PlayButton(
            playButtonContainer,
            () => this.togglePlayback()
        );

        this.updateStatus('Ready. Adjust frequency and volume, then click Play Audio.');
    }

    // Convert dB to linear gain (amplitude)
    dbToGain(db) {
        return Math.pow(10, db / 20);
    }

    // Start audio playback
    startPlayback() {
        if (this.isPlaying) {
            return;
        }
        
        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create oscillator
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sine'; // Pure tone
            this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            const gainValue = this.dbToGain(this.volume);
            this.gainNode.gain.setValueAtTime(gainValue, this.audioContext.currentTime);

            // Connect nodes
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            // Start playback
            this.oscillator.start();
            this.isPlaying = true;
            this.playButton.setPlaying(true);

            this.updateStatus(`Playing: ${this.frequency} Hz at ${this.volume.toFixed(1)} dB`);

            // Handle when oscillator stops (after duration or manual stop)
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

    // Stop audio playback
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

    // Toggle playback
    togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    // Update status message
    updateStatus(message) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status';
        }
    }

    // Show error status
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status ${type}`;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AudioGenerator();
});


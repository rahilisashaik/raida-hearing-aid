/**
 * Volume Slider Component
 * Allows user to configure audio volume in dB (-10 to 100 dB)
 */
export class VolumeSlider {
    constructor(container, initialValue = 0, onChange = null) {
        this.container = container;
        this.value = initialValue;
        this.onChange = onChange;
        this.min = -10;
        this.max = 100;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="slider-group">
                <label for="volume-slider">Volume: <span id="volume-value">${this.value}</span> dB</label>
                <input 
                    type="range" 
                    id="volume-slider" 
                    min="${this.min}" 
                    max="${this.max}" 
                    value="${this.value}"
                    step="0.1"
                >
                <div class="slider-labels">
                    <span>${this.min} dB</span>
                    <span>${this.max} dB</span>
                </div>
            </div>
        `;

        const slider = this.container.querySelector('#volume-slider');
        const valueDisplay = this.container.querySelector('#volume-value');

        slider.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            valueDisplay.textContent = this.value.toFixed(1);
            if (this.onChange) {
                this.onChange(this.value);
            }
        });
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = Math.max(this.min, Math.min(this.max, value));
        const slider = this.container.querySelector('#volume-slider');
        const valueDisplay = this.container.querySelector('#volume-value');
        if (slider) {
            slider.value = this.value;
            valueDisplay.textContent = this.value.toFixed(1);
        }
    }
}


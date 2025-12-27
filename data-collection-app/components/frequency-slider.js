/**
 * Frequency Slider Component
 * Allows user to configure audio frequency in Hz (250-8000 Hz)
 */
export class FrequencySlider {
    constructor(container, initialValue = 1000, onChange = null) {
        this.container = container;
        this.value = initialValue;
        this.onChange = onChange;
        this.min = 250;
        this.max = 8000;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="slider-group">
                <label for="frequency-slider">Frequency: <span id="frequency-value">${this.value}</span> Hz</label>
                <input 
                    type="range" 
                    id="frequency-slider" 
                    min="${this.min}" 
                    max="${this.max}" 
                    value="${this.value}"
                    step="1"
                >
                <div class="slider-labels">
                    <span>${this.min} Hz</span>
                    <span>${this.max} Hz</span>
                </div>
            </div>
        `;

        const slider = this.container.querySelector('#frequency-slider');
        const valueDisplay = this.container.querySelector('#frequency-value');

        slider.addEventListener('input', (e) => {
            this.value = parseInt(e.target.value);
            valueDisplay.textContent = this.value;
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
        const slider = this.container.querySelector('#frequency-slider');
        const valueDisplay = this.container.querySelector('#frequency-value');
        if (slider) {
            slider.value = this.value;
            valueDisplay.textContent = this.value;
        }
    }
}


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
                <label for="frequency-slider">Frequency:</label>
                <div class="slider-with-input">
                    <input 
                        type="number" 
                        id="frequency-input" 
                        min="${this.min}" 
                        max="${this.max}" 
                        value="${this.value}"
                        step="1"
                        aria-label="Frequency in Hz"
                    >
                    <span class="input-suffix">Hz</span>
                    <button type="button" id="frequency-set-btn" class="frequency-set-btn">Set</button>
                    <input 
                        type="range" 
                        id="frequency-slider" 
                        min="${this.min}" 
                        max="${this.max}" 
                        value="${this.value}"
                        step="1"
                    >
                </div>
                <div class="slider-labels">
                    <span>${this.min} Hz</span>
                    <span>${this.max} Hz</span>
                </div>
            </div>
        `;

        const slider = this.container.querySelector('#frequency-slider');
        const input = this.container.querySelector('#frequency-input');

        const updateFromValue = (val) => {
            this.value = Math.max(this.min, Math.min(this.max, Math.round(val)));
            slider.value = this.value;
            input.value = this.value;
            if (this.onChange) {
                this.onChange(this.value);
            }
        };

        const commitInputValue = () => {
            const parsed = parseInt(input.value, 10);
            if (Number.isNaN(parsed) || parsed < this.min || parsed > this.max) {
                input.value = this.value;
            } else {
                updateFromValue(parsed);
            }
        };

        slider.addEventListener('input', (e) => {
            updateFromValue(parseInt(e.target.value, 10));
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commitInputValue();
            }
        });

        input.addEventListener('change', () => {
            commitInputValue();
        });

        this.container.querySelector('#frequency-set-btn').addEventListener('click', () => {
            commitInputValue();
        });
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = Math.max(this.min, Math.min(this.max, Math.round(value)));
        const slider = this.container.querySelector('#frequency-slider');
        const input = this.container.querySelector('#frequency-input');
        if (slider) slider.value = this.value;
        if (input) input.value = this.value;
    }
}


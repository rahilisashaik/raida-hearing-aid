/**
 * Play Button Component
 * Button to trigger audio playback
 */
export class PlayButton {
    constructor(container, onClick = null) {
        this.container = container;
        this.onClick = onClick;
        this.isPlaying = false;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <button id="play-button" class="play-button">
                <span id="play-button-text">Play Audio</span>
            </button>
        `;

        const button = this.container.querySelector('#play-button');
        button.addEventListener('click', () => {
            if (this.onClick) {
                this.onClick();
            }
        });
    }

    setPlaying(isPlaying) {
        this.isPlaying = isPlaying;
        const button = this.container.querySelector('#play-button');
        const text = this.container.querySelector('#play-button-text');
        
        if (button && text) {
            if (isPlaying) {
                button.classList.add('playing');
                text.textContent = 'Playing...';
            } else {
                button.classList.remove('playing');
                text.textContent = 'Play Audio';
            }
        }
    }
}


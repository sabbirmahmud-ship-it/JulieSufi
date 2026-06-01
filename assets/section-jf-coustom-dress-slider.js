if (!customElements.get('jf-coustom-dress-slider')) {
  class JfCoustomDressSlider extends HTMLElement {
    constructor() {
      super();
      this.index = 0;
      this.goTo = this.goTo.bind(this);
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-custom-dress-track]');
      this.slides = Array.from(this.querySelectorAll('[data-custom-dress-slide]'));
      this.dotsContainer = this.querySelector('[data-custom-dress-dots]');
      this.prevButton = this.querySelector('[data-custom-dress-prev]');
      this.nextButton = this.querySelector('[data-custom-dress-next]');

      if (!this.track || !this.slides.length) return;

      if (this.prevButton) this.prevButton.addEventListener('click', this.previous);
      if (this.nextButton) this.nextButton.addEventListener('click', this.next);

      this.renderDots();
      this.goTo(0, false);
    }

    disconnectedCallback() {
      if (this.prevButton) this.prevButton.removeEventListener('click', this.previous);
      if (this.nextButton) this.nextButton.removeEventListener('click', this.next);
    }

    renderDots() {
      if (!this.dotsContainer) return;

      this.dotsContainer.innerHTML = '';

      this.slides.forEach((slide, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jf-coustom-dress-slider__dot';
        button.setAttribute('aria-label', `Go to slide ${index + 1}`);
        button.addEventListener('click', () => this.goTo(index));
        this.dotsContainer.appendChild(button);
      });
    }

    previous() {
      this.goTo(Math.max(0, this.index - 1));
    }

    next() {
      this.goTo(Math.min(this.slides.length - 1, this.index + 1));
    }

    goTo(index, animate = true) {
      this.index = Math.max(0, Math.min(this.slides.length - 1, index));

      if (!animate) {
        this.track.style.transition = 'none';
        requestAnimationFrame(() => {
          this.track.style.transition = '';
        });
      }

      this.track.style.transform = `translateX(-${this.index * 100}%)`;
      this.updateState();
    }

    updateState() {
      if (this.prevButton) this.prevButton.disabled = this.index === 0;
      if (this.nextButton) this.nextButton.disabled = this.index === this.slides.length - 1;

      if (!this.dotsContainer) return;

      Array.from(this.dotsContainer.children).forEach((dot, index) => {
        dot.classList.toggle('is-active', index === this.index);
      });
    }
  }

  customElements.define('jf-coustom-dress-slider', JfCoustomDressSlider);
}

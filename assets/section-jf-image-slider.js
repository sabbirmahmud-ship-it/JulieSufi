if (!customElements.get('jf-image-slider')) {
  class JfImageSlider extends HTMLElement {
    constructor() {
      super();
      this.handleResize = this.handleResize.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-slider-track]');
      this.dots = this.querySelector('[data-slider-dots]');

      if (!this.track || !this.dots) return;

      this.slides = Array.from(this.track.querySelectorAll('[data-slider-slide]'));
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.track);
      this.track.addEventListener('scroll', this.handleScroll, { passive: true });
      this.handleResize();
    }

    disconnectedCallback() {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.track) this.track.removeEventListener('scroll', this.handleScroll);
    }

    handleResize() {
      this.slides = Array.from(this.track.querySelectorAll('[data-slider-slide]')).filter(
        (slide) => slide.offsetWidth > 0
      );

      if (!this.slides.length) return;

      if (this.slides.length === 1) {
        this.totalPages = 1;
      } else {
        this.slideOffset = this.slides[1].offsetLeft - this.slides[0].offsetLeft;
        this.slidesPerPage = Math.max(
          1,
          Math.floor((this.track.clientWidth - this.slides[0].offsetLeft) / this.slideOffset)
        );
        this.totalPages = Math.max(1, this.slides.length - this.slidesPerPage + 1);
      }

      this.renderDots();
      this.updateActiveDot();
    }

    handleScroll() {
      this.updateActiveDot();
    }

    renderDots() {
      if (!this.totalPages || this.totalPages < 2) {
        this.dots.innerHTML = '';
        return;
      }

      if (this.dots.childElementCount === this.totalPages) return;

      this.dots.innerHTML = '';

      for (let index = 0; index < this.totalPages; index += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jf-image-slider__dot';
        button.setAttribute('aria-label', `Go to slide ${index + 1}`);
        button.addEventListener('click', () => this.goToPage(index));
        this.dots.appendChild(button);
      }
    }

    updateActiveDot() {
      const dots = Array.from(this.dots.children);

      if (!dots.length || !this.slideOffset) return;

      const currentPage = Math.max(0, Math.min(this.totalPages - 1, Math.round(this.track.scrollLeft / this.slideOffset)));

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentPage);
      });
    }

    goToPage(index) {
      if (!this.slides[index]) return;

      this.track.scrollTo({
        left: this.slides[index].offsetLeft,
        behavior: 'smooth',
      });
    }
  }

  customElements.define('jf-image-slider', JfImageSlider);
}

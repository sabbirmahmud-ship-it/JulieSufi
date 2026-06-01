if (!customElements.get('jf-image-slider')) {
  class JfImageSlider extends HTMLElement {
    constructor() {
      super();
      this.handleResize = this.handleResize.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.measureTrack = this.measureTrack.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-slider-track]');
      this.dots = this.querySelector('[data-slider-dots]');

      if (!this.track || !this.dots) return;

      this.slides = Array.from(this.track.querySelectorAll('[data-slider-slide]'));
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.track);
      this.track.addEventListener('scroll', this.handleScroll, { passive: true });
      this.measureTrack();
    }

    disconnectedCallback() {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
      if (this.track) this.track.removeEventListener('scroll', this.handleScroll);
    }

    handleResize() {
      if (this.resizeFrame) return;

      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = null;
        this.measureTrack();
      });
    }

    handleScroll() {
      if (this.scrollFrame) return;

      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = null;
        this.updateActiveDot();
      });
    }

    measureTrack() {
      const visibleSlides = this.slides.filter((slide) => slide.getClientRects().length);

      if (!visibleSlides.length) return;

      if (visibleSlides.length === 1) {
        this.slideOffset = this.track.clientWidth;
        this.totalPages = 1;
      } else {
        const gap = parseFloat(window.getComputedStyle(this.track).columnGap || window.getComputedStyle(this.track).gap || 0);
        const firstSlideWidth = Math.ceil(visibleSlides[0].getBoundingClientRect().width);

        this.slideOffset = firstSlideWidth + gap;
        this.slidesPerPage = Math.max(1, Math.floor(this.track.clientWidth / this.slideOffset));
        this.totalPages = Math.max(1, visibleSlides.length - this.slidesPerPage + 1);
      }

      this.renderDots();
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

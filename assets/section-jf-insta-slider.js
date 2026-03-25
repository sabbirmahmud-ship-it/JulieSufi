if (!customElements.get('jf-insta-slider')) {
  class JfInstaSlider extends HTMLElement {
    constructor() {
      super();
      this.handleResize = this.handleResize.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-insta-track]');
      this.dots = this.querySelector('[data-insta-dots]');
      this.prevButton = this.querySelector('[data-insta-prev]');
      this.nextButton = this.querySelector('[data-insta-next]');

      if (!this.track || !this.dots || !this.prevButton || !this.nextButton) return;

      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.track);
      this.track.addEventListener('scroll', this.handleScroll, { passive: true });
      this.prevButton.addEventListener('click', this.onButtonClick);
      this.nextButton.addEventListener('click', this.onButtonClick);
      this.handleResize();
    }

    disconnectedCallback() {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.track) this.track.removeEventListener('scroll', this.handleScroll);
      if (this.prevButton) this.prevButton.removeEventListener('click', this.onButtonClick);
      if (this.nextButton) this.nextButton.removeEventListener('click', this.onButtonClick);
    }

    handleResize() {
      this.slides = Array.from(this.querySelectorAll('[data-insta-slide]')).filter((slide) => slide.offsetWidth > 0);

      if (!this.slides.length) return;

      if (this.slides.length === 1) {
        this.totalPages = 1;
        this.slideOffset = 0;
      } else {
        this.slideOffset = this.slides[1].offsetLeft - this.slides[0].offsetLeft;
        this.slidesPerPage = Math.max(
          1,
          Math.floor((this.track.clientWidth - this.slides[0].offsetLeft) / this.slideOffset)
        );
        this.totalPages = Math.max(1, this.slides.length - this.slidesPerPage + 1);
      }

      this.renderDots();
      this.updateState();
    }

    handleScroll() {
      this.updateState();
    }

    onButtonClick(event) {
      event.preventDefault();
      if (!this.slideOffset) return;

      const direction = event.currentTarget === this.nextButton ? 1 : -1;

      this.track.scrollTo({
        left: this.track.scrollLeft + direction * this.slideOffset,
        behavior: 'smooth',
      });
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
        button.className = 'jf-insta-slider__dot';
        button.setAttribute('aria-label', `Go to slide ${index + 1}`);
        button.addEventListener('click', () => {
          if (!this.slides[index]) return;
          this.track.scrollTo({
            left: this.slides[index].offsetLeft,
            behavior: 'smooth',
          });
        });
        this.dots.appendChild(button);
      }
    }

    updateState() {
      const dots = Array.from(this.dots.children);

      if (!this.slideOffset) {
        this.prevButton.setAttribute('disabled', 'disabled');
        this.nextButton.setAttribute('disabled', 'disabled');
        return;
      }

      const currentPage = Math.max(
        0,
        Math.min(this.totalPages - 1, Math.round(this.track.scrollLeft / this.slideOffset))
      );

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentPage);
      });

      if (currentPage <= 0) {
        this.prevButton.setAttribute('disabled', 'disabled');
      } else {
        this.prevButton.removeAttribute('disabled');
      }

      if (currentPage >= this.totalPages - 1) {
        this.nextButton.setAttribute('disabled', 'disabled');
      } else {
        this.nextButton.removeAttribute('disabled');
      }
    }
  }

  customElements.define('jf-insta-slider', JfInstaSlider);
}

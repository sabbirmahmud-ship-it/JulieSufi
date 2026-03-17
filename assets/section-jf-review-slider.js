if (!customElements.get('jf-review-slider')) {
  class JfReviewSlider extends HTMLElement {
    constructor() {
      super();
      this.handleResize = this.handleResize.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-review-track]');
      this.prevButton = this.querySelector('[data-review-prev]');
      this.nextButton = this.querySelector('[data-review-next]');

      if (!this.track || !this.prevButton || !this.nextButton) return;

      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.track);
      this.track.addEventListener('scroll', this.handleScroll, {passive: true});
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
      this.slides = Array.from(this.querySelectorAll('[data-review-slide]')).filter((slide) => slide.offsetWidth > 0);

      if (this.slides.length < 2) {
        this.prevButton.setAttribute('disabled', 'disabled');
        this.nextButton.setAttribute('disabled', 'disabled');
        return;
      }

      this.slideOffset = this.slides[1].offsetLeft - this.slides[0].offsetLeft;
      this.updateButtons();
    }

    handleScroll() {
      this.updateButtons();
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

    updateButtons() {
      const maxScrollLeft = this.track.scrollWidth - this.track.clientWidth - 2;

      if (this.track.scrollLeft <= 2) {
        this.prevButton.setAttribute('disabled', 'disabled');
      } else {
        this.prevButton.removeAttribute('disabled');
      }

      if (this.track.scrollLeft >= maxScrollLeft) {
        this.nextButton.setAttribute('disabled', 'disabled');
      } else {
        this.nextButton.removeAttribute('disabled');
      }
    }
  }

  customElements.define('jf-review-slider', JfReviewSlider);
}

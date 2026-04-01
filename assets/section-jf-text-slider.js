if (!customElements.get('jf-text-slider')) {
  class JfTextSlider extends HTMLElement {
    constructor() {
      super();
      this.activeIndex = 0;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this.onPrevClick = this.onPrevClick.bind(this);
      this.onNextClick = this.onNextClick.bind(this);
      this.onDotClick = this.onDotClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onBlockSelect = this.onBlockSelect.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-text-track]');
      this.viewport = this.querySelector('[data-text-viewport]');
      this.slides = Array.from(this.querySelectorAll('[data-text-slide]'));
      this.prevButton = this.querySelector('[data-text-prev]');
      this.nextButton = this.querySelector('[data-text-next]');
      this.dots = Array.from(this.querySelectorAll('[data-text-dot]'));

      if (!this.track || !this.slides.length) return;

      if (this.prevButton) this.prevButton.addEventListener('click', this.onPrevClick);
      if (this.nextButton) this.nextButton.addEventListener('click', this.onNextClick);
      this.dots.forEach((dot) => dot.addEventListener('click', this.onDotClick));

      if (this.viewport) {
        this.viewport.addEventListener('keydown', this.onKeydown);
        this.viewport.addEventListener('touchstart', this.onTouchStart, {passive: true});
        this.viewport.addEventListener('touchmove', this.onTouchMove, {passive: true});
        this.viewport.addEventListener('touchend', this.onTouchEnd);
      }

      this.addEventListener('shopify:block:select', this.onBlockSelect);
      this.update();
    }

    disconnectedCallback() {
      if (this.prevButton) this.prevButton.removeEventListener('click', this.onPrevClick);
      if (this.nextButton) this.nextButton.removeEventListener('click', this.onNextClick);
      if (this.viewport) {
        this.viewport.removeEventListener('keydown', this.onKeydown);
        this.viewport.removeEventListener('touchstart', this.onTouchStart);
        this.viewport.removeEventListener('touchmove', this.onTouchMove);
        this.viewport.removeEventListener('touchend', this.onTouchEnd);
      }

      if (this.dots) this.dots.forEach((dot) => dot.removeEventListener('click', this.onDotClick));
      this.removeEventListener('shopify:block:select', this.onBlockSelect);
    }

    onPrevClick() {
      this.goTo(this.activeIndex - 1);
    }

    onNextClick() {
      this.goTo(this.activeIndex + 1);
    }

    onDotClick(event) {
      const index = Number(event.currentTarget.dataset.slideIndex);
      this.goTo(index);
    }

    onKeydown(event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.goTo(this.activeIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.goTo(this.activeIndex + 1);
      }
    }

    onTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.touchDeltaX = 0;
    }

    onTouchMove(event) {
      this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
    }

    onTouchEnd() {
      if (Math.abs(this.touchDeltaX) < 40) return;

      if (this.touchDeltaX > 0) {
        this.goTo(this.activeIndex - 1);
      } else {
        this.goTo(this.activeIndex + 1);
      }

      this.touchStartX = 0;
      this.touchDeltaX = 0;
    }

    onBlockSelect(event) {
      const selectedSlide = event.target.closest('[data-text-slide]');

      if (!selectedSlide) return;

      const selectedIndex = this.slides.indexOf(selectedSlide);

      if (selectedIndex < 0) return;

      this.goTo(selectedIndex);

      if (this.viewport) {
        this.viewport.focus({preventScroll: true});
      }
    }

    goTo(index) {
      const slideCount = this.slides.length;

      if (!slideCount) return;

      if (index < 0) {
        this.activeIndex = slideCount - 1;
      } else if (index >= slideCount) {
        this.activeIndex = 0;
      } else {
        this.activeIndex = index;
      }

      this.update();
    }

    update() {
      this.track.style.transform = `translate3d(-${this.activeIndex * 100}%, 0, 0)`;

      this.slides.forEach((slide, index) => {
        const isActive = index === this.activeIndex;
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      this.dots.forEach((dot, index) => {
        const isActive = index === this.activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }
  }

  customElements.define('jf-text-slider', JfTextSlider);
}

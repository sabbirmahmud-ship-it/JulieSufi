if (!customElements.get('jf-stockists-slider')) {
  class JfStockistsSlider extends HTMLElement {
    constructor() {
      super();
      this.handleScroll = this.handleScroll.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.handleBlockSelect = this.handleBlockSelect.bind(this);
    }

    connectedCallback() {
      this.viewport = this.querySelector('[data-stockists-track]');
      if (!this.viewport) return;

      this.slides = Array.from(this.querySelectorAll('[data-stockists-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-stockists-dot]'));
      this.prevButtons = Array.from(this.querySelectorAll('[data-stockists-prev]'));
      this.nextButtons = Array.from(this.querySelectorAll('[data-stockists-next]'));
      this.currentIndex = 0;

      this.prevButtons.forEach((button) => {
        button.addEventListener('click', () => this.goTo(this.currentIndex - 1));
      });

      this.nextButtons.forEach((button) => {
        button.addEventListener('click', () => this.goTo(this.currentIndex + 1));
      });

      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => {
          this.goTo(Number(dot.dataset.stockistsIndex));
        });
      });

      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.viewport);
      this.viewport.addEventListener('scroll', this.handleScroll, { passive: true });
      document.addEventListener('shopify:block:select', this.handleBlockSelect);

      this.handleResize();
    }

    disconnectedCallback() {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.viewport) this.viewport.removeEventListener('scroll', this.handleScroll);
      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
    }

    handleResize() {
      this.slides = Array.from(this.querySelectorAll('[data-stockists-slide]')).filter(
        (slide) => slide.offsetWidth > 0
      );

      if (!this.slides.length) return;

      if (this.currentIndex > this.slides.length - 1) {
        this.currentIndex = this.slides.length - 1;
      }

      this.goTo(this.currentIndex, false);
      this.updateUI();
    }

    handleScroll() {
      if (this.isProgrammaticScroll) return;

      this.updateCurrentIndexFromScroll();
      this.updateUI();
    }

    handleBlockSelect(event) {
      const selectedBlock = event.target.closest('[data-stockists-slide]');
      if (!selectedBlock || !this.contains(selectedBlock)) return;

      const index = Number(selectedBlock.dataset.stockistsIndex);
      if (Number.isNaN(index)) return;

      this.goTo(index, false);
    }

    updateCurrentIndexFromScroll() {
      if (!this.slides.length) return;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      this.slides.forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft - this.viewport.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      this.currentIndex = closestIndex;
    }

    updateUI() {
      const hasPrevious = this.currentIndex > 0;
      const hasNext = this.currentIndex < this.slides.length - 1;

      this.prevButtons.forEach((button) => {
        button.disabled = !hasPrevious;
      });

      this.nextButtons.forEach((button) => {
        button.disabled = !hasNext;
      });

      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    goTo(index, smooth = true) {
      if (!this.slides.length) return;

      const boundedIndex = Math.max(0, Math.min(index, this.slides.length - 1));
      const targetSlide = this.slides[boundedIndex];
      if (!targetSlide) return;

      this.currentIndex = boundedIndex;
      this.updateUI();

      this.isProgrammaticScroll = true;
      this.viewport.scrollTo({
        left: targetSlide.offsetLeft,
        behavior: smooth ? 'smooth' : 'auto',
      });

      window.clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = window.setTimeout(() => {
        this.isProgrammaticScroll = false;
        this.updateCurrentIndexFromScroll();
        this.updateUI();
      }, smooth ? 300 : 0);
    }
  }

  customElements.define('jf-stockists-slider', JfStockistsSlider);
}

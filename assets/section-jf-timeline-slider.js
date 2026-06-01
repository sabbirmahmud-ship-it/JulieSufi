if (!customElements.get('jf-timeline-slider')) {
  class JfTimelineSlider extends HTMLElement {
    constructor() {
      super();
      this.handlePrevClick = this.handlePrevClick.bind(this);
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handleBreakpointChange = this.handleBreakpointChange.bind(this);
      this.handleBlockSelect = this.handleBlockSelect.bind(this);
    }

    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-timeline-slide]'));
      if (!this.slides.length) return;

      this.prevButtons = Array.from(this.querySelectorAll('[data-timeline-prev]'));
      this.nextButtons = Array.from(this.querySelectorAll('[data-timeline-next]'));
      this.breakpoint = window.matchMedia('(min-width: 750px)');
      this.currentIndex = 0;

      this.prevButtons.forEach((button) => {
        button.addEventListener('click', this.handlePrevClick);
      });

      this.nextButtons.forEach((button) => {
        button.addEventListener('click', this.handleNextClick);
      });

      if (this.breakpoint.addEventListener) {
        this.breakpoint.addEventListener('change', this.handleBreakpointChange);
      } else {
        this.breakpoint.addListener(this.handleBreakpointChange);
      }

      document.addEventListener('shopify:block:select', this.handleBlockSelect);
      this.update();
    }

    disconnectedCallback() {
      this.prevButtons?.forEach((button) => {
        button.removeEventListener('click', this.handlePrevClick);
      });

      this.nextButtons?.forEach((button) => {
        button.removeEventListener('click', this.handleNextClick);
      });

      if (this.breakpoint) {
        if (this.breakpoint.removeEventListener) {
          this.breakpoint.removeEventListener('change', this.handleBreakpointChange);
        } else {
          this.breakpoint.removeListener(this.handleBreakpointChange);
        }
      }

      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
    }

    get visibleCount() {
      const desiredCount = this.breakpoint?.matches ? 3 : 1;
      return Math.min(desiredCount, this.slides.length);
    }

    get maxStartIndex() {
      return Math.max(0, this.slides.length - this.visibleCount);
    }

    handlePrevClick() {
      this.goTo(this.currentIndex - 1);
    }

    handleNextClick() {
      this.goTo(this.currentIndex + 1);
    }

    handleBreakpointChange() {
      this.currentIndex = Math.min(this.currentIndex, this.maxStartIndex);
      this.update();
    }

    handleBlockSelect(event) {
      const selectedSlide = event.target.closest('[data-timeline-slide]');
      if (!selectedSlide || !this.contains(selectedSlide)) return;

      const selectedIndex = Number(selectedSlide.dataset.timelineIndex);
      if (Number.isNaN(selectedIndex)) return;

      const centeredIndex = selectedIndex - Math.floor(this.visibleCount / 2);
      this.goTo(centeredIndex);
    }

    goTo(index) {
      const boundedIndex = Math.max(0, Math.min(index, this.maxStartIndex));
      if (boundedIndex === this.currentIndex && this.dataset.ready === 'true') return;

      this.currentIndex = boundedIndex;
      this.update();
    }

    update() {
      const startIndex = this.currentIndex;
      const endIndex = startIndex + this.visibleCount;
      const hasPrev = startIndex > 0;
      const hasNext = startIndex < this.maxStartIndex;

      this.style.setProperty('--jf-timeline-columns', String(this.visibleCount));

      this.slides.forEach((slide, index) => {
        const isVisible = index >= startIndex && index < endIndex;
        slide.classList.toggle('is-visible', isVisible);

        if (isVisible) {
          slide.dataset.visibleSlot = String(index - startIndex + 1);
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.removeAttribute('data-visible-slot');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      this.prevButtons.forEach((button) => {
        const slot = Number(button.closest('[data-timeline-slide]')?.dataset.visibleSlot || 0);
        const isVisibleButton = this.visibleCount === 1 || slot === 1;
        button.classList.toggle('is-hidden', !isVisibleButton);
        button.disabled = !hasPrev;
        button.setAttribute('aria-hidden', String(!isVisibleButton));
      });

      this.nextButtons.forEach((button) => {
        const slot = Number(button.closest('[data-timeline-slide]')?.dataset.visibleSlot || 0);
        const isVisibleButton = this.visibleCount === 1 || slot === this.visibleCount;
        button.classList.toggle('is-hidden', !isVisibleButton);
        button.disabled = !hasNext;
        button.setAttribute('aria-hidden', String(!isVisibleButton));
      });

      this.dataset.ready = 'true';
    }
  }

  customElements.define('jf-timeline-slider', JfTimelineSlider);
}

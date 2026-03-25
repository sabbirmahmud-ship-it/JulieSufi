if (!customElements.get('jf-review-slider')) {
  class JfReviewSlider extends HTMLElement {
    constructor() {
      super();
      this.handleResize = this.handleResize.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
      this.onModalOpen = this.onModalOpen.bind(this);
      this.onModalClose = this.onModalClose.bind(this);
      this.onModalBackdropClick = this.onModalBackdropClick.bind(this);
      this.onDialogClosed = this.onDialogClosed.bind(this);
    }

    connectedCallback() {
      this.track = this.querySelector('[data-review-track]');
      this.prevButton = this.querySelector('[data-review-prev]');
      this.nextButton = this.querySelector('[data-review-next]');
      this.modalOpenButtons = Array.from(this.querySelectorAll('[data-review-open]'));
      this.modalCloseButtons = Array.from(this.querySelectorAll('[data-review-close]'));
      this.modals = Array.from(this.querySelectorAll('[data-review-modal]'));

      this.modalOpenButtons.forEach((button) => button.addEventListener('click', this.onModalOpen));
      this.modalCloseButtons.forEach((button) => button.addEventListener('click', this.onModalClose));
      this.modals.forEach((modal) => {
        modal.addEventListener('click', this.onModalBackdropClick);
        modal.addEventListener('close', this.onDialogClosed);
      });

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
      if (this.modalOpenButtons) {
        this.modalOpenButtons.forEach((button) => button.removeEventListener('click', this.onModalOpen));
      }
      if (this.modalCloseButtons) {
        this.modalCloseButtons.forEach((button) => button.removeEventListener('click', this.onModalClose));
      }
      if (this.modals) {
        this.modals.forEach((modal) => {
          modal.removeEventListener('click', this.onModalBackdropClick);
          modal.removeEventListener('close', this.onDialogClosed);
        });
      }
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

    onModalOpen(event) {
      const modalId = event.currentTarget.getAttribute('aria-controls');
      const modal = modalId ? document.getElementById(modalId) : null;

      if (!modal || typeof modal.showModal !== 'function') return;

      this.activeModalTrigger = event.currentTarget;
      modal.showModal();
    }

    onModalClose(event) {
      const modal = event.currentTarget.closest('[data-review-modal]');

      if (modal) modal.close();
    }

    onModalBackdropClick(event) {
      if (event.target === event.currentTarget) {
        event.currentTarget.close();
      }
    }

    onDialogClosed() {
      if (this.activeModalTrigger) {
        this.activeModalTrigger.focus();
        this.activeModalTrigger = null;
      }
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

// if (!customElements.get('jf-product-details')) {
//   class JfProductDetails extends HTMLElement {
//     constructor() {
//       super();
//       this.handleScroll = this.handleScroll.bind(this);
//       this.handleResize = this.handleResize.bind(this);
//       this.toggleDescription = this.toggleDescription.bind(this);
//     }

//     connectedCallback() {
//       this.viewport = this.querySelector('[data-product-details-track]');
//       this.slides = Array.from(this.querySelectorAll('[data-product-details-slide]'));
//       this.dots = Array.from(this.querySelectorAll('[data-product-details-dot]'));
//       this.description = this.querySelector('[data-product-details-description]');
//       this.descriptionToggle = this.querySelector('[data-product-details-more]');
//       this.moreLabel = this.dataset.labelMore || 'See more';
//       this.lessLabel = this.dataset.labelLess || 'See less';
//       this.currentIndex = 0;
//       this.descriptionExpanded = false;

//       this.dots.forEach((dot) => {
//         dot.addEventListener('click', () => {
//           this.goTo(Number(dot.dataset.productDetailsDot));
//         });
//       });

//       if (this.viewport) {
//         this.viewport.addEventListener('scroll', this.handleScroll, { passive: true });
//         this.resizeObserver = new ResizeObserver(this.handleResize);
//         this.resizeObserver.observe(this.viewport);
//       }

//       if (this.descriptionToggle && this.description) {
//         this.descriptionToggle.addEventListener('click', this.toggleDescription);
//       }

//       this.handleResize();
//     }

//     disconnectedCallback() {
//       if (this.viewport) {
//         this.viewport.removeEventListener('scroll', this.handleScroll);
//       }

//       if (this.descriptionToggle) {
//         this.descriptionToggle.removeEventListener('click', this.toggleDescription);
//       }

//       if (this.resizeObserver) {
//         this.resizeObserver.disconnect();
//       }
//     }

//     handleResize() {
//       this.slides = Array.from(this.querySelectorAll('[data-product-details-slide]')).filter(
//         (slide) => slide.offsetWidth > 0
//       );

//       if (this.currentIndex > this.slides.length - 1) {
//         this.currentIndex = Math.max(this.slides.length - 1, 0);
//       }

//       this.goTo(this.currentIndex, false);
//       this.updateDescriptionState();
//       this.updateUI();
//     }

//     handleScroll() {
//       if (this.isProgrammaticScroll || !this.viewport || !this.slides.length) return;

//       let closestIndex = 0;
//       let closestDistance = Number.POSITIVE_INFINITY;

//       this.slides.forEach((slide, index) => {
//         const distance = Math.abs(slide.offsetLeft - this.viewport.scrollLeft);
//         if (distance < closestDistance) {
//           closestDistance = distance;
//           closestIndex = index;
//         }
//       });

//       this.currentIndex = closestIndex;
//       this.updateUI();
//     }

//     goTo(index, smooth = true) {
//       if (!this.viewport || !this.slides.length) {
//         this.updateUI();
//         return;
//       }

//       const boundedIndex = Math.max(0, Math.min(index, this.slides.length - 1));
//       const targetSlide = this.slides[boundedIndex];
//       if (!targetSlide) return;

//       this.currentIndex = boundedIndex;
//       this.updateUI();
//       this.isProgrammaticScroll = true;

//       this.viewport.scrollTo({
//         left: targetSlide.offsetLeft,
//         behavior: smooth ? 'smooth' : 'auto',
//       });

//       window.clearTimeout(this.scrollEndTimer);
//       this.scrollEndTimer = window.setTimeout(() => {
//         this.isProgrammaticScroll = false;
//         this.updateUI();
//       }, smooth ? 250 : 0);
//     }

//     updateUI() {
//       this.dots.forEach((dot, index) => {
//         const isActive = index === this.currentIndex;
//         dot.classList.toggle('is-active', isActive);

//         if (isActive) {
//           dot.setAttribute('aria-current', 'true');
//         } else {
//           dot.removeAttribute('aria-current');
//         }
//       });
//     }

//     toggleDescription() {
//       this.descriptionExpanded = !this.descriptionExpanded;
//       this.updateDescriptionState();
//     }

//     updateDescriptionState() {
//       if (!this.description || !this.descriptionToggle) return;

//       const isDesktop = window.matchMedia('(min-width: 990px)').matches;

//       if (isDesktop) {
//         this.description.classList.remove('jf-product-details__description--collapsed');
//         this.descriptionToggle.hidden = true;
//         return;
//       }

//       this.description.classList.toggle(
//         'jf-product-details__description--collapsed',
//         !this.descriptionExpanded
//       );

//       const hasOverflow = this.description.scrollHeight > this.description.clientHeight + 2;
//       this.descriptionToggle.hidden = !hasOverflow && !this.descriptionExpanded;
//       this.descriptionToggle.textContent = this.descriptionExpanded ? this.lessLabel : this.moreLabel;
//       this.descriptionToggle.setAttribute('aria-expanded', this.descriptionExpanded ? 'true' : 'false');
//     }
//   }

//   customElements.define('jf-product-details', JfProductDetails);
// }


if (!customElements.get('jf-product-details')) {
  class JfProductDetails extends HTMLElement {
    constructor() {
      super();
      this.handleScroll = this.handleScroll.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.toggleDescription = this.toggleDescription.bind(this);
    }

    connectedCallback() {
      this.viewport = this.querySelector('[data-product-details-track]');
      this.slides = Array.from(this.querySelectorAll('[data-product-details-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-product-details-dot]'));
      this.description = this.querySelector('[data-product-details-description]');
      this.descriptionToggle = this.querySelector('[data-product-details-more]');
      this.moreLabel = this.dataset.labelMore || 'See more';
      this.lessLabel = this.dataset.labelLess || 'See less';
      this.currentIndex = 0;
      this.descriptionExpanded = false;

      // ✅ Accordion logic (ONLY ONE OPEN AT A TIME)
      this.accordions = Array.from(this.querySelectorAll('.jf-product-details__accordion'));

      this.accordions.forEach((accordion) => {
        accordion.addEventListener('toggle', () => {
          if (accordion.open) {
            this.accordions.forEach((other) => {
              if (other !== accordion) {
                other.removeAttribute('open');
              }
            });
          }
        });
      });

      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => {
          this.goTo(Number(dot.dataset.productDetailsDot));
        });
      });

      if (this.viewport) {
        this.viewport.addEventListener('scroll', this.handleScroll, { passive: true });
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this.viewport);
      }

      if (this.descriptionToggle && this.description) {
        this.descriptionToggle.addEventListener('click', this.toggleDescription);
      }

      this.handleResize();
    }

    disconnectedCallback() {
      if (this.viewport) {
        this.viewport.removeEventListener('scroll', this.handleScroll);
      }

      if (this.descriptionToggle) {
        this.descriptionToggle.removeEventListener('click', this.toggleDescription);
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      // (optional cleanup)
      if (this.accordions) {
        this.accordions.forEach((accordion) => {
          accordion.removeEventListener('toggle', this.handleAccordionToggle);
        });
      }
    }

    handleResize() {
      this.slides = Array.from(this.querySelectorAll('[data-product-details-slide]')).filter(
        (slide) => slide.offsetWidth > 0
      );

      if (this.currentIndex > this.slides.length - 1) {
        this.currentIndex = Math.max(this.slides.length - 1, 0);
      }

      this.goTo(this.currentIndex, false);
      this.updateDescriptionState();
      this.updateUI();
    }

    handleScroll() {
      if (this.isProgrammaticScroll || !this.viewport || !this.slides.length) return;

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
      this.updateUI();
    }

    goTo(index, smooth = true) {
      if (!this.viewport || !this.slides.length) {
        this.updateUI();
        return;
      }

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
        this.updateUI();
      }, smooth ? 250 : 0);
    }

    updateUI() {
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

    toggleDescription() {
      this.descriptionExpanded = !this.descriptionExpanded;
      this.updateDescriptionState();
    }

    updateDescriptionState() {
      if (!this.description || !this.descriptionToggle) return;

      const isDesktop = window.matchMedia('(min-width: 990px)').matches;

      if (isDesktop) {
        this.description.classList.remove('jf-product-details__description--collapsed');
        this.descriptionToggle.hidden = true;
        return;
      }

      this.description.classList.toggle(
        'jf-product-details__description--collapsed',
        !this.descriptionExpanded
      );

      const hasOverflow = this.description.scrollHeight > this.description.clientHeight + 2;
      this.descriptionToggle.hidden = !hasOverflow && !this.descriptionExpanded;
      this.descriptionToggle.textContent = this.descriptionExpanded ? this.lessLabel : this.moreLabel;
      this.descriptionToggle.setAttribute('aria-expanded', this.descriptionExpanded ? 'true' : 'false');
    }
  }

  customElements.define('jf-product-details', JfProductDetails);
}

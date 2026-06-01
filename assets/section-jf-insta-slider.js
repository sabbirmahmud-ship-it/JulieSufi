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
      this.controls = this.querySelector('.jf-insta-slider__controls');
      this.feedEndpoint = this.dataset.instaFeedEndpoint;
      this.feedLimit = Number.parseInt(this.dataset.instaFeedLimit || '0', 10) || 0;
      this.feedHandle = this.dataset.instaFeedHandle || '';
      this.sectionId = this.dataset.instaSectionId || '';

      if (!this.track) return;

      this.initializeSlider();

      if (this.feedEndpoint) {
        this.loadFeed();
      }
    }

    initializeSlider() {
      if (!this.dots || !this.prevButton || !this.nextButton) return;

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
      this.toggleControls();

      if (!this.dots) return;

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
      this.toggleControls();

      if (!this.prevButton || !this.nextButton || !this.dots) return;

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

    toggleControls() {
      if (!this.controls) return;

      this.controls.hidden = !this.totalPages || this.totalPages < 2;
    }

    async loadFeed() {
      const url = this.buildFeedUrl();

      if (!url) return;

      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'same-origin',
        });

        if (!response.ok) return;

        const payload = await response.json();
        const posts = this.normalizePosts(payload);

        if (!posts.length) return;

        this.renderFeedSlides(posts);
      } catch (error) {
        console.warn('JF Instagram slider feed could not be loaded.', error);
      }
    }

    buildFeedUrl() {
      if (!this.feedEndpoint) return '';

      try {
        const url = new URL(this.feedEndpoint, window.location.origin);

        if (this.feedLimit > 0) {
          url.searchParams.set('limit', String(this.feedLimit));
        }

        if (this.feedHandle) {
          url.searchParams.set('handle', this.feedHandle);
        }

        if (this.sectionId) {
          url.searchParams.set('section_id', this.sectionId);
        }

        return url.toString();
      } catch (error) {
        console.warn('JF Instagram slider feed endpoint is invalid.', error);
        return '';
      }
    }

    normalizePosts(payload) {
      const source =
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload?.posts) && payload.posts) ||
        (Array.isArray(payload?.items) && payload.items) ||
        (Array.isArray(payload?.media) && payload.media) ||
        [];

      return source
        .map((item) => ({
          alt: item.alt || item.caption || '',
          imageUrl: item.image_url || item.imageUrl || item.media_url || item.mediaUrl || item.thumbnail_url || '',
          permalink: item.permalink || item.link || '',
        }))
        .filter((item) => item.imageUrl);
    }

    renderFeedSlides(posts) {
      const shouldSlider = posts.length > 5;

      this.track.classList.toggle('jf-insta-slider__track--slider', shouldSlider);
      this.track.classList.toggle('jf-insta-slider__track--grid', !shouldSlider);
      this.track.innerHTML = posts.map((post) => this.buildSlideMarkup(post)).join('');

      this.handleResize();
      this.track.scrollTo({ left: 0, behavior: 'auto' });
      this.updateState();
    }

    buildSlideMarkup(post) {
      const imageAlt = this.escapeHtml(post.alt);
      const imageMarkup = `
        <div class="jf-insta-slider__media">
          <img src="${this.escapeAttribute(post.imageUrl)}" alt="${imageAlt}" loading="lazy" sizes="(min-width: 750px) 20vw, 48vw">
        </div>
      `;

      if (post.permalink) {
        return `
          <li class="jf-insta-slider__slide" data-insta-slide>
            <a href="${this.escapeAttribute(post.permalink)}" class="jf-insta-slider__link">
              ${imageMarkup}
            </a>
          </li>
        `;
      }

      return `
        <li class="jf-insta-slider__slide" data-insta-slide>
          <div class="jf-insta-slider__card">
            ${imageMarkup}
          </div>
        </li>
      `;
    }

    escapeAttribute(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    escapeHtml(value) {
      return this.escapeAttribute(value).replace(/'/g, '&#39;');
    }
  }

  customElements.define('jf-insta-slider', JfInstaSlider);
}

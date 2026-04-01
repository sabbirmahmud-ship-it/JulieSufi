if (!customElements.get('jf-our-brides')) {
  class JfOurBrides extends HTMLElement {
    constructor() {
      super();

      this.currentPage = 1;
      this.mediaQuery = window.matchMedia('(min-width: 750px)');
      this.handlePaginationClick = this.handlePaginationClick.bind(this);
      this.handleViewportChange = this.handleViewportChange.bind(this);
      this.handleBlockSelect = this.handleBlockSelect.bind(this);
    }

    connectedCallback() {
      this.items = Array.from(this.querySelectorAll('[data-page-item]'));
      this.pagination = this.querySelector('[data-pagination]');
      this.paginationPages = this.querySelector('[data-pagination-pages]');
      this.prevButton = this.querySelector('[data-pagination-prev]');
      this.nextButton = this.querySelector('[data-pagination-next]');
      this.lastItemsPerPage = this.getItemsPerPage();

      if (!this.items.length || !this.pagination || !this.paginationPages || !this.prevButton || !this.nextButton) {
        return;
      }

      this.pagination.addEventListener('click', this.handlePaginationClick);

      if (typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.addEventListener('change', this.handleViewportChange);
      } else if (typeof this.mediaQuery.addListener === 'function') {
        this.mediaQuery.addListener(this.handleViewportChange);
      }

      document.addEventListener('shopify:block:select', this.handleBlockSelect);

      this.render();
    }

    disconnectedCallback() {
      if (this.pagination) {
        this.pagination.removeEventListener('click', this.handlePaginationClick);
      }

      if (typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.removeEventListener('change', this.handleViewportChange);
      } else if (typeof this.mediaQuery.removeListener === 'function') {
        this.mediaQuery.removeListener(this.handleViewportChange);
      }

      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
    }

    getItemsPerPage() {
      const key = this.mediaQuery.matches ? 'itemsPerPageDesktop' : 'itemsPerPageMobile';
      const value = parseInt(this.dataset[key], 10);

      if (Number.isNaN(value) || value < 1) {
        return this.items.length || 1;
      }

      return value;
    }

    getTotalPages() {
      return Math.max(1, Math.ceil(this.items.length / this.lastItemsPerPage));
    }

    render() {
      this.lastItemsPerPage = this.getItemsPerPage();

      const totalPages = this.getTotalPages();
      this.currentPage = Math.min(Math.max(this.currentPage, 1), totalPages);

      const startIndex = (this.currentPage - 1) * this.lastItemsPerPage;
      const endIndex = startIndex + this.lastItemsPerPage;

      this.items.forEach((item, index) => {
        item.hidden = index < startIndex || index >= endIndex;
      });

      if (totalPages <= 1) {
        this.pagination.hidden = true;
        this.paginationPages.innerHTML = '';
        return;
      }

      this.pagination.hidden = false;
      this.paginationPages.innerHTML = '';

      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jf-our-brides__pagination-button';
        button.textContent = String(page);
        button.dataset.page = String(page);

        if (page === this.currentPage) {
          button.classList.add('is-active');
          button.setAttribute('aria-current', 'page');
          button.disabled = true;
        } else {
          button.setAttribute('aria-label', `Go to page ${page}`);
        }

        this.paginationPages.appendChild(button);
      }

      this.prevButton.disabled = this.currentPage === 1;
      this.nextButton.disabled = this.currentPage === totalPages;
    }

    handlePaginationClick(event) {
      const pageButton = event.target.closest('[data-page]');

      if (pageButton) {
        this.currentPage = parseInt(pageButton.dataset.page, 10) || 1;
        this.render();
        return;
      }

      if (event.target.closest('[data-pagination-prev]') && this.currentPage > 1) {
        this.currentPage -= 1;
        this.render();
        return;
      }

      if (event.target.closest('[data-pagination-next]') && this.currentPage < this.getTotalPages()) {
        this.currentPage += 1;
        this.render();
      }
    }

    handleViewportChange() {
      const previousItemsPerPage = this.lastItemsPerPage;
      const nextItemsPerPage = this.getItemsPerPage();
      const firstVisibleItemIndex = (this.currentPage - 1) * previousItemsPerPage;

      this.currentPage = Math.floor(firstVisibleItemIndex / nextItemsPerPage) + 1;
      this.render();
    }

    handleBlockSelect(event) {
      const { blockId } = event.detail || {};

      if (!blockId) {
        return;
      }

      const selectedIndex = this.items.findIndex((item) => item.dataset.blockId === blockId);

      if (selectedIndex === -1) {
        return;
      }

      this.currentPage = Math.floor(selectedIndex / this.getItemsPerPage()) + 1;
      this.render();
    }
  }

  customElements.define('jf-our-brides', JfOurBrides);
}

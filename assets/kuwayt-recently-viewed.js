import { RecentlyViewed } from '@theme/recently-viewed-products';
import { sectionRenderer } from '@theme/section-renderer';

class KuwaytRecentlyViewed extends HTMLElement {
  connectedCallback() {
    if (this.dataset.loaded === 'true') return;
    this.dataset.loaded = 'true';
    this.#load();
  }

  async #load() {
    const ids = RecentlyViewed.getProducts();
    const grid = this.querySelector('[data-kuwayt-recent-grid]');
    if (!grid || ids.length === 0 || !this.dataset.sectionId || !this.dataset.searchUrl) {
      this.hidden = true;
      return;
    }

    const url = new URL(this.dataset.searchUrl, window.location.origin);
    url.searchParams.set('q', ids.map((id) => `id:${id}`).join(' OR '));
    url.searchParams.set('type', 'product');

    try {
      const html = await sectionRenderer.getSectionHTML(this.dataset.sectionId, false, url);
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const freshGrid = parsed.querySelector('[data-kuwayt-recent-grid]');
      if (!freshGrid || freshGrid.dataset.hasProducts !== 'true') {
        this.hidden = true;
        return;
      }

      grid.innerHTML = freshGrid.innerHTML;
      grid.dataset.hasProducts = 'true';
      this.hidden = false;
    } catch (error) {
      this.hidden = true;
      console.error(error);
    }
  }
}

if (!customElements.get('kuwayt-recently-viewed')) {
  customElements.define('kuwayt-recently-viewed', KuwaytRecentlyViewed);
}

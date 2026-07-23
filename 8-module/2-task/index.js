import createElement from "../../assets/lib/create-element.js";
import ProductCard from "../../6-module/2-task/index.js";

export default class ProductGrid {
  constructor(products) {
    this.products = products;
    this.filters = {
      category: null,
      noNuts: null,
      vegeterianOnly: null,
      maxSpiciness: null,
    };
    this.gridInner = null;
    this.elem = this.renderProductGrid();
  }

  renderProductGrid() {
    const grid = createElement(`
      <div class="products-grid">
        <div class="products-grid__inner">
        </div>
      </div>
    `);

    this.gridInner = grid.querySelector(".products-grid__inner");
    this.gridInner.append(...this.renderProductCards(this.products));
    return grid;
  }

  renderProductCards(products) {
    this.gridInner.replaceChildren();

    const filteredProducts = this.applyFilters(products);
    const filteredCards = filteredProducts.map((product) => {
      return createElement(`
        <div class="card">
          <div class="card__top">
            <img src="/assets/images/products/${
              product.image
            }" class="card__image" alt="${product.name}">
            <span class="card__price">€${product.price.toFixed(2)}</span>
          </div>
          <div class="card__body">
            <div class="card__title">${product.name}</div>
            <button type="button" class="card__button">
              <img src="/assets/images/icons/plus-icon.svg" alt="icon">
            </button>
          </div>
        </div>
      `);
    });

    this.gridInner.append(...filteredCards);
    return filteredCards;
  }

  updateFilter(filters) {
    Object.assign(this.filters, filters);
    this.renderProductCards(this.products);
  }

  applyFilters(products) {
    return products.filter((product) => {
      if (this.filters.noNuts === true && product.nuts === true) {
        return false;
      }

      if (this.filters.vegeterianOnly === true && !product.vegeterian) {
        return false;
      }

      if (
        this.filters.maxSpiciness !== null &&
        product.spiciness > this.filters.maxSpiciness
      ) {
        return false;
      }

      if (
        this.filters.category !== null &&
        this.filters.category !== "" &&
        product.category !== this.filters.category
      ) {
        return false;
      }

      return true;
    });
  }
}

import Carousel from "../../6-module/3-task/index.js";
import slides from "../../6-module/3-task/slides.js";

import RibbonMenu from "../../7-module/1-task/index.js";
import categories from "../../7-module/1-task/categories.js";

import StepSlider from "../../7-module/4-task/index.js";
import ProductsGrid from "../../8-module/2-task/index.js";

import CartIcon from "../../8-module/1-task/index.js";
import Cart from "../../8-module/4-task/index.js";

export default class Main {
  constructor() {
    this.products = [];

    this.cart = null;
    this.carousel = null;
    this.ribbonMenu = null;
    this.slider = null;
    this.cartIcon = null;
    this.productsGrid = null;

    document.body.addEventListener("product-add", this.handleProductAdd);
    document.body.addEventListener("slider-change", this.handleSliderChange);
    document.body.addEventListener("ribbon-select", this.handleRibbonSelect);
  }

  async render() {
    this.products = await this.fetchStoreData();

    this.carousel = new Carousel(slides);
    this.ribbonMenu = new RibbonMenu(categories);
    this.slider = new StepSlider({ steps: 5, value: 3 });
    this.cartIcon = new CartIcon();
    this.cart = new Cart(this.cartIcon);
    this.productsGrid = new ProductsGrid(this.products);

    document
      .querySelector("[data-carousel-holder]")
      .appendChild(this.carousel.elem);
    document
      .querySelector("[data-ribbon-holder]")
      .appendChild(this.ribbonMenu.elem);
    document
      .querySelector("[data-slider-holder]")
      .appendChild(this.slider.elem);
    document
      .querySelector("[data-cart-icon-holder]")
      .appendChild(this.cartIcon.elem);

    const productsGridHolder = document.querySelector(
      "[data-products-grid-holder]",
    );

    productsGridHolder.innerHTML = "";
    productsGridHolder.appendChild(this.productsGrid.elem);

    const initialFilters = {
      noNuts: document.getElementById("nuts-checkbox").checked,
      vegeterianOnly: document.getElementById("vegeterian-checkbox").checked,
      maxSpiciness: this.slider.value,
      category: null,
    };

    this.productsGrid.updateFilter(initialFilters);

    document.addEventListener(
      "change",
      function (event) {
        const target = event.target;
        if (target.id === "nuts-checkbox") {
          const checked = target.checked;
          this.productsGrid.updateFilter({ noNuts: checked });
        } else if (target.id === "vegeterian-checkbox") {
          const checked = target.checked;
          this.productsGrid.updateFilter({ vegeterianOnly: checked });
        }
      }.bind(this),
    );

    return Promise.resolve();
  }

  async fetchStoreData() {
    const response = await fetch("products.json");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const storeData = await response.json();
    return storeData;
  }
  catch(error) {
    console.error("Fetch failed:", error);
  }

  handleProductAdd = async (event) => {
    const productId = event.detail;
    const product = this.products.find((item) => item.id === productId);

    try {
      await this.cart.addProduct(product);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  handleSliderChange = (event) => {
    let value = event.detail;
    console.log(value);

    this.productsGrid.updateFilter({
      maxSpiciness: value,
    });
  };

  handleRibbonSelect = (event) => {
    let categoryId = event.detail;

    this.productsGrid.updateFilter({
      category: categoryId,
    });
  };
}

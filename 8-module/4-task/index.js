import createElement from "../../assets/lib/create-element.js";
import escapeHtml from "../../assets/lib/escape-html.js";

import Modal from "../../7-module/2-task/index.js";

export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;
    this.modalInstance = null;

    this.addEventListeners();
  }

  addProduct(product) {
    if (!product || typeof product !== "object") {
      return;
    }

    const existingItem = this.cartItems.find(
      (item) => item.product.id === product.id,
    );
    let cartItem;

    if (existingItem) {
      existingItem.count += 1;
      cartItem = existingItem;
    } else {
      cartItem = {
        product: product,
        count: 1,
      };
      this.cartItems.push(cartItem);
    }

    this.onProductUpdate(cartItem);
  }

  updateProductCount(productId, amount) {
    const cartItem = this.cartItems.find(
      (item) => item.product.id === productId,
    );

    if (!cartItem) {
      return;
    }

    cartItem.count += amount;

    if (cartItem.count <= 0) {
      const index = this.cartItems.indexOf(cartItem);
      if (index > -1) {
        this.cartItems.splice(index, 1);
      }
    }

    this.onProductUpdate(cartItem);
  }

  isEmpty() {
    return this.cartItems.length === 0;
  }

  getTotalCount() {
    return this.cartItems.reduce((total, item) => total + item.count, 0);
  }

  getTotalPrice() {
    return this.cartItems.reduce((total, item) => {
      return total + item.product.price * item.count;
    }, 0);
  }

  renderProduct(product, count) {
    return createElement(`
    <div class="cart-product" data-product-id="${product.id}">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${product.price.toFixed(2)}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2,
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
    this.modalInstance = new Modal();
    this.modalInstance.open();
    this.modalWin = this.modalInstance.elem;

    const title = this.modalWin.querySelector(".modal__title");
    this.modalInstance.setTitle("Your order");

    const productsContainer = document.createElement("div");
    for (const { product, count } of this.cartItems) {
      const productHtml = this.renderProduct(product, count);
      productsContainer.append(productHtml);
    }

    if (productsContainer) {
      productsContainer.addEventListener(
        "click",
        this.handleCounter.bind(this),
      );
    }

    const formHtml = this.renderOrderForm();
    productsContainer.append(formHtml);
    formHtml.addEventListener("submit", this.onSubmit.bind(this));

    this.modalInstance.setBody(productsContainer);
  }

  onProductUpdate(cartItem) {
    let productId = cartItem.product.id;
    let modalBody = this.modalWin;
    if (document.body.classList.contains("is-modal-open") && this.modalWin) {
      let productCount = modalBody.querySelector(
        `[data-product-id="${productId}"] .cart-counter__count`,
      );
      let productPrice = modalBody.querySelector(
        `[data-product-id="${productId}"] .cart-product__price`,
      );
      let infoPrice = modalBody.querySelector(`.cart-buttons__info-price`);

      productCount.innerHTML = cartItem.count;
      productPrice.innerHTML = `€${(
        cartItem.product.price * cartItem.count
      ).toFixed(2)}`;
      infoPrice.innerHTML = `€${this.getTotalPrice().toFixed(2)}`;
    }

    if (this.isEmpty()) {
      this.modalInstance.close();
    }

    if (cartItem.count === 0 && this.modalWin) {
      const productElem = this.modalWin.querySelector(
        `[data-product-id="${productId}"]`,
      );

      if (productElem) {
        productElem.remove();
      }
    }

    this.cartIcon.update(this);
  }

  async onSubmit(event) {
    event.preventDefault();
    const modalForm = event.target;
    if (this.modalWin) {
      const submitBtn = this.modalWin.querySelector(".btn-group__button");
      submitBtn.classList.add("is-loading");

      let response = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: new FormData(modalForm),
      });

      if (response.ok) {
        const title = this.modalWin.querySelector(".modal__title");
        const modalBody = this.modalWin.querySelector(".modal__body");
        this.modalInstance.setTitle("Success!");
        this.cartItems = [];

        modalBody.innerHTML = `
          <div class="modal__body-inner">
            <p>
              Order successful! Your order is being cooked :) <br>
              We’ll notify you about delivery time shortly.<br>
              <img src="/assets/images/delivery.gif">
            </p>
          </div>
        `;
      } else {
        alert("Fix me!");
      }
    }
  }

  handleCounter = (e) => {
    const targetBtn = event.target.closest("button");

    const productId = e.target.closest(".cart-product").dataset.productId;
    const amount = targetBtn.classList.contains("cart-counter__button_plus")
      ? 1
      : -1;
    this.updateProductCount(productId, amount);
  };

  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }
}

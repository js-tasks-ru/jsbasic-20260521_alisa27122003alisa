export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;
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

  onProductUpdate(cartItem) {
    // реализуем в следующей задаче

    this.cartIcon.update(this);
  }
}

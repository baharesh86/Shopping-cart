import { productsData } from "./products.js";

// cart modal
const cartBtn = document.querySelector(".cart-icon");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const confirmBtn = document.querySelector(".confirm");

const cartContainer = document.querySelector(".cart-container");
const productsContainer = document.querySelector(".content-center");
const cartTotal = document.querySelector(".total-price");
const cartItem = document.querySelector(".cart-number");
const cartContent = document.querySelector(".cart-products");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDOM = [];

// get products
class Products {
    getProducts() {
        return productsData;
    }
}

// app view
class Ui {
    // products view
    productsView(products) {
        let result = "";
        products.forEach((product) => {
            result += `<div class="product">
            <div class="img-container">
            <div class="image-container"><img class="product-img" src=${product.imageUrl} alt="#"></div>
          </div>
          <div class="product-desc">
          <p class="product-title">${product.title}</p>
          <p class="product-price">${product.price}$</p>
          </div>
          <button class="add-to-cart-btn" data-id="${product.id}">
          <i class="fa-solid fa-cart-shopping"></i>
          Add To Cart</button>
          </div>`;
        });
        productsContainer.innerHTML = result;
    };

    getAddToCartBtns() {
        const addToCartBtns = [ ...document.querySelectorAll(".add-to-cart-btn") ];
        buttonsDOM = addToCartBtns;

        addToCartBtns.forEach((btn) => {
            const id = btn.dataset.id;
            // check if this product id is in cart ?
            const isInCart = cart.find((item) => item.id === parseInt(id));
            if (isInCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener("click", (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get added to cart products
                const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
                // update cart 
                cart = [ ...cart, addedProduct ];

                // update cart 
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // update cart view
                this.addCartItem(addedProduct);
            });

        });
    };


    setCartValue(cart) {
        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItems += curr.quantity;
            return curr.quantity * curr.price + acc;
        }, 0);
        cartTotal.innerText = `total price : ${parseFloat(totalPrice).toFixed(
            2
        )} $`;
        cartItem.innerText = tempCartItems;
    };


    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
                    <img src=${cartItem.imageUrl} alt="#">
                    <div class="cart-item-details">
                    <p class="cart-item-title">${cartItem.title}</p>
                        <p class="cart-item-price">${cartItem.price}</p>
                        </div>

                    <div class="cart-item-right">
                        <div class="cart-item-quantity">
                            <span class="icon increment" data-id="${cartItem.id}"><i class="fas fa-chevron-up"></i></span>
                            <p class="number">${cartItem.quantity}</p>
                            <span class="icon decrement" data-id="${cartItem.id}"><i class="fas fa-chevron-down"></i></span>
                        </div>
                        <span class="icon delete" data-id="${cartItem.id}"><i class="fa-solid fa-trash"></i></span>
                        </div>
        `;
        cartContent.appendChild(div);
    }

    setupApp() {
        cart = Storage.getCart();
        cart.forEach((cartItem) => this.addCartItem(cartItem));
        this.setCartValue(cart);
    }

    cartLogic() {
        // clear 
        clearCart.addEventListener("click", () => this.clearCart());

        // delete, increment, decrement cart item
        cartContent.addEventListener("click", (event) => {
            // delete item
            if (event.target.classList.contains("fa-trash")) {
                const id = event.target.parentElement.dataset.id;
                console.log(id);
                // remove from DOM :
                cartContent.removeChild(event.target.parentElement.parentElement.parentElement);
                // update cart & storage 
                this.removeItem(id);

            } else if (event.target.classList.contains("fa-chevron-up")) {
                const id = event.target.parentElement.dataset.id;
                const addedItem = cart.find((c) => c.id == id);
                addedItem.quantity++;
                // update storage
                Storage.saveCart(cart);
                // update total price
                this.setCartValue(cart);
                // update item quantity :
                event.target.parentElement.nextElementSibling.innerText = addedItem.quantity;

            } else if (event.target.classList.contains("fa-chevron-down")) {
                const id = event.target.parentElement.dataset.id;
                const substractedItem = cart.find((c) => c.id == id);

                if (substractedItem.quantity === 1) {
                    this.removeItem(id);
                    console.log(event.target.parentElement.parentElement.parentElement.parentElement);
                    cartContent.removeChild(event.target.parentElement.parentElement.parentElement.parentElement);
                    return;
                }
                substractedItem.quantity--;
                // update storage
                Storage.saveCart(cart);
                // update total price
                this.setCartValue(cart);
                // update item quantity :
                event.target.parentElement.previousElementSibling.innerText = substractedItem.quantity;
            }
        });
    }

    clearCart() {
        cart.forEach((cItem) => this.removeItem(cItem.id));
        while (cartContent.children.length) {
            cartContent.removeChild(cartContent.children[ 0 ]);
        }
    }

    removeItem(id) {
        // update cart
        cart = cart.filter((cartItem) => cartItem.id != id);
        // update cart value
        this.setCartValue(cart);
        // update cart from storage
        Storage.saveCart(cart);

        // update addtocartbtns
        const button = this.getSingleButton(id);
        button.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add To Cart`;
        button.disabled = false;
    }
    getSingleButton(id) {
        return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
    }

}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id == id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return JSON.parse(localStorage.getItem("cart"))
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new Ui;
    ui.setupApp();
    // get products data
    const products = new Products;
    const productsData = products.getProducts();
    // show products
    ui.productsView(productsData);
    ui.getAddToCartBtns();
    // remove cart items
    ui.cartLogic();
    // save products
    Storage.saveProducts(productsData);
});




// cart modal
cartBtn.addEventListener("click", showCart);
confirmBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

function showCart() {
    backdrop.style.display = "flex";
    cartContainer.style.display = "flex";
    cartModal.style.opacity = "1";
    cartModal.style.top = "20%";
}
function closeCart() {
    cartContainer.style.display = "none";
    backdrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";
}

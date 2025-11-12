const categoriesController = require("../controllers/categoriesController");
const productsController = require("../controllers/productsController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");

const routes = [
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h
        .response({
          status: "success",
          message: "Restaurant API is running",
          endpoints: {
            categories: "/categories",
            products: "/products",
            carts: "/carts",
            orders: "/orders",
          },
        })
        .code(200);
    },
  },

  // Categories Routes
  {
    method: "GET",
    path: "/categories",
    handler: categoriesController.getAllCategories,
  },
  {
    method: "GET",
    path: "/categories/{id}",
    handler: categoriesController.getCategoryById,
  },
  {
    method: "POST",
    path: "/categories",
    handler: categoriesController.createCategory,
  },
  {
    method: "PUT",
    path: "/categories/{id}",
    handler: categoriesController.updateCategory,
  },
  {
    method: "DELETE",
    path: "/categories/{id}",
    handler: categoriesController.deleteCategory,
  },

  // Products Routes
  {
    method: "GET",
    path: "/products",
    handler: productsController.getAllProducts,
  },
  {
    method: "GET",
    path: "/products/{id}",
    handler: productsController.getProductById,
  },
  {
    method: "POST",
    path: "/products",
    handler: productsController.createProduct,
  },
  {
    method: "PUT",
    path: "/products/{id}",
    handler: productsController.updateProduct,
  },
  {
    method: "DELETE",
    path: "/products/{id}",
    handler: productsController.deleteProduct,
  },

  // Cart Routes
  {
    method: "GET",
    path: "/carts",
    handler: cartController.getAllCartItems,
  },
  {
    method: "GET",
    path: "/carts/{id}",
    handler: cartController.getCartItemById,
  },
  {
    method: "POST",
    path: "/carts",
    handler: cartController.addToCart,
  },
  {
    method: "PUT",
    path: "/carts/{id}",
    handler: cartController.updateCartItem,
  },
  {
    method: "DELETE",
    path: "/carts/{id}",
    handler: cartController.deleteCartItem,
  },
  {
    method: "DELETE",
    path: "/carts",
    handler: cartController.clearCart,
  },

  // Order Routes
  {
    method: "GET",
    path: "/orders",
    handler: orderController.getAllOrders,
  },
  {
    method: "GET",
    path: "/orders/{id}",
    handler: orderController.getOrderById,
  },
  {
    method: "POST",
    path: "/orders",
    handler: orderController.createOrder,
  },
  {
    method: "DELETE",
    path: "/orders/{id}",
    handler: orderController.deleteOrder,
  },
];

module.exports = routes;

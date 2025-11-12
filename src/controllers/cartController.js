const pool = require("../config/database");

const cartController = {
  getAllCartItems: async (request, h) => {
    try {
      const { product_id } = request.query;

      let query = `
        SELECT cart.*,
          json_build_object(
            'id', products.id,
            'code', products.code,
            'name', products.name,
            'price', products.price,
            'is_available', products.is_available,
            'image', products.image,
            'category', json_build_object('id', categories.id, 'name', categories.name)
          ) as product
        FROM cart
        JOIN products ON cart.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
      `;

      const params = [];

      if (product_id) {
        query += ` WHERE cart.product_id = $1`;
        params.push(product_id);
      }

      query += ` ORDER BY cart.created_at DESC`;

      const result = await pool.query(query, params);

      return h.response(result.rows).code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch cart",
        })
        .code(500);
    }
  },

  getCartItemById: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        `
        SELECT cart.*,
          json_build_object(
            'id', products.id,
            'code', products.code,
            'name', products.name,
            'price', products.price,
            'is_available', products.is_available,
            'image', products.image,
            'category', json_build_object('id', categories.id, 'name', categories.name)
          ) as product
        FROM cart
        JOIN products ON cart.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE cart.id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Cart item not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          data: result.rows[0],
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch cart item",
        })
        .code(500);
    }
  },

  addToCart: async (request, h) => {
    try {
      const { product_id, quantity, notes } = request.payload;

      const productResult = await pool.query(
        "SELECT price FROM products WHERE id = $1",
        [product_id]
      );

      if (productResult.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Product not found",
          })
          .code(404);
      }

      const totalPrice = productResult.rows[0].price * quantity;

      const result = await pool.query(
        `
        INSERT INTO cart (product_id, quantity, total_price, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
        [product_id, quantity, totalPrice, notes]
      );

      const cart = await pool.query(
        `
        SELECT cart.*,
          json_build_object(
            'id', products.id,
            'code', products.code,
            'name', products.name,
            'price', products.price,
            'is_available', products.is_available,
            'image', products.image,
            'category', json_build_object('id', categories.id, 'name', categories.name)
          ) as product
        FROM cart
        JOIN products ON cart.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE cart.id = $1
      `,
        [result.rows[0].id]
      );

      return h
        .response({
          status: "success",
          message: "Item added to cart",
          data: cart.rows[0],
        })
        .code(201);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to add item to cart",
        })
        .code(500);
    }
  },

  updateCartItem: async (request, h) => {
    try {
      const { id } = request.params;
      const { quantity, notes } = request.payload;

      const cartItem = await pool.query(
        `
        SELECT cart.product_id, products.price
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.id = $1
      `,
        [id]
      );

      if (cartItem.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Cart item not found",
          })
          .code(404);
      }

      const totalPrice = cartItem.rows[0].price * quantity;

      await pool.query(
        `
        UPDATE cart
        SET quantity = $1, total_price = $2, notes = $3
        WHERE id = $4
      `,
        [quantity, totalPrice, notes, id]
      );

      const result = await pool.query(
        `
        SELECT cart.*,
          json_build_object(
            'id', products.id,
            'code', products.code,
            'name', products.name,
            'price', products.price,
            'is_available', products.is_available,
            'image', products.image,
            'category', json_build_object('id', categories.id, 'name', categories.name)
          ) as product
        FROM cart
        JOIN products ON cart.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE cart.id = $1
      `,
        [id]
      );

      return h
        .response({
          status: "success",
          message: "Cart item updated",
          data: result.rows[0],
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to update cart item",
        })
        .code(500);
    }
  },

  deleteCartItem: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        "DELETE FROM cart WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Cart item not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "Cart item deleted",
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to delete cart item",
        })
        .code(500);
    }
  },

  clearCart: async (request, h) => {
    try {
      await pool.query("DELETE FROM cart");

      return h
        .response({
          status: "success",
          message: "Cart cleared",
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to clear cart",
        })
        .code(500);
    }
  },
};

module.exports = cartController;

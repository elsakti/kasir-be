const pool = require("../config/database");

const productsController = {
  getAllProducts: async (request, h) => {
    try {
      const { category } = request.query;

      let query = `
        SELECT products.*,
          json_build_object('id', categories.id, 'name', categories.name) as category
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
      `;

      const params = [];

      if (category) {
        query += ` WHERE categories.name = $1`;
        params.push(category);
      }

      query += ` ORDER BY products.id`;

      const result = await pool.query(query, params);

      return h.response(result.rows).code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch products",
        })
        .code(500);
    }
  },

  getProductById: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        `
        SELECT products.*,
          json_build_object('id', categories.id, 'name', categories.name) as category
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Product not found",
          })
          .code(404);
      }

      return h.response(result.rows[0]).code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch product",
        })
        .code(500);
    }
  },

  createProduct: async (request, h) => {
    try {
      const { code, name, price, is_available, image, category_id } =
        request.payload;

      const result = await pool.query(
        `
        INSERT INTO products (code, name, price, is_available, image, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [code, name, price, is_available, image, category_id]
      );

      const product = await pool.query(
        `
        SELECT products.*,
          json_build_object('id', categories.id, 'name', categories.name) as category
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = $1
      `,
        [result.rows[0].id]
      );

      return h.response(product.rows[0]).code(201);
    } catch (error) {
      if (error.code === "23505") {
        return h
          .response({
            status: "fail",
            message: "Product code already exists",
          })
          .code(400);
      }
      return h
        .response({
          status: "error",
          message: "Failed to create product",
        })
        .code(500);
    }
  },

  updateProduct: async (request, h) => {
    try {
      const { id } = request.params;
      const { code, name, price, is_available, image, category_id } =
        request.payload;

      const result = await pool.query(
        `
        UPDATE products
        SET code = $1, name = $2, price = $3, is_available = $4, image = $5, category_id = $6
        WHERE id = $7
        RETURNING *
      `,
        [code, name, price, is_available, image, category_id, id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Product not found",
          })
          .code(404);
      }

      const product = await pool.query(
        `
        SELECT products.*,
          json_build_object('id', categories.id, 'name', categories.name) as category
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = $1
      `,
        [id]
      );

      return h.response(product.rows[0]).code(200);
    } catch (error) {
      if (error.code === "23505") {
        return h
          .response({
            status: "fail",
            message: "Product code already exists",
          })
          .code(400);
      }
      return h
        .response({
          status: "error",
          message: "Failed to update product",
        })
        .code(500);
    }
  },

  deleteProduct: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Product not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "Product deleted successfully",
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to delete product",
        })
        .code(500);
    }
  },
};

module.exports = productsController;

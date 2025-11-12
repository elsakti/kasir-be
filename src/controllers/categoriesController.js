const pool = require("../config/database");

const categoriesController = {
  // Get all categories
  getAllCategories: async (request, h) => {
    try {
      const result = await pool.query("SELECT * FROM categories ORDER BY id");
      return h.response(result.rows).code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch categories",
        })
        .code(500);
    }
  },

  // Get category by ID
  getCategoryById: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Category not found",
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
          message: "Failed to fetch category",
        })
        .code(500);
    }
  },

  // Create new category
  createCategory: async (request, h) => {
    try {
      const { name } = request.payload;
      const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );

      return h
        .response({
          status: "success",
          message: "Category created successfully",
          data: result.rows[0],
        })
        .code(201);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to create category",
        })
        .code(500);
    }
  },

  // Update category
  updateCategory: async (request, h) => {
    try {
      const { id } = request.params;
      const { name } = request.payload;

      const result = await pool.query(
        "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Category not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "Category updated successfully",
          data: result.rows[0],
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to update category",
        })
        .code(500);
    }
  },

  // Delete category
  deleteCategory: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        "DELETE FROM categories WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Category not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "Category deleted successfully",
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to delete category",
        })
        .code(500);
    }
  },
};

module.exports = categoriesController;

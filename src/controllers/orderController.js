const pool = require("../config/database");

const orderController = {
  getAllOrders: async (request, h) => {
    try {
      const result = await pool.query(`
        SELECT orders.id, orders.total_amount, orders.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', order_items.id,
                'quantity', order_items.quantity,
                'total_price', order_items.total_price,
                'notes', order_items.notes,
                'product', json_build_object(
                  'id', products.id,
                  'code', products.code,
                  'name', products.name,
                  'price', products.price,
                  'is_available', products.is_available,
                  'image', products.image,
                  'category', json_build_object('id', categories.id, 'name', categories.name)
                )
              ) ORDER BY order_items.id
            ) FILTER (WHERE order_items.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders
        LEFT JOIN order_items ON orders.id = order_items.order_id
        LEFT JOIN products ON order_items.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        GROUP BY orders.id
        ORDER BY orders.created_at DESC
      `);

      return h
        .response({
          status: "success",
          data: result.rows,
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to fetch orders",
        })
        .code(500);
    }
  },

  getOrderById: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        `
        SELECT orders.id, orders.total_amount, orders.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', order_items.id,
                'quantity', order_items.quantity,
                'total_price', order_items.total_price,
                'notes', order_items.notes,
                'product', json_build_object(
                  'id', products.id,
                  'code', products.code,
                  'name', products.name,
                  'price', products.price,
                  'is_available', products.is_available,
                  'image', products.image,
                  'category', json_build_object('id', categories.id, 'name', categories.name)
                )
              ) ORDER BY order_items.id
            ) FILTER (WHERE order_items.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders
        LEFT JOIN order_items ON orders.id = order_items.order_id
        LEFT JOIN products ON order_items.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE orders.id = $1
        GROUP BY orders.id
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Order not found",
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
          message: "Failed to fetch order",
        })
        .code(500);
    }
  },

  createOrder: async (request, h) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { items } = request.payload;

      let totalAmount = 0;
      for (const item of items) {
        const productResult = await client.query(
          "SELECT price FROM products WHERE id = $1",
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return h
            .response({
              status: "fail",
              message: `Product with id ${item.product_id} not found`,
            })
            .code(404);
        }

        totalAmount += productResult.rows[0].price * item.quantity;
      }

      const orderResult = await client.query(
        "INSERT INTO orders (total_amount) VALUES ($1) RETURNING *",
        [totalAmount]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of items) {
        const productResult = await client.query(
          "SELECT price FROM products WHERE id = $1",
          [item.product_id]
        );

        const totalPrice = productResult.rows[0].price * item.quantity;

        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, total_price, notes) VALUES ($1, $2, $3, $4, $5)",
          [orderId, item.product_id, item.quantity, totalPrice, item.notes || null]
        );
      }

      await client.query("COMMIT");

      const result = await pool.query(
        `
        SELECT orders.id, orders.total_amount, orders.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', order_items.id,
                'quantity', order_items.quantity,
                'total_price', order_items.total_price,
                'notes', order_items.notes,
                'product', json_build_object(
                  'id', products.id,
                  'code', products.code,
                  'name', products.name,
                  'price', products.price,
                  'is_available', products.is_available,
                  'image', products.image,
                  'category', json_build_object('id', categories.id, 'name', categories.name)
                )
              ) ORDER BY order_items.id
            ) FILTER (WHERE order_items.id IS NOT NULL),
            '[]'
          ) as items
        FROM orders
        LEFT JOIN order_items ON orders.id = order_items.order_id
        LEFT JOIN products ON order_items.product_id = products.id
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE orders.id = $1
        GROUP BY orders.id
      `,
        [orderId]
      );

      return h
        .response({
          status: "success",
          message: "Order created successfully",
          data: result.rows[0],
        })
        .code(201);
    } catch (error) {
      await client.query("ROLLBACK");
      return h
        .response({
          status: "error",
          message: "Failed to create order",
        })
        .code(500);
    } finally {
      client.release();
    }
  },

  deleteOrder: async (request, h) => {
    try {
      const { id } = request.params;
      const result = await pool.query(
        "DELETE FROM orders WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return h
          .response({
            status: "fail",
            message: "Order not found",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          message: "Order deleted successfully",
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: "error",
          message: "Failed to delete order",
        })
        .code(500);
    }
  },
};

module.exports = orderController;

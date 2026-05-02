import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-80493524/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default menu if not exists
async function initializeMenu() {
  // Always update menu to latest version
  const defaultMenu = {
      categories: [
        {
          id: "platos-principales",
          name: "Platos Principales",
          products: [
            { id: "plato-1", name: "Carne Sudada", price: 16000, description: "Carne en salsa criolla con arroz", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.43-pm.jpeg?w=768" },
            { id: "plato-2", name: "Pollo Sudado", price: 15000, description: "Pollo en salsa criolla", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/pollo-asado.jpg?w=640" },
            { id: "plato-3", name: "Pollo a la Brasa", price: 16000, description: "Pollo a la brasa jugoso", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/muslo-de-pollo.jpg?w=612" },
            { id: "plato-4", name: "Chorizo Santarosano", price: 14000, description: "Chorizo artesanal con arepa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/chorizo.webp?w=417" },
            { id: "plato-5", name: "Pincho", price: 12000, description: "Brocheta de carne con arepa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.40-pm-1.jpeg?w=768" }
          ]
        },
        {
          id: "moñonas",
          name: "Moñonas",
          products: [
            { id: "moñona-1", name: "Moñona", price: 13000, description: "Plato tradicional paisa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.41-pm.jpeg?w=768" }
          ]
        },
        {
          id: "sopas-caldos",
          name: "Sopas y Caldos",
          products: [
            { id: "sopa-1", name: "Sopa de Mondongo", price: 14000, description: "Sopa tradicional de mondongo", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/mondongo.jpg?w=426" },
            { id: "sopa-2", name: "Caldo con Costilla", price: 15000, description: "Caldo paisa con costilla", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-05-at-6.22.19-pm.jpeg?w=768" },
            { id: "sopa-3", name: "Caldo de Pollo", price: 13000, description: "Caldo de pollo tradicional", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/caldo-de-pollo.webp?w=626" }
          ]
        },
        {
          id: "bebidas",
          name: "Bebidas",
          products: [
            { id: "bebida-1", name: "Tinto", price: 2000, description: "Café colombiano", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/tinto-1.webp?w=600" },
            { id: "bebida-2", name: "Jugo Natural", price: 5000, description: "Variedad de frutas frescas", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop" },
            { id: "bebida-3", name: "Gaseosa", price: 3000, description: "Bebida carbonatada 350ml", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop" },
            { id: "bebida-4", name: "Agua", price: 2000, description: "Agua embotellada", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop" }
          ]
        }
      ]
    };
    await kv.set("menu", defaultMenu);
}

// Reset menu (development only)
app.post("/make-server-80493524/menu/reset", async (c) => {
  try {
    await kv.del("menu");
    await initializeMenu();
    const menu = await kv.get("menu");
    return c.json({ success: true, menu });
  } catch (error) {
    console.log(`Error resetting menu: ${error}`);
    return c.json({ error: "Failed to reset menu" }, 500);
  }
});

// Update menu (development only)
app.put("/make-server-80493524/menu/update", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("menu", body);
    return c.json({ success: true, menu: body });
  } catch (error) {
    console.log(`Error updating menu: ${error}`);
    return c.json({ error: "Failed to update menu" }, 500);
  }
});

// Get menu
app.get("/make-server-80493524/menu", async (c) => {
  try {
    // Return menu directly from code with real images from caldoparado.wordpress.com
    const menu = {
      categories: [
        {
          id: "platos-principales",
          name: "Platos Principales",
          products: [
            { id: "plato-1", name: "Carne Sudada", price: 16000, description: "Carne en salsa criolla con arroz", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.43-pm.jpeg?w=768" },
            { id: "plato-2", name: "Pollo Sudado", price: 15000, description: "Pollo en salsa criolla", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/pollo-asado.jpg?w=640" },
            { id: "plato-3", name: "Pollo a la Brasa", price: 16000, description: "Pollo a la brasa jugoso", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/muslo-de-pollo.jpg?w=612" },
            { id: "plato-4", name: "Chorizo Santarosano", price: 14000, description: "Chorizo artesanal con arepa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/chorizo.webp?w=417" },
            { id: "plato-5", name: "Pincho", price: 12000, description: "Brocheta de carne con arepa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.40-pm-1.jpeg?w=768" }
          ]
        },
        {
          id: "moñonas",
          name: "Moñonas",
          products: [
            { id: "moñona-1", name: "Moñona", price: 13000, description: "Plato tradicional paisa", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-20-at-6.02.41-pm.jpeg?w=768" }
          ]
        },
        {
          id: "sopas-caldos",
          name: "Sopas y Caldos",
          products: [
            { id: "sopa-1", name: "Sopa de Mondongo", price: 14000, description: "Sopa tradicional de mondongo", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/mondongo.jpg?w=426" },
            { id: "sopa-2", name: "Caldo con Costilla", price: 15000, description: "Caldo paisa con costilla", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/whatsapp-image-2023-10-05-at-6.22.19-pm.jpeg?w=768" },
            { id: "sopa-3", name: "Caldo de Pollo", price: 13000, description: "Caldo de pollo tradicional", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/caldo-de-pollo.webp?w=626" }
          ]
        },
        {
          id: "bebidas",
          name: "Bebidas",
          products: [
            { id: "bebida-1", name: "Tinto", price: 2000, description: "Café colombiano", image: "https://caldoparado.wordpress.com/wp-content/uploads/2023/10/tinto-1.webp?w=600" },
            { id: "bebida-2", name: "Jugo Natural", price: 5000, description: "Variedad de frutas frescas", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop" },
            { id: "bebida-3", name: "Gaseosa", price: 3000, description: "Bebida carbonatada 350ml", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop" },
            { id: "bebida-4", name: "Agua", price: 2000, description: "Agua embotellada", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop" }
          ]
        }
      ]
    };
    return c.json(menu);
  } catch (error) {
    console.log(`Error fetching menu: ${error}`);
    return c.json({ error: "Failed to fetch menu" }, 500);
  }
});

// Get orders for a specific table
app.get("/make-server-80493524/orders/:tableNumber", async (c) => {
  try {
    const tableNumber = c.req.param("tableNumber");
    const orders = await kv.getByPrefix(`order:table:${tableNumber}:`);
    return c.json(orders || []);
  } catch (error) {
    console.log(`Error fetching orders for table: ${error}`);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Get all orders (for admin)
app.get("/make-server-80493524/admin/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:table:");
    return c.json(orders || []);
  } catch (error) {
    console.log(`Error fetching all orders: ${error}`);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Create new order
app.post("/make-server-80493524/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { tableNumber, items, paymentMethod, notes, total } = body;

    const orderId = `order:table:${tableNumber}:${Date.now()}`;
    const order = {
      id: orderId,
      tableNumber,
      items,
      paymentMethod,
      notes: notes || "",
      total,
      status: "received",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editable: true,
      editableUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    };

    await kv.set(orderId, order);
    return c.json(order);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Update order (for editing by client)
app.put("/make-server-80493524/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { items, notes, total } = body;

    const existingOrder = await kv.get(orderId);
    if (!existingOrder) {
      return c.json({ error: "Order not found" }, 404);
    }

    const now = new Date();
    const editableUntil = new Date(existingOrder.editableUntil);

    if (now > editableUntil || existingOrder.status !== "received") {
      return c.json({ error: "Order is no longer editable" }, 403);
    }

    const updatedOrder = {
      ...existingOrder,
      items,
      notes: notes || existingOrder.notes,
      total,
      updatedAt: new Date().toISOString()
    };

    await kv.set(orderId, updatedOrder);
    return c.json(updatedOrder);
  } catch (error) {
    console.log(`Error updating order: ${error}`);
    return c.json({ error: "Failed to update order" }, 500);
  }
});

// Update order status (for admin)
app.patch("/make-server-80493524/admin/orders/:orderId/status", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { status } = body;

    const existingOrder = await kv.get(orderId);
    if (!existingOrder) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...existingOrder,
      status,
      editable: status === "received",
      updatedAt: new Date().toISOString()
    };

    await kv.set(orderId, updatedOrder);
    return c.json(updatedOrder);
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// Get active tables (for admin)
app.get("/make-server-80493524/admin/tables", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:table:");
    const tableMap = new Map();

    orders.forEach((order: any) => {
      const tableNumber = order.tableNumber;
      if (!tableMap.has(tableNumber)) {
        tableMap.set(tableNumber, {
          tableNumber,
          orders: [],
          totalAmount: 0
        });
      }
      const table = tableMap.get(tableNumber);
      table.orders.push(order);
      table.totalAmount += order.total;
    });

    return c.json(Array.from(tableMap.values()));
  } catch (error) {
    console.log(`Error fetching active tables: ${error}`);
    return c.json({ error: "Failed to fetch tables" }, 500);
  }
});

// Initialize menu on startup
initializeMenu();

Deno.serve(app.fetch);
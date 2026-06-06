import { z } from "zod";
import { STATUSES } from "./types";

export const orderItemSchema = z.object({
  name: z.string().min(1, "Pizza name is required"),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0),
});

// Body for POST /api/create. received_by is the username of whoever takes the order.
export const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  items: z.array(orderItemSchema).min(1, "Add at least one pizza"),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  address: z.string().min(1, "Address is required"),
  received_by: z.string().min(1, "Username is required"),
});

// Body for POST /api/status.
export const statusSchema = z.object({
  id: z.uuid(),
  status: z.enum(STATUSES),
  username: z.string().min(1, "Username is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type StatusInput = z.infer<typeof statusSchema>;

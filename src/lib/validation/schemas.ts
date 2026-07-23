import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[0-9!@#$%^&*]/, 'Include at least one number or special character'),
});

export const clientSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  company: z.string().max(100).optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(20).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(200),
  description: z.string().max(2000).optional(),
  clientId: z.string().min(1, 'Please select a client'),
  dueDate: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be positive'),
});

export const invoiceSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
  dueDate: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CommentInput = z.infer<typeof commentSchema>;

import { z } from "zod";

export const courseCreationFromSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  thumbnail: z.string().url("Thumbnail image is required"),
});
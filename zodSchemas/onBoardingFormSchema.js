import { z } from "zod";

export const onboardingFormSchema = z.object({
    name: z.string().min(3, "Name should be at least 3 characters long"),
    description: z.string().min(5, "Description should be at least 5 characters long"),
    subdomain: z.string().min(3, "Subdomain should be at least 3 characters long")
})
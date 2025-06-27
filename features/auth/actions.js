"use server";

import { client } from "@/lib/db";
import { transformZodErrors } from "@/lib/transformZodErrors";
import { onboardingFormSchema } from "@/zodSchemas/onBoardingFormSchema";
import { clerkClient, auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export const userCreationAndOnboarding = async (data) => {
    try {
        const { userId } = await auth(); // safer than currentUser()
        if (!userId) {
            throw new Error("User not authorized");
        }

        const validatedFields = onboardingFormSchema.parse({
            name: data.name,
            description: data.description,
            subdomain: data.subdomain,
        });

        const existingWebsite = await client.website.findUnique({
            where: {
                subdomain: validatedFields.subdomain,
            },
        });

        if (existingWebsite) {
            return {
                errors: {
                    message: "Subdomain is already taken",
                },
                data: null,
            };
        }

        const defaultTemplate = await client.template.findFirst({
            orderBy: {
                createdAt: "asc",
            },
            include: {
                pages: true,
            }
        });
        if (!defaultTemplate) throw new Error("No Default template found");

        const clerkUser = await currentUser();

        const dbUser = await client.user.upsert({
            where: {
                clerkId: userId,
            },
            update: {}, // Don't update if user exists
            create: {
                clerkId: userId,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                email: clerkUser.emailAddresses[0].emailAddress,
                imageUrl: clerkUser.imageUrl,

                website: {
                    create: {
                        name: validatedFields.name,
                        description: validatedFields.description,
                        subdomain: validatedFields.subdomain
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "")
                            .replace(/-+/g, "-"),
                        templateId: defaultTemplate.id,
                    },
                },
            },
            include: {
                website: true,
            },
        });

        const website = dbUser.website[0];

        // 3. Clone template pages to the website
        if (website && defaultTemplate.pages.length > 0) {
            await client.page.createMany({
                data: defaultTemplate.pages.map((page) => ({
                    name: page.title,
                    slug: page.slug,
                    sections: page.sections,
                    websiteId: website.id,
                })),
            });
        }

        const clerkClientVariable = await clerkClient();

        if (dbUser) {
            const res = await clerkClientVariable.users.updateUser(userId, {
                publicMetadata: {
                    onboardingComplete: true,
                },
            });
            return {
                errors: null,
                data: dbUser,
            };
        }
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return {
                errors: transformZodErrors(error),
                data: null,
            };
        }
        return {
            errors: {
                message: "An unexpected error occurred. Could not create shelf.",
            },
            data: null,
        };
    }
};

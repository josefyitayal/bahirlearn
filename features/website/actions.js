"use server";

import { client } from "@/lib/db";
import { clerkClient, auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export const getCurrentUserWebsite = async () => {
    try {
        const { userId } = await auth(); // safer than currentUser()
        if (!userId) {
            throw new Error("User not authorized");
        }

        const dbUser = await client.user.findUnique({
            where: { clerkId: userId },
            include: {
                website: {
                    include: {
                        courses: {
                            include: {
                                enrollments: true,
                            },
                        },
                        members: true,
                        pages: true,
                        template: true,
                        transactions: true
                    },
                },
            },
        });

        if (dbUser) {
            return {
                errors: null,
                data: dbUser?.website,
            };
        } else {
            return {
                errors: {
                    message: "There is no website",
                },
                data: null,
            };
        }
    } catch (error) {
        console.error(error);
        return {
            errors: {
                message:
                    "An unexpected error occurred. Could not create shelf.",
            },
            data: null,
        };
    }
};

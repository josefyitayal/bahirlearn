"use server";

import { client } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const getAllMembers = async () => {
  try {
    const { userId } = await auth(); // safer than currentUser()
    if (!userId) {
      throw new Error("User not authorized");
    }

    const dbUser = await client.user.findUnique({
        where: {
            clerkId: userId
        },
        include: {
            website: {
                include: {
                    members: {
                        include: {
                            enrollments: true
                        }
                    }
                }
            }
        }
    })

    if (dbUser.website[0]) {
        return {
            errors: null,
            data: dbUser.website[0].members
        }
    }else {
        return {
            errors: {
                message: "There is no user or website"
            },
            data: null
        }
    }

  } catch (error) {
    console.error(error);
    return {
      errors: {
        message: "An unexpected error occurred. Could not create shelf.",
      },
      data: null,
    };
  }
};
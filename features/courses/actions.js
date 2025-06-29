"use server";

import { client } from "@/lib/db";
import { transformZodErrors } from "@/lib/transformZodErrors";
import { courseCreationFromSchema } from "@/zodSchemas/courseCreationFromSchema";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export const createCourse = async (title, description, price, thumbnail) => {
    try {
        const { userId } = await auth(); // safer than currentUser()
        if (!userId) {
            throw new Error("User not authorized");
        }

        console.log("finding user")
        const dbUser = await client.user.findUnique({
            where: {
                clerkId: userId,
            },
            include: {
                website: true,
            },
        });

        if (dbUser) {
            console.log("validate the inputs")
            const validatedFields = courseCreationFromSchema.parse({
                title: title,
                description: description,
                price: price,
                thumbnail: thumbnail,
            });
            console.log("creating course")
            const dbCourse = await client.course.create({
                data: {
                    title: validatedFields.title,
                    description: validatedFields.description,
                    thumbnail: validatedFields.thumbnail,
                    price: validatedFields.price,
                    websiteId: dbUser.website[0].id,
                },
            });
            console.log(dbCourse)
            if (dbCourse) {
                console.log("course created")
                return {
                    errors: null,
                    data: dbCourse,
                };
            } else {
                console.log("error happend")
                return {
                    errors: {
                        message: "Failed to create course",
                    },
                    data: null,
                };
            }
        } else {
            return {
                errors: {
                    message: "There is no website associate for the user",
                },
                data: null,
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
                message:
                    "An unexpected error occurred. Could not create shelf.",
            },
            data: null,
        };
    }
};

export async function updateCourse(
    courseId,
    { title, description, price, thumbnail }
) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const updated = await client.course.update({
            where: { id: courseId },
            data: {
                title,
                description,
                price,
                thumbnail,
                updatedAt: new Date(),
            },
        });
        return { errors: null, data: updated };
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
}

export const deleteCourse = async (courseId) => {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const deleted = await client.course.deleteMany({
            where: { id: courseId },
        }); // won't throw

        return { errors: null, data: deleted };
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

export const getAllCourses = async () => {
    try {
      const { userId } = await auth(); // safer than currentUser()
      if (!userId) {
        throw new Error("User not authorized");
      }

      const dbUser = await client.user.findUnique({
        where: {
          clerkId: userId,
        },
        include: {
          website: {
            include: {
              courses: true
            },
          },
        },
      });

      if (dbUser.website[0]) {
        return {
          errors: null,
          data: dbUser.website[0].courses,
        };
      } else {
        return {
          errors: {
            message: "There is no website associated with user website",
          },
          data: null,
        };
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

export const getCourseById = async (courseId) => {
    try {
      const { userId } = await auth(); // safer than currentUser()
      if (!userId) {
        throw new Error("User not authorized");
      }

      const dbUser = await client.user.findUnique({
        where: {
          clerkId: userId,
        },
        include: {
          website: {
            include: {
              courses: {
                where: {
                  id: courseId,
                },
                include: {
                  lessons: {
                    orderBy: {
                      order: "asc",
                    },
                  },
                  enrollments: true,
                }
              },
            },
          },
        },
      });

      if (dbUser.website[0]) {
        return {
          errors: null,
          data: dbUser.website[0].courses[0],
        };
      } else {
        return {
          errors: {
            message: "There is no website associated with user website",
          },
          data: null,
        };
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

export const saveLesson = async (lessons, courseId) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authorized");


    if (!courseId) {
      return { errors: { message: "Missing courseId in lesson data." }, data: null };
    }

    // Fetch existing lessons from DB
    const originalLessons = await client.lesson.findMany({
      where: { courseId },
    });

    const submittedIds = new Set(lessons.map((l) => l.id));

    // Delete lessons that were removed on the client
    const lessonsToDelete = originalLessons.filter((lesson) => !submittedIds.has(lesson.id));

    await Promise.all(
      lessonsToDelete.map((lesson) =>
        client.lesson.delete({
          where: { id: lesson.id },
        })
      )
    );

    // Upsert submitted lessons
    const upserts = await Promise.all(
      lessons.map((lesson) =>
        client.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            content: lesson.content,
            order: lesson.position,
          },
          create: {
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            courseId: courseId,
            order: lesson.position,
          },
        })
      )
    );

    return { errors: null, data: upserts };
  } catch (error) {
    console.error(error);
    return {
      errors: { message: "Failed to save course." },
      data: null,
    };
  }
};

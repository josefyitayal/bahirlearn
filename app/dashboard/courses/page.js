// Courses page

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { MoreHorizontal, Book } from "lucide-react";

import { CourseForm, createCourse, deleteCourse, getAllCourses, updateCourse } from "@/features/courses";

function page() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCourseId, setEditedCourseId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [courses, setCourses] = useState(null);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            const { errors, data } = await getAllCourses();
            if (errors) {
                toast(errors.message);
            }
            setCourses(data);
            setIsLoading(false);
        };
        getData();
    }, [refreshKey]);

    let editedCourse = null;
    if (courses) {
        editedCourse = courses.find((c) => c.id === editedCourseId) || null;
    }

    async function handleDelete(courseId) {
        const { errors, data: deletingCourse } = await deleteCourse(
            courseId
        );
        if (errors) {
            toast(errors.message);
        }
        if (deletingCourse) {
            toast("successfully deleted");
            setRefreshKey((prev) => prev + 1);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Button */}
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-2xl">📚 Courses</h2>

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button>Create Course</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editedCourse ? "Edit course" : "Create a New Course"}</DialogTitle>
                        </DialogHeader>

                        <CourseForm
                            course={editedCourse}
                            onSubmit={async (values) => {
                                if (editedCourse) {
                                    const { errors, data: updatedCourseData } =
                                        await updateCourse(editedCourse.id, {
                                            title: values.name,
                                            description: values.description,
                                            price: values.price,
                                            thumbnail: values.thumbnail,
                                        });
                                    if (errors) toast(errors.message);
                                    if (updatedCourseData) {
                                        toast("Successfully updated!");
                                        setRefreshKey((prev) => prev + 1);
                                    }
                                } else {
                                    const { errors, data } = await createCourse(
                                        values.title,
                                        values.description,
                                        values.price,
                                        values.thumbnail
                                    );
                                    if (errors) {
                                      console.log(errors)

                                    }
                                    if (data)
                                        router.push(
                                            `/dashboard/courses/${data.id}`
                                        );
                                }

                                setIsEditing(false);
                                setEditedCourseId(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="w-full h-56 flex items-center justify-center">
                    <p className="text-lg font-medium">Loading...</p>
                </div>
            ) : courses && courses.length > 0 ? (
                // Grid of Courses
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="relative aspect-video w-full">
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover w-full h-full"
                                />

                                {/* Top-left Action Button */}
                                <div className="absolute top-2 left-2 z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            sideOffset={4}
                                        >
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditedCourseId(
                                                        course.id
                                                    );
                                                    setIsEditing(true);
                                                }}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() =>
                                                    handleDelete(course.id)
                                                }
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <CardHeader className="p-4 space-y-1">
                                <Link href={`/dashboard/courses/${course.id}`}>
                                    <CardTitle className="text-lg hover:underline transition">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                                        {course.description}
                                    </CardDescription>
                                </Link>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                // Empty State
                <div className="w-full h-56 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                    <Book size={80} />
                    <p className="text-lg font-medium">
                        There is no course created yet.
                    </p>
                </div>
            )}
        </div>
    );
}

export default page;

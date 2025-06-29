import React from "react";
import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/shared/RichTextEditor"
import LessonBuilderProvider from "@/context/lessonBuilderContext";
import {LessonSidebar, SaveButton, getCourseById} from "@/features/courses";

async function page({ params }) {
  const { id: courseId } = await params;
  console.log(courseId)

  const {errors, data:course} = await getCourseById(courseId)
  if (errors) {
    return <div>Error occurred: {errors.message}</div>
  }

  return (
    <div>
        <LessonBuilderProvider course={course}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BackButton />
                    <p>{course.title}</p>
                </div>
                <div className="">
                    <SaveButton />
                </div>
            </div>
            <div>
                <div className="flex items-start gap-5">
                    <div className="flex-[0.3]">
                      <LessonSidebar />
                    </div>
                    <div className="flex-[1]" >
                        <RichTextEditor />
                    </div>
                </div>
            </div>
          </div>
        </LessonBuilderProvider>
    </div>
)
}

export default page;

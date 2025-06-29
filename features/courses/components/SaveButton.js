"use client"

import { Button } from "@/components/ui/button"
import { useLessonBuilder } from "@/context/lessonBuilderContext";
import { saveLesson } from "@/features/courses"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const SaveButton = () => {
	const [isLoading, setIsLoading] = useState(false)
	const { lessons, courseId } = useLessonBuilder();

	async function saveData() {
		if (lessons && lessons.length > 0) {
			setIsLoading(true)
			const lessonsWithPosition = lessons.map((lesson, index) => ({
			  ...lesson,
			  position: index,
			}));
			const {errors, data} = await saveLesson(lessonsWithPosition, courseId)
			setIsLoading(false)
			console.log(data, "asdfkalsdfj")
			if (errors) {
				toast.error(errors.message)
			}
			if (data) {
				toast.success("Successfully saved")
			}

		}
	}

	return (
		<Button onClick={saveData} disabled={isLoading}>
			{isLoading ? "Saving..." : "Save"}
		</Button>
	)
}

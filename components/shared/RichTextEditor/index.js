"use client"
import dynamic from "next/dynamic"
import {useState, useEffect} from "react"
import {useLessonBuilder} from "@/context/lessonBuilderContext";

const Tiptap = dynamic(() => import ('./Tiptap'), {ssr: false,});


const RichTextEditor = () => {
    const [content, setContent] = useState("")
    const {
        addLesson,
        removeLesson,
        moveLesson,
        updateLesson,
        lessons,
        currentLessonId,
        setCurrentLessonId
    } = useLessonBuilder();
    // Sync content when currentLessonId or lessons change
    useEffect(() => {
        if (!currentLessonId) return;
        const lesson = lessons.find(l => l.id === currentLessonId);
        if (lesson) {
            setContent(lesson.content || "");
        }
    }, [currentLessonId, lessons]);
    const handleContentChange = (newContent) => {
        setContent(newContent);
        if (currentLessonId) {
            updateLesson(currentLessonId, {
                content: newContent
            });
        }
    };
    return (
      <div className = "w-fit prose"> 
        <Tiptap
          onChange={handleContentChange}
          content={content}
        />
      </div>
    )
}
export default RichTextEditor

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLessonBuilder } from "@/context/lessonBuilderContext";
import React, {useState, useEffect} from "react";
import { LessonSidebarItem } from "./LessonSidebarItem";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function LessonSidebar() {
    const [mounted, setMounted] = useState(false);
    const { addLesson, removeLesson, moveLesson, updateLesson, lessons, setLessons, currentLessonId, setCurrentLessonId } = useLessonBuilder();

    const sensors = useSensors(
        useSensor(PointerSensor),
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = lessons.findIndex((l) => l.id === active.id);
          const newIndex = lessons.findIndex((l) => l.id === over.id);
          const newLessons = arrayMove(lessons, oldIndex, newIndex);
          setLessons(newLessons);
        }
    };

    if (!mounted) return null; // Prevent SSR mismatch

    return (
      <div className="w-full">
        <Card className="shadow-sm border-muted">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-base font-semibold text-foreground">📚 Lessons</CardTitle>
          </CardHeader>

          <CardContent className="p-1 space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lessons.map((lesson) => lesson.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1.5">
                  {lessons.map((lesson) => (
                    <LessonSidebarItem
                      key={lesson.id}
                      id={lesson.id}
                      title={lesson.title}
                      isSelected={currentLessonId === lesson.id}
                      onSelect={() => setCurrentLessonId(lesson.id)}
                      onRename={(id, newTitle) => updateLesson(id, { title: newTitle })}
                      onRemove={removeLesson}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              onClick={() => addLesson("")}
              className="w-full text-sm font-medium"
            >
              + Add Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    );

}

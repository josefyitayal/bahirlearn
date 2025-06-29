"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function LessonSidebarItem({
    id,
    title,
    isSelected,
    onSelect,
    onRename,
    onRemove,
}) {
    const [editing, setEditing] = useState(title === "");
    const [inputValue, setInputValue] = useState(title);
    const inputRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handleBlur = () => {
        if (inputValue.trim() !== "") {
            onRename(id, inputValue.trim());
        }
        // Exit edit mode either way
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center justify-between rounded-md border border-transparent px-2 py-1.5 transition group w-full max-w-full",
          isSelected ? "bg-accent border-border shadow-sm font-semibold" : "hover:bg-muted/60"
        )}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground mr-2"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Title or Input */}
        <div className="flex-grow">
          {editing ? (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter lesson name"
              className="h-8 text-sm w-full"
            />
          ) : (
            <button
              onClick={onSelect}
              onDoubleClick={() => setEditing(true)}
              className="w-full text-left text-sm truncate"
            >
              {title || "Untitled"}
            </button>
          )}
        </div>

        {/* Trash icon - visible on hover or selected */}
        <Trash
          onClick={() => onRemove(id)}
          className={cn(
            "w-4 h-4 text-destructive cursor-pointer ml-2 transition-opacity flex-shrink-0",
            isSelected || editing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        />
      </div>
    );

}

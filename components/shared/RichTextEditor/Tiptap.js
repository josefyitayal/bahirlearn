'use client'

import {useEffect} from "react"

import Toolbar from "./Toolbar"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Youtube from '@tiptap/extension-youtube'
import Image from '@tiptap/extension-image'

const Tiptap = ({ onChange, content }) => {
  const handleChange = (newContent) => {
    onChange(newContent);
  };
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "rounded-md w-full p-4 border border-gray-200 dark:border-gray-700 min-h-[300px] prose dark:prose-invert max-w-full"
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {levels: [1,2,3] },
      }),
      Highlight.configure({ multicolor: true }),
      BulletList,
      Image.configure({
        inline: true,
      }),
      OrderedList,
      ListItem,
      Blockquote,
      Youtube.configure({
        nocookie: true,
        loop: true,
        modestBranding: true,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        // Basic validation for URLs
        validate: href => /^https?:\/\//.test(href),
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || "<p>Start typing...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML());
    },
  })

  // Sync prop-driven content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false) // `false` prevents history stack push
    }
  }, [content, editor])

  if (!editor) return null

  return (
    // Changed w-fit to w-full and added max-w-4xl for better responsiveness
    <div className="flex flex-col gap-3">
      <Toolbar editor={editor}/>
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap

"use client"

import {useState, useCallback, useEffect} from "react"
import { Box } from "@/components/shared/Box"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bold, Italic, Strikethrough, Code, Underline, Highlighter, Link,
    ImagePlus, Video, AlignCenter, AlignJustify, AlignLeft, AlignRight,
    Heading1, Heading2, Heading3, List, ListOrdered, MessageSquareQuote,
    FileCode2, ChevronDown
} from 'lucide-react';

const Toolbar = ({editor}) => {
    const [headingLevel, setHeadingLevel] = useState("Paragraph")
    const [linkURL, setLinkURL] = useState("")
    const [imageLink, setImageLink] = useState("")
    const [videoLink, setVideoLink] = useState("")
    const [height, setHeight] = useState(480)
    const [width, setWidth] = useState(640)

    const addYoutubeVideo = () => {
        if (videoLink) {
            editor.chain().focus().setYoutubeVideo({
                src: videoLink,
                width: Math.max(320, parseInt(width, 10)) || 640,
                height: Math.max(180, parseInt(height, 10)) || 480,
            }).run();
        }
    }

    const updateHeading = useCallback((value) => {
        const level = parseInt(value.replace('H', ''), 10);
        if (isNaN(level)) {
            setHeadingLevel("Paragraph");
            editor.chain().focus().setParagraph().run();
        } else {
            setHeadingLevel(value);
            editor.chain().focus().toggleHeading({ level }).run();
        }
    }, [editor]);

    useEffect(() => {
        const handleUpdate = () => {
            for (let level = 1; level <= 3; level++) {
                if (editor.isActive('heading', { level })) {
                    setHeadingLevel(`H${level}`);
                    return;
                }
            }
            setHeadingLevel("Paragraph");
        };

        if (editor) {
            editor.on('update', handleUpdate);
            editor.on('selectionUpdate', handleUpdate);
        }

        return () => {
            if (editor) {
                editor.off('update', handleUpdate);
                editor.off('selectionUpdate', handleUpdate);
            }
        };
    }, [editor]);


    const addImage = useCallback(() => {
        if (imageLink) {
            editor.chain().focus().setImage({ src: imageLink }).run()
        }
    }, [editor, imageLink])

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        let url = linkURL;

        if (url === null) {
            return
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }


        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor, linkURL])


    if (!editor) {
        return null;
    }

    return (
        // Added flex-wrap and gap-2 for better mobile responsiveness
        <div className="flex items-center flex-wrap gap-2 p-2 border border-border rounded-md bg-card">
            <Box tooltip="Bold">
                <Button
                    variant={editor.isActive('bold') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    size="icon"
                ><Bold className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Italic">
                <Button
                    variant={editor.isActive('italic') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                     size="icon"
                ><Italic className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Strike">
                <Button
                    variant={editor.isActive('strike') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                     size="icon"
                ><Strikethrough className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Code">
                <Button
                    variant={editor.isActive('code') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                     size="icon"
                ><Code className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Underline">
                <Button
                    variant={editor.isActive('underline') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                     size="icon"
                ><Underline className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Highlight">
                <Button
                    variant={editor.isActive('highlight') ? '' : 'ghost'}
                    onClick={() => editor.chain().focus().toggleHighlight({color: "#ffc078"}).run()}
                     size="icon"
                ><Highlighter className="w-4 h-4"/></Button>
            </Box>

            <Popover>
              <PopoverTrigger asChild>
                 <Button variant={editor.isActive('link') ? '' : 'ghost'} size="icon">
                     <Link className="w-4 h-4" />
                 </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex items-center gap-2">
                    <Input type="text" placeholder="https://example.com" value={linkURL} onChange={(e) => setLinkURL(e.target.value)}/>
                    <Button onClick={setLink}>Set</Button>
                </div>
              </PopoverContent>
            </Popover>


            <Separator orientation="vertical" className="h-6 mx-1"/>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><ImagePlus className="w-4 h-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                   <div className="flex flex-col gap-2 pt-2">
                      <Input
                        type="text"
                        placeholder="Paste image URL"
                        value={imageLink}
                        onChange={(e) => setImageLink(e.target.value)}
                      />
                      <Button onClick={addImage}>Embed Image</Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-2">
                    <Input type="text" placeholder="Paste YouTube URL" value={videoLink} onChange={(e) => setVideoLink(e.target.value)}/>
                    <div className="flex items-center justify-between gap-1">
                        <Input type="number" min="320" placeholder="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
                        <Input type="number" min="180" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
                    </div>
                    <Button onClick={addYoutubeVideo}>Embed Video</Button>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6 mx-1"/>

            <Box tooltip="Align Left">
                <Button variant={editor.isActive({ textAlign: 'left' }) ? '' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('left').run()} size="icon"><AlignLeft className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Align Center">
                <Button variant={editor.isActive({ textAlign: 'center' }) ? '' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('center').run()} size="icon"><AlignCenter className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Align Right">
                <Button variant={editor.isActive({ textAlign: 'right' }) ? '' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('right').run()} size="icon"><AlignRight className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Align Justify">
                <Button variant={editor.isActive({ textAlign: 'justify' }) ? '' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('justify').run()} size="icon"><AlignJustify className="w-4 h-4"/></Button>
            </Box>

            <Separator orientation="vertical" className="h-6 mx-1"/>

            <Box tooltip="Bullet List">
                <Button variant={editor.isActive("bulletList") ? '' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()} size="icon"><List className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Ordered List">
                <Button variant={editor.isActive("orderedList") ? '' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()} size="icon"><ListOrdered className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Blockquote">
                <Button variant={editor.isActive("blockquote") ? '' : 'ghost'} onClick={() => editor.chain().focus().toggleBlockquote().run()} size="icon"><MessageSquareQuote className="w-4 h-4"/></Button>
            </Box>
            <Box tooltip="Code Block">
                <Button variant={editor.isActive("codeBlock") ? '' : 'ghost'} onClick={() => editor.chain().focus().toggleCodeBlock().run()} size="icon"><FileCode2 className="w-4 h-4"/></Button>
            </Box>

            <Separator orientation="vertical" className="h-6 mx-1"/>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px]">
                    {headingLevel}
                    <ChevronDown className="w-4 h-4 ml-2"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup value={headingLevel} onValueChange={updateHeading}>
                  <DropdownMenuRadioItem value="H1">Heading 1</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="H2">Heading 2</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="H3">Heading 3</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Paragraph">Paragraph</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}

export default Toolbar

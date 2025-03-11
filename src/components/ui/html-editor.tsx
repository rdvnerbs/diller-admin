"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
} from "lucide-react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function HtmlEditor({
  value,
  onChange,
  placeholder = "Enter content here...",
  minHeight = "300px",
}: HtmlEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(
    null,
  );

  const insertAtCursor = (before: string, after: string = "") => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position after the operation
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          start + before.length,
          end + before.length,
        );
      }
    }, 0);
  };

  const formatHandlers = {
    bold: () => insertAtCursor("<strong>", "</strong>"),
    italic: () => insertAtCursor("<em>", "</em>"),
    h1: () => insertAtCursor("<h1>", "</h1>"),
    h2: () => insertAtCursor("<h2>", "</h2>"),
    h3: () => insertAtCursor("<h3>", "</h3>"),
    ul: () => insertAtCursor("<ul>\n  <li>", "</li>\n</ul>"),
    ol: () => insertAtCursor("<ol>\n  <li>", "</li>\n</ol>"),
    link: () => {
      const url = prompt("Enter URL:", "https://");
      if (url) {
        insertAtCursor(`<a href="${url}" target="_blank">`, "</a>");
      }
    },
    image: () => {
      const url = prompt("Enter image URL:", "https://");
      if (url) {
        insertAtCursor(
          `<img src="${url}" alt="Image" style="max-width: 100%" />`,
        );
      }
    },
    alignLeft: () => insertAtCursor('<div style="text-align: left">', "</div>"),
    alignCenter: () =>
      insertAtCursor('<div style="text-align: center">', "</div>"),
    alignRight: () =>
      insertAtCursor('<div style="text-align: right">', "</div>"),
    code: () => insertAtCursor("<pre><code>", "</code></pre>"),
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.bold}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.italic}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.h1}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.h2}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.h3}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.ul}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.ol}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.alignLeft}
          className="h-8 w-8 p-0"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.alignCenter}
          className="h-8 w-8 p-0"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.alignRight}
          className="h-8 w-8 p-0"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.link}
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.image}
          className="h-8 w-8 p-0"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHandlers.code}
          className="h-8 w-8 p-0"
          title="Insert Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="flex-1"></div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="ml-auto"
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {isPreview ? (
        <div
          className="p-3 prose max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <Textarea
          ref={(ref) => setTextareaRef(ref)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}

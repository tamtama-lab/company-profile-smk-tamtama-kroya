"use client";

import { cn } from "@/utils";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  MdFormatBold,
  MdFormatItalic,
  MdCode,
  MdSubject,
  MdFormatStrikethrough,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdHorizontalRule,
  MdFormatClear,
  MdKeyboardReturn,
  MdUndo,
  MdRedo,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
} from "react-icons/md";
import { Extension, type Editor } from "@tiptap/core";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type EditorStateSnapshot,
} from "@tiptap/react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

const TextAlignExtension = Extension.create({
  name: "textAlign",
  addGlobalAttributes() {
    return [
      {
        types: ["heading", "paragraph"],
        attributes: {
          textAlign: {
            default: "left",
            parseHTML: (element) => element.style.textAlign || "left",
            renderHTML: (attributes) => ({
              style: `text-align: ${attributes.textAlign};`,
            }),
          },
        },
      },
    ];
  },
});

const extractPlainTextFromHtml = (html: string) => {
  if (!html) return "";

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\u00a0/g, " ");
  } catch {
    return html.replace(/<[^>]+>/g, "");
  }
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyTextToHtmlTemplate = (templateHtml: string, text: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateHtml || "", "text/html");
    const firstElement = doc.body.firstElementChild as HTMLElement | null;

    if (!firstElement) {
      const paragraph = doc.createElement("p");
      paragraph.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
      return paragraph.outerHTML;
    }

    firstElement.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
    return doc.body.innerHTML;
  } catch {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }
};

export interface FormInputInlineRichTextProps {
  label?: string;
  isMandatory?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
}

export const FormInputInlineRichText = forwardRef<
  HTMLTextAreaElement,
  FormInputInlineRichTextProps
>(
  (
    {
      label,
      isMandatory,
      error,
      value,
      onChange,
      placeholder,
      name,
      className,
      disabled,
    },
    ref,
  ) => {
    const templateRef = useRef<string>(value || "<p></p>");
    const lastEmittedValueRef = useRef<string>(value || "");
    const [plainTextValue, setPlainTextValue] = useState<string>(
      extractPlainTextFromHtml(value || ""),
    );

    useEffect(() => {
      if (value === lastEmittedValueRef.current) return;

      templateRef.current = value || templateRef.current || "<p></p>";
      setPlainTextValue(extractPlainTextFromHtml(value || ""));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextText = event.target.value;
      setPlainTextValue(nextText);

      const nextHtml = applyTextToHtmlTemplate(templateRef.current, nextText);
      lastEmittedValueRef.current = nextHtml;
      onChange(nextHtml);
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
          </div>
        )}

        <textarea
          ref={ref}
          name={name}
          value={plainTextValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={cn(
            "w-full px-4 max-sm:text-sm py-2 border rounded-sm resize-y min-h-12",
            "placeholder-gray-400 max-sm:placeholder:text-xs",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            disabled && "bg-gray-100 text-gray-600 cursor-not-allowed",
            className,
          )}
        />
      </div>
    );
  },
);
FormInputInlineRichText.displayName = "FormInputInlineRichText";

export interface FormInputRichTextProps {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
}

const menuBarStateSelector = (ctx: EditorStateSnapshot<Editor | null>) => {
  if (!ctx.editor) {
    return {
      isBold: false,
      canBold: false,
      isItalic: false,
      canItalic: false,
      isStrike: false,
      canStrike: false,
      isCode: false,
      canCode: false,
      canClearMarks: false,
      canClearNodes: false,
      isParagraph: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isBulletList: false,
      isOrderedList: false,
      isCodeBlock: false,
      isBlockquote: false,
      canHardBreak: false,
      canHorizontalRule: false,
      canUndo: false,
      canRedo: false,
      isAlignLeft: false,
      isAlignCenter: false,
      isAlignRight: false,
      canAlignLeft: false,
      canAlignCenter: false,
      canAlignRight: false,
    };
  }

  return {
    isBold: ctx.editor.isActive("bold") ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive("italic") ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isStrike: ctx.editor.isActive("strike") ?? false,
    canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
    isCode: ctx.editor.isActive("code") ?? false,
    canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
    canClearNodes: ctx.editor.can().chain().clearNodes().run() ?? false,
    isParagraph: ctx.editor.isActive("paragraph") ?? false,
    isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
    isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
    isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
    isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
    isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
    canAlignLeft:
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("paragraph", { textAlign: "left" })
        .run() ??
        false) ||
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("heading", { textAlign: "left" })
        .run() ??
        false),
    canAlignCenter:
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("paragraph", { textAlign: "center" })
        .run() ??
        false) ||
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("heading", { textAlign: "center" })
        .run() ??
        false),
    canAlignRight:
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("paragraph", { textAlign: "right" })
        .run() ??
        false) ||
      (ctx.editor
        .can()
        .chain()
        .focus()
        .updateAttributes("heading", { textAlign: "right" })
        .run() ??
        false),
    isBulletList: ctx.editor.isActive("bulletList") ?? false,
    isOrderedList: ctx.editor.isActive("orderedList") ?? false,
    isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
    isBlockquote: ctx.editor.isActive("blockquote") ?? false,
    canHardBreak: ctx.editor.can().chain().setHardBreak().run() ?? false,
    canHorizontalRule:
      ctx.editor.can().chain().setHorizontalRule().run() ?? false,
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,
  };
};

export const FormInputRichText = forwardRef<
  HTMLDivElement,
  FormInputRichTextProps
>(
  (
    {
      label,
      isMandatory,
      limit,
      error,
      value,
      onChange,
      placeholder,
      name,
      className,
      disabled,
    },
    ref,
  ) => {
    const editor = useEditor({
      extensions: [TextStyleKit, StarterKit, TextAlignExtension],
      content: value || "",
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none min-h-[120px] p-3 max-sm:text-xs focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
          "data-placeholder": placeholder || "Tulis di sini...",
          id: name || "",
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        const html = currentEditor.getHTML();
        onChange(html === "<p></p>" ? "" : html);
      },
    });

    useEffect(() => {
      if (!editor) return;
      const nextValue = value || "";
      const currentValue = editor.getHTML();

      if (currentValue !== nextValue) {
        editor.commands.setContent(nextValue || "<p></p>", {
          emitUpdate: false,
        });
      }
    }, [editor, value]);

    const editorState = useEditorState({
      editor,
      selector: menuBarStateSelector,
    });

    const textLength = editor?.getText().length || 0;
    const isAboveLimit = limit ? textLength > limit : false;

    const toolbarButtonClass =
      "h-8 w-8 inline-flex items-center justify-center rounded-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const applyInlineMarkAtCursor = (mark: "bold" | "italic" | "strike") => {
      if (!editor) return;

      const runToggle = () => {
        const chain = editor.chain().focus();

        if (mark === "bold") {
          chain.toggleBold().run();
          return;
        }

        if (mark === "italic") {
          chain.toggleItalic().run();
          return;
        }

        chain.toggleStrike().run();
      };

      const { state } = editor;
      const { selection } = state;

      if (!selection.empty) {
        runToggle();
        return;
      }

      const cursorPos = selection.from;
      const resolvedPos = state.doc.resolve(cursorPos);
      const textContent = resolvedPos.parent.textContent || "";
      const parentOffset = resolvedPos.parentOffset;
      const isWordChar = (char: string) => /[\p{L}\p{N}_-]/u.test(char);

      let startOffset = parentOffset;
      while (
        startOffset > 0 &&
        isWordChar(textContent[startOffset - 1] || "")
      ) {
        startOffset -= 1;
      }

      let endOffset = parentOffset;
      while (
        endOffset < textContent.length &&
        isWordChar(textContent[endOffset] || "")
      ) {
        endOffset += 1;
      }

      if (startOffset === endOffset) {
        runToggle();
        return;
      }

      const parentStart = cursorPos - parentOffset;
      const from = parentStart + startOffset;
      const to = parentStart + endOffset;

      editor.chain().focus().setTextSelection({ from, to }).run();

      runToggle();

      editor.chain().focus().setTextSelection(to).run();
    };

    const formatButtons = [
      {
        id: "paragraph",
        title: "Paragraph",
        icon: <MdSubject className="w-4 h-4" />,
        active: !!editor?.isActive("paragraph"),
        disabled: !editor?.can().chain().focus().setParagraph().run(),
        action: () => editor?.chain().focus().setParagraph().run(),
      },
      {
        id: "bold",
        title: "Bold",
        icon: <MdFormatBold className="w-4 h-4" />,
        active: editorState?.isBold ?? false,
        disabled: !(editorState?.canBold ?? false),
        action: () => applyInlineMarkAtCursor("bold"),
      },
      {
        id: "italic",
        title: "Italic",
        icon: <MdFormatItalic className="w-4 h-4" />,
        active: editorState?.isItalic ?? false,
        disabled: !(editorState?.canItalic ?? false),
        action: () => applyInlineMarkAtCursor("italic"),
      },
      {
        id: "strike",
        title: "Strike",
        icon: <MdFormatStrikethrough className="w-4 h-4" />,
        active: editorState?.isStrike ?? false,
        disabled: !(editorState?.canStrike ?? false),
        action: () => applyInlineMarkAtCursor("strike"),
      },
      // {
      //   id: "code",
      //   title: "Code",
      //   icon: <MdCode className="w-4 h-4" />,
      //   active: editorState?.isCode ?? false,
      //   disabled: !(editorState?.canCode ?? false),
      //   action: () => editor?.chain().focus().toggleCode().run(),
      // },
      // {
      //   id: "clearMarks",
      //   title: "Clear Marks",
      //   icon: <MdFormatClear className="w-4 h-4" />,
      //   active: false,
      //   disabled: !(editorState?.canClearMarks ?? false),
      //   action: () => editor?.chain().focus().unsetAllMarks().run(),
      // },
      // {
      //   id: "clearNodes",
      //   title: "Clear Nodes",
      //   icon: <MdSubject className="w-4 h-4" />,
      //   active: false,
      //   disabled: !(editorState?.canClearNodes ?? false),
      //   action: () => editor?.chain().focus().clearNodes().run(),
      // },
      {
        id: "heading1",
        title: "Heading 1",
        icon: <span className="text-[10px] font-bold">H1</span>,
        active: editorState?.isHeading1 ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: "heading2",
        title: "Heading 2",
        icon: <span className="text-[10px] font-bold">H2</span>,
        active: editorState?.isHeading2 ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: "heading3",
        title: "Heading 3",
        icon: <span className="text-[10px] font-bold">H3</span>,
        active: editorState?.isHeading3 ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        id: "align-left",
        title: "Align Left",
        icon: <MdFormatAlignLeft className="w-4 h-4" />,
        active: editorState?.isAlignLeft ?? false,
        disabled: !(editorState?.canAlignLeft ?? false),
        action: () => {
          if (!editor) return;
          if (editor.isActive("heading")) {
            editor
              .chain()
              .focus()
              .updateAttributes("heading", { textAlign: "left" })
              .run();
            return;
          }
          editor
            .chain()
            .focus()
            .updateAttributes("paragraph", { textAlign: "left" })
            .run();
        },
      },
      {
        id: "align-center",
        title: "Align Center",
        icon: <MdFormatAlignCenter className="w-4 h-4" />,
        active: editorState?.isAlignCenter ?? false,
        disabled: !(editorState?.canAlignCenter ?? false),
        action: () => {
          if (!editor) return;
          if (editor.isActive("heading")) {
            editor
              .chain()
              .focus()
              .updateAttributes("heading", { textAlign: "center" })
              .run();
            return;
          }
          editor
            .chain()
            .focus()
            .updateAttributes("paragraph", { textAlign: "center" })
            .run();
        },
      },
      {
        id: "align-right",
        title: "Align Right",
        icon: <MdFormatAlignRight className="w-4 h-4" />,
        active: editorState?.isAlignRight ?? false,
        disabled: !(editorState?.canAlignRight ?? false),
        action: () => {
          if (!editor) return;
          if (editor.isActive("heading")) {
            editor
              .chain()
              .focus()
              .updateAttributes("heading", { textAlign: "right" })
              .run();
            return;
          }
          editor
            .chain()
            .focus()
            .updateAttributes("paragraph", { textAlign: "right" })
            .run();
        },
      },
      {
        id: "bullet",
        title: "Bullet List",
        icon: <MdFormatListBulleted className="w-4 h-4" />,
        active: editorState?.isBulletList ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        id: "ordered",
        title: "Ordered List",
        icon: <MdFormatListNumbered className="w-4 h-4" />,
        active: editorState?.isOrderedList ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleOrderedList().run(),
      },
      {
        id: "quote",
        title: "Blockquote",
        icon: <MdFormatQuote className="w-4 h-4" />,
        active: editorState?.isBlockquote ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleBlockquote().run(),
      },
      // {
      //   id: "codeblock",
      //   title: "Code Block",
      //   icon: <MdCode className="w-4 h-4" />,
      //   active: editorState?.isCodeBlock ?? false,
      //   disabled: false,
      //   action: () => editor?.chain().focus().toggleCodeBlock().run(),
      // },
      {
        id: "rule",
        title: "Horizontal Rule",
        icon: <MdHorizontalRule className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canHorizontalRule ?? false),
        action: () => editor?.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "hardBreak",
        title: "Hard Break",
        icon: <MdKeyboardReturn className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canHardBreak ?? false),
        action: () => editor?.chain().focus().setHardBreak().run(),
      },
      {
        id: "undo",
        title: "Undo",
        icon: <MdUndo className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canUndo ?? false),
        action: () => editor?.chain().focus().undo().run(),
      },
      {
        id: "redo",
        title: "Redo",
        icon: <MdRedo className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canRedo ?? false),
        action: () => editor?.chain().focus().redo().run(),
      },
    ];

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            {limit && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isAboveLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {textLength}/{limit}
              </span>
            )}
          </div>
        )}

        <div
          ref={ref}
          className={cn(
            "w-full border rounded-sm transition-colors",
            "focus-within:ring-2 focus-within:ring-primary focus-within:bg-white focus-within:border-transparent",
            (isAboveLimit || error) &&
              "border-red-500 focus-within:ring-red-500",
            !error && !isAboveLimit && "border-gray-300",
            disabled && "bg-gray-100 text-gray-600 cursor-not-allowed",
            className,
          )}
        >
          <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-200 bg-gray-100">
            {formatButtons.map((button) => (
              <button
                key={button.id}
                type="button"
                title={button.title}
                aria-label={button.title}
                disabled={disabled || button.disabled || !editor}
                onClick={button.action}
                className={cn(
                  toolbarButtonClass,
                  button.active
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
                )}
              >
                {button.icon}
              </button>
            ))}
          </div>
          <EditorContent editor={editor} />
        </div>

        {isAboveLimit && !error && (
          <span className="text-red-500 text-xs mt-1 block">
            Jumlah karakter melebihi batas maksimal
          </span>
        )}
      </div>
    );
  },
);
FormInputRichText.displayName = "FormInputRichText";

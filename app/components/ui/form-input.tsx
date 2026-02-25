"use client";

import { cn } from "@/utils";
import { forwardRef, useState, useRef, useEffect } from "react";
import { IoMdClose, IoMdEye, IoMdEyeOff } from "react-icons/io";
import {
  MdFormatBold,
  MdFormatItalic,
  MdCode,
  MdTitle,
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
} from "react-icons/md";
import type { Editor } from "@tiptap/core";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type EditorStateSnapshot,
} from "@tiptap/react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import {
  isValidIndoPhone,
  normalizePhoneNumber,
} from "@/utils/phoneNumberFormat";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const emailFormat = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "")
    .replace(/@+/g, "@")
    .replace(/\.{2,}/g, ".");

// Form Input Text Component untuk shadcn/ui form
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isMandatory?: boolean;
  isEmail?: boolean;
  limit?: number;
  isCapitalize?: boolean;
  isUppercase?: boolean;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      isMandatory,
      isEmail,
      limit,
      isCapitalize,
      isUppercase,
      error,
      className,
      value,
      onChange,
      type,
      ...props
    },
    ref,
  ) => {
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;
    const isPassword = type === "password";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (isCapitalize && newValue) {
        newValue = capitalize(newValue);
      } else if (isUppercase) {
        newValue = newValue.toUpperCase();
      }

      if (isEmail) {
        newValue = emailFormat(newValue);
      }

      e.target.value = newValue;
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      props.onBlur?.(e);
    };

    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
      ];
      const isValidChar = /[a-zA-Z0-9@._-]/.test(e.key);

      if (!isValidChar && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const isValidEmail =
      isEmail && stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
    const showEmailError = touched && isValidEmail;

    // Determine input type
    const inputType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isEmail
        ? "email"
        : "text";

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
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "w-full px-4 max-sm:text-sm py-1.5 max-sm:py-1 border rounded-sm",
              "placeholder-gray-400 max-sm:placeholder:text-xs",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors",
              (isAboveLimit || showEmailError || error) &&
                "border-red-500 focus:ring-red-500",
              !error && !isAboveLimit && !showEmailError && "border-gray-300",
              isPassword && "pr-12", // Add padding right for eye button
              props.readOnly && "bg-gray-100 text-gray-600 cursor-not-allowed",
              className,
            )}
            onKeyDown={isEmail ? handleEmailKeyDown : undefined}
            maxLength={limit}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoMdEyeOff className="w-5 h-5" />
              ) : (
                <IoMdEye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {showEmailError && !error && (
          <span className="text-red-500 text-xs mt-1 block">
            Format email tidak valid
          </span>
        )}
      </div>
    );
  },
);
FormInput.displayName = "FormInput";

// Form Input Number Component
export interface FormInputNumberProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  minLength?: number;
  error?: string;
}

export const FormInputNumber = forwardRef<
  HTMLInputElement,
  FormInputNumberProps
>(
  (
    {
      label,
      isMandatory,
      limit,
      minLength,
      error,
      className,
      value,
      onKeyDown,
      onWheel,
      ...props
    },
    ref,
  ) => {
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent arrow keys from changing number value
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        return;
      }
      if (onKeyDown) onKeyDown(e);
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      // Prevent mouse wheel from changing value while focused
      if (document.activeElement === e.currentTarget) {
        e.preventDefault();
      }
      if (onWheel) onWheel(e);
    };

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
                  "text-xs max-sm:text-[10px] font-medium",
                  isAboveLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type="number"
            value={value}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            className={cn(
              "w-full px-4 max-sm:text-xs py-2 border rounded-sm",
              "placeholder-gray-400 max-sm:placeholder:text-xs",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-colors",
              (isAboveLimit || error) &&
                "border-red-500 focus:ring-red-500 pr-10",
              !error && !isAboveLimit && "border-gray-300",
              props.readOnly && "bg-gray-100 text-gray-600 cursor-not-allowed",
              className,
            )}
            maxLength={limit}
            minLength={minLength}
            {...props}
          />
          {isAboveLimit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">
                <IoMdClose size={14} />
              </div>
            </div>
          )}
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
FormInputNumber.displayName = "FormInputNumber";

// Form Input Phone Number Component
export interface FormInputPhoneProps {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  name?: string;
}

export const FormInputPhone = forwardRef<HTMLInputElement, FormInputPhoneProps>(
  (
    {
      label,
      isMandatory,
      limit = 15,
      error,
      value = "",
      onChange,
      onBlur,
      placeholder = "08xxxxxxxxxx",
      name,
    },
    ref,
  ) => {
    const [touched, setTouched] = useState(false);
    const isAboveLimit = value.length > limit;
    const isInvalid = value.length > 0 && !isValidIndoPhone(value);
    const showError = touched && isInvalid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      onChange(normalizePhoneNumber(raw));
    };

    const handleBlur = () => {
      setTouched(true);
      onBlur?.();
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm max-sm:text-xs font-semibold text-gray-700">
              {label} {isMandatory && <span className="text-red-500">*</span>}
            </label>
            <span
              className={cn(
                "text-xs",
                isAboveLimit ? "text-red-500" : "text-gray-400",
              )}
            >
              {value.length}/{limit}
            </span>
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="tel"
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-2 border rounded-sm text-sm",
              "focus:outline-none focus:ring-2 transition-colors",
              (isAboveLimit || showError || error) &&
                "border-red-500 focus:ring-red-500 pr-10",
              !error &&
                !isAboveLimit &&
                !showError &&
                "border-gray-300 focus:ring-primary",
            )}
          />
          {(isAboveLimit || showError) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <IoMdClose size={14} />
              </div>
            </div>
          )}
        </div>
        {showError && !error && (
          <span className="text-xs text-red-500 mt-1 block">
            Nomor HP harus diawali 62 dan valid
          </span>
        )}
      </div>
    );
  },
);
FormInputPhone.displayName = "FormInputPhone";

// Form Textarea Component
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  isMandatory?: boolean;
  limit?: number;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, isMandatory, limit, error, className, value, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const stringValue = String(value || "");
    const isAboveLimit = limit ? stringValue.length > limit : false;

    // Adjust height on mount and when value changes
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);

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
                {stringValue.length}/{limit}
              </span>
            )}
          </div>
        )}
        {/* Auto-resizing textarea with vertical manual resize support */}
        <textarea
          ref={(el) => {
            // forwardRef support with proper typing
            if (typeof ref === "function")
              (ref as (instance: HTMLTextAreaElement | null) => void)(el);
            else if (ref && typeof ref === "object")
              (
                ref as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = el;
            // store on internal ref for autogrow
            internalRef.current = el;
          }}
          value={value}
          onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
            // Auto grow
            const el = e.currentTarget as HTMLTextAreaElement;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
            const handler = props.onInput as
              | React.FormEventHandler<HTMLTextAreaElement>
              | undefined;
            if (handler) handler(e);
          }}
          className={cn(
            "w-full px-4 py-2 border rounded-sm resize-y",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent",
            "max-sm:px-2 max-sm:text-xs transition-colors",
            (isAboveLimit || error) && "border-red-500 focus:ring-red-500",
            !error && !isAboveLimit && "border-gray-300",
            className,
          )}
          maxLength={limit || 256}
          rows={3}
          {...props}
        />
        {/* Initialize height based on value */}
        <script
          // This is a small sentinel script for clarity only; actual resizing is handled by React refs/effects
          // Kept empty intentionally
          type="text/javascript"
        />
      </div>
    );
  },
);
FormTextarea.displayName = "FormTextarea";

// Form Rich Text (Tiptap) Component
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
      extensions: [TextStyleKit, StarterKit],
      content: value || "",
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none min-h-[120px] p-3 max-sm:text-xs focus:outline-none",
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
        id: "heading2",
        title: "Heading 2",
        icon: <MdTitle className="w-4 h-4" />,
        active: editorState?.isHeading2 ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: "bold",
        title: "Bold",
        icon: <MdFormatBold className="w-4 h-4" />,
        active: editorState?.isBold ?? false,
        disabled: !(editorState?.canBold ?? false),
        action: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        id: "italic",
        title: "Italic",
        icon: <MdFormatItalic className="w-4 h-4" />,
        active: editorState?.isItalic ?? false,
        disabled: !(editorState?.canItalic ?? false),
        action: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        id: "strike",
        title: "Strike",
        icon: <MdFormatStrikethrough className="w-4 h-4" />,
        active: editorState?.isStrike ?? false,
        disabled: !(editorState?.canStrike ?? false),
        action: () => editor?.chain().focus().toggleStrike().run(),
      },
      {
        id: "code",
        title: "Code",
        icon: <MdCode className="w-4 h-4" />,
        active: editorState?.isCode ?? false,
        disabled: !(editorState?.canCode ?? false),
        action: () => editor?.chain().focus().toggleCode().run(),
      },
      {
        id: "clearMarks",
        title: "Clear Marks",
        icon: <MdFormatClear className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canClearMarks ?? false),
        action: () => editor?.chain().focus().unsetAllMarks().run(),
      },
      {
        id: "clearNodes",
        title: "Clear Nodes",
        icon: <MdSubject className="w-4 h-4" />,
        active: false,
        disabled: !(editorState?.canClearNodes ?? false),
        action: () => editor?.chain().focus().clearNodes().run(),
      },
      {
        id: "heading1",
        title: "Heading 1",
        icon: <span className="text-[10px] font-bold">H1</span>,
        active: editorState?.isHeading1 ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
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
      {
        id: "codeblock",
        title: "Code Block",
        icon: <MdCode className="w-4 h-4" />,
        active: editorState?.isCodeBlock ?? false,
        disabled: false,
        action: () => editor?.chain().focus().toggleCodeBlock().run(),
      },
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

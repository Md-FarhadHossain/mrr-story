'use client';

import { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { upload } from '@imagekit/next';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  LinkIcon,
  Undo,
  Redo,
  Loader2,
  Code,
  Code2,
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

const MenuBar = ({ editor, onImageUpload, isUploading }: { editor: any; onImageUpload: () => void; isUploading: boolean }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };



  return (
    <div className={styles.toolbar}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} data-active={editor.isActive('bold')} className={styles.toolbarButton} title="Bold"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} data-active={editor.isActive('italic')} className={styles.toolbarButton} title="Italic"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} data-active={editor.isActive('strike')} className={styles.toolbarButton} title="Strikethrough"><Strikethrough size={18} /></button>
      <div className={styles.toolbarDivider} />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-active={editor.isActive('heading', { level: 2 })} className={styles.toolbarButton} title="Heading 2"><Heading2 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} data-active={editor.isActive('heading', { level: 3 })} className={styles.toolbarButton} title="Heading 3"><Heading3 size={18} /></button>
      <div className={styles.toolbarDivider} />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} data-active={editor.isActive('bulletList')} className={styles.toolbarButton} title="Bullet List"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} data-active={editor.isActive('orderedList')} className={styles.toolbarButton} title="Ordered List"><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} data-active={editor.isActive('blockquote')} className={styles.toolbarButton} title="Blockquote"><Quote size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} data-active={editor.isActive('code')} className={styles.toolbarButton} title="Inline Code"><Code size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} data-active={editor.isActive('codeBlock')} className={styles.toolbarButton} title="Code Block"><Code2 size={18} /></button>
      <div className={styles.toolbarDivider} />
      <button type="button" onClick={setLink} data-active={editor.isActive('link')} className={styles.toolbarButton} title="Link"><LinkIcon size={18} /></button>
      <button
        type="button"
        onClick={onImageUpload}
        disabled={isUploading}
        className={styles.toolbarButton}
        title="Upload Image via ImageKit"
      >
        {isUploading ? <Loader2 size={18} className={styles.spinning} /> : <ImageIcon size={18} />}
      </button>

      <div className={styles.toolbarDivider} />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={styles.toolbarButton} title="Undo"><Undo size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={styles.toolbarButton} title="Redo"><Redo size={18} /></button>
    </div>
  );
};

// Shared helper: upload a File to ImageKit and return the CDN URL
async function uploadFileToImageKit(file: File): Promise<string> {
  const authRes = await fetch('/api/imagekit-auth');
  if (!authRes.ok) throw new Error('Failed to get ImageKit auth params');
  const { token, signature, expire, publicKey } = await authRes.json();

  const result = await upload({
    file,
    fileName: file.name,
    publicKey,
    token,
    signature,
    expire,
    useUniqueFileName: true,
  });

  if (!result.url) throw new Error('ImageKit returned no URL');
  return result.url;
}

export default function RichTextEditor({ name, defaultValue = '', placeholder = 'Start writing your story...' }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Keep a stable ref to the editor so the paste handler can read the latest instance
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-sanitize: fix any doubled heading markers that can appear after
  // round-tripping through tiptap-markdown (e.g. `## ## Hello` → `## Hello`)
  // Fix: Trim leading whitespace/newlines which can cause the first block to be parsed as a paragraph
  let sanitized = defaultValue.trimStart();
  // Remove escaped heading markers: `\## ` → `## `
  sanitized = sanitized.replace(/\\(#{1,6}\s+)/g, '$1');
  // Remove doubled heading markers: `## ## ` → `## ` and `### ### ` → `### `
  sanitized = sanitized.replace(/^(#{1,6})\s+\1\s+/gm, '$1 ');
  // Remove doubled heading markers where levels differ: `## ### ` → `## `
  sanitized = sanitized.replace(/^(#{1,6})\s+(#{1,6})\s+/gm, '$1 ');
  // Remove bold/italic markers surrounding a heading that might have been accidentally added
  sanitized = sanitized.replace(/^\s*([*_]{1,3})(#{1,6}\s+[\s\S]*?)\1/gm, '$2');
  // Ensure headings always have a blank line before them (fixes missing newlines from previous blocks)
  sanitized = sanitized.replace(/^(#{1,6}\s+[A-Za-z0-9])/gm, '\n\n$1').replace(/\n{3,}/g, '\n\n').trimStart();

  // Intercept paste events: if the clipboard contains image files, upload them
  // to ImageKit and insert the CDN URL — skipping the base64 path entirely.
  const handlePaste = (view: any, event: ClipboardEvent): boolean => {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItems = items.filter((item) => item.kind === 'file' && item.type.startsWith('image/'));

    if (imageItems.length === 0) return false; // let Tiptap handle non-image pastes

    event.preventDefault();
    const currentEditor = editorRef.current;
    if (!currentEditor) return true;

    setIsUploading(true);
    (async () => {
      try {
        for (const item of imageItems) {
          const file = item.getAsFile();
          if (!file) continue;
          const url = await uploadFileToImageKit(file);
          currentEditor.chain().focus().setImage({ src: url, alt: file.name || 'pasted-image' }).run();
        }
      } catch (err) {
        console.error('Paste image upload failed:', err);
        alert('Image upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    })();

    return true; // mark as handled
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image,
      Link.configure({ openOnClick: false }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    // Pass the sanitized markdown directly to the content.
    // Since this runs only on the client, tiptap-markdown parses it correctly.
    content: sanitized,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown.getMarkdown();
      setMarkdownOutput(md);
    },
    editorProps: {
      attributes: { class: styles.editorContent },
      handlePaste,
    },
  });

  // Keep the ref in sync with the latest editor instance
  (editorRef as any).current = editor;

  // Sync initial markdown output after first mount
  useEffect(() => {
    if (editor) {
      const md = (editor.storage as any)?.markdown?.getMarkdown?.();
      if (md) setMarkdownOutput(md);
    }
  }, [editor]);

  if (!mounted) {
    return null; // Avoid SSR issues with tiptap-markdown DOMParser
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const url = await uploadFileToImageKit(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      console.error('ImageKit upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.editorContainer}>
      <MenuBar editor={editor} onImageUpload={handleImageUpload} isUploading={isUploading} />
      {isUploading && (
        <div className={styles.pasteUploadBanner}>
          <span className={styles.spinning} style={{ display: 'inline-flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </span>
          Uploading image to CDN…
        </div>
      )}
      <EditorContent editor={editor} />
      {/* Hidden file input for ImageKit uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input type="hidden" name={name} value={markdownOutput} />
    </div>
  );
}


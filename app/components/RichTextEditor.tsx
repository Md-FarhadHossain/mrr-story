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

export default function RichTextEditor({ name, defaultValue = '', placeholder = 'Start writing your story...' }: RichTextEditorProps) {
  const [markdownOutput, setMarkdownOutput] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Start empty — content is loaded via useEffect so the Markdown
    // extension can properly parse headings, bold, etc.
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown.getMarkdown();
      setMarkdownOutput(md);
    },
    editorProps: {
      attributes: { class: styles.editorContent },
    },
  });

  // Load initial markdown AFTER the editor is mounted so that
  // tiptap-markdown's parser converts `### heading` → H3 nodes,
  // `**bold**` → bold marks, etc. (the content: prop bypasses this).
  useEffect(() => {
    if (editor && defaultValue) {
      editor.commands.setContent(defaultValue);
      // Sync the hidden input with the parsed-then-re-serialised markdown
      const md = (editor.storage as any)?.markdown?.getMarkdown?.();
      if (md) setMarkdownOutput(md);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]); // run once when the editor instance is first available

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      // 1. Get signed auth params from our server
      const authRes = await fetch('/api/imagekit-auth');
      const { token, signature, expire, publicKey, urlEndpoint } = await authRes.json();

      // 2. Upload to ImageKit
      const result = await upload({
        file,
        fileName: file.name,
        publicKey,
        token,
        signature,
        expire,
        useUniqueFileName: true,
      });

      // 3. Insert the returned CDN URL into the editor
      if (result.url) {
        editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      }
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


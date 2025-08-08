"use client";

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import React from 'react';

// Define the props the component will accept
interface CKEditorProps {
  value: string;
  onChange: (data: string) => void;
}

// This component acts as a bridge between CKEditor and React Hook Form
export function CKEditorComponent({ value, onChange }: CKEditorProps) {
  return (
    <div className="prose max-w-none">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""} // Use the `data` prop to set the content
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data); // Call the form's onChange with the new content
        }}
      />
    </div>
  );
}
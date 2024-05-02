import React from 'react';
import { createEditor, Node } from 'slate';
import { Editable, Slate, ReactEditor } from 'slate-react';

const MyEditor: React.FC = () => {
const editor = createEditor() as ReactEditor;

type ParagraphNode = {
    type: 'paragraph';
    children: Node[];
};

const initialDocument: ParagraphNode[] = [
    {
        type: 'paragraph',
        children: [
            {
                text: 'A line of text!',
            },
        ],
    },
];

return (
    <>
        <div>Editor</div>
        <Slate editor={editor} initialValue={initialDocument}>
            <Editable />
        </Slate>
    </>
);
};

export default MyEditor;
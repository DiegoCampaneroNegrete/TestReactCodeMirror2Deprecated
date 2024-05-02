import React, { FC } from 'react';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/3024-night.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/powershell/powershell'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/python/python'
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import { Controlled as ControlledEditor } from 'react-codemirror2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import {javaLanguage} from "@codemirror/lang-java"

interface CodeEditorProps {
  language: string;
  displayName: string;
  value: string;
  onChange: (value: string) => void;
  lineNumbers: boolean;
  runFunction?: () => void;
  theme?: string;
}

const CodeEditor: FC<CodeEditorProps> = ({
  language,
  displayName,
  value,
  onChange,
  lineNumbers,
  runFunction,
  theme
}) => {
  function handleChange(editor: any, data: any, value: string) {
    if(displayName !== "Console"){
      onChange(value)
    }
  }

  function IsConsole({runFunction} :{runFunction: () => void}){
   if(displayName === "Console"){
      return(
        <button
          type="button"
          className="run-btn"
          onClick={() => runFunction()}
          > 
          <FontAwesomeIcon icon={faPlay} /> Run Code
        </button>
      )
    }
    else if(displayName === "Test Cases"){
      return(
        <button
          type="button"
          className="run-btn"
          onClick={() => runFunction()}
          > 
          <FontAwesomeIcon icon={faPlayCircle} /> Run Test Cases
        </button>
      )
    }
    else if(displayName.includes("Main")){
      return(
        <button
          type="button"
          className="run-btn"
          onClick={() => runFunction()}
          > 
          <FontAwesomeIcon icon={faPlayCircle} /> Run Console
        </button>
      )
    }
  }
  return (
    <div className={"editor-container"}>
    <div className="editor-title">
      {displayName}
      {runFunction && IsConsole({ runFunction })}
    </div>
      <ControlledEditor
        onBeforeChange={handleChange}
        value={value}
        className="code-mirror-wrapper"
        options={{
          lineWrapping: true,
          lint: true,
          mode: language,
          matchBrackets: true,
          theme: theme===undefined? "default":theme,
          lineNumbers: lineNumbers,
          indentWithTabs: true,
          autocomplete: javaLanguage,
          extraKeys: {
            "Ctrl-Space": "autocomplete"
          },
          smartIndent: true,
          autofocus: true,
          
        }}
      />
    </div>
  )
}

export default CodeEditor;
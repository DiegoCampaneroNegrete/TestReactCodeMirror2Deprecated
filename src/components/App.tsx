import React, { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Select from "react-select";
import useLocalStorage from "../hooks/useLocalStorage";
import Editor from "./Editor";
import NavDark from "./Navbar";
import { GroupBase } from 'react-select';

const HOST = "https://afdevs.ddns.net";

var REST_ENDPOINT_RUN = HOST + "/api/v1/java_code";
var REST_ENDPOINT_TEST_CASES = HOST + "/api/v1/java_test_cases";
var REST_ENDPOINT_LOAD = HOST + "/api/v1/load_case";
const WS_URL = HOST + "/ws-endpoint";

const pathSession = window.location.href.split("/")[3];
const testCase = window.location.href.split("/")[4];
const PREFIX = "apex-code-challenge-" + pathSession + "-" + testCase;

const socket = new SockJS(WS_URL);
const stompClient = Stomp.over(socket);

interface Option {
  label?: string;
  value?: string;
  displayName?: string;
  language?: string;
}

const callPOST = async (endpoint: string, body: string, type: string) => {
  const response = await fetch(endpoint, {
    method: "POST",
    body: body,
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const jsonResponse = await response.json();
  if (type === "result") {
    return (
      jsonResponse["result"] +
      " in " +
      jsonResponse["duration"] +
      " ms\n\n" +
      jsonResponse["output"]
    );
  }
  if (type === "load") {
    return jsonResponse;
  }
};



function onChangeUpdate(value: string, type: string, functionSet: any) {
        var quote = {
            message: value,
            type: type,
            // from: socket.transport.unloadRef,
        };
        stompClient.send(
            "/topic/reply-" + pathSession + "-" + testCase,
            {},
            JSON.stringify(quote)
        );
        functionSet(value);
    }

const onChangeFunc = (value: string, displayName: string, functionSet: any) => {
    onChangeUpdate(value, displayName, functionSet);
};

function redirect() {
    if (pathSession === "") {
        let path = (Math.random() + 1).toString(36).substring(2);
        window.location.replace(window.location.href + path);
    }
}

const App: React.FC = () => {
  redirect();
  const [apiResponse, setApiResponse] = useState<string>(
    "Run your code and see the result here"
  );
const [casesValue, setCasesValue] = useState<string>(
    "See the cases results here"
);
const [text, setText] = useLocalStorage(
    "text",
    `See the code challenge here`
);
const [java] = useLocalStorage(
        "java",
        `public class Main {
        public static void main (String[] args) {
                        System.out.print("Hello World from Java!");
        }
}`
);
    const [initialState, setInitialState] = useLocalStorage(
        "initialState",
        true
    );
  const [python] = useLocalStorage(
    "python",
    `print("Hello World from Python")`
  );
  const [code, setCode] = useLocalStorage("code", java);
  const [inputValue, setInputValue] = useLocalStorage(
    "input",
    "Put your input values here"
  );
  const [selectedOption, setSelectedOption] = useState<Option>({
    label: "Java 21",
    value: "java",
    displayName: "Main.java",
    language: "text/x-java",
  });


  function callRunAPI(): void {
    let body = JSON.stringify({
      code: btoa(JSON.parse(localStorage.getItem(PREFIX + "code") || '{}')),
      session_id: pathSession,
      case_id: testCase,
      input_values: btoa(JSON.parse(localStorage.getItem(PREFIX + "input") || '{}')),
    });
    callPOST(REST_ENDPOINT_RUN, body, "result").then((result: string) => {
      onChangeUpdate(result, "Console", setApiResponse);
    });
  }

  const options: Option[] = [
    {
      label: "Java 21",
      value: "java",
      displayName: "Main.java",
      language: "text/x-java",
    },
    {
      label: "Python 3",
      value: "python",
      displayName: "Main.py",
      language: "python",
    },
  ];

  function callTestCasesAPI(): void {
    let body = JSON.stringify({
      code: btoa(JSON.parse(localStorage.getItem(PREFIX + "code") || '{}')),
      session_id: pathSession,
      case_id: testCase,
      input_values: btoa(JSON.parse(localStorage.getItem(PREFIX + "input") || '{}')),
    });
    callPOST(REST_ENDPOINT_TEST_CASES, body, "result").then((result: string) => {
      onChangeUpdate(result, "Test Cases", setCasesValue);
    });
  }

  function setSelectedOptions(value: Option) {
    if (value.label === "Java 21") {
      REST_ENDPOINT_RUN = HOST + "/api/v1/java_code";
      setCode(java);
    } else if (value.label === "Python 3") {
      REST_ENDPOINT_RUN = HOST + "/api/v1/python_code";
      setCode(python);
    }
    setSelectedOption(value);
  }


const langSelector = () => (
    <Select
        defaultValue={{ label: "Java 21" }}
        options={options as readonly ({ label: string; } | GroupBase<{ label: string; }>)[]}
        onChange={(newValue: any) => setSelectedOptions(newValue)}
    //   theme={(theme) => ({
    //     ...theme,
    //     colors: {
    //       primary25: "silver",
    //       primary: "black",
    //     },
    //   })}
    />
);

  // ... rest of the code remains the same
  return (
    <>
      <NavDark />
      <div className="pane top-pane">
        <PanelGroup autoSaveId="save" direction="horizontal">
        <Panel
            className="pane top-pane"
            minSize={10}
        >
            <Editor
                language="powershell"
                displayName="Text"
                lineNumbers={false}
                value={text}
                onChange={(e) => onChangeFunc(e, "Text", setText)}
                runFunction={() => {}}
                theme="dracula"
            />
        </Panel>
          <PanelResizeHandle />
        <Panel className="pane top-pane" minSize={10}>
            <Editor
                language={selectedOption.language || ""}
                displayName={selectedOption?.displayName || ""}
                lineNumbers={true}
                value={code}
                runFunction={langSelector}
                onChange={(e) => onChangeFunc(e, "Code", setCode)}
                theme="material-darker"
            />
        </Panel>
          <PanelResizeHandle />
        <Panel
            className={testCase !== undefined ? "" : "pane top-pane"}
            minSize={10}
        >
            {testCase !== undefined ? (
              <>
                <PanelGroup direction="vertical">
                <Panel
                    className="pane "
                    minSize={10}
                >
                    <Editor
                      language="powershell"
                      displayName="Console"
                      lineNumbers={false}
                      runFunction={callRunAPI}
                      value={apiResponse}
                      onChange={(e) =>
                        onChangeFunc(e, "Console", setApiResponse)
                      }
                      theme="3024-night"
                    />
                  </Panel>
                  <PanelResizeHandle className="resizer" />
                  <Panel
                    className="pane vertical-pane"
                    minSize={10}
                    // defaultSizePercentage={33}
                  >
                    <Editor
                      language="powershell"
                      displayName="Input"
                      lineNumbers={false}
                      value={inputValue}
                      onChange={(e) => onChangeFunc(e, "Input", setInputValue)}
                      theme="3024-night"
                    />
                  </Panel>
                  <PanelResizeHandle />
                  <Panel
                    className="pane vertical-pane"
                    minSize={10}
                    // defaultSizePercentage={33}
                  >
                    <Editor
                      language="powershell"
                      displayName="Test Cases"
                      lineNumbers={false}
                      value={casesValue}
                      runFunction={callTestCasesAPI}
                      onChange={(e) =>
                        onChangeFunc(e, "Test Cases", setCasesValue)
                      }
                      theme="3024-night"
                    />
                  </Panel>
                </PanelGroup>
              </>
            ) : (
                <>
                    <Editor
                        language="powershell"
                        displayName="Console"
                        lineNumbers={false}
                        runFunction={callRunAPI}
                        value={apiResponse}
                        onChange={(e) => onChangeFunc(e, "Console", setApiResponse)}
                        theme="3024-night"
                    />
                </>
            )}
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
};

export default App;
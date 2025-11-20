import React, { useEffect, useMemo, useState } from 'react';
import { runCode } from '../../Api/execApi';

const defaultHtml = `<!-- Write HTML here -->\n<div class="p-4">\n  <h1>Hello Playground</h1>\n  <p>Edit HTML, CSS, and JS to see changes live.</p>\n</div>`;

const defaultCss = `/* Write CSS here */\nbody {\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;\n}\n h1 { color: #22c55e; }\n p { color: #94a3b8; }`;

const defaultJs = `// Write JavaScript here\nconsole.log('Playground ready');`;

function TextArea({ label, value, onChange, className = '' }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 bg-slate-800 border-b border-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`flex-1 resize-none bg-slate-900 text-slate-100 p-3 outline-none border-0 focus:ring-0 ${className}`}
      />
    </div>
  );
}

const CodePlayground = () => {
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState(defaultCss);
  const [js, setJs] = useState(defaultJs);
  const [autoRun, setAutoRun] = useState(true);
  const [srcDoc, setSrcDoc] = useState('');
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState("console.log('Hello from Node.js')");
  const [stdin, setStdin] = useState('');
  const [execResult, setExecResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const defaultTemplates = {
    javascript: "console.log('Hello, World!')\n",
    python: "print('Hello, World!')\n",
    cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    cout << \"Hello, World!\\n\";\n    return 0;\n}\n",
    c: "#include <stdio.h>\nint main(){\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n",
    java: "import java.io.*;\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n",
    go: "package main\nimport \"fmt\"\nfunc main(){\n    fmt.Println(\"Hello, World!\")\n}\n",
    php: "<?php\necho 'Hello, World!';\n",
    ruby: "puts 'Hello, World!'\n",
    rust: "fn main(){\n    println!(\"Hello, World!\");\n}\n",
  };

  const buildSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n<style>\n${css}\n</style>\n</head>\n<body>\n${html}\n<script>\ntry {\n${js}\n} catch (e) {\n  console.error(e);\n  const pre = document.createElement('pre');\n  pre.style.color = '#ef4444';\n  pre.textContent = e?.stack || e?.message || String(e);\n  document.body.appendChild(pre);\n}\n<\/script>\n</body>\n</html>`;
  }, [html, css, js]);

  useEffect(() => {
    if (!autoRun) return;
    const id = setTimeout(() => setSrcDoc(buildSrcDoc), 300);
    return () => clearTimeout(id);
  }, [buildSrcDoc, autoRun]);

  const handleRun = () => setSrcDoc(buildSrcDoc);
  const handleReset = () => {
    setHtml(defaultHtml);
    setCss(defaultCss);
    setJs(defaultJs);
  };
  const handleDownload = () => {
    const blob = new Blob([buildSrcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setExecResult(null);
    try {
      const result = await runCode({ language: lang, code, stdin });
      setExecResult(result);
    } catch (e) {
      setExecResult({ success: false, error: e?.message || 'Execution failed' });
    } finally {
      setIsRunning(false);
    }
  };

  // When language changes, load template if editor is empty or contains previous template
  useEffect(() => {
    const current = code?.trim();
    const anyTemplate = Object.values(defaultTemplates).some((tpl) => tpl.trim() === current);
    if (!current || anyTemplate) {
      setCode(defaultTemplates[lang] || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const insertTemplate = () => {
    setCode(defaultTemplates[lang] || '');
  };

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Code Playground</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-slate-300 text-sm">
              <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} />
              Auto run
            </label>
            <button onClick={handleRun} className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm">Run</button>
            <button onClick={handleReset} className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm">Reset</button>
            <button onClick={handleDownload} className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">Download</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-rows-3 gap-4 h-[70vh]">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
              <TextArea label="HTML" value={html} onChange={setHtml} />
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
              <TextArea label="CSS" value={css} onChange={setCss} />
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
              <TextArea label="JavaScript" value={js} onChange={setJs} />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-[70vh]">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 bg-slate-800 border-b border-slate-700">
              Preview
            </div>
            <iframe
              title="preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={srcDoc}
              className="w-full h-[calc(70vh-40px)] bg-white"
            />
          </div>
        </div>

        {/* Language Runner */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span>Language Runner</span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="ml-2 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded border border-slate-700"
                >
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={insertTemplate} className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-xs">Template</button>
                <button onClick={handleExecute} disabled={isRunning} className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white text-xs">
                  {isRunning ? 'Running…' : 'Run'}
                </button>
              </div>
            </div>
            <div className="grid grid-rows-2 lg:grid-rows-2 gap-4 p-4 flex-1 overflow-auto">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder={"Write " + lang + " code here"}
                className="w-full h-full resize-none bg-slate-950 text-slate-100 p-3 outline-none border border-slate-700 rounded"
              />
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                spellCheck={false}
                placeholder="Standard input (optional)"
                className="w-full h-32 resize-none bg-slate-950 text-slate-100 p-3 outline-none border border-slate-700 rounded"
              />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-[70vh]">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 bg-slate-800 border-b border-slate-700">
              Output
            </div>
            <div className="p-4 h-[calc(70vh-40px)] overflow-auto font-mono text-sm">
              {execResult ? (
                <div>
                  {execResult.compile_stderr ? (
                    <pre className="text-red-400 whitespace-pre-wrap">{execResult.compile_stderr}</pre>
                  ) : null}
                  {execResult.stdout ? (
                    <pre className="text-slate-100 whitespace-pre-wrap">{execResult.stdout}</pre>
                  ) : null}
                  {execResult.stderr ? (
                    <pre className="text-red-400 whitespace-pre-wrap">{execResult.stderr}</pre>
                  ) : null}
                  {(!execResult.stdout && !execResult.stderr && !execResult.compile_stderr) ? (
                    <pre className="text-slate-400">(no output)</pre>
                  ) : null}
                  <div className="mt-2 text-xs text-slate-500">{execResult.language} • time: {execResult.time ?? '-'}s • mem: {execResult.memory ?? '-'} KB</div>
                </div>
              ) : (
                <div className="text-slate-500">Run code to see output…</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;



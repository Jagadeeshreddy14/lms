import express from 'express';

const execRouter = express.Router();

// Simple mapping of friendly language names to Piston identifiers
const LANGUAGE_MAP = {
  javascript: 'javascript',
  node: 'javascript',
  python: 'python',
  python3: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  go: 'go',
  ruby: 'ruby',
  php: 'php',
  rust: 'rust',
};

execRouter.post('/run', async (req, res) => {
  try {
    const { language, code, stdin = '', args = [] } = req.body || {};

    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required' });
    }

    const lang = LANGUAGE_MAP[String(language).toLowerCase()] || String(language).toLowerCase();

    const payload = {
      language: lang,
      version: '*',
      files: [
        {
          content: code,
        },
      ],
      stdin,
      args,
      compile_timeout: 10000,
      run_timeout: 10000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Execution service error', details: data });
    }

    // Normalize output
    const result = {
      success: true,
      language: lang,
      stdout: data?.run?.stdout || '',
      stderr: data?.run?.stderr || '',
      output: (data?.run?.stdout || '') + (data?.run?.stderr ? `\n${data.run.stderr}` : ''),
      code: data?.run?.code,
      signal: data?.run?.signal,
      time: data?.run?.time,
      memory: data?.run?.memory,
      compile_stdout: data?.compile?.stdout || '',
      compile_stderr: data?.compile?.stderr || '',
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Exec run error:', err);
    return res.status(500).json({ success: false, message: 'Internal execution error', error: err?.message });
  }
});

export default execRouter;



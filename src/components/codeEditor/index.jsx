import MonacoEditor from 'react-monaco-editor';

const CodeEditor = (props) => {
  const { language, height, code, onChange, options } = props;
  return (
    <MonacoEditor
      width="100%"
      height={height || '100%'}
      language={language || 'json'}
      theme="vs-dark"
      value={code}
      options={options}
      onChange={onChange}
    />
  );
};

export default CodeEditor;

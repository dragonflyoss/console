import MonacoEditor from 'react-monaco-editor';

const CodeEditor = (props) => {
  const { language, width, height, value, onChange, options } = props;
  return (
    <MonacoEditor
      width={width || '100%'}
      height={height || '100px'}
      language={language || 'json'}
      theme="vs-dark"
      value={value}
      options={options}
      onChange={onChange}
    />
  );
};

export default CodeEditor;

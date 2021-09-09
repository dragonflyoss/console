import { Result, Button } from 'antd';
export default function ErrorPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button
          type="primary"
          onClick={() => window.location.assign('/signin')}
        >
          Back Home
        </Button>
      }
    />
  );
}

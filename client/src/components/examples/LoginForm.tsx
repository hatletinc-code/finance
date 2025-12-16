import { LoginForm } from "../LoginForm";

export default function LoginFormExample() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm onLogin={(email, password) => console.log("Login:", email, password)} />
    </div>
  );
}

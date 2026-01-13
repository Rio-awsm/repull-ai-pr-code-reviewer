import { requireUnauth } from "@/modules/auth/auth-utils";
import LoginForm from "@/modules/auth/login-form";

const LoginPage = async () => {
  await requireUnauth();
  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;

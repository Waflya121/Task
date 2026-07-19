import { AuthShell } from '../components/auth/AuthShell';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <AuthShell
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить работу в личном кабинете."
      asideTitle="Рады видеть снова"
      asideText="Ваши данные ждут вас. Войдите и продолжите с того места, где остановились."
      bullets={[
        'Безопасный вход по JWT-токену',
        'Опция «Запомнить меня»',
        'Доступ к защищённому кабинету',
      ]}
    >
      <LoginForm />
    </AuthShell>
  );
}

export default LoginPage;

import { AuthShell } from '../components/auth/AuthShell';
import { ForgotPassword } from '../components/auth/ForgotPassword';

export function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Забыли пароль?"
      subtitle="Укажите email — пришлём ссылку для сброса пароля."
      asideTitle="Ничего страшного"
      asideText="Восстановить доступ можно за минуту. Мы отправим безопасную ссылку на вашу почту."
      bullets={[
        'Безопасная ссылка для сброса',
        'Никакой информации об аккаунте не раскрывается',
        'Новый пароль — и снова в деле',
      ]}
    >
      <ForgotPassword />
    </AuthShell>
  );
}

export default ForgotPasswordPage;

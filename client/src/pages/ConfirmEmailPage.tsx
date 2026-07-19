import { AuthShell } from '../components/auth/AuthShell';
import { EmailConfirm } from '../components/auth/EmailConfirm';

export function ConfirmEmailPage() {
  return (
    <AuthShell
      title="Подтверждение email"
      subtitle="Активируйте аккаунт, чтобы получить полный доступ."
      asideTitle="Ещё один шаг"
      asideText="Подтверждение email защищает ваш аккаунт и открывает все возможности сервиса."
      bullets={[
        'Ссылка действует ограниченное время',
        'Можно запросить письмо повторно',
        'После подтверждения — сразу в кабинет',
      ]}
    >
      <EmailConfirm />
    </AuthShell>
  );
}

export default ConfirmEmailPage;

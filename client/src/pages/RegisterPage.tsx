import { AuthShell } from '../components/auth/AuthShell';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <AuthShell
      title="Создать аккаунт"
      subtitle="Пара минут — и вы в системе. Данные под надёжной защитой."
      asideTitle="Присоединяйтесь к нам"
      asideText="Начните пользоваться сервисом уже сегодня — быстро, удобно и безопасно."
      bullets={[
        'Мгновенный доступ после регистрации',
        'Подтверждение email для защиты аккаунта',
        'Восстановление пароля в один клик',
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}

export default RegisterPage;

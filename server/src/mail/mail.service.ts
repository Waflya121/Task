import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compile, type TemplateDelegate } from 'handlebars';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../config/configuration';

type TemplateName = 'welcome' | 'reset-password';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;
  // Скомпилированные шаблоны кешируются в памяти, чтобы не читать файл с
  // диска и не парсить Handlebars на каждое письмо.
  private readonly templateCache = new Map<TemplateName, TemplateDelegate>();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const mail = this.configService.get('mail', { infer: true });
    this.transporter = nodemailer.createTransport({
      host: mail.smtpHost,
      port: mail.smtpPort,
      secure: mail.smtpPort === 465,
      // На relay-сервере NetAngels для VDS "Старт" (skvmrelay.netangels.ru)
      // авторизация не требуется — доступ разрешён по IP клиентского VDS.
      auth: mail.smtpUser ? { user: mail.smtpUser, pass: mail.smtpPass } : undefined,
      // Relay использует самоподписанный сертификат для STARTTLS — это
      // доверенный внутренний сервер провайдера (доступ по IP), строгая
      // проверка цепочки сертификата тут не нужна и не пройдёт.
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
    });
  }

  private get serviceName(): string {
    return this.configService.get('serviceName', { infer: true });
  }

  private get frontendUrl(): string {
    return this.configService.get('frontendUrl', { infer: true });
  }

  private get from(): string {
    return this.configService.get('mail', { infer: true }).from;
  }

  private renderTemplate(
    name: TemplateName,
    context: Record<string, unknown>,
  ): string {
    let template = this.templateCache.get(name);
    if (!template) {
      const source = readFileSync(
        join(__dirname, 'templates', `${name}.hbs`),
        'utf8',
      );
      template = compile(source);
      this.templateCache.set(name, template);
    }
    return template(context);
  }

  // Приветственное письмо с подтверждением email.
  // Ошибка отправки не должна ронять регистрацию — логируем и продолжаем.
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    try {
      const html = this.renderTemplate('welcome', {
        firstName,
        serviceName: this.serviceName,
        frontendUrl: this.frontendUrl,
        confirmUrl: `${this.frontendUrl}/confirm?token=${token}`,
        token,
      });
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Добро пожаловать в ${this.serviceName}!`,
        html,
      });
    } catch (error) {
      this.logger.warn(
        `Не удалось отправить приветственное письмо на ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async sendResetPasswordEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    try {
      const html = this.renderTemplate('reset-password', {
        firstName,
        serviceName: this.serviceName,
        frontendUrl: this.frontendUrl,
        resetUrl: `${this.frontendUrl}/reset-password?token=${token}`,
        token,
      });
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `Сброс пароля в ${this.serviceName}`,
        html,
      });
    } catch (error) {
      this.logger.warn(
        `Не удалось отправить письмо сброса пароля на ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

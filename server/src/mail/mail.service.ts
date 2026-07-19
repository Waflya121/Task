import { readFileSync } from 'fs';
import { join } from 'path';
import { lookup as dnsLookup } from 'dns/promises';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compile, type TemplateDelegate } from 'handlebars';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../config/configuration';

type TemplateName = 'welcome' | 'reset-password';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  // Скомпилированные шаблоны кешируются в памяти, чтобы не читать файл с
  // диска и не парсить Handlebars на каждое письмо.
  private readonly templateCache = new Map<TemplateName, TemplateDelegate>();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  private get serviceName(): string {
    return this.configService.get('serviceName', { infer: true });
  }

  private get frontendUrl(): string {
    return this.configService.get('frontendUrl', { infer: true });
  }

  private get from(): string {
    return this.configService.get('mail', { infer: true }).from;
  }

  // Nodemailer/smtp-connection резолвит хост через dns.resolve() (прямой
  // запрос к DNS-серверу через c-ares), а не через dns.lookup() (системный
  // резолвер ОС). За VPN/proxy-клиентами с перехватом DNS на уровне ОС
  // (Clash/FlClash и т.п. в режиме fake-ip) это часто означает, что
  // dns.lookup() резолвит мгновенно, а dns.resolve() виснет по таймауту —
  // поэтому резолвим IP сами и подключаемся по нему, передавая исходное имя
  // хоста в tls.servername, чтобы TLS-сертификат по-прежнему проверялся
  // корректно (SNI).
  private async createTransporter(): Promise<nodemailer.Transporter> {
    const mail = this.configService.get('mail', { infer: true });
    let host = mail.smtpHost;
    try {
      const resolved = await dnsLookup(mail.smtpHost);
      host = resolved.address;
    } catch (error) {
      this.logger.warn(
        `Не удалось предварительно резолвить ${mail.smtpHost} через dns.lookup, ` +
          `используем исходный хост: ${
            error instanceof Error ? error.message : String(error)
          }`,
      );
    }
    return nodemailer.createTransport({
      host,
      port: mail.smtpPort,
      // 465 — неявный TLS; остальные порты (587) используют STARTTLS.
      secure: mail.smtpPort === 465,
      auth: mail.smtpUser ? { user: mail.smtpUser, pass: mail.smtpPass } : undefined,
      tls: { servername: mail.smtpHost },
      // Письмо отправляется в фоне и не блокирует ответ API (см. auth.service.ts),
      // поэтому можно позволить себе щедрый таймаут — реальное SMTP-рукопожатие
      // иногда занимает больше минуты, а не секунды (медленная сеть/прокси).
      connectionTimeout: 120_000,
      greetingTimeout: 60_000,
      socketTimeout: 120_000,
    });
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
      const transporter = await this.createTransporter();
      await transporter.sendMail({
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
      const transporter = await this.createTransporter();
      await transporter.sendMail({
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

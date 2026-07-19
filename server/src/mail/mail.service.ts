import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compile, type TemplateDelegate } from 'handlebars';
import { AppConfig } from '../config/configuration';

type TemplateName = 'welcome' | 'reset-password';

const UNISENDER_ENDPOINT = 'https://api.unisender.com/ru/api/sendEmail';

interface UniSenderResponse {
  result?: { email_id?: number | number[] };
  error?: string;
  code?: string;
}

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

  // Отправка письма через HTTP API UniSender (POST-запрос на api.unisender.com),
  // а не через SMTP — обходит блокировку исходящих SMTP-портов, которая
  // встречается практически на всех бюджетных хостингах (Render, VPS и т.д.).
  private async send(to: string, subject: string, html: string): Promise<void> {
    const mail = this.configService.get('mail', { infer: true });
    const params = new URLSearchParams({
      format: 'json',
      api_key: mail.unisenderApiKey,
      email: to,
      sender_name: mail.senderName,
      sender_email: mail.senderEmail,
      subject,
      body: html,
      list_id: mail.unisenderListId,
    });

    const response = await fetch(UNISENDER_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const json = (await response.json()) as UniSenderResponse;
    // UniSender почти всегда отвечает 200 даже при ошибке — реальный статус
    // нужно смотреть в теле ответа (`error`/`code`), а не по HTTP-коду.
    if (!response.ok || json.error) {
      throw new Error(
        `UniSender API ${response.status}: ${json.error ?? JSON.stringify(json)}`,
      );
    }
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
      await this.send(to, `Добро пожаловать в ${this.serviceName}!`, html);
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
      await this.send(to, `Сброс пароля в ${this.serviceName}`, html);
    } catch (error) {
      this.logger.warn(
        `Не удалось отправить письмо сброса пароля на ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

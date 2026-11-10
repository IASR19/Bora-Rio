import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BusinessException } from '../../common/exceptions/business.exception';

const RESEND_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 10_000;

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailSendFailedException extends BusinessException {
  constructor() {
    super('Não foi possível enviar o e-mail. Tente novamente em instantes.');
  }
}

/**
 * Envio de e-mail pela API do Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Precisa de `RESEND_API_KEY` e `MAIL_FROM` (remetente de um domínio verificado no Resend).
 * Fora de produção, sem essas variáveis, só registra no log: dá pra testar o fluxo sem enviar.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>('MAIL_FROM');

    if (!apiKey || !from) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('RESEND_API_KEY/MAIL_FROM não configurados: e-mail não enviado.');
        throw new EmailSendFailedException();
      }
      this.logger.warn(`Resend não configurado: e-mail "${message.subject}" não enviado.`);
      return;
    }

    let response: Response;
    try {
      response = await fetch(RESEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
    } catch (err) {
      this.logger.error(`Falha de rede ao chamar o Resend: ${err instanceof Error ? err.message : String(err)}`);
      throw new EmailSendFailedException();
    }

    if (!response.ok) {
      const body = (await response.text().catch(() => '')).slice(0, 300);
      this.logger.error(`Resend recusou o envio (${response.status}): ${body}`);
      throw new EmailSendFailedException();
    }
  }
}

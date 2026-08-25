import { EmailTemplate } from './email-template.enum';

/**
 * Interface defining the payload required to send an email
 */
export interface ISendEmailPayload {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, any>;
}

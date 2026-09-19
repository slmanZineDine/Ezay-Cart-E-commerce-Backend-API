export const EMAIL_SENDER = 'EMAIL_SENDER';

export interface EmailSender {
  sendVerificationEmail(data: VerificationEmailData): Promise<void>;

  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void>;
}

export interface VerificationEmailData {
  email: string;
  username: string;
  token: string;
}

export interface PasswordResetEmailData {
  email: string;
  username: string;
  otp: string;
}

export interface EmailDomain {
  id: string;
  domain: string;
  createdAt: Date;
}

export type NewEmailDomain = Pick<EmailDomain, 'domain'>;

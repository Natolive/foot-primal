// Email prêt à partir, produit par un template de `mail/application/templates/`.
export interface Mail {
  to: { email: string; name: string };
  subject: string;
  html: string;
}

export abstract class Mailer {
  abstract send(mail: Mail): Promise<void>;
}

import MailService from "@sendgrid/mail";
import process from "process";
import {ClientResponse} from "@sendgrid/client/src/response";
import {debug, info, warn} from "../../../utils/logger-handler";

const {NEXT_SENDGRID_MAIL_API_KEY, NEXT_SENDGRID_MAIL_FROM} = process.env;

class EmailServiceFactory {
  constructor(private apiKey = NEXT_SENDGRID_MAIL_API_KEY, readonly from = NEXT_SENDGRID_MAIL_FROM) {
    if (!apiKey)
      throw new Error(`Needs "apiKey" field, NEXT_SENDGRID_MAIL_API_KEY`);

    if (!from)
      throw new Error(`Needs "from" field, NEXT_SENDGRID_MAIL_FROM`);

    MailService.setApiKey(apiKey);
  }

  async sendEmail(subject: string, bcc: string | string[], html: string): Promise<ClientResponse> {
    return new Promise((p, f) => {
      debug(`Sending email (${subject})`);

      const sendCallback = (e: Error, result: [ClientResponse, {}]) => {
        if (e) {
          warn(`Failed to send email to ${bcc.toString()} (${subject})`);
          f(e);
        } else {
          info(`Sent email to ${bcc.toString()} (${subject})`);
          p(result[0]);
        }
      }

      MailService.send({subject, html, bcc, from: NEXT_SENDGRID_MAIL_FROM!}, false, sendCallback)
    });
  }
}

export const EmailService = new EmailServiceFactory();
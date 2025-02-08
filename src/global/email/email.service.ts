import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import {
  buildErrorTemplate,
  buildSuccessTemplate,
  buildTemplate,
} from './Templates/emailVerification.template';

@Injectable()
export class EmailService {
  mailTransport() {
    //For Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });

    return transporter;
  }

  async sendVerificationEmail(email: string, token: string) {
    const transport = this.mailTransport();

    const verificationUrl = `${process.env.VERIFICATION_URL}${token}`;
    const htmlBody = await buildTemplate(verificationUrl);

    const options: MailOptions = {
      from: {
        name: process.env.DEFAULT_ADDRESS,
        address: process.env.DEFAULT_EMAIL,
      },
      to: email,
      html: htmlBody,
      subject: 'Email verification',
    };

    transport.sendMail(options, (error, info) => {
      if (error) {
        return { message: 'Error sending email', error };
      }
      return { message: 'Email sent successfully', info };
    });
  }

  async sendWelcomeEmail(email: string) {
    const transport = this.mailTransport();

    const htmlBody = await buildSuccessTemplate();

    const options: MailOptions = {
      from: {
        name: process.env.DEFAULT_ADDRESS,
        address: process.env.DEFAULT_EMAIL,
      },
      to: email,
      html: htmlBody,
      subject: 'Welcome to our platform',
    };

    transport.sendMail(options, (error, info) => {
      if (error) {
        return { message: 'Error sending email', error };
      }
      return { message: 'Email sent successfully', info };
    });
  }

  async sendErrorEmail(email: string) {
    const transport = this.mailTransport();

    const htmlBody = await buildErrorTemplate();

    const options: MailOptions = {
      from: {
        name: process.env.DEFAULT_ADDRESS,
        address: process.env.DEFAULT_EMAIL,
      },
      to: email,
      html: htmlBody,
      subject: 'Oops!! Invalid or Expired Token',
    };

    transport.sendMail(options, (error, info) => {
      if (error) {
        return { message: 'Error sending email', error };
      }
      return { message: 'Email sent successfully', info };
    });
  }
}

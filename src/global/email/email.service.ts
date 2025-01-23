import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/sendEmail.dto';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { Response } from 'express';
import { buildTemplate } from './Templates/emailVerification.template';

@Injectable()
export class EmailService {
  mailTransport() {
    //For mailtrap
    // const transporter = nodemailer.createTransport({
    //   host: process.env.HOST,
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.MAILTRAP_USER,
    //     pass: process.env.MAILTRAP_PASS,
    //   },
    // });

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

  async sendEmail(dto: SendEmailDto, res: Response) {
    const { from, recepients, html, subject } = dto;

    const transport = this.mailTransport();

    const options: MailOptions = {
      from: from ?? {
        name: process.env.DEFAULT_ADDRESS,
        address: process.env.DEFAULT_EMAIL,
      },
      to: recepients,
      html,
      subject,
    };

    transport.sendMail(options, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        return res.status(500).json({ message: 'Error sending email', error });
      }
      console.log('Email sent successfully:', info);
      return res.status(200).json({ message: 'Email sent successfully', info });
    });
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
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize transporter asynchronously
    this.initializeTransporter().catch((error) => {
      this.logger.error(
        'Failed to initialize email service in constructor:',
        error,
      );
    });
  }

  private async initializeTransporter() {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    // Check if we have SMTP credentials configured
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      // Use configured SMTP (Gmail, etc.)
      const isGmail = smtpHost.includes('gmail.com');

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort.toString()),
        secure: isGmail ? true : this.configService.get('SMTP_SECURE', false), // Gmail requires SSL
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        // Gmail specific settings
        ...(isGmail && {
          service: 'gmail',
          tls: {
            rejectUnauthorized: false,
          },
        }),
      });
    } else if (isDevelopment) {
      // Fallback to Mailhog for development if no SMTP configured
      this.logger.warn(
        'No SMTP credentials found, using Mailhog for development',
      );
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: {
          user: '',
          pass: '',
        },
      });
    } else {
      throw new Error('SMTP credentials not configured for production');
    }

    // Verify connection
    try {
      await this.transporter.verify();
      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email service:', error);
    }
  }

  private async ensureTransporterReady() {
    if (!this.transporter) {
      await this.initializeTransporter();
    }
  }

  async sendVerificationEmail(email: string, firstName: string, token: string) {
    await this.ensureTransporterReady();

    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email/${token}`;

    const htmlContent = this.getEmailTemplate('verification', {
      firstName,
      verificationUrl,
      supportEmail: this.configService.get('SMTP_FROM'),
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Verify Your Email - Medical Training Platform',
        html: htmlContent,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ) {
    await this.ensureTransporterReady();

    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const htmlContent = this.getEmailTemplate('password-reset', {
      firstName,
      resetUrl,
      supportEmail: this.configService.get('SMTP_FROM'),
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Password Reset Request - Medical Training Platform',
        html: htmlContent,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendSubscriptionConfirmation(
    email: string,
    firstName: string,
    planType: string,
  ) {
    await this.ensureTransporterReady();

    const htmlContent = this.getEmailTemplate('subscription-confirmation', {
      firstName,
      planType,
      supportEmail: this.configService.get('SMTP_FROM'),
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Subscription Confirmed - Medical Training Platform',
        html: htmlContent,
      });

      this.logger.log(`Subscription confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send subscription confirmation email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendTrialExpirationReminder(
    email: string,
    firstName: string,
    daysLeft: number,
  ) {
    await this.ensureTransporterReady();

    const htmlContent = this.getEmailTemplate('trial-expiration', {
      firstName,
      daysLeft,
      supportEmail: this.configService.get('SMTP_FROM'),
    });

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: `Trial Expires in ${daysLeft} Days - Medical Training Platform`,
        html: htmlContent,
      });

      this.logger.log(`Trial expiration reminder sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send trial expiration reminder to ${email}:`,
        error,
      );
      throw error;
    }
  }

  private getEmailTemplate(templateName: string, data: any): string {
    // Try multiple possible paths for template resolution
    const possiblePaths = [
      path.join(__dirname, 'templates', `${templateName}.html`),
      path.join(
        process.cwd(),
        'src',
        'email',
        'templates',
        `${templateName}.html`,
      ),
      path.join(
        process.cwd(),
        'dist',
        'src',
        'email',
        'templates',
        `${templateName}.html`,
      ),
    ];

    for (const templatePath of possiblePaths) {
      try {
        if (fs.existsSync(templatePath)) {
          let template = fs.readFileSync(templatePath, 'utf8');

          // Replace placeholders with actual data
          Object.keys(data).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            template = template.replace(regex, data[key]);
          });

          this.logger.log(
            `Template ${templateName} loaded from: ${templatePath}`,
          );
          return template;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to load template from ${templatePath}: ${error.message}`,
        );
        continue;
      }
    }

    this.logger.warn(
      `Template ${templateName} not found in any location, using fallback`,
    );
    return this.getFallbackTemplate(templateName, data);
  }

  private getFallbackTemplate(templateName: string, data: any): string {
    switch (templateName) {
      case 'verification':
        return `
          <h2>Welcome to Medical Training Platform!</h2>
          <p>Hi {{firstName}},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="{{verificationUrl}}">Verify Email</a></p>
          <p>If you have any questions, please contact us at {{supportEmail}}</p>
        `;

      case 'password-reset':
        return `
          <h2>Password Reset Request</h2>
          <p>Hi {{firstName}},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="{{resetUrl}}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `;

      case 'subscription-confirmation':
        return `
          <h2>Subscription Confirmed</h2>
          <p>Hi {{firstName}},</p>
          <p>Your {{planType}} subscription has been confirmed!</p>
          <p>Thank you for choosing Medical Training Platform.</p>
        `;

      case 'trial-expiration':
        return `
          <h2>Trial Expiration Reminder</h2>
          <p>Hi {{firstName}},</p>
          <p>Your trial will expire in {{daysLeft}} days.</p>
          <p>Upgrade now to continue accessing all features!</p>
        `;

      default:
        return '<p>Email content</p>';
    }
  }
}

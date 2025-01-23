export async function buildTemplate(url: string) {
  const html = `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
          }
          .header {
              background-color: #4CAF50;
              color: #ffffff;
              padding: 20px;
              text-align: center;
          }
          .content {
              padding: 20px;
              text-align: left;
          }
          .button {
              display: inline-block;
              background-color: #4CAF50;
              color: #ffffff;
              padding: 15px 25px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
          }
          .footer {
              background-color: #f4f4f4;
              text-align: center;
              padding: 10px;
              font-size: 12px;
              color: #777777;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Email Verification</h1>
          </div>
          <div class="content">
              <h2>Hello,</h2>
              <p>Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:</p>
              <a href=${url} class="button">Verify Email</a>
              <p>If you did not create an account, no further action is required.</p>
          </div>
          <div class="footer">
              <p>&copy; 2024 Nest Ecommerce. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
      `;

  return html;
}

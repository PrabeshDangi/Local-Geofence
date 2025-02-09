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
              <p>&copy; 2024 Local-Geofence. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
      `;

  return html;
}

export async function buildSuccessTemplate() {
  const html = `
        <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified</title>
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
                <h1>Email Verified</h1>
            </div>
            <div class="content">
                <h2>Congratulations!</h2>
                <p>Your email address has been successfully verified. You can now access your account and enjoy all our services.</p>
                <p>Thank you for registering with us!</p>
                <p>Please proceed to the login page!!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Local-Geofence. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
        `;

  return html;
}

export async function buildErrorTemplate() {
  const html = `
        <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invalid or Expired Token</title>
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
                background-color: #f44336;
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
                <h1>Error: Invalid or Expired Token</h1>
            </div>
            <div class="content">
                <h2>Oops!</h2>
                <p>The verification token is either invalid or has expired. Please make sure you are using the correct link.</p>
                <p>If you need to request a new verification email, please contact our support team for further assistance.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Local-Geofence. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
        `;

  return html;
}

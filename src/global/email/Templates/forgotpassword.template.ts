export async function templateBuilder(
  Username: string,
  email: string,
  otp: string,
) {
  const subject = 'Password Reset Request';
  const html = `<strong>CONFIDENTIAL!!</strong><br> Dear ${Username} your password reset token is: ${otp}. <br>Warning: Do not share this token with anyone.`;
  const recepients = [{ name: Username, address: email }];
  return {
    recepients,
    html,
    subject,
  };
}

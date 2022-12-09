import "dotenv/config";
import { createTransport, getTestMessageUrl } from "nodemailer";
import { accessEnv } from "./accessEnv";

const targetURL = accessEnv("FRONTEND_URL", "http://localhost:7777");
const mailUser = accessEnv("MAIL_USER", "oscjrmwaah5gzxgg@ethereal.email");

const transport = createTransport({
  host: accessEnv("MAIL_HOST", "smtp.ethereal.email"),
  port: parseInt(accessEnv("MAIL_PORT", "587")),
  auth: {
    user: mailUser,
    pass: accessEnv("MAIL_PASS", "sdfguycvbjghv"),
  },
});

const makeANiceEmail = (text: string): string => {
  return `
    <div className="email" style="
      border: 1px solid black;
      padding: 20px;
      font-family: sans-serif;
      line-height: 2;
      font-size: 20px;
    ">
      <h2>Hello There!</h2>
      <p>${text}</p>
      <p>😘, Yours truly</p>
    </div>
  `;
};

export const sendPasswordResetEmail = async (resetToken: string, to: string): Promise<void> => {
  // email the user a token
  const info = await transport.sendMail({
    to,
    from: "example@example.com",
    subject: "Your password reset token!",
    html: makeANiceEmail(`Your Password Reset Token is here!
      <a href="${targetURL}/reset?token=${resetToken}">Click Here to reset</a>
    `),
  });
  if (info && mailUser.includes("ethereal.email")) {
    console.log(`Message Sent!  Preview it at ${getTestMessageUrl(info)}`);
  }
};

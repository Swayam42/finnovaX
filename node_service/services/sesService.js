const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { ses } = require("../config/aws");

const sendEmail = async ({ to, subject, message }) => {
    const params = {
        Source: process.env.SES_FROM_EMAIL || "test@example.com", // LocalStack accepts any verified sender, we can use test@example.com
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
            },
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
        },
    };

    try {
        const response = await ses.send(new SendEmailCommand(params));
        console.log(`[AWS LocalStack] 📧 Email sent to ${to}. MessageId: ${response.MessageId}`);
        return response;
    } catch (error) {
        console.error(`[AWS LocalStack Error] Failed to send email to ${to}:`, error);
        throw error;
    }
};

module.exports = {
    sendEmail,
};

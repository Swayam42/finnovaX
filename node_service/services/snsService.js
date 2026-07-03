const { PublishCommand } = require("@aws-sdk/client-sns");
const { sns } = require("../config/aws");
const twilio = require('twilio');

const sendSMS = async ({ phoneNumber, message }) => {
    // 1. If Twilio credentials exist, use Twilio (Production Deployment)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
                to: phoneNumber
            });
            console.log(`[Twilio Cloud] 📲 SMS sent to ${phoneNumber}. SID: ${response.sid}`);
            return response;
        } catch (error) {
            console.error(`[Twilio Cloud Error] Failed to send SMS to ${phoneNumber}:`, error.message || error);
            // Fall through to simulation mode if Twilio delivery fails
        }
    }

    // 2. Try AWS SNS / LocalStack ONLY if endpoint is explicitly set OR if valid AWS credentials are provided (not default "test")
    if (process.env.AWS_ENDPOINT_URL || (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'test')) {
        const params = {
            Message: message,
            PhoneNumber: phoneNumber,
        };

        try {
            const response = await sns.send(new PublishCommand(params));
            console.log(`[AWS SNS / LocalStack] 📲 SMS sent to ${phoneNumber}. MessageId: ${response.MessageId}`);
            return response;
        } catch (error) {
            console.error(`⚠️ [AWS SNS Error] Delivery to ${phoneNumber} failed (${error.code || error.message}). Switching to simulation mode.`);
            // Fall through to simulation mode instead of throwing an error that breaks user registration
        }
    }

    // 3. Safe fallback / Simulation Mode (when running locally or without active SMS provider credentials in cloud)
    console.log('\n=========================================');
    console.log(`📲 [SMS Simulation Mode] To: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    console.log('=========================================\n');
    return { simulated: true, to: phoneNumber, message };
};

module.exports = {
    sendSMS,
};

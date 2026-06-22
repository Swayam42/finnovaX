const { PublishCommand } = require("@aws-sdk/client-sns");
const { sns } = require("../config/aws");

const sendSMS = async ({ phoneNumber, message }) => {
    const params = {
        Message: message,
        PhoneNumber: phoneNumber,
    };

    try {
        const response = await sns.send(new PublishCommand(params));
        console.log(`[AWS LocalStack] 📲 SMS sent to ${phoneNumber}. MessageId: ${response.MessageId}`);
        return response;
    } catch (error) {
        console.error(`[AWS LocalStack Error] Failed to send SMS to ${phoneNumber}:`, error);
        throw error;
    }
};

module.exports = {
    sendSMS,
};

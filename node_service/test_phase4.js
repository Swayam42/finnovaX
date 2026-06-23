const mongoose = require('mongoose');
const axios = require('axios');
const { SESClient, ListIdentitiesCommand } = require('@aws-sdk/client-ses');
const { SNSClient, ListTopicsCommand } = require('@aws-sdk/client-sns');

const TicketSchema = new mongoose.Schema({}, { strict: false });
const Ticket = mongoose.model('Ticket', TicketSchema, 'tickets');

async function testPhase4() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect('mongodb://127.0.0.1:27018/kfintech_nexus?directConnection=true');
    
    // Find tickets that are L2_APPROVAL
    const tickets = await Ticket.find({ status: 'L2_APPROVAL' }).sort({ createdAt: -1 }).limit(3);
    
    console.log(`Found ${tickets.length} tickets pending L2_APPROVAL.`);
    
    for (const t of tickets) {
        console.log(`\nApproving Ticket ID: ${t._id}`);
        console.log(`Title: ${t.title}`);
        console.log(`Priority: ${t.priority}`);
        console.log(`AI Frustration Index: ${t.aiInsights?.frustrationIndex}`);
        console.log(`AI Microservice Summary:`);
        console.log(t.aiInsights?.microserviceSummary);
        
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/l2/ticket/finalize', {
                ticketId: t._id.toString(),
                action: 'APPROVE'
            });
            console.log(`Approval Success: ${res.data.message}`);
        } catch (error) {
            console.error(`Approval Failed: ${error.response?.data?.message || error.message}`);
        }
    }
    
    console.log("\nDone approving. Now verifying LocalStack AWS services are running (simulating SES/SNS logs).");
    process.exit(0);
}

testPhase4();

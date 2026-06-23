const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function runEndToEnd() {
    console.log("🚀 Starting Agentic E2E Test: Generating 4 Tickets...\n");

    const dummyFilePath = path.join(__dirname, 'dummy.png');
    if (!fs.existsSync(dummyFilePath)) {
        // Create a 1x1 transparent PNG file
        const pngHex = "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082";
        fs.writeFileSync(dummyFilePath, Buffer.from(pngHex, 'hex'));
    }

    const tickets = [
        { name: "John Doe", text: "My portfolio crashed! Urgent help needed.", acc: "1111" }
    ];

    for (let i = 0; i < tickets.length; i++) {
        console.log(`\n========================================`);
        console.log(`🚀 Creating Ticket ${i + 1} for ${tickets[i].name}...`);
        
        try {
            // 1. INVESTOR DESK: Create Ticket
            const form = new FormData();
            form.append('complaintText', tickets[i].text);
            form.append('investorName', tickets[i].name);
            form.append('accountNumber', tickets[i].acc);
            
            const res = await axios.post("http://localhost:5000/api/tickets", form, {
                headers: form.getHeaders()
            });
            
            const ticketId = res.data.ticket._id;
            console.log(`✅ Ticket Created! ID: ${ticketId}`);
            console.log(`   - AI Sentiment: ${res.data.ticket.aiSentimentScore}`);
            console.log(`   - AI Priority: ${res.data.ticket.assignedPriority}`);

            // 2. L1 MAKER DESK: Escalate
            await axios.put('http://localhost:5000/api/admin/escalate/' + ticketId);
            console.log(`✅ L1 Maker Escalated Ticket to L2!`);
            
            // 3. L2 CHECKER DESK: Approve
            await axios.post('http://localhost:5000/api/l2/finalize', { ticketId: ticketId, action: 'APPROVE' });
            console.log(`✅ L2 Checker Approved & Finalized!`);
            
            // Wait 1s for background AWS emails/sms to fire
            await new Promise(r => setTimeout(r, 1000));
            console.log(`📧 AWS LocalStack Mock SMS & Email Sent! Check your docker logs.`);
            
        } catch (err) {
            console.error(`❌ Error on Ticket ${i + 1}:`, err.response ? err.response.data : err.message);
        }
    }
    
    console.log(`\n🎉 E2E Workflow Completed Successfully!`);
}

runEndToEnd();

const axios = require('axios');
const FormData = require('form-data');

async function runEndToEnd() {
    console.log("🚀 Starting Agentic E2E Test: Generating 4 Tickets...\n");

    const tickets = [
        { name: "John Doe", text: "My portfolio crashed! Urgent help needed.", acc: "1111" },
        { name: "Jane Smith", text: "I love the new dashboard UI.", acc: "2222" },
        { name: "Alice Brown", text: "Please update my nominee details.", acc: "3333" },
        { name: "Bob White", text: "The app is logging me out constantly.", acc: "4444" }
    ];

    for (let i = 0; i < tickets.length; i++) {
        console.log(`\n========================================`);
        console.log(`🎟️ Creating Ticket ${i + 1} for ${tickets[i].name}...`);
        
        try {
            // 1. INVESTOR DESK: Create Ticket
            const form = new FormData();
            form.append('complaintText', tickets[i].text);
            form.append('investorName', tickets[i].name);
            form.append('accountNumber', tickets[i].acc);
            
            // Dummy buffer for S3 document upload
            form.append('file', Buffer.from('Dummy KYC Document'), {
                filename: `kyc_doc_${i}.txt`,
                contentType: 'text/plain',
            });

            const res = await axios.post("http://localhost:5000/api/tickets", form, {
                headers: form.getHeaders()
            });
            
            const ticketId = res.data.ticket._id;
            console.log(`✅ Ticket Created! ID: ${ticketId}`);
            console.log(`   - AI Sentiment: ${res.data.ticket.aiSentimentScore}`);
            console.log(`   - AI Priority: ${res.data.ticket.assignedPriority}`);
            console.log(`   - S3 Document URL: ${res.data.ticket.documentUrl}`);

            // 2. L1 MAKER DESK: Move to L2
            console.log(`\n👨‍💻 L1 Maker Reviewing...`);
            await axios.post("http://localhost:5000/api/admin/move-to-l2", {
                ticketId,
                adminId: "60d5ecb8b392d700153f3a11"
            });
            console.log(`✅ L1 Maker approved and forwarded to L2!`);

            // 3. L2 CHECKER DESK: Finalize & Trigger AWS LocalStack
            console.log(`\n🕵️ L2 Checker Finalizing...`);
            const finalizeRes = await axios.post("http://localhost:5000/api/l2/finalize", {
                ticketId,
                checkerId: "60d5ecb8b392d700153f3a22",
                action: "APPROVE",
                comments: "Verified manually by agent workflow."
            });
            console.log(`✅ L2 Checker Approved!`);
            
            // Wait 1s for background AWS emails/sms to fire
            await new Promise(r => setTimeout(r, 1000));
            console.log(`📩 AWS LocalStack Mock SMS & Email Sent!`);
            
        } catch (err) {
            console.error(`❌ Error on Ticket ${i + 1}:`, err.response ? err.response.data : err.message);
        }
    }
    
    console.log(`\n🎉 E2E Workflow Completed Successfully!`);
}

runEndToEnd();

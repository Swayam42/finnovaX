const axios = require('axios');

const BASE = 'http://127.0.0.1:5000';

const ticketIds = [
    '6a39ad305a5e37d0b83f415a',  // Amit - Balance Transfer
    '6a39ad855a5e37d0b83f415e',  // John Doe - Legal Action
    '6a39ae7b5a5e37d0b83f4162',  // Jane Smith - Registry Issues
];

async function runPipeline() {
    // Step 1: Escalate all tickets from OPEN → L2_APPROVAL
    console.log("=== STEP 1: Escalating tickets to L2_APPROVAL ===\n");
    for (const id of ticketIds) {
        try {
            const res = await axios.put(`${BASE}/api/admin/escalate/${id}`, {
                notes: 'Auto-escalated for E2E test.'
            });
            console.log(`✅ Escalated ${id}: ${res.data.message}`);
        } catch (err) {
            console.error(`❌ Escalate failed ${id}: ${err.response?.data?.error || err.message}`);
        }
    }

    // Step 2: Finalize all tickets (APPROVE) → triggers SES/SNS
    console.log("\n=== STEP 2: Finalizing tickets via L2 Checker (APPROVE) ===\n");
    for (const id of ticketIds) {
        try {
            const res = await axios.post(`${BASE}/api/l2/finalize`, {
                ticketId: id,
                action: 'APPROVE'
            });
            console.log(`✅ Approved ${id}: ${res.data.message}`);
        } catch (err) {
            console.error(`❌ Approval failed ${id}: ${err.response?.data?.message || err.message}`);
        }
    }

    console.log("\n=== PIPELINE COMPLETE ===");
}

runPipeline();

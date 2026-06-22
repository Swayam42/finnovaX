const axios = require('axios');

const BASE = 'http://127.0.0.1:5000';

const ticketIds = [
    '6a39ad305a5e37d0b83f415a',
    '6a39ad855a5e37d0b83f415e',
    '6a39ae7b5a5e37d0b83f4162',
];

async function finalize() {
    console.log("=== Finalizing tickets via L2 Checker (APPROVE) ===\n");
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
    console.log("\n=== DONE ===");
}

finalize();

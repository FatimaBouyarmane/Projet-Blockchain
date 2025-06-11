
const { mineBlock } = require('./minerLogic');

const startMiningTimer = () => {
    console.log('Starting mining timer - blocks will be mined every 10 minutes');
    
    // Mine a block every 10 minutes (600000 ms)
    setInterval(async () => {
        try {
            console.log('Timer triggered - attempting to mine block...');
            const result = await mineBlock('system_miner');
            if (result.success) {
                console.log(`Timer mining successful: Block ${result.block.height} mined`);
            } else {
                console.log('Timer mining result:', result.message);
            }
        } catch (error) {
            console.error('Timer mining error:', error);
        }
    }, 600000); // 10 minutes
    
    // Also mine the first block after 30 seconds for testing
    setTimeout(async () => {
        try {
            console.log('Initial mining attempt...');
            await mineBlock('genesis_miner');
        } catch (error) {
            console.error('Initial mining error:', error);
        }
    }, 30000);
};

module.exports = { startMiningTimer };

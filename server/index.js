const expressApp = require('./express');
const { initializeBlockchain } = require('./init');

initializeBlockchain().then(() => {
    console.log('Genesis block created and saved.');

    const PORT = process.env.PORT || 3000;
    expressApp.listen(PORT, 'localhost', () => {
        console.log(`Blockchain server running at http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Failed to initialize blockchain:', error);
});
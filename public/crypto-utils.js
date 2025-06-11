
class CryptoUtils {
    static async generateSignature(txData) {
        // Create a simple hash-based signature
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(txData));
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return 'auto_' + signature.substring(0, 32);
    }
    
    static generateTransactionId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

window.CryptoUtils = CryptoUtils;

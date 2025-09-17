document.addEventListener('DOMContentLoaded', () => {
    const refundsTab = document.getElementById('refundsTab');
    const processRefundBtn = document.getElementById('processRefundBtn');
    const refundTransactionIdInput = document.getElementById('refundTransactionId');
    const refundReasonTextarea = document.getElementById('refundReason');

    if (!refundsTab) return;

    processRefundBtn.addEventListener('click', async () => {
        const transactionId = refundTransactionIdInput.value.trim();
        const refundReason = refundReasonTextarea.value.trim();
        
        if (!transactionId || !refundReason) {
            alert("Please enter a transaction ID and a reason for the refund.");
            return;
        }

        const confirmed = confirm(`Are you sure you want to refund transaction #${transactionId}?`);
        if (confirmed) {
            const refundData = {
                transactionId,
                reason: refundReason,
                user_id: window.currentUser.id
            };
            const response = await apiFetch('process_refund.php', 'POST', refundData);

            if (response && response.success) {
                alert(`Refund for transaction #${transactionId} processed successfully. Stock has been updated.`);
                refundTransactionIdInput.value = '';
                refundReasonTextarea.value = '';
                // Refresh product data after refund
                // This would be done by calling fetchProducts() from pos.js
            } else {
                alert("Refund failed: " + (response.message || "Unknown error."));
            }
        }
    });
});

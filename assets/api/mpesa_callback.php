<?php
header("Content-Type: application/json");
require_once __DIR__ . "/db.php";

// Receive callback data
$callback = json_decode(file_get_contents("php://input"), true);

file_put_contents("callback_log.json", json_encode($callback, JSON_PRETTY_PRINT));

// Extract useful fields
$stkCallback = $callback["Body"]["stkCallback"] ?? null;

if (!$stkCallback) {
    echo json_encode(["ResultCode" => 1, "ResultDesc" => "No STK Callback"]);
    exit;
}

$merchantRequestID = $stkCallback["MerchantRequestID"];
$checkoutRequestID = $stkCallback["CheckoutRequestID"];
$resultCode = $stkCallback["ResultCode"];
$resultDesc = $stkCallback["ResultDesc"];

// If transaction successful
if ($resultCode == 0) {

    $metadata = [];
    foreach ($stkCallback["CallbackMetadata"]["Item"] as $item) {
        $metadata[$item["Name"]] = $item["Value"] ?? "";
    }

    $mpesaReceipt = $metadata["MpesaReceiptNumber"] ?? "";
    $phone = $metadata["PhoneNumber"] ?? "";
    $amount = $metadata["Amount"] ?? 0;

    // Save into mpesa_payments table
    $stmt = $pdo->prepare("
        INSERT INTO mpesa_payments
            (checkout_request_id, merchant_request_id, receipt_no, phone, amount, result_desc, raw_callback, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $checkoutRequestID,
        $merchantRequestID,
        $mpesaReceipt,
        $phone,
        $amount,
        $resultDesc,
        json_encode($callback)
    ]);
}

// Update mpesa_requests status
$stmt = $pdo->prepare("
    UPDATE mpesa_requests
    SET status = ?, raw_callback = ?
    WHERE checkout_request_id = ?
");
$stmt->execute([$resultDesc, json_encode($callback), $checkoutRequestID]);

echo json_encode(["ResultCode" => 0, "ResultDesc" => "Callback processed"]);
?>

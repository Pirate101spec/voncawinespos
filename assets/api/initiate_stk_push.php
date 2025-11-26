<?php
header("Content-Type: application/json");
require_once "config.php";

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);
$phone = $input["phone"] ?? "";
$amount = $input["amount"] ?? "";

// Validation
if (!$phone || !$amount) {
    echo json_encode(["success" => false, "message" => "Missing phone or amount"]);
    exit;
}

// ----------- STEP 1: GET ACCESS TOKEN -----------
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => DARAJA_TOKEN_URL,
    CURLOPT_HTTPHEADER => [
        "Authorization: Basic " . base64_encode(DARAJA_CONSUMER_KEY . ":" . DARAJA_CONSUMER_SECRET)
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$tokenResponse = curl_exec($curl);
curl_close($curl);

$tokenData = json_decode($tokenResponse, true);
$token = $tokenData["access_token"] ?? null;

if (!$token) {
    echo json_encode(["success" => false, "message" => "Failed to get access token", "raw" => $tokenResponse]);
    exit;
}

// ----------- STEP 2: GENERATE PASSWORD -----------
$timestamp = date("YmdHis");
$password = base64_encode(BUSINESS_SHORTCODE . PASSKEY . $timestamp);

// ----------- STEP 3: PREPARE STK PUSH BODY -----------
$stkPayload = [
    "BusinessShortCode" => BUSINESS_SHORTCODE,
    "Password" => $password,
    "Timestamp" => $timestamp,
    "TransactionType" => "CustomerPayBillOnline",
    "Amount" => intval($amount),
    "PartyA" => $phone,
    "PartyB" => BUSINESS_SHORTCODE,
    "PhoneNumber" => $phone,
    "CallBackURL" => CALLBACK_URL,
    "AccountReference" => "Vonca",
    "TransactionDesc" => "POS Sale"
];

// ----------- STEP 4: SEND STK PUSH -----------
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => DARAJA_STK_PUSH_URL,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer $token"
    ],
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($stkPayload),
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);

// ----------- STEP 5: RETURN TO FRONTEND -----------
if (!empty($data["CheckoutRequestID"])) {
    echo json_encode([
        "success" => true,
        "checkoutRequestID" => $data["CheckoutRequestID"],
        "raw" => $data
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => $data["errorMessage"] ?? "STK Push Failed",
        "raw" => $data
    ]);
}
?>

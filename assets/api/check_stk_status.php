<?php
header("Content-Type: application/json");
require_once __DIR__ . "/config.php";

$input = json_decode(file_get_contents("php://input"), true);
$checkoutRequestID = $input["checkoutRequestID"] ?? "";

if (!$checkoutRequestID) {
    echo json_encode(["success" => false, "message" => "Missing CheckoutRequestID"]);
    exit;
}

// 1) Get token
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

$token = json_decode($tokenResponse)->access_token ?? null;
if (!$token) {
    echo json_encode(["success" => false, "message" => "Failed to get token"]);
    exit;
}

// 2) Build Query
$timestamp = date("YmdHis");
$password = base64_encode(BUSINESS_SHORTCODE . PASSKEY . $timestamp);

$queryPayload = [
    "BusinessShortCode" => BUSINESS_SHORTCODE,
    "Password" => $password,
    "Timestamp" => $timestamp,
    "CheckoutRequestID" => $checkoutRequestID
];

// 3) Send Query
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => DARAJA_STK_QUERY_URL,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer $token"
    ],
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($queryPayload),
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);
$resultCode = $data["ResultCode"] ?? "-1";

$status = "PENDING";
if ($resultCode === "0") $status = "SUCCESS";
else if ($resultCode !== "0" && $resultCode !== "1") $status = "FAILED";

echo json_encode([
    "success" => true,
    "status" => $status,
    "mpesaData" => $data
]);
?>

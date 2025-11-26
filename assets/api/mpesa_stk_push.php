<?php
header("Content-Type: application/json");
require_once __DIR__ . "/config.php";
require_once __DIR__ . "/db.php";

// Read JSON body
$body = json_decode(file_get_contents("php://input"), true);
if (!$body) {
    echo json_encode(["success" => false, "message" => "No JSON body received"]);
    exit;
}

$phone = $body["phone"] ?? "";
$amount = (float)($body["amount"] ?? 0);
$accountRef = $body["accountRef"] ?? "VoncaPOS";
$description = $body["description"] ?? "POS Sale";

if (!preg_match('/^2547\d{8}$/', $phone)) {
    echo json_encode(["success" => false, "message" => "Phone must be 2547XXXXXXXX"]);
    exit;
}

if ($amount <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid amount"]);
    exit;
}

// Build callback URL
$callbackUrl =
    (isset($_SERVER["HTTPS"]) ? "https" : "http") . "://" .
    $_SERVER["HTTP_HOST"] . "/wines/assets/api/mpesa_callback.php";

// 1) Get OAuth Token
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
    echo json_encode(["success" => false, "message" => "Failed to get access token"]);
    exit;
}

// 2) Generate Password
$timestamp = date("YmdHis");
$password = base64_encode(BUSINESS_SHORTCODE . PASSKEY . $timestamp);

// 3) Build STK request payload
$stkPayload = [
    "BusinessShortCode" => BUSINESS_SHORTCODE,
    "Password" => $password,
    "Timestamp" => $timestamp,
    "TransactionType" => "CustomerPayBillOnline",
    "Amount" => (int)$amount,
    "PartyA" => $phone,
    "PartyB" => BUSINESS_SHORTCODE,
    "PhoneNumber" => $phone,
    "CallBackURL" => $callbackUrl,
    "AccountReference" => $accountRef,
    "TransactionDesc" => $description
];

// 4) Send STK Push
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

if (!empty($data["CheckoutRequestID"])) {

    // Insert into mpesa_requests
    try {
        $stmt = $pdo->prepare("
            INSERT INTO mpesa_requests
                (merchant_request_id, checkout_request_id, phone, amount, status, raw_request, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $data["MerchantRequestID"] ?? null,
            $data["CheckoutRequestID"] ?? null,
            $phone,
            $amount,
            $data["ResponseDescription"] ?? "PENDING",
            $response
        ]);

        $db_id = $pdo->lastInsertId();

    } catch (Exception $e) {
        $db_id = null;
    }

    echo json_encode([
        "success" => true,
        "checkoutRequestID" => $data["CheckoutRequestID"],
        "merchantRequestID" => $data["MerchantRequestID"] ?? null,
        "db_id" => $db_id
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => $data["errorMessage"] ?? "STK Push Failed",
        "raw" => $data
    ]);
}
?>

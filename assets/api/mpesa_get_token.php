<?php
// assets/api/mpesa_get_token.php
// Returns Daraja sandbox OAuth token
header("Content-Type: application/json");

// Prefer environment variables in production
$consumerKey = getenv('MPESA_CONSUMER_KEY') ?: 'JW9FSPPJcfQ3KEuFkPi4G47SGNmAOhHCaTwiwAGwb9h6eMCj';
$consumerSecret = getenv('MPESA_CONSUMER_SECRET') ?: 'S753ejNjTxK7nMUDSaF0XgBsNt5Q4k761kJYgNqCXqSSXseWn6aW32vWQV8x19Vc';

// Sandbox endpoint
$tokenUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $tokenUrl);
curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_USERPWD, $consumerKey . ":" . $consumerSecret);

$response = curl_exec($curl);
$httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpcode >= 200 && $httpcode < 300) {
    $data = json_decode($response, true);
    echo json_encode(['success' => true, 'token' => $data['access_token']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to retrieve token', 'raw' => $response]);
}

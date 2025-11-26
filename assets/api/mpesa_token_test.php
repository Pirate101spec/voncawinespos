<?php
$consumerKey = "JW9FSPPJcfQ3KEuFkPi4G47SGNmAOhHCaTwiwAGwb9h6eMCj";
$consumerSecret = "S753ejNjTxK7nMUDSaF0XgBsNt5Q4k761kJYgNqCXqSSXseWn6aW32vWQV8x19Vc";

$url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_USERPWD, $consumerKey . ":" . $consumerSecret);

$response = curl_exec($curl);
$code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

echo "HTTP CODE: ".$code."<br>";
echo $response;

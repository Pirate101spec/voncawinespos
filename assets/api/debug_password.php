<?php
$shortcode = "174379";
$passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0d4e1a";
$timestamp = date("YmdHis");

$password = base64_encode($shortcode . $passkey . $timestamp);

echo json_encode([
    "shortcode" => $shortcode,
    "passkey_length" => strlen($passkey),
    "timestamp" => $timestamp,
    "generated_password" => $password
], JSON_PRETTY_PRINT);

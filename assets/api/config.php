<?php

// --- DARAJA CREDENTIALS (Sandbox) ---
define("DARAJA_CONSUMER_KEY", "JW9FSPPJcfQ3KEuFkPi4G47SGNmAOhHCaTwiwAGwb9h6eMCj");
define("DARAJA_CONSUMER_SECRET", "S753ejNjTxK7nMUDSaF0XgBsNt5Q4k761kJYgNqCXqSSXseWn6aW32vWQV8x19Vc");

// --- STK PUSH DEFAULT SANDBOX SHORTCODE ---
define("BUSINESS_SHORTCODE", "174379");

// Sandbox PASSKEY from Safaricom Portal
define("PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0d4e1a");

// Callback URL (for localhost use ngrok)
define("CALLBACK_URL", "https://luther-vapoury-ignacia.ngrok-free.dev/wines/assets/api/mpesa_callback.php");

// Daraja URLs
define("DARAJA_TOKEN_URL", "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials");
define("DARAJA_STK_PUSH_URL", "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest");
define("DARAJA_STK_QUERY_URL", "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query");

?>

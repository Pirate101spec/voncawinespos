<?php
// PHP code for assets/api/get_settings.php
require_once "db.php";

header("Content-Type: application/json");

// Ensure the connection exists (assuming $pdo is established in db.php)
if (!isset($pdo)) {
    echo json_encode(["success" => false, "message" => "Database connection error."]);
    exit;
}

try {
    // Fetch all settings from the settings table
    // Assuming a table structure: settings(setting_key, setting_value)
    $sql = "SELECT setting_key, setting_value FROM settings";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $rawSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // Fetches results as key => value pairs

    // Map the fetched associative array into a more structured object for the frontend
    $settings = [
        "storeName" => $rawSettings['store_name'] ?? 'Wines POS',
        "taxRate" => (float)($rawSettings['tax_rate'] ?? 0.16) // Default to 16% VAT
    ];
    
    // Convert the tax rate from a decimal (0.16) to a percentage (16) for input display
    $settings['taxRate'] = $settings['taxRate'] * 100;


    echo json_encode([
        "success" => true,
        "data" => $settings
    ]);

} catch (Exception $e) {
    // Log the actual error but return a generic message for security
    error_log("Settings fetch error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "A server error occurred while fetching system settings."
    ]);
}
?>

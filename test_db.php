<?php
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
try {
    require_once 'assets/api/db.php';
    $response['success'] = true;
    $response['message'] = 'Database connection successful!';
} catch (\PDOException $e) {
    $response['message'] = 'Database connection failed:' . $e->getMessage();
} 
echo json_encode($response);
?>
<?php
session_start();
// Set headers for CORS and JSON content type
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php'; // Your database connection file

$response = ['success' => false, 'message' => ''];

try {
    // Only allow POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method.");
    }

    // Read incoming JSON
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['username']) || !isset($data['password'])) {
        throw new Exception("Username and password are required.");
    }

    $username = $data['username'];
    $password = $data['password'];

    // Prepared statement
    $sql = "SELECT id, username, password, role FROM users WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // ✅ Correct login
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        $response = [
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ];
    } else {
        // ❌ Invalid login
        $response['message'] = 'Invalid username or password.';
    }

} catch (Exception $e) {
    $response['message'] = 'An error occurred: ' . $e->getMessage();
}

// ✅ Return final response
echo json_encode($response);

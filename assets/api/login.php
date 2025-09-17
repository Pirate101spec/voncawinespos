<?php
// Set headers for CORS and JSON content type
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db.php'; // Your database connection file

$response = ['success' => false, 'message' => ''];

try {
    // Check for POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method.");
    }

    // Get raw POST data
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['username']) || !isset($data['password'])) {
        throw new Exception("Username and password are required.");
    }

    $username = $data['username'];
    $password = $data['password'];

    // Use a prepared statement to prevent SQL injection
    $sql = "SELECT id, username, password, role FROM users WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Successful login
        $response['success'] = true;
        $response['message'] = 'Login successful.';
        $response['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ];
    } else {
        // Failed login attempt
        $response['message'] = 'Invalid username or password.';
    }

} catch (Exception $e) {
    // Catch any errors and return a clean error message
    $response['message'] = 'An error occurred: ' . $e->getMessage();
}

// Send the JSON response
echo json_encode($response);
?>


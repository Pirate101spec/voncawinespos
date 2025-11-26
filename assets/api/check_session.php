<?php 
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id']) && isset($_SESSION['username']) && isset($_SESSION['role'])) {
    echo json_encode([
        "authenticated" => true,
        "username" => $_SESSION['username'],
        "role" => $_SESSION['role']
    ]);
} else {
    echo json_encode(["authenticated" => false]);
}
<?php
$host = "localhost";
$user = "root"; // change if needed
$pass = "";     // change if needed
$db   = "mfocandb";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]);
    exit;
}
$conn->set_charset("utf8mb4");
?>
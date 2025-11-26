<?php
header('Content-Type: application/json');
require_once 'db.php'; // Adjust path if needed

try {
    // Fetch all invoices from sales table
    $query = "
        SELECT 
            sales.id,
            sales.subtotal,
            sales.tax,
            sales.total,
            sales.payment_method,
            sales.created_at,
            customers.name AS customer_name
        FROM sales
        LEFT JOIN customers ON sales.customer_id = customers.id
        ORDER BY sales.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format invoice numbers & customer defaults
    foreach ($invoices as &$inv) {
        $inv['invoice_number'] = 'INV-' . str_pad($inv['id'], 5, '0', STR_PAD_LEFT);

        if ($inv['customer_name'] === null) {
            $inv['customer_name'] = "Walk-in Customer";
        }
    }

    echo json_encode($invoices);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>

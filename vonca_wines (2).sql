-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2025 at 03:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vonca_wines`
--
CREATE DATABASE IF NOT EXISTS `vonca_wines` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vonca_wines`;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `retail_price` decimal(10,2) NOT NULL,
  `wholesale_price` decimal(10,2) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `stock` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `retail_price`, `wholesale_price`, `barcode`, `stock`) VALUES
(1, 'Red Wine - Merlot', 1500.00, 1000.00, '123456789012', NULL),
(2, 'White Wine - Chardonnay', 1200.00, 800.00, '987654321098', 6),
(3, 'mzinga', 1000.00, 800.00, '100001', NULL),
(4, 'Kenya Cane', 1500.00, 1350.00, '00156', 4),
(6, 'Blue ice', 400.00, 250.00, '77', 5),
(7, 'Delmonte', 400.00, 350.00, '02', 5),
(8, 'Guiness', 500.00, 440.00, '03', 5),
(9, 'Balozi', 500.00, 430.00, '04', 5),
(10, 'Pilsner', 700.00, 660.00, '05', 5),
(11, 'Chrome vodka', 400.00, 330.00, '06', 5),
(12, 'Hunters', 600.00, 230.00, '08', 5),
(13, 'Vla', 600.00, 440.00, '07', 5),
(14, 'Kingfisher', 900.00, 730.00, '09', 5);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
CREATE TABLE IF NOT EXISTS `sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `payment_method` enum('cash','mpesa') NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `user_id`, `customer_id`, `payment_method`, `subtotal`, `tax`, `total`, `created_at`) VALUES
(5, 10, NULL, 'cash', 1000.00, 160.00, 1160.00, '2025-10-21 17:46:25'),
(6, 10, NULL, 'cash', 1000.00, 160.00, 1160.00, '2025-10-22 07:02:43'),
(7, 10, NULL, 'cash', 1500.00, 240.00, 1740.00, '2025-10-24 06:41:27'),
(8, 10, NULL, 'cash', 1500.00, 240.00, 1740.00, '2025-10-24 06:41:29'),
(9, 10, NULL, 'cash', 1500.00, 240.00, 1740.00, '2025-10-24 06:41:29'),
(10, 10, NULL, 'cash', 1000.00, 160.00, 1160.00, '2025-10-28 17:24:51'),
(11, 10, NULL, 'cash', 4800.00, 768.00, 5568.00, '2025-10-31 13:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `sales_history`
--

DROP TABLE IF EXISTS `sales_history`;
CREATE TABLE IF NOT EXISTS `sales_history` (
  `transaction_id` int(11) NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `payment_method` int(11) DEFAULT NULL,
  `User_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `qty`, `price`, `total`) VALUES
(1, 5, 3, 1, 1000.00, 0.00),
(2, 6, 3, 1, 1000.00, 0.00),
(3, 7, 1, 1, 1500.00, 0.00),
(4, 8, 1, 1, 1500.00, 0.00),
(5, 9, 1, 1, 1500.00, 0.00),
(6, 10, 3, 1, 1000.00, 1000.00),
(7, 11, 2, 4, 1200.00, 4800.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'cashier',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(10, 'admin1', '$2y$10$DNXc5ySFfMPPisCJgy4zcu3crqkQ0VlKnH4nnW4G.n/q0ueGFG1Ba', 'admin'),
(11, 'avin', '$2y$10$ltP8A5Q8VQwzkao0MNfW7uKEfNst31nuZEtenFgeJ/CVUyGlXj7hu', 'cashier'),
(12, 'janet', '$2y$10$.873rnIKPpJgYBl2PsasOesRf5Hznhwbxy5XyUkp0UFSJOaWuJRim', 'cashier');

-- --------------------------------------------------------

--
-- Table structure for table `user_logs`
--

DROP TABLE IF EXISTS `user_logs`;
CREATE TABLE IF NOT EXISTS `user_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `performed_by` int(11) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `performed_by` (`performed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`),
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

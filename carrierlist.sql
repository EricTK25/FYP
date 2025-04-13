-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2025 年 02 月 09 日 23:25
-- 伺服器版本： 10.11.6-MariaDB
-- PHP 版本： 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `fypProject`
--

-- --------------------------------------------------------

--
-- 資料表結構 `carrierlist`
--

CREATE TABLE `carrierlist` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_category` varchar(50) NOT NULL,
  `product_image` text NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  phoneNumber VARCHAR(20),
  icon_data LONGTEXT
);

--
-- 傾印資料表的資料 `carrierlist`
--

INSERT INTO `carrierlist` (`product_id`, `product_name`, `product_category`, `product_image`, `cost`, `stock`) VALUES
(1, 'TeslaShit', 'Car', 'https://www.tesla.com/ownersmanual/images/GUID-B5641257-9E85-404B-9667-4DA5FDF6D2E7-online-en-US.png', '1.00', 10),
(2, 'Toyota', 'Car', 'https://purepng.com/public/uploads/large/purepng.com-toyotatoyotamotor-corporationautomotivemanufactureraichimultinational-1701527678510h6ezr.png', '2.00', 6),
(3, 'Honda', 'Car', 'https://purepng.com/public/uploads/large/white-honda-sedan-product-kind-honda-car-qpv.png', '0.25', 24),
(4, 'DaeWoo', 'Car', 'https://purepng.com/public/uploads/large/cobalt-color-car-rf1.png', '0.25', 3),
(5, 'Holden', 'Car', 'https://purepng.com/public/uploads/large/red-car-ezq.png', '0.10', 12),
(6, 'Jaguar', 'Car', 'https://purepng.com/public/uploads/large/purepng.com-jaguar-e-type-coupe-carcarvehicletransportjaguar-961524666464d2lcd.png', '1.25', 0),
(7, 'BMW', 'Car', 'https://purepng.com/public/uploads/large/purepng.com-bmwbmwcarluxurious-carbmw-cars-1701527416177jaalq.png', '0.05', 15),
(8, 'Ford', 'Car', 'https://purepng.com/public/uploads/large/purepng.com-fordfordcarfodr-carvehicle-1701527484491zugjq.png', '0.20', 0),
(9, 'Audi', 'Car', 'https://purepng.com/public/uploads/large/black-edition-audi-luxury-car-1nm.png', '0.15', 12);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `carrierlist`
--
ALTER TABLE `carrierlist`
  ADD PRIMARY KEY (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

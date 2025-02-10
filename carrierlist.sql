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

--
-- 傾印資料表的資料 `carrierlist`
--

INSERT INTO `carrierlist` (`product_id`, `product_name`, `product_category`, `product_image`, `cost`, `stock`) VALUES
(1, 'Tesla', 'Car', 'https://www.tesla.com/ownersmanual/images/GUID-B5641257-9E85-404B-9667-4DA5FDF6D2E7-online-en-US.png', 1.00, 10),
(2, 'Toyota', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/drone.jpg', 2.00, 6),
(3, 'Honda', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/headset.jpg', 0.25, 24),
(4, 'DaeWoo', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg', 0.25, 3),
(5, 'Holden', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/sunglasses.jpg', 0.10, 12),
(6, 'Jaguar', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/watch.jpg', 1.25, 0),
(7, 'BMW', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/cube.jpg', 0.05, 15),
(8, 'Ford', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/train.jpg', 0.20, 0),
(9, 'Audi', 'Car', 'https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/robots.jpg', 0.15, 12);

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

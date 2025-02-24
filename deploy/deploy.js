const { ethers } = require("hardhat");
const mysql = require('mysql2/promise');
const deployRecord = require('../src/deployConfig.json');
const fs = require('fs');
require('dotenv').config();

const deployCarrierToken = async (deployer) => {
  let CarrierToken = await ethers.getContractFactory("CarrierToken");
  CarrierToken = CarrierToken.connect(deployer);
  let carrierToken = await CarrierToken.deploy();
  await carrierToken.waitForDeployment();

  console.log("CarrierToken deployed to:", await carrierToken.getAddress());
  return carrierToken.getAddress();
};

const deployCarrierApp = async (deployer) => {
  const networkId = "31337"; 

  let CarrierApp = await ethers.getContractFactory("CarrierApp");
  CarrierApp = CarrierApp.connect(deployer);
  let carrierapp = await CarrierApp.deploy();
  await carrierapp.waitForDeployment();
  deployRecord[networkId] = { CarrierApp: { address: await carrierapp.getAddress() } };
  fs.writeFileSync('./deployRecord.json', JSON.stringify(deployRecord, null, 2));
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    port: process.env.DB_PORT
  });
  const [rows] = await connection.execute('SELECT * FROM carrierlist');
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    if (!item.product_id || !item.product_name || !item.product_category ||
        !item.product_image || item.cost === undefined || item.stock === undefined) {
      console.error(`Missing fields in row ${i}:`, item);
      continue; 
    }

    const transaction = await carrierapp.list(
      item.product_id,
      item.product_name,
      item.product_category,
      item.product_image,
      tokens(item.cost),
      item.stock,
    );
    await transaction.wait();
  }
  
  await connection.end();
  console.log("carrierapp deployed to:", await carrierapp.getAddress());
}

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
}

async function main() {
  const [deployer] = await ethers.getSigners();
  await deployCarrierToken(deployer);
  await deployCarrierApp(deployer);
  console.log("Deployer: ",deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
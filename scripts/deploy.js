const hre = require("hardhat");
const mysql = require('mysql2/promise');
const config = require('../src/config.json');
const fs = require('fs');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkId = "31337"; 
  const targetAddress = config[networkId]?.CarrierApp?.address;

  try {
    console.log("Target Address from Config:", targetAddress);
    console.log("Deploying CarrierApp contract...");
    let CarrierApp = await ethers.getContractFactory("CarrierApp");
    let carrierapp = await CarrierApp.deploy();
    await carrierapp.waitForDeployment();
    config[networkId] = { CarrierApp: { address: await carrierapp.getAddress() } };
    fs.writeFileSync('../FYP/src/config.json', JSON.stringify(config, null, 2));
    const connection = await mysql.createConnection({
       host: "localhost",
       user: "root",
       password: "root",
       database: "fypproject",
       port: 3306
    });

    const [rows] = await connection.execute('SELECT * FROM carrierlist');
    console.log("Fetched items:", rows);

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      console.log(`Processing item ${i}:`, item);
      if (!item.product_id || !item.product_name || !item.product_category ||
          !item.product_image || item.cost === undefined || item.stock === undefined) {
        console.error(`Missing fields in row ${i}:`, item);
        continue; 
      }

      const transaction = await carrierapp.connect(deployer).list(
        item.product_id,
        item.product_name,
        item.product_category,
        item.product_image,
        tokens(item.cost), 
        item.stock,
      );
      console.log(transaction);
      await transaction.wait();
      console.log(`Listed item ${item.product_id}: ${item.product_name}`);
    }
    await connection.end();

  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
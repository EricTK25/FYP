const Gun = require('gun');
const config = require('../config.json');
const fs = require('fs');
const insertData = require('../Config/insertData.js');
const fetchData = require('../Script/fetchData.js');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
};

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

    // Initialize Gun.js
    const gun = Gun({ peers: ['http://localhost:8765/gun'] }); // Add your Gun.js server URL
    async function insertIntoGun() {
      insertData.forEach((item) => {
        gun.get('carrierlist').get(item.product_id).put(item, (ack) => {
          if (ack.err) {
            console.error('Error inserting item:', ack.err);
          } else {
            console.log(`Inserted product ID ${item.product_id}: ${item.product_name}`);
          }
        });
      });
    
      console.log('Data insertion complete!');
    }
    
    insertIntoGun();// Run the insertion function
    fetchData(gun,carrierapp,deployer,tokens);// Fetch data from the Gun.js database
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

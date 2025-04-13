const hre = require("hardhat");
const Gun = require('gun');
const config = require('../src/config.json');
const fs = require('fs');
const insertData = require('./insertData.js');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkId = "31337";
  const targetAddress = config[networkId]?.CarrierApp?.address;

  let carrierapp;

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
    
    // Run the insertion function
    insertIntoGun();
    // Fetch data from the Gun.js database
    gun.get('carrierlist').once(async (data) => {
      console.log("Fetched items from Gun.js:", data);
    
      for (const id in data) {
        const reference = data[id]['#']; // Get the reference to the item
        if (!reference) continue;
    
        // Fetch the complete item data using the reference
        const fetchItemData = async () => {
          gun.get(reference).once(async (item) => {
            if (!item) {
              console.error(`Item ${id} not found`);
              return;
            }
    
            console.log(`Processing item ${id}:`, item);
    
            // Ensure item has all necessary fields
            if (!item.product_id || !item.product_name || !item.product_category ||
                !item.product_image || item.cost === undefined || item.stock === undefined) {
              console.error(`Missing fields in item ${id}:`, item);
              return;
            }
    
            // List the item on the blockchain
            try {
              const transaction = await carrierapp.connect(deployer).list(
                item.product_id,
                item.product_name,
                item.product_category,
                item.product_image,
                tokens(item.cost),
                item.stock
              );
              console.log(transaction);
              await transaction.wait();
              console.log(`Listed item ${item.product_id}: ${item.product_name}`);
            } catch (error) {
              console.error(`Error listing item ${id}:`, error);
            }
          });
        };
    
        await fetchItemData(); // Call the async function and await its completion
      }
    });
    
    

  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

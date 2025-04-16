const hre = require("hardhat");
const Gun = require("gun");
const config = require("../src/config.json");
const fs = require("fs");
const insertData = require("./insertData.js");

const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkId = (await hre.ethers.provider.getNetwork()).chainId.toString();
  let configData = { ...config };

  console.log(`Deploying on network ID: ${networkId} with deployer: ${deployer.address}`);

  console.log("Deploying CarrierApp contract...");
  const CarrierApp = await ethers.getContractFactory("CarrierApp");
  const carrierapp = await CarrierApp.deploy();
  await carrierapp.waitForDeployment();
  const contractAddress = await carrierapp.getAddress();
  console.log(`CarrierApp deployed at: ${contractAddress}`);

  configData[networkId] = { CarrierApp: { address: contractAddress } };
  fs.writeFileSync("../FYP/src/config.json", JSON.stringify(configData, null, 2));
  console.log("Config updated");

  const gun = Gun({ peers: ["http://localhost:8765/gun"] });

  async function insertIntoGun() {
    return Promise.all(
      insertData.map(
        (item) =>
          new Promise((resolve, reject) => {
            gun.get("carrierlist").get(item.id).put(item, (ack) => {
              if (ack.err) {
                console.error(`Error inserting item ${item.id}:`, ack.err);
                reject(ack.err);
              } else {
                console.log(`Inserted item ID ${item.id}: ${item.name}`);
                resolve();
              }
            });
          })
      )
    );
  }

  try {
    await insertIntoGun();
    console.log("Data insertion to Gun.js complete!");
  } catch (error) {
    console.error("Gun.js insertion failed:", error);
  }

  const transactions = [];
  for (const item of insertData) {
    if (!item.specification) {
      console.error(`Item ${item.id} missing specification`);
      continue;
    }

    const spec = item.specification;
    const requiredFields = [
      "color",
      "engine_power",
      "fuel",
      "interior",
      "mileage",
      "condition",
      "cubic_capacity",
    ];
    const missingFields = requiredFields.filter(
      (field) => !spec[field] || spec[field].length === 0
    );
    if (missingFields.length > 0) {
      console.error(`Item ${item.id} missing specification fields: ${missingFields.join(", ")}`);
      continue;
    }

    try {
      console.log(`Listing item ${item.id} with specification:`, spec);
      const itemStruct = {
        product_id: item.id, 
        name: item.name,
        category: item.category,
        image: item.image,
        cost: tokens(item.cost),
        stock: Number(item.stock),
        specs: { 
          color: "",
          engine_power: "",
          fuel: "",
          interior: "",
          mileage: "",
          condition: "",
          cubic_capacity: "",
        },
        highlights: item.highlights || "",
      };

      const specStruct = {
        color: spec.color,
        engine_power: spec.engine_power,
        fuel: spec.fuel,
        interior: spec.interior,
        mileage: spec.mileage,
        condition: spec.condition,
        cubic_capacity: spec.cubic_capacity,
      };

      const tx = await carrierapp.connect(deployer).list(
        item.id,
        itemStruct,
        specStruct,
      );
      transactions.push(tx);
      console.log(`Listed item ${item.id}: ${item.name}, Tx: ${tx.hash}`);
    } catch (error) {
      console.error(`Error listing item ${item.id}:`, error);
    }
  }

  await Promise.all(transactions.map((tx) => tx.wait()));
  console.log("All items listed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
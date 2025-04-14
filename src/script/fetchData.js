module.exports = function fetchData(gun,carrierapp,deployer,tokens) {
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
}
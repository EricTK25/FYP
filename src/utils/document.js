import { jsPDF } from "jspdf";
import { parseUnits, formatEther } from "ethers";
import Gun from "gun";

const gun = Gun();

export const generateAndStoreDocument = async (
  transaction,
  productId,
  cartItem,
  orderId,
  account,
  provider,
  documentRegistry
) => {
  try {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    const buyerAddress = account;

    doc.setFontSize(20);
    doc.text("Vehicle Purchase Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 30);
    doc.text(`Buyer Wallet: ${buyerAddress.slice(0, 6)}...${buyerAddress.slice(-4)}`, 20, 40);
    doc.text(`Transaction Hash: ${transaction.hash}`, 20, 50);
    doc.text(`Order ID: ${orderId.toString()}`, 20, 60);

    doc.setFontSize(14);
    doc.text("Purchased Vehicle:", 20, 80);
    const costEth = formatEther(parseUnits(String(cartItem.cost), "ether"));
    doc.setFontSize(12);
    doc.text(`Name: ${cartItem.product_name || cartItem.name}`, 20, 90);
    doc.text(`Product ID: ${cartItem.id}`, 20, 100);
    doc.text(`Cost: ${costEth} ETH`, 20, 110);
    doc.text(`Category: ${cartItem.category || "N/A"}`, 20, 120);
    doc.text(`Color: ${cartItem.specs?.color || "N/A"}`, 20, 130);
    doc.text(`Engine Power: ${cartItem.specs?.engine_power || "N/A"}`, 20, 140);
    doc.text(`Fuel: ${cartItem.specs?.fuel || "N/A"}`, 20, 150);
    doc.text(`Interior: ${cartItem.specs?.interior || "N/A"}`, 20, 160);
    doc.text(`Mileage: ${cartItem.specs?.mileage || "N/A"}`, 20, 170);
    doc.text(`Condition: ${cartItem.specs?.condition || "N/A"}`, 20, 180);
    doc.text(`Cubic Capacity: ${cartItem.specs?.cubic_capacity || "N/A"}`, 20, 190);
    doc.text(`Highlights: ${cartItem.highlights || "N/A"}`, 20, 200);

    doc.setFontSize(14);
    doc.text(`Total: ${cartItem.cost} ETH`, 20, 220);

    const pdfBlob = doc.output("blob");
    console.log("PDF Blob size:", pdfBlob.size);

    // Trigger local download
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle_receipt_${transaction.hash}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("PDF downloaded locally:", `vehicle_receipt_${transaction.hash}.pdf`);

    // Store transaction metadata in DocumentRegistry (using tx hash as placeholder)
    const signer = await provider.getSigner();
    const contractWithSigner = documentRegistry.connect(signer);
    const placeholderCid = transaction.hash; // Use tx hash since no IPFS CID
    const tx = await contractWithSigner.storeDocument(account, productId, orderId, placeholderCid);
    await tx.wait();
    console.log("Document metadata stored in DocumentRegistry with placeholder CID:", placeholderCid);

    // Store in GunDB
    if (account) {
      const userNode = gun.get(`user_${account}`).get("documents");
      userNode.get(transaction.hash).put({ cid: placeholderCid, timestamp: date });
      console.log("Document metadata stored in GunDB with placeholder CID:", placeholderCid);
    }

    return placeholderCid;
  } catch (error) {
    console.error("Error generating/storing document:", error);
    throw error;
  }
};
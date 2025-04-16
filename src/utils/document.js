import { jsPDF } from "jspdf";
import { parseUnits, formatEther } from "ethers";
import Gun from "gun";

const gun = Gun();

// Constants for PDF formatting
const MARGIN = 20;
const PAGE_WIDTH = 210;
const LINE_HEIGHT = 10;
const FONT_SIZES = {
  TITLE: 20,
  SECTION: 14,
  NORMAL: 12,
  FOOTER: 10,
};
const MAX_WIDTH = PAGE_WIDTH - 2 * MARGIN;

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
    const buyerAddress = account || "Unknown";

    // Helper function to add text with wrapping
    const addWrappedText = (text, x, y, fontSize, maxWidth) => {
      try {
        // Validate inputs
        if (typeof text !== 'string') {
          console.warn('Invalid text input, converting to string:', text);
          text = String(text ?? 'N/A');
        }
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(maxWidth) || !Number.isFinite(fontSize)) {
          console.warn('Invalid numeric inputs:', { x, y, maxWidth, fontSize });
          return y; // Skip rendering to avoid crash
        }
        if (maxWidth <= 0) {
          console.warn('Invalid maxWidth:', maxWidth);
          return;
        }

        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        let currentY = y;
        lines.forEach((line, index) => {
          if (typeof line === 'string' && line.trim()) {
            doc.text(line, x, currentY + index * LINE_HEIGHT);
          }
        });
        return currentY + lines.length * LINE_HEIGHT;
      } catch (error) {
        console.error('Error in addWrappedText:', error);
        return y; // Continue with next text block
      }
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SIZES.TITLE);
    doc.text("Vehicle Purchase Receipt", MARGIN, MARGIN);
    doc.setFontSize(FONT_SIZES.NORMAL);
    doc.setFont("helvetica", "normal");
    let yPos = MARGIN + LINE_HEIGHT;
    yPos = addWrappedText(`Date: ${date}`, MARGIN, yPos, FONT_SIZES.NORMAL, MAX_WIDTH);
    yPos = addWrappedText(
      `Buyer Wallet: ${buyerAddress.slice(0, 6)}...${buyerAddress.slice(-4)}`,
      MARGIN,
      yPos,
      FONT_SIZES.NORMAL,
      MAX_WIDTH
    );
    yPos = addWrappedText(`Transaction Hash: ${transaction.hash}`, MARGIN, yPos, FONT_SIZES.NORMAL, MAX_WIDTH);
    yPos = addWrappedText(`Order ID: ${orderId.toString()}`, MARGIN, yPos, FONT_SIZES.NORMAL, MAX_WIDTH);

    // Vehicle Details Section
    yPos += LINE_HEIGHT;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SIZES.SECTION);
    doc.text("Purchased Vehicle", MARGIN, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_SIZES.NORMAL);
    yPos += LINE_HEIGHT;

    const costEth = formatEther(parseUnits(String(cartItem.cost || "0"), "ether"));
    const vehicleDetails = [
      { label: "Name", value: cartItem.product_name || cartItem.name || "Unknown" },
      { label: "Product ID", value: cartItem.id || "N/A" },
      { label: "Cost", value: `${costEth} ETH` },
      { label: "Category", value: cartItem.category || "N/A" },
      { label: "Color", value: cartItem.specs?.color || "N/A" },
      { label: "Engine Power", value: cartItem.specs?.engine_power || "N/A" },
      { label: "Fuel", value: cartItem.specs?.fuel || "N/A" },
      { label: "Interior", value: cartItem.specs?.interior || "N/A" },
      { label: "Mileage", value: cartItem.specs?.mileage || "N/A" },
      { label: "Condition", value: cartItem.specs?.condition || "N/A" },
      { label: "Cubic Capacity", value: cartItem.specs?.cubic_capacity || "N/A" },
    ];

    // Two-column layout for vehicle details
    const colWidth = (MAX_WIDTH - 10) / 2;
    const midPoint = MARGIN + colWidth + 5;
    vehicleDetails.forEach((detail, index) => {
      const x = index % 2 === 0 ? MARGIN : midPoint;
      if (index % 2 === 0 && index > 0) yPos += LINE_HEIGHT;
      doc.text(`${detail.label}: ${detail.value}`, x, yPos);
      if (index % 2 === 1) yPos += LINE_HEIGHT;
    });

    // Highlights Section
    yPos += LINE_HEIGHT * 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SIZES.SECTION);
    doc.text("Highlights", MARGIN, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT_SIZES.NORMAL);
    yPos += LINE_HEIGHT;
    // Normalize highlights to string
    const highlights = Array.isArray(cartItem.highlights)
      ? cartItem.highlights.join(", ")
      : cartItem.highlights ?? "N/A";
    yPos = addWrappedText(highlights, MARGIN, yPos, FONT_SIZES.NORMAL, MAX_WIDTH);

    // Total Section
    yPos += LINE_HEIGHT;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SIZES.SECTION);
    doc.text(`Total: ${costEth} ETH`, MARGIN, yPos);

    // Footer
    const footerText = "Thank you for your purchase! This receipt is proof of your vehicle purchase. Contact support@x.ai for assistance.";
    doc.setFontSize(FONT_SIZES.FOOTER);
    doc.setFont("helvetica", "italic");
    yPos = addWrappedText(footerText, MARGIN, 270, FONT_SIZES.FOOTER, MAX_WIDTH);

    // Add page number
    doc.setFontSize(FONT_SIZES.FOOTER);
    doc.text(`Page 1 of 1`, PAGE_WIDTH - MARGIN - 20, 270);

    // Generate and download PDF
    const pdfBlob = doc.output("blob");
    console.log("PDF Blob size:", pdfBlob.size);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle_receipt_${transaction.hash}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("PDF downloaded locally:", `vehicle_receipt_${transaction.hash}.pdf`);

    // Store transaction metadata in DocumentRegistry
    const signer = await provider.getSigner();
    const contractWithSigner = documentRegistry.connect(signer);
    const placeholderCid = transaction.hash;
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
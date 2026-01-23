const { ApiError } = require("../utils/ApiError");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { asyncHandler } = require("../utils/asyncHandler");

const generateInvoiceController = asyncHandler(async (req, res, next) => {
  try {
    const {
      orderId,
      exporter,
      consignee,
      items,
      total,
      fees,
      gross_total,
      airWaybillNo,
      totalWeight,
      shipmentTerm,
      remarks,
      custom_tracking_number,
      shipping_reason,
      type,
      total_weight,
    } = req.body;
    
    if (!orderId || !exporter || !consignee || !items || !total) {
      throw new ApiError(400, "Missing required fields.");
    }

    const invoicesDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `invoice-${orderId}.pdf`;
    const filePath = path.join(invoicesDir, fileName);
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    doc.pipe(fs.createWriteStream(filePath));

    // Set base coordinates and widths
    const pageWidth = 595;
    const leftX = 40;
    const rightX = 550;
    const headerHeight = 40;
    const headerTopY = 30;

    // ***** MAIN BORDER - SINGLE BORDER STRATEGY *****
    const mainBorderX = leftX;
    const mainBorderY = headerTopY;
    const mainBorderWidth = rightX - leftX;
    const mainBorderHeight = 650; // Reduced height to accommodate footer outside

    doc.lineWidth(2);
    doc
      .rect(mainBorderX, mainBorderY, mainBorderWidth, mainBorderHeight)
      .stroke();

    // Header section - NO separate border, part of main border
    doc.lineWidth(1);
    doc.font("Helvetica-Bold").fontSize(18);
    doc.text("Commercial Invoice", leftX + 5, headerTopY + 8, {
      width: 250,
      continued: false,
    });
    doc.font("Helvetica").fontSize(10);
    if (type === "envelope") {
      doc.text("Incoterm: DOC", 290, headerTopY + 6);
    } else {
      doc.text("Reason for shipping", 290, headerTopY + 6);
    }

    doc.font("Helvetica-Bold").fontSize(10);
    if (type === "envelope") {
      doc.text(
        "Reason for shipping: Documents with NO COMMERCIAL VALUE",
        290,
        headerTopY + 22
      );
    } else {
      doc.text(shipping_reason || "N/A", 290, headerTopY + 22);
    }


    // Internal dividers only (no outer borders)
    doc
      .moveTo(280, headerTopY)
      .lineTo(280, headerTopY + headerHeight)
      .stroke();
    doc.moveTo(leftX, 70).lineTo(rightX, 70).stroke();

    // Second row - NO border, just internal lines
    const colWidths = [150, 100, 70, 80, 160];
    let xPos = leftX;
    for (let w of colWidths) {
      xPos += w;
      if (xPos < rightX) doc.moveTo(xPos, 70).lineTo(xPos, 100).stroke();
    }

    // Horizontal line after columns
    doc.moveTo(leftX, 100).lineTo(rightX, 100).stroke();

    // Column titles - small, not bold
    doc.font("Helvetica").fontSize(8);
    doc.text("Air Waybill No", leftX + 5, 73, { width: colWidths[0] });
    doc.text("Date of Export", leftX + colWidths[0] + 5, 73, {
      width: colWidths[1],
    });
    doc.text("Total Weight", leftX + colWidths[0] + colWidths[1] + 5, 73, {
      width: colWidths[2],
    });
    doc.text(
      "Shipment Term",
      leftX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      73,
      { width: colWidths[3] }
    );
    doc.text(
      "Destination Country",
      leftX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
      73,
      { width: colWidths[4] }
    );

    // Column values - bold, larger text
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text(custom_tracking_number || "N/A", leftX + 5, 85, {
      width: colWidths[0],
    });
    doc.text(
      new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
      leftX + colWidths[0] + 5,
      85,
      { width: colWidths[1] }
    );
    doc.text(
      `${total_weight || "0.0"} kg`,
      leftX + colWidths[0] + colWidths[1] + 5,
      85,
      { width: colWidths[2] }
    );
    doc.text(
      shipmentTerm || "DDU",
      leftX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      85,
      { width: colWidths[3] }
    );
    doc.text(
      consignee.country || "United Kingdom",
      leftX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
      85,
      { width: colWidths[4] }
    );

    // ********* Exporter/Shipper and Consignee Section *********
    const expConsY = 100;
    const expConsHeight = 200; // This is now just a minimum - actual height will be calculated

    // NO OUTER BORDER - only internal divider
    // Vertical line dividing Exporter and Consignee (will be extended after addresses are drawn)
    const centerX = 295;

    // Grey background for main headers
    doc
      .rect(leftX, expConsY, centerX - leftX, 30)
      .fillAndStroke("#d5d5d5", "#000000");
    doc
      .rect(centerX, expConsY, rightX - centerX, 30)
      .fillAndStroke("#d5d5d5", "#000000");

    // Main headers text - bold and larger
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(14);
    doc.text("Exporter / Shipper", leftX + 8, expConsY + 8, {
      width: centerX - leftX - 16,
    });
    doc.text("Ship To / Consignee", centerX + 8, expConsY + 8, {
      width: rightX - centerX - 16,
    });

    // Reset fill color for content
    doc.fillColor("#000000");

    // Helper function for label/value pairs
    // Returns the height used by the text so next fields can be positioned correctly
    function drawLabelValueExact(
      label,
      value,
      x,
      y,
      isLeftSide = true,
      isSpecialField = false
    ) {
      if (isSpecialField) {
        const bgX = isLeftSide ? leftX : centerX;
        const bgWidth = isLeftSide ? centerX - leftX : rightX - centerX;
        const bgHeight = 20;
        const bgY = y - 2;

        doc
          .rect(bgX, bgY, bgWidth, bgHeight)
          .fillAndStroke("#e8e8e8", "#e8e8e8");
      }

      doc.fillColor("#666666").font("Helvetica").fontSize(10);
      doc.text(label, x, y, { width: 85 });

      doc.fillColor("#000000");
      if (isSpecialField) {
        doc.font("Helvetica-Bold").fontSize(11);
      } else {
        doc.font("Helvetica").fontSize(10);
      }
      
      // Calculate available width for value text
      const valueX = x + 90;
      const maxWidth = isLeftSide 
        ? centerX - valueX - 8  // Leave some padding from center divider
        : rightX - valueX - 8;  // Leave some padding from right border
      
      // Draw value text with width constraint so it wraps properly
      doc.text(value || "", valueX, y, { width: maxWidth });
      
      // Calculate and return the height used by the value text
      const textHeight = doc.heightOfString(value || "", { width: maxWidth });
      const labelHeight = doc.heightOfString(label, { width: 85 });
      
      // Return the maximum height used (label or value)
      return Math.max(textHeight, labelHeight);
    }

    // Exporter details - left side
    const expLeftX = leftX + 8;
    let expY = expConsY + 40;
    const fieldSpacing = 5; // Spacing between fields

    let currentExpY = expY;
    let height = drawLabelValueExact(
      "Contact Name",
      exporter.contactName || exporter.name,
      expLeftX,
      currentExpY,
      true,
      true
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Address",
      exporter.address || "Moore Shop Mall, 58 Parnell St",
      expLeftX,
      currentExpY
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Postal Code",
      exporter.postalCode || "D01Y336",
      expLeftX,
      currentExpY
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "City/State",
      exporter.city || "Dublin, Co. Dublin",
      expLeftX,
      currentExpY
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Phone/Fax",
      exporter.phone || "353894076665",
      expLeftX,
      currentExpY
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Email",
      exporter.email || "couriers@easyship.com",
      expLeftX,
      currentExpY
    );
    currentExpY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Country",
      exporter.country || "Ireland",
      expLeftX,
      currentExpY
    );
    const expBottomY = currentExpY + height;

    // Consignee details - right side
    const consLeftX = centerX + 8;
    let consY = expConsY + 40;

    let currentConsY = consY;
    height = drawLabelValueExact(
      "Contact Name",
      consignee.contactName || consignee.name || "EYMA MORE",
      consLeftX,
      currentConsY,
      false,
      true
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Address",
      consignee.address || "7 Astbury Avenue, Merseybank Charlton",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Postal Code",
      consignee.postalCode || "M21 7NJ",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "City/State",
      consignee.city || "Manchester",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Tax ID",
      consignee.taxId || "",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Phone/Fax",
      consignee.phone || "+447538712497",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Email",
      consignee.email || "thembisibeko123@gmail.com",
      consLeftX,
      currentConsY,
      false
    );
    currentConsY += height + fieldSpacing;

    height = drawLabelValueExact(
      "Country",
      consignee.country || "United Kingdom",
      consLeftX,
      currentConsY,
      false
    );
    const consBottomY = currentConsY + height;

    // Draw dividers now that we know the actual bottom position
    const maxBottomY = Math.max(expBottomY, consBottomY);
    
    // Vertical line dividing Exporter and Consignee - extend to actual bottom
    doc
      .moveTo(centerX, expConsY)
      .lineTo(centerX, maxBottomY + 5)
      .stroke();

    // Horizontal line at bottom of this section
    doc
      .moveTo(leftX, maxBottomY + 5)
      .lineTo(rightX, maxBottomY + 5)
      .stroke();

    // ********* Items Table *********
    // Use the maximum bottom Y from both address sections, plus some spacing
    const tableStartY = maxBottomY + 15;
    const rowHeight = 18;
    const tableHeaderHeight = 18;
    const tableHeight = tableHeaderHeight + items.length * rowHeight;

    // Table header background - extends to main border edges
    doc
      .rect(
        leftX,
        tableStartY - tableHeaderHeight,
        rightX - leftX,
        tableHeaderHeight
      )
      .fillAndStroke("#f2f2f2", "#f2f2f2");

    // Column X positions for text alignment
    const colX = [
      leftX,
      leftX + 30,
      leftX + 180,
      leftX + 260,
      leftX + 290,
      leftX + 330,
      leftX + 420,
      leftX + 470,
      rightX,
    ];

    // Table header text
    doc.fillColor("#000000").font("Helvetica").fontSize(9);
    doc.text("Item", colX[0] + 5, tableStartY - tableHeaderHeight + 5);
    doc.text(
      "Description of Goods",
      colX[1] + 5,
      tableStartY - tableHeaderHeight + 5
    );
    doc.text(
      "Country of Origin",
      colX[2] + 5,
      tableStartY - tableHeaderHeight + 5
    );
    doc.text("Qty", colX[3] + 10, tableStartY - tableHeaderHeight + 5);
    doc.text("Part #", colX[4] + 10, tableStartY - tableHeaderHeight + 5);
    doc.text(
      "Harmonised Code",
      colX[5] + 5,
      tableStartY - tableHeaderHeight + 5
    );
    doc.text("Unit Value", colX[6] + 5, tableStartY - tableHeaderHeight + 5);
    doc.text("Total", colX[7] + 5, tableStartY - tableHeaderHeight + 5);

    // Horizontal line below header
    doc
      .moveTo(leftX, tableStartY)
      .lineTo(rightX, tableStartY)
      .strokeColor("#cccccc")
      .lineWidth(0.5)
      .stroke();

    // Table rows text
    doc.font("Helvetica").fontSize(9);
    let itemY = tableStartY + 3;

    items.forEach((item, idx) => {
      const y = itemY + idx * rowHeight;
      doc.text((idx + 1).toString(), colX[0] + 10, y);
      doc.text(item.description, colX[1] + 5, y);
      doc.text(item.countryOfOrigin || "IE", colX[2] + 10, y);
      doc.text(item.quantity.toString(), colX[3] + 10, y);
      doc.text(item.partNumber || "1", colX[4] + 10, y);
      doc.text(item.harmCode || item.harmonisedCode, colX[5] + 5, y);
      doc.text(Number(item.unitPrice).toFixed(2), colX[6] + 5, y);
      doc.text(Number(item.total).toFixed(2), colX[7] + 5, y);
    });

    // Line after table items - this stays inside border
    const tableEndY = tableStartY + items.length * rowHeight;
    doc
      .moveTo(leftX, tableEndY)
      .lineTo(rightX, tableEndY)
      .strokeColor("#000000")
      .lineWidth(1)
      .stroke();

    // ********* Remarks Section - INSIDE BORDER *********
    const remarksY = tableEndY + 15;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Remarks:", leftX + 5, remarksY);
    doc.font("Helvetica").fontSize(9);
    doc.text(remarks || "SHIPPING PAID", leftX + 5, remarksY + 15);

    // ********* Signature Section - INSIDE BORDER *********
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Signature", leftX + 5, remarksY + 45);

    // ********* Totals Section - OUTSIDE MAIN BORDER, PROPERLY POSITIONED *********
    const totalsBoxWidth = 160;
    const totalsBoxHeight = 75;
    const totalsX = rightX - totalsBoxWidth; // Align with right edge of main border
    const totalsY = mainBorderY + mainBorderHeight - 80; // Position above the main border bottom

    // Draw totals box border
    doc.lineWidth(1);
    doc.rect(totalsX, totalsY, totalsBoxWidth, totalsBoxHeight).stroke();

    // Totals content background for grand total row only
    doc
      .rect(totalsX, totalsY + 50, totalsBoxWidth, 25)
      .fillAndStroke("#f0f0f0", "#000000");

    const totalsTextX = totalsX + 8;
    const totalsValueX = totalsX + totalsBoxWidth - 60;

    // Reset fill color and draw text
    doc.fillColor("#000000").font("Helvetica").fontSize(9);
    // doc.text("Total Shipping Cost", totalsTextX, totalsY + 8);
    doc.text("Total Value of Goods", totalsTextX, totalsY + 28);

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Total", totalsTextX, totalsY + 57);

    // Values - right aligned
    const currency = exporter.currency || "USD";
    doc.font("Helvetica").fontSize(9);
    // doc.text(
    //   `${currency} ${(fees.shipping || 20.21).toFixed(2)}`,
    //   totalsValueX,
    //   totalsY + 8
    // );
    doc.text(
      `${currency} ${Number(gross_total).toFixed(2)}`,
      totalsValueX,
      totalsY + 28
    );

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(
      `${currency} ${Number(total).toFixed(2)}`,
      totalsValueX,
      totalsY + 57
    );

    // ********* Footer - POSITIONED BELOW TOTALS BOX *********
    const footerY = totalsY + totalsBoxHeight + 15; // Position below the totals box

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Commercial Invoice 2025", leftX, footerY);

    doc.font("Helvetica").fontSize(8);
    doc.text(new Date().toISOString().slice(0, 10), leftX + 180, footerY);
    doc.text("The item may be opened officially.", leftX + 280, footerY);

    // Page number - right aligned
    doc.text("Page 1 of 1", rightX - 60, footerY);

    doc.end();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/invoices/${fileName}`;

    res.json({
      message: "Commercial Invoice generated successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
});

  // const generateSaleInvoiceController = asyncHandler(async (req, res, next) => {
  //   try {
  //     const {
  //       orderId,
  //       exporter,
  //       consignee,
  //       items,
  //       total,
  //       fees,
  //       gross_total,
  //       currency,
  //       paymentOption,
  //       additional,
  //       discount,
  //     } = req.body;
  //     if (!orderId || !exporter || !consignee || !items || !total) {
  //       throw new ApiError(400, "Missing required fields.");
  //     }

  //     const invoicesDir = path.join(__dirname, "../saleinvoices");
  //     if (!fs.existsSync(invoicesDir)) {
  //       fs.mkdirSync(invoicesDir, { recursive: true });
  //     }

  //     const fileName = `invoice-${orderId}.pdf`;
  //     const filePath = path.join(invoicesDir, fileName);
  //     const doc = new PDFDocument({ margin: 30, size: "A4" });

  //     doc.pipe(fs.createWriteStream(filePath));
  //     const logoPath = path.join(__dirname, "../assets/logo.png");
  //     if (fs.existsSync(logoPath)) {
  //       doc.image(logoPath, 460, 25, { width: 100 });
  //     } else {
  //       console.warn("Logo image not found.");
  //     }
  //     doc.fontSize(18).font("Helvetica-Bold").text("INVOICE", 30, 30);
  //     doc
  //       .moveDown(0.5)
  //       .fontSize(12)
  //       .font("Helvetica")
  //       .text("Varamex Express", 30)
  //       .text("Tax Number: 1388534BA", 30)
  //       .text("Moore St Shopping Mall, Unit 6, Dublin 1, Ireland, D01 P688", 30)
  //       .text("Ph. +353 1 575 8797", 30)
  //       .text("Email: sales@varamex.com", 30);
  //     doc
  //       .fontSize(11)
  //       .font("Helvetica")
  //       .text(
  //         `Date: ${new Date().toLocaleDateString("en-US", {
  //           day: "numeric",
  //           month: "long",
  //           year: "numeric",
  //         })}`,
  //         400,
  //         103,
  //         {
  //           align: "right",
  //           width: 175, // enough width to keep line single
  //         }
  //       )
  //       .text(`Invoice No: ${exporter.invoiceNumber}`, 400, 120, {
  //         align: "right",
  //         width: 175,
  //       });

  //     doc.moveTo(30, 140).lineTo(570, 140).stroke();
  //     // Sender
  //     doc.fontSize(12).font("Helvetica-Bold").text("Sender", 30, 155);
  //     doc.fontSize(10).font("Helvetica").text(exporter.name, 30, 170);
  //     doc.text(exporter.address, 30, 185);
  //     doc.text(exporter.city, 30, 210);
  //     doc.text(`Phone: ${exporter.phone}`, 30, 230);

  //     // Receiver
  //     doc.fontSize(12).font("Helvetica-Bold").text("Receiver", 320, 155);
  //     doc.fontSize(10).font("Helvetica").text(consignee.name, 320, 170);
  //     doc.text(consignee.address, 320, 185);
  //     doc.text(consignee.city, 320, 210);
  //     doc.text(`Phone: ${consignee.phone}`, 320, 230);
  //     // doc
  //     //   .fontSize(10)
  //     //   .font("Helvetica-Bold")
  //     //   .text("Exporting Carrier:", 320, 325);
  //     // doc.font("Helvetica").text(consignee.carrier, 430, 325);

  //     doc.moveTo(30, 255).lineTo(570, 255).stroke();

  //     // Items
  //     let yPos = 260;
  //     doc
  //       .text("Box#", 30, yPos)
  //       .text("Box Name", 80, yPos)
  //       .text("Courier", 200, yPos)
  //       .text("Weight", 330, yPos)
  //       .text("Box Type", 400, yPos)
  //       .text("Line Total", 480, yPos);

  //     doc
  //       .moveTo(30, yPos + 15)
  //       .lineTo(570, yPos + 15)
  //       .stroke();

  //     yPos += 25;
  //     items.forEach((item, index) => {
  //       doc
  //         .text(index + 1, 30, yPos)
  //         .text(item?.dimensions?.name, 80, yPos)
  //         .text(item.courier, 200, yPos)
  //         .text(item.weight, 330, yPos)
  //         .text(`${item.type}`, 400, yPos)
  //         .text(`${currency}${Number(item.actual_amount).toFixed(2)}`, 480, yPos);
  //       yPos += 15;
  //     });

  //     doc.moveTo(30, yPos).lineTo(570, yPos).stroke();
  //     yPos += 10;

  //     doc
  //       .text("Subtotal:", 400, yPos)
  //       .text(`${currency}${gross_total.toFixed(2)}`, 480, yPos);

  //     // ✅ Fees except Shipping Fee
  //     Object.keys(fees).forEach((feeType) => {
  //       if (
  //         feeType.toLowerCase() !== "shipping" &&
  //         feeType.toLowerCase() !== "shipping fee"
  //       ) {
  //         yPos += 15;
  //         doc
  //           .text(`${feeType}:`, 400, yPos)
  //           .text(`${currency}${fees[feeType]}`, 480, yPos);
  //       }
  //     });

  //     // ✅ Additional Amount (only show if not zero)
  //     if (additional && additional !== 0) {
  //       yPos += 15;
  //       doc
  //         .text("Additional:", 400, yPos)
  //         .text(`${currency}${additional.toFixed(2)}`, 480, yPos);
  //     }

  //     // ✅ Discount (only show if not zero)
  //     if (discount && discount !== 0) {
  //       yPos += 15;
  //       doc
  //         .text("Discount:", 400, yPos)
  //         .text(`-${currency}${discount.toFixed(2)}`, 480, yPos);
  //     }

  //     yPos += 20;
  //     doc
  //       .fontSize(12)
  //       .font("Helvetica-Bold")
  //       .text("TOTAL:", 400, yPos)
  //       .text(`${currency}${total.toFixed(2)}`, 480, yPos);

  //     if (paymentOption !== "later") {
  //       const paidImagePath = path.join(__dirname, "../assets/paid.jpg");
  //       if (fs.existsSync(paidImagePath)) {
  //         doc.image(paidImagePath, 220, yPos + 120, { width: 150 });
  //       } else {
  //         console.warn("PAID image not found.");
  //       }
  //     }
  //     // ✅ Customs Notice at the End
  //     // Customs, Delivery & Packing Notice
  //     doc.moveDown(2);
  //     doc
  //       .fontSize(10)
  //       .font("Helvetica-Bold")
  //       .text("CUSTOMS, DELIVERY & PACKING NOTICE", 25, null, { width: 550 });

  //     doc.moveDown(0.5);
  //     doc.font("Helvetica").fontSize(9);

  //     doc.text(
  //       "1: Receiver is responsible for all customs duties, taxes, and import charges in the destination country.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "2: No customs apply for shipments within the EU zone.",
  //       25,
  //       null,
  //       {
  //         width: 550,
  //       }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "3: For non-EU shipments, parcels may be inspected or delayed by customs. Varamex Express cannot intervene, waive, or negotiate customs issues.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "4: Parcels may be seized, delayed, or abandoned if duties are unpaid — no refunds or claims will be accepted in such cases.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "5: Delivery time is counted from the shipment date to arrival in the destination country. Customs delays are not included in shipping times.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "6: Packaging Responsibility: It is the customer's responsibility to pack all parcels securely to prevent damage.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "7: Broken suitcase wheels or cosmetic damage are not valid damage claims.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "8: Oversize Charges: Extra charges apply if your parcel exceeds the declared dimensions or weight.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(0.5);
  //     doc.text(
  //       "9: By placing an order, you authorize Varamex Express to charge your card for any size/weight excess without further notice.",
  //       25,
  //       null,
  //       { width: 550 }
  //     );
  //     doc.moveDown(1);
  //     const waImagePath = path.join(__dirname, "../assets/wa.png");
  //     const iconSize = 12;
  //     let currentY = doc.y + 5; // small padding if needed

  //     if (fs.existsSync(waImagePath)) {
  //       doc.image(waImagePath, 25, currentY, {
  //         width: iconSize,
  //         height: iconSize,
  //       });
  //     }

  //     doc
  //       .fontSize(9)
  //       .font("Helvetica")
  //       .text(
  //         "Customer Care (WhatsApp): +353 85 122 1598",
  //         25 + iconSize + 5, // indent text after icon
  //         currentY
  //       );

  //     // Complaints line
  //     const supImagePath = path.join(__dirname, "../assets/sup.png");
  //     currentY += iconSize + 5; // move Y down for next line

  //     if (fs.existsSync(supImagePath)) {
  //       doc.image(supImagePath, 25, currentY, {
  //         width: iconSize,
  //         height: iconSize,
  //       });
  //     }

  //     doc.text(
  //       "Complaints & Support: sales@varamex.com",
  //       25 + iconSize + 5,
  //       currentY
  //     );

  //     doc.moveDown(1);
  //     // doc
  //     //   .font("Helvetica-Bold")
  //     //   .text("Account holder: VARAMEX EXPRESS", 25, null, { width: 550 });
  //     // doc.font("Helvetica").text("IBAN: IE72SUMU99036511788516", 25, null, {
  //     //   width: 550,
  //     // });
  //     // doc.text("BIC: SUMUIE22XXX", 25, null, { width: 550 });
  //     // doc.text("Financial institution: SumUp Limited, Dublin, Ireland", 25, null, {
  //     //   width: 550,
  //     // });
  //     const footerText = [
  //       "Account holder: VARAMEX EXPRESS",
  //       "IBAN: IE72SUMU99036511788516",
  //       "BIC: SUMUIE22XXX",
  //       "Financial institution: SumUp Limited, Dublin, Ireland",
  //     ];

  //     // Reserve a Y position near the bottom
  //     const pageHeight = doc.page.height;
  //     let footerY = pageHeight - 80; // adjust 80 if needed for margin

  //     footerText.forEach((line) => {
  //       doc.fontSize(9).font("Helvetica-Bold").text(line, 0, footerY, {
  //         width: doc.page.width,
  //         align: "center",
  //       });
  //       footerY += 12; // line spacing
  //     });

  //     doc.end();

  //     const baseUrl = `${req.protocol}://${req.get("host")}`;
  //     const fileUrl = `${baseUrl}/saleinvoices/${fileName}`;

  //     res.json({ message: "Invoice generated successfully", url: fileUrl });
  //   } catch (error) {
  //     console.error("Error generating invoice:", error);
  //     res
  //       .status(error.statusCode || 500)
  //       .json({ error: error.message || "Internal Server Error" });
  //   }
  // });
const generateSaleInvoiceController = asyncHandler(async (req, res, next) => {
  try {
    const {
      orderId,
      exporter,
      consignee,
      items,
      total,
      fees,
      gross_total,
      currency,
      paymentOption,
      additional,
      discount,
    } = req.body;
    if (!orderId || !exporter || !consignee || !items || !total) {
      throw new ApiError(400, "Missing required fields.");
    }

    const invoicesDir = path.join(__dirname, "../saleinvoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `invoice-${orderId}.pdf`;
    const filePath = path.join(invoicesDir, fileName);
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    doc.pipe(fs.createWriteStream(filePath));

    // Logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 460, 25, { width: 100 });
    }

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("INVOICE", 30, 30);
    doc
      .moveDown(0.5)
      .fontSize(12)
      .font("Helvetica")
      .text("Varamex Express", 30)
      .text("Tax Number: 1388534BA", 30)
      .text("Moore St Shopping Mall, Unit 6, Dublin 1, Ireland, D01 P688", 30)
      .text("Ph. +353 1 575 8797", 30)
      .text("Email: sales@varamex.com", 30);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Date: ${new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        400,
        103,
        {
          align: "right",
          width: 175,
        }
      )
      .text(`Invoice No: ${exporter.invoiceNumber}`, 400, 120, {
        align: "right",
        width: 175,
      });

    doc.moveTo(30, 140).lineTo(570, 140).stroke();

    // ================= Sender / Receiver Block =================
    doc.fontSize(12).font("Helvetica-Bold").text("Sender", 30, 155);
    doc.fontSize(12).font("Helvetica-Bold").text("Receiver", 320, 155);

    doc.fontSize(10).font("Helvetica");

    const leftX = 30;
    const rightX = 320;
    const pageRight = 570;
    const leftWidth = rightX - leftX - 10;
    const rightWidth = pageRight - rightX;

    function drawBlock(doc, x, y, lines, width) {
      let curY = y;
      const gap = 4;
      lines.forEach((line) => {
        const text = line || "";
        doc.text(text, x, curY, { width });
        const h = doc.heightOfString(text, { width });
        curY += h + gap;
      });
      return curY;
    }

    const senderLines = [
      exporter.name || "",
      exporter.address || "",
      exporter.city || "",
      exporter.postalCode ? `Postal Code: ${exporter.postalCode}` : "",
      `Phone: ${exporter.phone || ""}`,
    ].filter(Boolean);

    const receiverLines = [
      consignee.name || "",
      consignee.address || "",
      consignee.city || "",
      consignee.postalCode ? `Postal Code: ${consignee.postalCode}` : "",
      `Phone: ${consignee.phone || ""}`,
    ].filter(Boolean);

    const blockStartY = 170;
    const senderBottom = drawBlock(
      doc,
      leftX,
      blockStartY,
      senderLines,
      leftWidth
    );
    const receiverBottom = drawBlock(
      doc,
      rightX,
      blockStartY,
      receiverLines,
      rightWidth
    );

    const afterAddressesY = Math.max(senderBottom, receiverBottom) + 8;
    doc.moveTo(30, afterAddressesY).lineTo(570, afterAddressesY).stroke();

    // ================= Items Table =================
    let yPos = afterAddressesY + 10;
    if (yPos > doc.page.height - 180) {
      doc.addPage();
      yPos = 40;
    }

    doc
      .text("Box#", 30, yPos)
      .text("Box Name", 80, yPos)
      .text("Courier", 200, yPos)
      .text("Weight", 330, yPos)
      .text("Box Type", 400, yPos)
      .text("Line Total", 480, yPos);

    doc
      .moveTo(30, yPos + 15)
      .lineTo(570, yPos + 15)
      .stroke();

    yPos += 25;
    items.forEach((item, index) => {
      doc
        .text(index + 1, 30, yPos)
        .text(item?.dimensions?.name, 80, yPos, { width: 100 })
        .text(item.courier, 200, yPos)
        .text(item.weight, 330, yPos)
        .text(`${item.type}`, 400, yPos)
        .text(`${currency}${Number(item.actual_amount).toFixed(2)}`, 480, yPos);
      yPos += 15;
    });

    doc.moveTo(30, yPos).lineTo(570, yPos).stroke();
    yPos += 10;

    doc
      .text("Subtotal:", 400, yPos)
      .text(`${currency}${gross_total.toFixed(2)}`, 480, yPos);

    Object.keys(fees).forEach((feeType) => {
      if (
        feeType.toLowerCase() !== "shipping" &&
        feeType.toLowerCase() !== "shipping fee"
      ) {
        yPos += 15;
        doc
          .text(`${feeType}:`, 400, yPos)
          .text(`${currency}${fees[feeType]}`, 480, yPos);
      }
    });

    if (additional && additional !== 0) {
      yPos += 15;
      doc
        .text("Additional:", 400, yPos)
        .text(`${currency}${additional.toFixed(2)}`, 480, yPos);
    }

    if (discount && discount !== 0) {
      yPos += 15;
      doc
        .text("Discount:", 400, yPos)
        .text(`-${currency}${discount.toFixed(2)}`, 480, yPos);
    }

    yPos += 20;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TOTAL:", 400, yPos)
      .text(`${currency}${total.toFixed(2)}`, 480, yPos);

    if (paymentOption !== "later") {
      const paidImagePath = path.join(__dirname, "../assets/paid.jpg");
      if (fs.existsSync(paidImagePath)) {
        doc.image(paidImagePath, 220, yPos + 120, { width: 150 });
      }
    }

    // Customs Notice
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("CUSTOMS, DELIVERY & PACKING NOTICE", 25, null, { width: 550 });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(9);

    doc.text(
      "1: Receiver is responsible for all customs duties, taxes, and import charges in the destination country.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "2: No customs apply for shipments within the EU zone.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "3: For non-EU shipments, parcels may be inspected or delayed by customs. Varamex Express cannot intervene, waive, or negotiate customs issues.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "4: Parcels may be seized, delayed, or abandoned if duties are unpaid — no refunds or claims will be accepted in such cases.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "5: Delivery time is counted from the shipment date to arrival in the destination country. Customs delays are not included in shipping times.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "6: Packaging Responsibility: It is the customer's responsibility to pack all parcels securely to prevent damage.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "7: Broken suitcase wheels or cosmetic damage are not valid damage claims.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "8: Oversize Charges: Extra charges apply if your parcel exceeds the declared dimensions or weight.",
      25,
      null,
      { width: 550 }
    );
    doc.moveDown(0.5);
    doc.text(
      "9: By placing an order, you authorize Varamex Express to charge your card for any size/weight excess without further notice.",
      25,
      null,
      { width: 550 }
    );

    doc.moveDown(1);
    const waImagePath = path.join(__dirname, "../assets/wa.png");
    const iconSize = 12;
    let currentY = doc.y + 5;

    if (fs.existsSync(waImagePath)) {
      doc.image(waImagePath, 25, currentY, {
        width: iconSize,
        height: iconSize,
      });
    }

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "Customer Care (WhatsApp): +353 85 122 1598",
        25 + iconSize + 5,
        currentY
      );

    const supImagePath = path.join(__dirname, "../assets/sup.png");
    currentY += iconSize + 5;
    if (fs.existsSync(supImagePath)) {
      doc.image(supImagePath, 25, currentY, {
        width: iconSize,
        height: iconSize,
      });
    }
    doc.text(
      "Complaints & Support: sales@varamex.com",
      25 + iconSize + 5,
      currentY
    );

    // Footer
    const footerText = [
      "Account holder: VARAMEX EXPRESS",
      "IBAN: IE72SUMU99036511788516",
      "BIC: SUMUIE22XXX",
      "Financial institution: SumUp Limited, Dublin, Ireland",
    ];

    const pageHeight = doc.page.height;
    let footerY = pageHeight - 80;

    footerText.forEach((line) => {
      doc.fontSize(9).font("Helvetica-Bold").text(line, 0, footerY, {
        width: doc.page.width,
        align: "center",
      });
      footerY += 12;
    });

    doc.end();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/saleinvoices/${fileName}`;

    res.json({ message: "Invoice generated successfully", url: fileUrl });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = { generateInvoiceController, generateSaleInvoiceController };

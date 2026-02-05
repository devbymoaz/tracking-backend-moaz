const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createCommercialInvoice = (data, filePath) => {
  return new Promise((resolve, reject) => {
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
      } = data;

      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

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
      
      // Vertical line dividing Exporter and Consignee
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
        
        const valueX = x + 90;
        const maxWidth = isLeftSide 
          ? centerX - valueX - 8
          : rightX - valueX - 8;
        
        doc.text(value || "", valueX, y, { width: maxWidth });
        
        const textHeight = doc.heightOfString(value || "", { width: maxWidth });
        const labelHeight = doc.heightOfString(label, { width: 85 });
        
        return Math.max(textHeight, labelHeight);
      }

      // Exporter details - left side
      const expLeftX = leftX + 8;
      let expY = expConsY + 40;
      const fieldSpacing = 5;

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

      // Draw dividers
      const maxBottomY = Math.max(expBottomY, consBottomY);
      
      doc
        .moveTo(centerX, expConsY)
        .lineTo(centerX, maxBottomY + 5)
        .stroke();

      doc
        .moveTo(leftX, maxBottomY + 5)
        .lineTo(rightX, maxBottomY + 5)
        .stroke();

      // ********* Items Table *********
      const tableStartY = maxBottomY + 15;
      const rowHeight = 18;
      const tableHeaderHeight = 18;
      
      doc
        .rect(
          leftX,
          tableStartY - tableHeaderHeight,
          rightX - leftX,
          tableHeaderHeight
        )
        .fillAndStroke("#f2f2f2", "#f2f2f2");

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

      doc.fillColor("#000000").font("Helvetica").fontSize(9);
      doc.text("Item", colX[0] + 5, tableStartY - tableHeaderHeight + 5);
      doc.text("Description of Goods", colX[1] + 5, tableStartY - tableHeaderHeight + 5);
      doc.text("Country of Origin", colX[2] + 5, tableStartY - tableHeaderHeight + 5);
      doc.text("Qty", colX[3] + 10, tableStartY - tableHeaderHeight + 5);
      doc.text("Part #", colX[4] + 10, tableStartY - tableHeaderHeight + 5);
      doc.text("Harmonised Code", colX[5] + 5, tableStartY - tableHeaderHeight + 5);
      doc.text("Unit Value", colX[6] + 5, tableStartY - tableHeaderHeight + 5);
      doc.text("Total", colX[7] + 5, tableStartY - tableHeaderHeight + 5);

      doc
        .moveTo(leftX, tableStartY)
        .lineTo(rightX, tableStartY)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();

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

      const tableEndY = tableStartY + items.length * rowHeight;
      doc
        .moveTo(leftX, tableEndY)
        .lineTo(rightX, tableEndY)
        .strokeColor("#000000")
        .lineWidth(1)
        .stroke();

      // ********* Remarks Section *********
      const remarksY = tableEndY + 15;

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Remarks:", leftX + 5, remarksY);
      doc.font("Helvetica").fontSize(9);
      doc.text(remarks || "SHIPPING PAID", leftX + 5, remarksY + 15);

      // ********* Signature Section *********
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Signature", leftX + 5, remarksY + 45);

      // ********* Totals Section *********
      const totalsBoxWidth = 160;
      const totalsBoxHeight = 75;
      const totalsX = rightX - totalsBoxWidth;
      const totalsY = mainBorderY + mainBorderHeight - 80;

      doc.lineWidth(1);
      doc.rect(totalsX, totalsY, totalsBoxWidth, totalsBoxHeight).stroke();

      doc
        .rect(totalsX, totalsY + 50, totalsBoxWidth, 25)
        .fillAndStroke("#f0f0f0", "#000000");

      const totalsTextX = totalsX + 8;
      const totalsValueX = totalsX + totalsBoxWidth - 60;

      doc.fillColor("#000000").font("Helvetica").fontSize(9);
      doc.text("Total Value of Goods", totalsTextX, totalsY + 28);

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Total", totalsTextX, totalsY + 57);

      const currency = exporter.currency || "USD";
      doc.font("Helvetica").fontSize(9);
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

      // ********* Footer *********
      const footerY = totalsY + totalsBoxHeight + 15;

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Commercial Invoice 2025", leftX, footerY);

      doc.font("Helvetica").fontSize(8);
      doc.text(new Date().toISOString().slice(0, 10), leftX + 180, footerY);
      doc.text("The item may be opened officially.", leftX + 280, footerY);

      doc.text("Page 1 of 1", rightX - 60, footerY);

      doc.end();
      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

const createSaleInvoice = (data, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        orderId,
        exporter,
        consignee,
        items,
        total,
        gross_total,
        additional,
        discount,
      } = data;

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Logo
      const logoPath = path.join(__dirname, "../assets/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 460, 25, { width: 100 });
      }

      // Header
      doc.fontSize(18).font("Helvetica-Bold").text("SALE INVOICE", 30, 30);
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
      const leftBlockH = drawBlock(doc, leftX, blockStartY, senderLines, 250);
      const rightBlockH = drawBlock(doc, rightX, blockStartY, receiverLines, 250);
      let afterBlockY = Math.max(leftBlockH, rightBlockH) + 20;

      doc.moveTo(30, afterBlockY).lineTo(570, afterBlockY).stroke();
      afterBlockY += 20;

      // ================= Items Table =================
      doc.fontSize(10).font("Helvetica-Bold");
      const tableTop = afterBlockY;
      
      const col1 = 30;  // Box#
      const col2 = 80;  // Name
      const col3 = 200; // Courier
      const col4 = 300; // Weight
      const col5 = 380; // Type
      const col6 = 480; // Total

      doc.text("No.", col1, tableTop);
      doc.text("Box Name", col2, tableTop);
      doc.text("Courier", col3, tableTop);
      doc.text("Weight", col4, tableTop);
      doc.text("Type", col5, tableTop);
      doc.text("Total", col6, tableTop);

      doc
        .moveTo(30, tableTop + 15)
        .lineTo(570, tableTop + 15)
        .stroke();

      let currentY = tableTop + 25;
      doc.font("Helvetica").fontSize(10);

      items.forEach((item, index) => {
        const itemName = item?.dimensions?.name || item.name || "-";
        const itemCourier = item.courier || "-";
        const itemWeight = item.weight || "-";
        const itemType = item.type || "-";
        const itemTotal = `${Number(item.actual_amount || item.total).toFixed(2)}`;

        doc.text((index + 1).toString(), col1, currentY);
        doc.text(itemName, col2, currentY, { width: 110 });
        doc.text(itemCourier, col3, currentY, { width: 90 });
        doc.text(itemWeight, col4, currentY, { width: 70 });
        doc.text(itemType, col5, currentY, { width: 90 });
        doc.text(itemTotal, col6, currentY);

        currentY += 20;
      });

      doc.moveTo(30, currentY).lineTo(570, currentY).stroke();
      currentY += 15;

      // ================= Summary Section =================
      const summaryX = 350;
      const valX = 480;
      doc.font("Helvetica");

      // Subtotal
      doc.text("Subtotal:", summaryX, currentY);
      doc.text(`${Number(gross_total).toFixed(2)}`, valX, currentY);
      currentY += 15;

      // Additional
      if (additional && Number(additional) > 0) {
        doc.text("Additional Charges:", summaryX, currentY);
        doc.text(`${Number(additional).toFixed(2)}`, valX, currentY);
        currentY += 15;
      }

      // Discount
      if (discount && Number(discount) > 0) {
        doc.text("Discount:", summaryX, currentY);
        doc.text(`-${Number(discount).toFixed(2)}`, valX, currentY);
        currentY += 15;
      }

      doc.font("Helvetica-Bold");
      doc.text("Total Amount:", summaryX, currentY);
      doc.text(`${Number(total).toFixed(2)}`, valX, currentY);
      currentY += 40;

      // ================= Payment Methods =================
      doc.fontSize(12).text("Payment Methods", 30, currentY);
      currentY += 15;
      
      const iconSize = 20;
      
      const revolutPath = path.join(__dirname, "../assets/revolut.png");
      if (fs.existsSync(revolutPath)) {
        doc.image(revolutPath, 30, currentY, { width: iconSize });
      }
      doc.fontSize(10).font("Helvetica").text("Revolut: @varamex", 30 + iconSize + 10, currentY + 5);
      
      const sumupPath = path.join(__dirname, "../assets/sumup.png");
      if (fs.existsSync(sumupPath)) {
        doc.image(sumupPath, 200, currentY, { width: iconSize });
      }
      doc.text("SumUp: Pay Link", 200 + iconSize + 10, currentY + 5);

      const cashPath = path.join(__dirname, "../assets/cash.png");
      if (fs.existsSync(cashPath)) {
        doc.image(cashPath, 350, currentY, { width: iconSize });
      }
      doc.text("Cash", 350 + iconSize + 10, currentY + 5);

      currentY += 40;

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
      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createCommercialInvoice, createSaleInvoice };

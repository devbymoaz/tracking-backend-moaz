
const { generateSaleInvoiceController } = require("./controllers/invoiceController");

const req = {
  body: {
    orderId: "TEST-123",
    exporter: { name: "Test Exporter", address: "123 Test St", country: "Ireland" },
    consignee: { name: "Test Consignee", address: "456 Test Ave", country: "Spain", phone: "123456789", email: "test@example.com" },
    items: [
      { description: "Test Item 1", quantity: 1, value: 10, weight: 1 },
      { description: "Test Item 2", quantity: 2, value: 20, weight: 2 }
    ],
    total: 50,
    fees: 5,
    gross_total: 55,
    currency: "EUR",
    paymentOption: "Credit Card",
    additional: 0,
    discount: 0
  },
  protocol: "http",
  get: (header) => "localhost:3000"
};

const res = {
  json: (data) => {
    console.log("Response JSON:", data);
    console.log("Test finished successfully");
    setTimeout(() => {
        console.log("Exiting...");
    }, 2000);
  },
  status: (code) => {
    console.log("Response Status:", code);
    return {
      json: (data) => {
        console.log("Response JSON (after status):", data);
        console.log("Test finished with status");
        setTimeout(() => {
            console.log("Exiting...");
        }, 2000);
      }
    };
  }
};

const next = (err) => {
  console.error("Next called with error:", err);
};

generateSaleInvoiceController(req, res, next);

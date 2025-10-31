import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Fetch all transactions
app.get("/transactions.js", async (req, res) => {
  try {
    const payments = await razorpay.payments.all({ count: 100 });
    res.json(payments.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5500"));



// $key_id = "rzp_test_RZiyLx8tDkY0FA";
// $key_secret = "iXn01Kf5oqVXE8qljEn65d3c";


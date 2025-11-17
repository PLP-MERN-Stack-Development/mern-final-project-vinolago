const axios = require("axios");
require('dotenv').config();

const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE, MPESA_CALLBACK_URL } = process.env;

// 🔹 Generate access token
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` },
  });
  return response.data.access_token;
}

// 🔹 Initiate STK Push
const initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, transactionId } = req.body;

    // Validate required fields
    if (!phone || !amount || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phone, amount, transactionId"
      });
    }

    const access_token = await getAccessToken();

    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    const stkRequest = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure amount is integer
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: "https://mtandao.co.ke/",
      AccountReference: `Escrow-${transactionId}`,
      TransactionDesc: `Invoice Payment - ${transactionId}`,
    };

    const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", stkRequest, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json({
      success: true,
      message: "STK push sent successfully. Enter PIN to complete.",
      MerchantRequestID: response.data.MerchantRequestID,
      CheckoutRequestID: response.data.CheckoutRequestID,
      transactionId: transactionId
    });
  } catch (err) {
    console.error('STK Push error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to initiate STK push",
      error: err.message
    });
  }
};

module.exports = { initiateStkPush };

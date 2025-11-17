const express = require('express');
const { initiateStkPush } = require('../middleware/mpesa');


const router = express.Router();

// STK Push endpoint
router.post('/stkpush', initiateStkPush);

// STK Query endpoint to check payment status
router.post('/stkquery', async (req, res) => {
  try {
    const { CheckoutRequestID } = req.body;

    // Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
    const tokenResponse = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // Query STK Push status
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

    const queryResponse = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: CheckoutRequestID
      })
    });

    const queryData = await queryResponse.json();

    res.json({
      success: true,
      resultCode: queryData.ResponseCode,
      resultDesc: queryData.ResponseDescription,
      status: queryData.ResultCode === "0" ? "success" : "failed"
    });
  } catch (error) {
    console.error('STK Query error:', error);
    res.status(500).json({ success: false, message: 'Failed to query payment status' });
  }
});

module.exports = router;

import React, { useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "500g Lemon Pickle", price: 100 },
  { id: 2, name: "500g Mango Pickle", price: 80 },
];

const BACKEND_URL = "https://razorpay-backend-0ngl.onrender.com"; // use your actual backend URL

function App() {
  const [quantities, setQuantities] = useState([0, 0]);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const handleAdd = (index) => {
    const updated = [...quantities];
    updated[index]++;
    setQuantities(updated);
  };

  const handleRemove = (index) => {
    const updated = [...quantities];
    if (updated[index] > 0) updated[index]--;
    setQuantities(updated);
  };

  const total = products.reduce(
    (sum, product, idx) => sum + product.price * quantities[idx],
    0
  );

  const handlePay = async () => {
    setLoading(true);
    setPaymentResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalAmount: total * 100 }), // Convert to paise
      });
      const order = await res.json();
      const options = {
        key: "rzp_test_RIyjeTmNCvUynj", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: (response) => {
          setLoading(false);
          setPaymentResult({
            success: true,
            message: `Payment successful!`,
          });
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#1976d2" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      setPaymentResult({
        success: false,
        message: "Payment failed",
      });
    }
  };

  return (
    <div className="app-container">
      {/* Compact, modern header */}
      <header className="header">
        <span role="img" aria-label="pickle" className="emoji"></span>
        <span className="title">Pickle Store</span>
      </header>
      <main className="content">
        <div className="products-grid">
          {products.map((product, idx) => (
            <div className="card" key={product.id}>
              <h2>{product.name}</h2>
              <p className="price">₹{product.price}</p>
              <div className="quantity-controls">
                <button onClick={() => handleRemove(idx)} disabled={quantities[idx] === 0}>
                  −
                </button>
                <span>{quantities[idx]}</span>
                <button onClick={() => handleAdd(idx)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="checkout">
          <p>
            Total Payable: <span className="highlight">₹{total}</span>
          </p>
          <button disabled={total === 0 || loading} onClick={handlePay}>
            {loading ? "Processing…" : "Pay Now"}
          </button>
          {/* Payment result indication */}
          {paymentResult && (
            <div className={paymentResult.success ? "result success" : "result failure"}>
              {paymentResult.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

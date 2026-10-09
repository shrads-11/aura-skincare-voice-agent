import { useState, useRef } from "react";
import "./App.css";
const orders = {
  "ORD-101": {
    customer: "Priya Sharma",
    product: "Vitamin C Serum (30ml)",
    amount: "₹699",
    status: "Out for Delivery",
    courier: "BlueDart",
    tracking: "BD-982103",
    expected: "by 6 PM today",
  },

  "ORD-102": {
    customer: "Rahul Verma",
    product: "Hydrating Sunscreen SPF 50",
    amount: "₹499",
    status: "Delivered",
    courier: "Delhivery",
    tracking: "DL-441029",
    expected: "14 days ago",
  },

  "ORD-103": {
    customer: "Ananya Patel",
    product: "Green Tea Face Wash + Toner",
    amount: "₹850",
    status: "Processing",
    courier: "",
    tracking: "",
    expected: "ordered 3 hours ago",
  },
};

function App() {
  const [callActive, setCallActive] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [ariaResponse, setAriaResponse] = useState("");
  const [callSummary, setCallSummary] = useState(null);

  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);

  const startCall = async () => {
    setConversation([]);
setTranscript("");
setOrderResult(null);
setAriaResponse("");
setCallSummary(null);
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      micStreamRef.current = stream;

      // Chrome speech recognition
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setStatus("Listening");
      };

      recognition.onresult = (event) => {
  let text = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    text += event.results[i][0].transcript;
  }

  text = text.trim();

  if (text) {
    setTranscript(text);
    setConversation((prev) => [
  ...prev,
  {
    speaker: "Customer",
    text: text,
  },
]);

    // Check if customer mentioned an order ID
    const orderMatch = text.toUpperCase().match(/ORD[- ]?(\d{3})/);

    if (orderMatch) {
      const orderId = `ORD-${orderMatch[1]}`;
      const order = orders[orderId];

if (order) {
  console.log("Order found:", order);

  const result = { orderId, ...order };
  setOrderResult(result);

  let response = "";

const lowerText = text.toLowerCase();

if (
  lowerText.includes("cancel") ||
  lowerText.includes("cancellation")
) {
  if (order.status === "Processing") {
    response =
      `Yes, your order ${orderId} can be cancelled because it is still being processed.`;
  } else {
    response =
      `I'm sorry, but order ${orderId} cannot be cancelled because it has already been shipped or is out for delivery.`;
  }
} 

else if (
  lowerText.includes("return") ||
  lowerText.includes("refund")
) {
  if (order.status === "Delivered") {
    response =
      `I'm sorry, but order ${orderId} was delivered 14 days ago. Aura Skincare accepts returns within 7 days of delivery for unopened and unused products.`;
  } else {
    response =
      `I can help you with the return policy. Returns are accepted within 7 days of delivery for unopened and unused products in their original packaging.`;
  }
}

else if (
  lowerText.includes("where") ||
  lowerText.includes("track") ||
  lowerText.includes("status") ||
  lowerText.includes("delivery")
) {
  if (order.courier) {
    response =
      `Your order ${orderId} is ${order.status.toLowerCase()} with ${order.courier}. ` +
      `It is expected ${order.expected}.`;
  } else {
    response =
      `Your order ${orderId} is currently ${order.status.toLowerCase()}. It was ${order.expected}.`;
  }
}

else {
  response =
    `I found your order ${orderId}. It is currently ${order.status.toLowerCase()}.`;
}

setAriaResponse(response);
setConversation((prev) => [
  ...prev,
  {
    speaker: "Aria",
    text: response,
  },
]);
const speech = new SpeechSynthesisUtterance(response);

const voices = window.speechSynthesis.getVoices();

const femaleVoice = voices.find(
  (voice) =>
    voice.lang.toLowerCase().includes("en-in") &&
    (
      voice.name.toLowerCase().includes("female") ||
      voice.name.toLowerCase().includes("heera") ||
      voice.name.toLowerCase().includes("priya")
    )
);

if (femaleVoice) {
  speech.voice = femaleVoice;
}

speech.lang = "en-IN";
speech.rate = 0.9;
speech.pitch = 1.1;
speech.volume = 1;

window.speechSynthesis.cancel();


setTimeout(() => {
  window.speechSynthesis.speak(speech);
}, 100);
} else {
  console.log("Order not found:", orderId);

  setOrderResult(null);
  setAriaResponse(
    `I couldn't find an order with the ID ${orderId}. Please check the order number and try again.`
  );
}
} else {
  let response = "";
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("return") ||
    lowerText.includes("refund")
  ) {
    response =
      "Aura Skincare accepts returns within 7 days of delivery for unopened and unused products in their original packaging.";
  } else if (
    lowerText.includes("shipping") ||
    lowerText.includes("delivery") ||
    lowerText.includes("deliver")
  ) {
    response =
      "We offer free shipping on orders above ₹499. Orders below ₹499 have a ₹50 shipping fee, and standard delivery takes 3 to 5 business days.";
  } else if (
    lowerText.includes("cancel") ||
    lowerText.includes("cancellation")
  ) {
    response =
      "Orders can be cancelled only while they are being processed. Once shipped or out for delivery, they cannot be cancelled.";
  } else if (
    lowerText.includes("cod") ||
    lowerText.includes("cash on delivery") ||
    lowerText.includes("payment")
  ) {
    response =
      "Cash on Delivery is available for orders up to ₹2,500. You can pay using cash or UPI.";
  } else {
    response =
      "I'm sorry, I can help with Aura Skincare orders, shipping, returns, cancellations, and payments. Could you please tell me what you need help with?";
  }

  setAriaResponse(response);

  setConversation((prev) => [
    ...prev,
    {
      speaker: "Aria",
      text: response,
    },
  ]);

  const speech = new SpeechSynthesisUtterance(response);

  const voices = window.speechSynthesis.getVoices();

  const femaleVoice = voices.find(
    (voice) =>
      voice.lang.toLowerCase().includes("en-in") &&
      (
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("heera") ||
        voice.name.toLowerCase().includes("priya")
      )
  );

  if (femaleVoice) {
    speech.voice = femaleVoice;
  }

  speech.lang = "en-IN";
  speech.rate = 0.9;
  speech.pitch = 1.1;
  speech.volume = 1;

  window.speechSynthesis.cancel();

  setTimeout(() => {
    window.speechSynthesis.speak(speech);
  }, 100);
}
  }
};

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed") {
          alert("Please allow microphone permission in Chrome.");
        }

        if (event.error === "network") {
          console.log(
            "Chrome speech service returned a network error."
          );
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };

      recognitionRef.current = recognition;

      setCallActive(true);

      // Start recognition
     
      // Start recognition
      recognition.start();

    } catch (error) {
      console.error("Microphone error:", error);

      alert("Could not access the microphone.");
    }
  };

  const endCall = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      micStreamRef.current = null;
    }
setCallSummary({
  customer_intent: orderResult ? "Order support" : "General enquiry",
  order_id: orderResult ? orderResult.orderId : null,
  resolution_status: ariaResponse ? "Resolved" : "Pending",
  call_summary: ariaResponse
    ? ariaResponse
    : "Customer contacted Aura Skincare for support."
});
    setCallActive(false);
    setStatus("Ready");
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>Aura Skincare</h1>
          <p>AI Customer Support Agent</p>
        </div>

        <div className="ready-badge">
          ● Ready
        </div>
      </header>

      <main className="main-container">

        {/* Agent */}
        <section className="agent-card">

          <div className="agent-icon">
            A
          </div>

          <h2>Aria</h2>

          <p className="agent-description">
            Friendly, professional and concise AI customer support
            specialist for Aura Skincare.
          </p>

          {/* Status */}
          <div className="status-box">
            {status === "Ready" && "🟢 Ready to start"}
            {status === "Listening" && "🎤 Listening..."}
            {status === "Thinking" && "🧠 Thinking..."}
            {status === "Speaking" && "🔊 Speaking..."}
          </div>

          {/* Call Buttons */}
          <div className="call-buttons">

            <button
              className="start-button"
              onClick={startCall}
              disabled={callActive}
            >
              🎙️ Start Call
            </button>

            <button
              className="end-button"
              onClick={endCall}
              disabled={!callActive}
            >
              End Call
            </button>

          </div>

        </section>

        {/* Test Orders */}
        <section className="orders-section">

          <h2>Test Orders</h2>

          <p className="section-description">
            Use these orders while testing the AI agent.
          </p>

          <div className="orders-grid">

            <div className="order-card">
              <h3>ORD-101</h3>
              <p><strong>Customer:</strong> Priya Sharma</p>
              <p><strong>Product:</strong> Vitamin C Serum (30ml)</p>
              <p><strong>Amount:</strong> ₹699</p>
              <p><strong>Status:</strong> Out for Delivery</p>
              <p><strong>Courier:</strong> BlueDart</p>
              <p><strong>Tracking:</strong> BD-982103</p>
              <p><strong>Expected:</strong> By 6 PM today</p>
            </div>

            <div className="order-card">
              <h3>ORD-102</h3>
              <p><strong>Customer:</strong> Rahul Verma</p>
              <p><strong>Product:</strong> Hydrating Sunscreen SPF 50</p>
              <p><strong>Amount:</strong> ₹499</p>
              <p><strong>Status:</strong> Delivered</p>
              <p><strong>Courier:</strong> Delhivery</p>
              <p><strong>Tracking:</strong> DL-441029</p>
              <p><strong>Delivered:</strong> 14 days ago</p>
            </div>

            <div className="order-card">
              <h3>ORD-103</h3>
              <p><strong>Customer:</strong> Ananya Patel</p>
              <p><strong>Product:</strong> Green Tea Face Wash + Toner</p>
              <p><strong>Amount:</strong> ₹850</p>
              <p><strong>Status:</strong> Processing</p>
              <p><strong>Ordered:</strong> 3 hours ago</p>
              <p><strong>Cancellation:</strong> Eligible</p>
            </div>

          </div>

        </section>

        {/* Transcript */}
        <section className="transcript-section">

          <h2>Call Transcript</h2>

          <div className="transcript-box">

           {conversation.length === 0 ? (
  <p>Start a call and speak to Aria.</p>
) : (
  <div className="conversation-list">
    {conversation.map((message, index) => (
      <div className="transcript-message" key={index}>
        <strong>{message.speaker}:</strong> {message.text}
      </div>
    ))}
  </div>
)}

          </div>
          {orderResult && (
  <div className="order-result">
    <h3>Order Details</h3>

    <p><strong>Order ID:</strong> {orderResult.orderId}</p>
    <p><strong>Customer:</strong> {orderResult.customer}</p>
    <p><strong>Product:</strong> {orderResult.product}</p>
    <p><strong>Amount:</strong> {orderResult.amount}</p>
    <p><strong>Status:</strong> {orderResult.status}</p>

    {orderResult.courier && (
      <p><strong>Courier:</strong> {orderResult.courier}</p>
    )}

    {orderResult.tracking && (
      <p><strong>Tracking:</strong> {orderResult.tracking}</p>
    )}

    <p><strong>Expected:</strong> {orderResult.expected}</p>
    <div className="aria-response">
  <strong>Aria:</strong> {ariaResponse}
</div>
  </div>
)}
{callSummary && (
  <div className="call-summary">
    <h3>Call Summary</h3>

    <pre>
      {JSON.stringify(callSummary, null, 2)}
    </pre>
  </div>
  
)}

</section>
      </main>
    </div>
  );
}
export default App;
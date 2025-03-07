import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import './Help.css';

export default function Help(){
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      question: "How do I book a ride?",
      answer:
        "Open the app, enter your destination, choose your ride type, and tap 'Book Now'. You'll be matched with a nearby driver.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards, digital wallets, and in some regions, cash payments.",
    },
    {
      question: "How do I contact my driver?",
      answer:
        "Once matched, you can contact your driver through the in-app messaging or calling feature.",
    },
    {
      question: "How do I report an issue with my ride?",
      answer:
        "Go to 'Trip History', select the ride, and tap 'Report an Issue'. Follow the prompts to describe your concern.",
    },
  ];

  return (
    <main className="h_w-full h_min-h-screen h_bg-gray-50">
      <div className="h_max-w-3xl h_mx-auto h_px-4 h_py-12">
        <h1 className="h_text-3xl h_font-bold h_text-gray-900 h_mb-12 h_text-center">
          Help Center
        </h1>
        {/* FAQ Section */}
        <section className="h_mb-16">
          <h2 className="h_text-2xl h_font-semibold h_mb-8 h_text-center">
            Frequently Asked Questions
          </h2>
          <div className="h_space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="h_border h_border-gray-200 h_rounded-lg h_bg-white h_shadow-sm"
              >
                <button
                  className="h_w-full h_p-4 h_flex h_justify-between h_items-center h_text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="h_font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="h_text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="h_text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="h_p-4 h_pt-0 h_text-gray-600 h_border-t h_border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        {/* Contact Support */}
        <section>
          <h2 className="h_text-2xl h_font-semibold h_mb-8 h_text-center">
            Still Need Help?
          </h2>
          <div className="h_grid h_grid-cols-1 h_md:grid-cols-3 h_gap-6">
            <div className="h_p-6 h_text-center h_border h_border-gray-200 h_rounded-lg h_bg-white h_shadow-sm h_hover:shadow-md h_transition-shadow">
              <MessageCircle className="h_mx-auto h_mb-4 h_text-blue-500" size={24} />
              <h3 className="h_font-medium h_mb-2">Chat Support</h3>
              <p className="h_text-sm h_text-gray-600">Available 24/7</p>
            </div>
            <div className="h_p-6 h_text-center h_border h_border-gray-200 h_rounded-lg h_bg-white h_shadow-sm h_hover:shadow-md h_transition-shadow">
              <Phone className="h_mx-auto h_mb-4 h_text-blue-500" size={24} />
              <h3 className="h_font-medium h_mb-2">Phone Support</h3>
              <p className="h_text-sm h_text-gray-600">1-800-RIDE-NOW</p>
            </div>
            <div className="h_p-6 h_text-center h_border h_border-gray-200 h_rounded-lg h_bg-white h_shadow-sm h_hover:shadow-md h_transition-shadow">
              <Mail className="h_mx-auto h_mb-4 h_text-blue-500" size={24} />
              <h3 className="h_font-medium h_mb-2">Email Support</h3>
              <p className="h_text-sm h_text-gray-600">support@rideapp.com</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

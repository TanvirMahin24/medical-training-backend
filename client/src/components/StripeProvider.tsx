import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_CONFIG } from "../config/stripe";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProvider;

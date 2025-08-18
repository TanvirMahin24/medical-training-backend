import React from "react";
import { CreditCard } from "lucide-react";

const Subscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor user subscription status and billing
        </p>
      </div>

      <div className="admin-card text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Subscriptions Management
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Full subscriptions management interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;

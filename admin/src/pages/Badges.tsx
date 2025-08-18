import React from "react";
import { Award, Plus } from "lucide-react";

const Badges: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage achievement badges
          </p>
        </div>
        <button className="admin-button-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Badge
        </button>
      </div>

      <div className="admin-card text-center py-12">
        <Award className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Badges Management
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Full badges management interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default Badges;

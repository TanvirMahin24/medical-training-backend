import React from "react";
import { FileText, Plus } from "lucide-react";

const Cases: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Cases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage medical training cases
          </p>
        </div>
        <button className="admin-button-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Case
        </button>
      </div>

      <div className="admin-card text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Cases Management
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Full cases management interface coming soon...
        </p>
      </div>
    </div>
  );
};

export default Cases;

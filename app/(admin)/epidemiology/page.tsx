'use client';

import React from 'react';
import { Map, AlertTriangle } from 'lucide-react';

// This is a placeholder for a real map component like Mapbox or Leaflet.
const MockMap = () => (
  <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
    <p className="text-gray-500">Map Placeholder</p>
  </div>
);

export default function EpidemiologyPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="text-red-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Family Infection Mapping</h3>
            <p className="text-sm text-gray-500">Track potential outbreaks based on family contacts.</p>
          </div>
        </div>
        <MockMap />
        {/* In a real app, this would show a list of alerts and allow admins to toggle clinic access */}
      </div>
    </div>
  );
}

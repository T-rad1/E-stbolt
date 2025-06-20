import React, { useState } from 'react';
import { Brain, Image as ImageIcon, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIFloorPlanPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [floorPlan, setFloorPlan] = useState<string | null>(null);
  const [specifications, setSpecifications] = useState({
    bedrooms: '2',
    bathrooms: '2',
    squareFeet: '1000',
    style: 'modern',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setFloorPlan('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <Brain className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              Advanced Floor Plan Designer
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Generate custom 2D floor plans using our advanced AI technology
            </p>
            <div className="mt-4">
              <Link
                to="/smart-assistant"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Smart Assistant Instead
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bedrooms
                </label>
                <select
                  value={specifications.bedrooms}
                  onChange={(e) => setSpecifications({ ...specifications, bedrooms: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Bedroom{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bathrooms
                </label>
                <select
                  value={specifications.bathrooms}
                  onChange={(e) => setSpecifications({ ...specifications, bathrooms: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 1.5, 2, 2.5, 3, 3.5].map((num) => (
                    <option key={num} value={num}>
                      {num} Bathroom{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  value={specifications.squareFeet}
                  onChange={(e) => setSpecifications({ ...specifications, squareFeet: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter square footage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={specifications.style}
                  onChange={(e) => setSpecifications({ ...specifications, style: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="modern">Modern</option>
                  <option value="traditional">Traditional</option>
                  <option value="contemporary">Contemporary</option>
                  <option value="minimalist">Minimalist</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Generate 2D Floor Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {floorPlan && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated 2D Floor Plan</h2>
            <div className="relative">
              <img
                src={floorPlan}
                alt="Generated Floor Plan"
                className="w-full rounded-lg"
              />
              <button
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                onClick={() => window.open(floorPlan, '_blank')}
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                2D floor plan generated based on your specifications:
                {specifications.bedrooms} bedrooms,
                {specifications.bathrooms} bathrooms,
                {specifications.squareFeet} sq ft,
                {specifications.style} style
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFloorPlanPage;
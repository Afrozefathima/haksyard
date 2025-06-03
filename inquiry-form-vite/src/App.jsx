import React, { useState, useEffect, useRef } from 'react';
import { carModels } from '../src/carData';

export default function App() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    parts: [], // parts as array
    name: '',
    phone: '',
    email: '',
    location: '',
  });
  const [customPart, setCustomPart] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPart, setSelectedPart] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customPartInputRef = useRef(null);
  


  const availableParts = [
    'Engine',
    'Transmission',
    'Brake Pads',
    'Brake Discs',
    'Oil Filter',
    'Air Filter',
    'Spark Plugs',
    'Battery',
    'Alternator',
    'Radiator',
    'Water Pump',
    'Fuel Pump',
    'Fuel Filter',
    'Shock Absorbers',
    'Suspension',
    'Timing Belt/Chain',
    'Clutch Kit',
    'Headlights',
    'Tail Lights',
    'Windshield Wipers',
    'Side Mirrors',
    'custom',
  ];

  const [selectedPartsList, setSelectedPartsList] = useState([]);
  const handleAddPart = () => {
    if (selectedPart === 'custom') {
      setShowCustomInput(true);
      setTimeout(() => {
        customPartInputRef.current?.focus();
      }, 0);
    } else if (selectedPart && !formData.parts.includes(selectedPart)) {
      setFormData((prev) => ({
        ...prev,
        parts: [...prev.parts, selectedPart],
      }));
      setSelectedPart('');
    }
  };



  const handleRemovePart = (partToRemove) => {
    setSelectedPartsList(prev => prev.filter(part => part !== partToRemove));
  };
  // Handle input changes for make, model, year, and contact fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    let update = { [name]: value };
    if (name === 'make') {
      // Reset model and year when make changes
      update.model = '';
      update.year = '';
    }
    if (name === 'model') {
      // Reset year when model changes
      update.year = '';
    }
    setFormData((prev) => ({ ...prev, ...update }));
  };


  // Handle custom part input text change
  const handleCustomPartChange = (e) => {
    setCustomPart(e.target.value);
  };

  // Add custom part to parts array by replacing 'custom'
  const addCustomPart = () => {
    const trimmed = customPart.trim();
    if (trimmed) {
      const full = `Other: ${trimmed}`;
      if (!formData.parts.includes(full)) {
        setFormData((prev) => ({
          ...prev,
          parts: [...prev.parts, full],
        }));
      }
    }
    setShowCustomInput(false);
    setSelectedPart('');
    setCustomPart('');
  };

  // Remove a part from the selected parts list
  const removePart = (part) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p !== part),
    }));

    if (part.startsWith('Other: ')) {
      setCustomPart('');
    }
  };

  // Auto focus custom part input when 'custom' is selected
  useEffect(() => {
    if (formData.parts.includes('custom') && customPartInputRef.current) {
      customPartInputRef.current.focus();
    }
  }, [formData.parts]);

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submittedAt = new Date().toLocaleString();

    const payload = [
      formData.make,
      formData.model,
      formData.year,
      formData.parts.join(', '),
      formData.name,
      formData.phone,
      formData.email,
      formData.location,
      submittedAt,
    ];

    try {
      const scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
      const res = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      setRefNumber(result.referenceNumber);

      alert(`✅ Submitted! Your Reference Number: ${result.referenceNumber}`);

      // Reset form and step
      setFormData({
        make: '',
        model: '',
        year: '',
        parts: [],
        name: '',
        phone: '',
        email: '',
        location: '',
      });
      setCustomPart('');
      setStep(1);
    } catch (err) {
      alert('Submission error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get model options for selected make
  const getModelOptions = () => (formData.make ? Object.keys(carModels[formData.make]) : []);

  // Get year options from startYear to current year descending
  const getYearOptions = () => {
    const start = carModels[formData.make]?.[formData.model]?.startYear;
    const now = new Date().getFullYear();
    return start ? Array.from({ length: now - start + 1 }, (_, i) => now - i) : [];
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Car Parts Request</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Make, Model, Year */}
        {step === 1 && (
          <>
            <div>
              <label htmlFor="make" className="block text-gray-700 mb-1 font-medium">
                Select Make
              </label>
              <select
                id="make"
                name="make"
                onChange={handleChange}
                value={formData.make}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Make</option>
                {Object.keys(carModels).map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="model" className="block text-gray-700 mb-1 font-medium">
                Select Model
              </label>
              <select
                id="model"
                name="model"
                onChange={handleChange}
                value={formData.model}
                required
                disabled={!formData.make}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Model</option>
                {getModelOptions().map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-gray-700 mb-1 font-medium">
                Select Year
              </label>
              <select
                id="year"
                name="year"
                onChange={handleChange}
                value={formData.year}
                required
                disabled={!formData.model}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select Year</option>
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-3 rounded-md font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors duration-300"
            >
              Next
            </button>
          </>
        )}

        {/* Step 2: Parts multi-select */}
        {step === 2 && (
          <>
            <div className="space-y-4">
              {/* Part Select */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="border border-gray-300 p-2 rounded-md w-4/5"
                >
                  <option value="">Select a part</option>
                  {availableParts.map((part) => (
                    <option key={part} value={part}>
                      {part === 'custom' ? 'Other (Custom)' : part}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddPart}
                  className="bg-blue-600 text-white px-4 py-2 w-1/5 rounded-md hover:bg-blue-700 transition"
                >
                  Add Part
                </button>
              </div>

              {/* Custom part input */}
              {showCustomInput && (
                <div className="mt-3">
                  <label
                    htmlFor="customPart"
                    className="block text-gray-700 mb-1 font-medium"
                  >
                    Enter Custom Part Name
                  </label>
                  <input
                    ref={customPartInputRef}
                    type="text"
                    id="customPart"
                    value={customPart}
                    onChange={handleCustomPartChange}
                    onBlur={addCustomPart}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomPart();
                      }
                    }}
                    placeholder="Type your part name and press Enter"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}

              {/* Selected Parts List */}
              {formData.parts.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-800 mb-2">Selected Parts:</p>
                  <ul className="flex flex-wrap gap-2">
                    {formData.parts.map((part) => (
                      <li
                        key={part}
                        className="inline-flex items-center bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {part}
                        <button
                          type="button"
                          onClick={() => removePart(part)}
                          className="ml-2 text-yellow-900 hover:text-yellow-700 focus:outline-none"
                          aria-label={`Remove ${part}`}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 rounded-md font-semibold text-yellow-600 border border-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={nextStep}
                disabled={formData.parts.length === 0}
                className={`px-6 py-3 rounded-md font-semibold text-white ${formData.parts.length === 0
                    ? 'bg-yellow-300 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                  } transition-colors`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Contact details */}
        {step === 3 && (
          <>
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={handleChange}
                value={formData.name}
                required
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                required
                placeholder="Your Phone Number"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                required
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-gray-700 mb-1 font-medium">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                onChange={handleChange}
                value={formData.location}
                required
                placeholder="Your Location"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 rounded-md font-semibold text-yellow-600 border border-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-md font-semibold text-white ${loading ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                  } transition-colors`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Submission success */}
        {step === 4 && (
          <div className="text-center p-6 bg-yellow-50 rounded-md border border-yellow-300">
            <h3 className="text-2xl font-semibold mb-4 text-yellow-700">Thank you!</h3>
            <p className="mb-2">Your inquiry has been submitted successfully.</p>
            <p>
              Your Reference Number: <strong>{refNumber}</strong>
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 px-6 py-3 rounded-md font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

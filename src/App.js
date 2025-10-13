import React, { useState, useEffect, useRef } from 'react';
import { carModels } from '../src/carData';
import PhoneInput from 'react-phone-input-2';
import { cities } from './cities';

const brands = Object.entries(carModels).map(([make, data]) => ({
  name: make,
  href: `/`,
  src: `/img/car-logos/${data.image}`,
  alt: `${make} logo`,
}));


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
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [showCustomMakeInput, setShowCustomMakeInput] = useState(false);
  const [showCustomModelInput, setShowCustomModelInput] = useState(false);
  const customMakeRef = useRef(null);
  const customModelRef = useRef(null);
  const [customYear, setCustomYear] = useState('');
  const [showCustomYearInput, setShowCustomYearInput] = useState(false);
  const customYearRef = useRef(null);

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
      if (value === 'custom') {
        // Show custom make input
        setShowCustomMakeInput(true);
        setFormData(prev => ({ ...prev, make: '', model: '', year: '' }));

        // Show custom model and year inputs
        setShowCustomModelInput(true);
        setCustomModel('');
        setShowCustomYearInput(true);
        setCustomYear('');

        setTimeout(() => customMakeRef.current?.focus(), 0);
      } else {
        setShowCustomMakeInput(false);
        setShowCustomModelInput(false);
        setShowCustomYearInput(false);
        update.model = '';
        update.year = '';
      }
    }

    if (name === 'model') {
      if (value === 'custom') {
        setShowCustomModelInput(true);
        setCustomModel('');
        setShowCustomYearInput(true);
        setCustomYear('');
        setTimeout(() => customModelRef.current?.focus(), 0);
      } else {
        setShowCustomModelInput(false);
        setShowCustomYearInput(false);
        update.year = '';
      }
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
  const getModelOptions = () => {
    if (!formData.make || formData.make === 'custom') return [];
    return Object.keys(carModels[formData.make] || {});
  };

  // Get year options from startYear to current year descending
  const getYearOptions = () => {
    const start = carModels[formData.make]?.[formData.model]?.startYear;
    const now = new Date().getFullYear();
    return start ? Array.from({ length: now - start + 1 }, (_, i) => now - i) : [];
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className='mt-10 xs:mx-3 xxs:mx-2 sm:mx-3 md:mx-5 mx-10'>
      <div className="max-w-3xl mx-auto p-6 shadow-md rounded-md font-sans">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Car Parts Request</h2>
        <div className="relative flex justify-between items-center mb-10 max-w-xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 z-0 -translate-y-1/2" />

          {[1, 2, 3].map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all
          ${step === s ? 'bg-blue-500 text-white' :
                    step > s ? 'bg-green-500 text-white' :
                      'bg-gray-300 text-gray-600'}
        `}
              >
                {s}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Make, Model, Year */}
          {step === 1 && (
            <>
              {/* Make */}
              <div>
                <label htmlFor="make" className="block text-gray-700 mb-1 font-medium">
                  Select Make
                </label>
                {!showCustomMakeInput ? (
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
                      <option key={make} value={make}>{make}</option>
                    ))}
                    <option value="custom">Other (Custom)</option>
                  </select>
                ) : (
                  <input
                    ref={customMakeRef}
                    type="text"
                    placeholder="Enter custom make"
                    value={customMake}
                    onChange={(e) => setCustomMake(e.target.value)}
                    onBlur={() => {
                      if (customMake.trim()) setFormData(prev => ({ ...prev, make: customMake.trim() }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-gray-700 mb-1 font-medium">
                  Select Model
                </label>
                {!showCustomModelInput ? (
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
                      <option key={model} value={model}>{model}</option>
                    ))}
                    {formData.make && <option value="custom">Other (Custom)</option>}
                  </select>
                ) : (
                  <input
                    ref={customModelRef}
                    type="text"
                    placeholder="Enter custom model"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    onBlur={() => {
                      if (customModel.trim()) setFormData(prev => ({ ...prev, model: customModel.trim() }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}
              </div>


              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-gray-700 mb-1 font-medium">
                  Select Year
                </label>

                {!showCustomYearInput ? (
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
                      <option key={year} value={year}>{year}</option>
                    ))}
                    {formData.model && <option value="custom">Other (Custom)</option>}
                  </select>
                ) : (
                  <input
                    ref={customYearRef}
                    type="text"
                    placeholder="Enter custom year"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    onBlur={() => {
                      if (customYear.trim()) setFormData(prev => ({ ...prev, year: customYear.trim() }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                )}
              </div>


              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.make || !formData.model || !formData.year}
                className={`w-full py-3 rounded-md font-semibold transition-colors duration-300 ${formData.make && formData.model && formData.year
                  ? 'text-white bg-green-700 hover:bg-green-600'
                  : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                  }`}
              >
                Next
              </button>
            </>
          )}


          {/* Step 2: Parts multi-select */}
          {step === 2 && (
            <>
              <div className="space-y-4 xs:space-y-2">
                {/* Part Select */}
                <div className="flex items-center gap-4">
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-4/5 xs:w-1/2"
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
                    className="bg-blue-600 text-white px-4 py-2 w-1/5 xs:w-1/2 rounded-md hover:bg-blue-700 transition"
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
                  className="px-6 py-3 rounded-md font-semibold text-black border border-[#828487] hover:bg-red-500 transition-colors"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={formData.parts.length === 0}
                  className={`px-6 py-3 rounded-md font-semibold text-white ${formData.parts.length === 0
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-700 hover:bg-green-600 '
                    } transition-colors  `}
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
                <PhoneInput
                  country={'ae'}
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                  inputClass="w-full border-gray-300 focus:ring-2 focus:ring-yellow-400"
                  containerClass="w-full"
                  inputStyle={{
                    width: '100%',
                    padding: '7px',
                    borderRadius: '0.375rem',
                    border: '1px solid #D1D5DB',
                  }}
                  required
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
                  className="px-6 py-3 rounded-md font-semibold text-black border border-[#828487] hover:bg-red-500 transition-colors"
                >
                  Back
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
      <div className='max-w-5xl mx-auto'>
        <ul className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-1 xxs:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {brands.map((brand) => (
            <li key={brand.name}>
              <a
                href={brand.href}
                className="block border h-full hover:border-lime-400 py-2"
                aria-label={`${brand.name} spare parts`}
              >
                <figure className="flex flex-col items-center justify-between">

                  <figcaption className="text-center mt-2 w-3/5 font-bold  text-xl rounded-sm px-2 py-1">
                    {brand.name}
                  </figcaption>
                </figure>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr className='my-10' />

      <div className='max-w-5xl mx-auto'>
        <ul className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-1 xxs:grid-cols-2 md:grid-cols-4 gap-4 my-10">
          {cities.map((city) => (
            <li key={city.id}>
              <a
                href={city.link} // use 'link' from your city object
                className="block border h-full hover:border-lime-400 py-2"
                aria-label={`${city.city} map`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <figure className="flex flex-col items-center justify-center">

                  <figcaption className="text-center mt-2 w-3/5 font-bold  text-xl rounded-sm px-2 py-1">
                    {city.city}
                  </figcaption>
                </figure>
              </a>
            </li>
          ))}
        </ul>
      </div>


    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';



<h2> Buy or Sell Online Bila Wasi Wasi.Use Escrow</h2 >

export default function SignUpForm() {

    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [formData, setFormData] = useState({
        role: '',
        assetType: '',
        price: '',
    });

    const [errors, setErrors] = useState({})


    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData({ ...formData, [name]: value })
        setErrors({}) // clear errors on input

    };

    const validate = () => {
        let newErrors = [];
        const price = Number(formData.price);

        if (!formData.role) newErrors.role = 'Please select selling or buying';
        if (!formData.assetType) newErrors.assetType = 'Please select an asset';
        if (!formData.price || isNaN(price) || price <= 0)
            newErrors.price = 'Please enter a valid price';
        if (price > 100000) newErrors.price = 'Transactions above KES 100, 000 are not allowed'
        return newErrors;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        if (!user) {
            localStorage.setItem('pendingSubmission', JSON.stringify(formData));
            navigate('./login')
        } else {
            console.log('Submitting form', formData);
        }
    };

    return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Buy and sell anything online without fear of reversal or scams
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="text-gray-700 font-medium">I'm</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="selling">Selling</option>
            <option value="buying">Buying</option>
          </select>
          <select
            name="assetType"
            value={formData.assetType}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">Select item</option>
            <option value="domain">domain</option>
            <option value="website">website</option>
            <option value="youtube channel">YouTube channel</option>
            <option value="social handle">social handle</option>
            <option value="contracted service">contracted service</option>
          </select>
          <label className="text-gray-700 font-medium">for KES</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-24 border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="22000"
            min='1'
            max='100000'
            required
          />
        </div>

        {/* Error messages */}
        <div className="text-sm text-red-600 space-y-1">
          {errors.role && <div>{errors.role}</div>}
          {errors.assetType && <div>{errors.assetType}</div>}
          {errors.price && <div>{errors.price}</div>}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Start Transaction
        </button>
      </form>
    </div>
    )
}
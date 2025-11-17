import React from 'react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';

const DealForm = ({ formData, setFormData, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimals (max 2 decimal places)
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFormData({ ...formData, price: value });
    }
  };

  const handlePriceBlur = () => {
    const value = parseFloat(formData.price);
    if (!isNaN(value)) {
      setFormData({ ...formData, price: value.toFixed(2) });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Transaction Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="transactionTitle"
          value={formData.transactionTitle}
          onChange={handleChange}
          placeholder="e.g. Buying example.co.ke domain"
          required
        />
      </div>

      {/* Role and Asset Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            My role <span className="text-red-500">*</span>
          </label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset type <span className="text-red-500">*</span>
          </label>
          <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="app">App</SelectItem>
              <SelectItem value="saas business">Saas business</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset Title + Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="assetTitle"
            value={formData.assetTitle}
            onChange={handleChange}
            placeholder="example.co.ke"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (KES) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#163300]">
            <span className="px-3 text-gray-500">KES</span>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className="flex-1 px-3 py-2 outline-none rounded-r-lg"
              min="1"
              placeholder="0.00"
              required
            />
          </div>
        </div>
      </div>

      {/* Terms + Deadline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms <span className="text-red-500">*</span>
          </label>
          <Select value={formData.terms} onValueChange={(value) => setFormData({ ...formData, terms: value })}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Payment</SelectItem>
              <SelectItem value="staged">Staged (Milestones)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline <span className="text-red-500">*</span>
            <span className="relative group cursor-pointer text-[#9fe870] font-bold ml-1" title="You must fund escrow by the deadline, or the deal will automatically expire.">
              ?
            </span>
          </label>
          <Input
            type="date"
            name="deadline"
            min={new Date().toISOString().split("T")[0]}
            max={(() => {
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 7);
              return maxDate.toISOString().split("T")[0];
            })()}
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Asset Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="assetDescription"
          placeholder="e.g. Online business"
          value={formData.assetDescription}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163300]"
          rows="3"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" className='cursor-pointer'>
          Add Item →
        </Button>
      </div>
    </form>
  );
};

export default DealForm;
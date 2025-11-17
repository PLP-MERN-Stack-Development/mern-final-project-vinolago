import { useState } from "react";

export default function CreateDeal() {
  const [form, setForm] = useState({
    assetType: "Domain",
    title: "",
    description: "",
    price: "",
    sellerContact: "",
    terms: "single",
    deadline: "",
    proof: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validate = () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Asset title is required.";
    if (!form.description) newErrors.description = "Description is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      newErrors.price = "Enter a valid price greater than 0.";
    }
    if (!form.sellerContact.match(/^[\w.-]+@[\w.-]+\.\w+$|^\+?\d{10,15}$/)) {
      newErrors.sellerContact = "Enter a valid phone or email.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Backend API call placeholder
    const payload = { ...form, status: "PENDING_PAYMENT" };
    console.log("Submitting deal:", payload);

    // TODO: Replace with API call e.g.
    // const res = await fetch("/api/deals", { method: "POST", body: JSON.stringify(payload) })
    // const data = await res.json()

    alert("Deal created. Redirecting to M-Pesa payment flow...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-4">Create Escrow Deal</h1>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium">Asset Type</label>
              <select
                name="assetType"
                value={form.assetType}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              >
                <option>Domain</option>
                <option>Website</option>
                <option>Code Repo</option>
                <option>Social Handle</option>
                <option>Other</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium">Asset Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="example.co.ke"
                className="mt-1 block w-full border rounded-md p-2"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium">Asset Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium">Price (KES)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            {/* Seller Contact */}
            <div>
              <label className="block text-sm font-medium">Seller Contact</label>
              <input
                type="text"
                name="sellerContact"
                value={form.sellerContact}
                onChange={handleChange}
                placeholder="Email or phone"
                className="mt-1 block w-full border rounded-md p-2"
              />
              {errors.sellerContact && <p className="text-red-500 text-sm">{errors.sellerContact}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="block text-sm font-medium">Payment Terms</label>
              <select
                name="terms"
                value={form.terms}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              >
                <option value="single">Single Payment</option>
                <option value="staged">Staged / Milestones</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium">Attach Proof (optional)</label>
              <input
                type="file"
                name="proof"
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Create Deal & Request Payment
              </button>
              <button
                type="button"
                className="border px-4 py-2 rounded-lg shadow hover:bg-gray-100"
                onClick={() => alert("Draft saved!")}
              >
                Save Draft
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              You will be prompted to complete payment via M-Pesa after creating the deal.
            </p>
          </form>
        </div>

        {/* Sidebar Help */}
        <aside className="bg-white shadow rounded-xl p-6">
          <h2 className="font-semibold mb-2">How Escrow Works</h2>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li>Create a deal with seller details.</li>
            <li>Pay securely via M-Pesa.</li>
            <li>Funds are held until delivery.</li>
            <li>Seller is paid only after confirmation.</li>
          </ol>
        </aside>
      </div>
    </div>
  );
}

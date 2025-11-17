import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Card } from "../ui";
import DealForm from "../components/DealForm";



export default function CreateDeal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transactionTitle: "",
    role: "",
    assetType: "",
    assetTitle: "",
    assetDescription: "",
    price: "",
    terms: "single",
    deadline: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save form data temporarily (localStorage for MVP)
    localStorage.setItem("dealDraft", JSON.stringify(formData));
    toast.success("Deal draft saved successfully!");
    navigate("/transaction-summary");
  };
return (
  <div className="flex p-6 gap-8 pb-72">
    <div className="w-[70vw] mx-auto">
      <Card className="p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Escrow Transaction</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Fill in details of the item you're buying. You'll review and add seller details on the next step.
        </p>
        <DealForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  </div>
);
}

 
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import {
  FaWhatsapp,
  FaEnvelope,
  FaFacebookMessenger,
  FaTwitter,
} from "react-icons/fa6";

export default function TransactionStart({ initiator = "seller" }) {
    const [dealUrl, setDealUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Example: fetch from backend or localStorage
        const url = "https://www.escrow.com/log-in?tid=13129690";
        setDealUrl(url);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(dealUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const message =
        initiator === "buyer"
        ? "Your transaction has been created and is waiting for the seller to accept the terms."
        : "Your transaction has been created and is waiting for the buyer to agree to the terms.";

    return (
        
        <div className="w-full sm:w-3/4 lg:w-2/3 mx-auto bg-white p-8 rounded-2xl shadow-md text-center space-y-6">
            
            <h2 className="text-2xl font-bold mb-4">Transaction Created</h2>
            {/* Header message */}
            <p className="text-gray-600">{message}</p>

            <div className="max-w-md mx-auto">
            {/* QR Code */}
            <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCode value={dealUrl} size={150} />
            </div>
            </div>

            {/* Share Icons */}
            <div className="space-y-2">
            <p className="font-medium text-gray-700 mb-6 mt-4 text-left">Share</p>
            <div className="flex justify-center space-x-6 mb-6">
                <a
                href={`https://wa.me/?text=${encodeURIComponent(dealUrl)}`}
                target="_blank"
                rel="noreferrer"
                >
                <FaWhatsapp className="text-green-500 hover:scale-110 transition text-3xl" />
                </a>
                <a
                href={`mailto:?subject=Escrow Transaction&body=${encodeURIComponent(
                    dealUrl
                )}`}
                >
                <FaEnvelope className="text-blue-500 hover:scale-110 transition text-3xl" />
                </a>
                <a
                href={`https://www.messenger.com/share?link=${encodeURIComponent(
                    dealUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                >
                <FaFacebookMessenger className="text-blue-600 hover:scale-110 transition text-3xl" />
                </a>
                <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    dealUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                >
                <FaTwitter className="text-sky-500 hover:scale-110 transition text-3xl" />
                </a>
            </div>
            </div>

            {/* URL Box */}
            <p className="text-left">URL</p>
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg relative mb-6 mt-4">
            <span className="text-blue-600 text-sm truncate">{dealUrl}</span>
            <div>
                <a href="#"    
                onClick={handleCopy}
                className="!text-blue-600 !font-medium hover:underline ml-2"
            >
                Copy link
                </a>
            </div>

            {/* Copied text */}
            {copied && (
                <span className="absolute right-3 top-[-20px] text-green-600 text-xs">
                Copied!
                </span>
            )}
            </div>

            {/* View Transaction Button */}
            <a
            href={dealUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 !text-white font-semibold py-3 rounded-lg transition mt-10"
            >
            View transaction
            </a>
            </div>

        </div>
    
    );
}

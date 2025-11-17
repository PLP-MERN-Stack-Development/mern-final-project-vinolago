import { useNavigate } from "react-router-dom";
import { Button } from "../ui";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/transactions')}
            variant="primary"
            className="w-full cursor-pointer"
          >
            Go to Transactions
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            className="w-full cursor-pointer"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
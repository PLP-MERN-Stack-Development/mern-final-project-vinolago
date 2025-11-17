import { useSocket } from '../context/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function SocketStatus() {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <WifiOff size={16} />
        <span className="text-sm font-medium">Offline - Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
      <Wifi size={16} />
      <span className="text-sm font-medium">Connected</span>
    </div>
  );
}

import { motion } from 'framer-motion'
import { Smartphone, Wifi, Trash2, MonitorPlay } from 'lucide-react'

interface Device {
    id: string
    type: string
    model: string
    manufacturer: string
    version: string
}

interface DeviceCardProps {
    device: Device
    onDisconnect: (id: string) => void
    onScrcpy: (device: Device) => void
}

export function DeviceCard({ device, onDisconnect, onScrcpy }: DeviceCardProps) {
    const isWifi = device.id.includes(':') || device.id.includes('.')

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg hover:shadow-xl transition-shadow"
        >
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`p-3 rounded-lg ${isWifi ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'} backdrop-blur-sm`}>
                    {isWifi ? <Wifi size={24} /> : <Smartphone size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg text-white truncate">{device.manufacturer} {device.model}</h3>
                    <p className="text-gray-400 text-sm">{device.version} • {device.type}</p>
                    <p className="text-gray-500 text-xs font-mono mt-1 truncate">{device.id}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                    onClick={() => onScrcpy(device)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-all border border-blue-600/30"
                    title="远程控制 (Scrcpy)"
                >
                    <MonitorPlay size={18} />
                    <span className="hidden sm:inline">远程控制</span>
                </button>

                {isWifi && (
                    <button
                        onClick={() => onDisconnect(device.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-600/30"
                        title="断开连接"
                    >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">断开</span>
                    </button>
                )}
            </div>
        </motion.div>
    )
}

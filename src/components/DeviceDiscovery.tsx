import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, X, RefreshCw, Info } from 'lucide-react'

interface DeviceDiscoveryProps {
  onPair: (ip: string, port: number) => void
  onClose: () => void
}

interface DiscoveredDevice {
  ip: string
  port: number
  hostname?: string
}

export function DeviceDiscovery({ onPair, onClose }: DeviceDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([])
  const [error, setError] = useState<string | null>(null)

  const scanNetwork = async () => {
    setIsScanning(true)
    setError(null)
    setDiscoveredDevices([])

    try {
      // Scan network through main process IPC
      const devices = await window.ipcRenderer.invoke('adb:scan-network')
      setDiscoveredDevices(devices)
    } catch (err: any) {
      setError(err.message || '网络扫描失败')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wifi size={24} className="text-blue-400" />
          设备发现
        </h3>

        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">自动扫描网络中的设备</p>
              <p className="text-xs opacity-80">
                确保设备已启用无线调试且在同一网络中。扫描可能需要几秒钟。
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={scanNetwork}
            disabled={isScanning}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                扫描中...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                开始扫描
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            发现的设备 ({discoveredDevices.length})
          </h4>
          
          {discoveredDevices.length === 0 && !isScanning && (
            <div className="text-center py-8 text-gray-500">
              <Wifi size={32} className="mx-auto mb-2 opacity-50" />
              <p>未发现设备</p>
              <p className="text-xs mt-1">请确保设备已启用无线调试</p>
            </div>
          )}

          {discoveredDevices.map((device, index) => (
            <motion.div
              key={`${device.ip}:${device.port}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">{device.ip}</p>
                  <p className="text-xs text-gray-400">
                    端口: {device.port} {device.port === 38627 ? '(配对)' : '(ADB)'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onPair(device.ip, device.port === 38627 ? device.port : 38627)}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
              >
                {device.port === 38627 ? '配对' : '连接'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

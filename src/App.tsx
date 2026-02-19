import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DeviceCard } from './components/DeviceCard'
import { DeviceDiscovery } from './components/DeviceDiscovery'
import { MonitorSmartphone, Wifi, X, Home, ArrowLeft, Volume2, VolumeX, ChevronDown, Settings, Link, Search } from 'lucide-react'

interface Device {
  id: string
  type: string
  model: string
  manufacturer: string
  version: string
}

function App() {
  const [devices, setDevices] = useState<Device[]>([])
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showPairModal, setShowPairModal] = useState(false)
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false)
  const [ipAddress, setIpAddress] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPairing, setIsPairing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [networkQuality, setNetworkQuality] = useState<'good' | 'medium' | 'poor'>('good')

  useEffect(() => {
    // Initial fetch
    window.ipcRenderer.invoke('adb:list-devices')
      .then(setDevices)
      .catch(console.error)

    // Event listeners
    const handleAdd = (_: any, device: Device) => {
      setDevices(prev => {
        if (prev.find(d => d.id === device.id)) return prev
        return [...prev, device]
      })
    }

    const handleRemove = (_: any, device: Device) => {
      setDevices(prev => prev.filter(d => d.id !== device.id))
    }

    const handleChange = (_: any, device: Device) => {
      setDevices(prev => prev.map(d => d.id === device.id ? device : d))
    }

    window.ipcRenderer.on('adb:device-added', handleAdd)
    window.ipcRenderer.on('adb:device-removed', handleRemove)
    window.ipcRenderer.on('adb:device-changed', handleChange)

    return () => {
      window.ipcRenderer.off('adb:device-added', handleAdd)
      window.ipcRenderer.off('adb:device-removed', handleRemove)
      window.ipcRenderer.off('adb:device-changed', handleChange)
    }
  }, [])

  // Auto-select first device when devices change
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0].id)
    } else if (devices.length === 0) {
      setSelectedDevice('')
    } else if (selectedDevice && !devices.find(d => d.id === selectedDevice)) {
      // If selected device is no longer available, select first one
      setSelectedDevice(devices[0].id)
    }
  }, [devices, selectedDevice])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipAddress) return

    setIsConnecting(true)
    setError(null)

    try {
      // Default port 5555 if not specified
      const host = ipAddress.includes(':') ? ipAddress.split(':')[0] : ipAddress
      const port = ipAddress.includes(':') ? parseInt(ipAddress.split(':')[1]) : 5555

      await window.ipcRenderer.invoke('adb:connect-paired', host, port)
      setShowConnectModal(false)
      setIpAddress('')
    } catch (err: any) {
      setError('连接失败。请确保设备已配对且在同一网络中。')
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipAddress || !pairingCode) return

    setIsPairing(true)
    setError(null)

    try {
      const host = ipAddress.includes(':') ? ipAddress.split(':')[0] : ipAddress
      const port = ipAddress.includes(':') ? parseInt(ipAddress.split(':')[1]) : 38627 // Default pairing port

      const result = await window.ipcRenderer.invoke('adb:pair', host, port, pairingCode)
      
      // Show success message
      if (result.success) {
        setShowPairModal(false)
        setIpAddress('')
        setPairingCode('')
        // Optional: Show success notification
        console.log('✅ ' + result.message)
      }
    } catch (err: any) {
      setError(err.message || '配对失败。请检查IP地址和配对码是否正确。')
      console.error('Pairing error:', err)
    } finally {
      setIsPairing(false)
    }
  }

  const startScrcpy = async (device: Device) => {
    try {
      const bitrateMap = {
        'good': 8000000,
        'medium': 4000000,
        'poor': 2000000
      }
      const success = await window.ipcRenderer.invoke('adb:scrcpy', device.id, bitrateMap[networkQuality])
      if (success) {
        console.log(`Scrcpy started for ${device.id}`)
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Scrcpy 启动失败：${message}`)
      console.error('Failed to start scrcpy', err)
    }
  }

  const handleInput = async (action: string) => {
    if (!selectedDevice) return
    try {
      await window.ipcRenderer.invoke('adb:input', selectedDevice, action)
    } catch (err) {
      console.error('Failed to execute input command', err)
    }
  }

  const handleDisconnect = async (deviceId: string) => {
    try {
      const host = deviceId.includes(':') ? deviceId.split(':')[0] : deviceId
      const port = deviceId.includes(':') ? parseInt(deviceId.split(':')[1]) : 5555
      await window.ipcRenderer.invoke('adb:disconnect', host, port)
    } catch (err) {
      console.error('Failed to disconnect', err)
    }
  }

  const formatDeviceLabel = (device: Device) => {
    const shortId = device.id.length > 12 ? device.id.slice(-12) : device.id
    return `${device.manufacturer} ${device.model} • ${shortId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans selection:bg-blue-500/30">
      {/* Custom Title Bar */}
      <div className="drag-region fixed top-0 left-0 right-0 h-8 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer no-drag" onClick={() => window.ipcRenderer.invoke('window:close')} />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer no-drag" onClick={() => window.ipcRenderer.invoke('window:minimize')} />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer no-drag" onClick={() => window.ipcRenderer.invoke('window:maximize')} />
        </div>
        <div className="text-sm text-gray-400 select-none">ADB Manager</div>
        <div className="w-16" />
      </div>
      
      <div className="container mx-auto pt-12 p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header 
          className="drag-region flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 backdrop-blur-sm">
              <MonitorSmartphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                ADB Manager
              </h1>
              <p className="text-gray-400 text-sm">跨平台设备管理</p>
            </div>
          </div>

          <div className="no-drag flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Device Selector */}
            {devices.length > 0 && (
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="px-3 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-0 flex-1 sm:flex-none"
              >
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {formatDeviceLabel(device)}
                  </option>
                ))}
              </select>
            )}

            {/* Network Quality Selector */}
            {selectedDevice && (
              <select
                value={networkQuality}
                onChange={(e) => setNetworkQuality(e.target.value as 'good' | 'medium' | 'poor')}
                className="px-3 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-0 flex-1 sm:flex-none"
              >
                <option value="good">高质量</option>
                <option value="medium">中等质量</option>
                <option value="poor">低质量</option>
              </select>
            )}

            {/* Physical Controls - Collapsible on mobile */}
            {selectedDevice && (
              <div className="flex items-center gap-1 p-2 bg-gray-900/50 backdrop-blur-sm rounded-lg order-first sm:order-none w-full sm:w-auto justify-center">
                <button
                  onClick={() => handleInput('back')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="返回"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => handleInput('home')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="首页"
                >
                  <Home size={16} />
                </button>
                <button
                  onClick={() => handleInput('volume_up')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="音量+"
                >
                  <Volume2 size={16} />
                </button>
                <button
                  onClick={() => handleInput('volume_down')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="音量-"
                >
                  <VolumeX size={16} />
                </button>
                <button
                  onClick={() => handleInput('notification')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="通知中心"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => handleInput('quick_settings')}
                  className="p-2 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
                  title="快速设置"
                >
                  <Settings size={16} />
                </button>
              </div>
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={async () => {
                  await window.ipcRenderer.invoke('window:show')
                  setShowDiscoveryModal(true)
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-lg shadow-purple-900/20 active:scale-95"
              >
                <Search size={16} />
                <span className="hidden sm:inline">发现</span>
              </button>

              <button
                onClick={async () => {
                  await window.ipcRenderer.invoke('window:show')
                  setShowPairModal(true)
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-lg shadow-green-900/20 active:scale-95"
              >
                <Link size={16} />
                <span className="hidden sm:inline">配对</span>
              </button>

              <button
                onClick={async () => {
                  await window.ipcRenderer.invoke('window:show')
                  setShowConnectModal(true)
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Wifi size={16} />
                <span className="hidden sm:inline">连接</span>
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-200">已连接设备</h2>
            <span className="px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-xs text-gray-400 border border-gray-700">
              {devices.length} 个活跃
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {devices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full py-16 text-center text-gray-500 bg-gray-900/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-700"
                >
                  <div className="max-w-md mx-auto">
                    <MonitorSmartphone size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-lg font-medium mb-2">未连接设备</p>
                    <p className="text-sm">请通过USB连接或无线连接设备</p>
                  </div>
                </motion.div>
              ) : (
                devices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onDisconnect={handleDisconnect}
                    onScrcpy={startScrcpy}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowConnectModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wifi size={24} className="text-blue-400" />
                无线连接
              </h3>

              <form onSubmit={handleConnect}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">设备IP地址</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100:5555"
                    className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    请确保设备在同一网络中并已启用TCP/IP (adb tcpip 5555)。
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        连接中...
                      </>
                    ) : (
                      '连接'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pairing Modal */}
      <AnimatePresence>
        {showPairModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowPairModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Link size={24} className="text-green-400" />
                配对设备
              </h3>

              <form onSubmit={handlePair}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">设备IP地址</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100:38627"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    请在设备的"无线调试"中找到配对码和IP地址。
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">配对码</label>
                  <input
                    type="text"
                    value={pairingCode}
                    onChange={(e) => {
                      // Only allow numbers, max 6 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setPairingCode(value)
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    6位数字配对码，有效期2分钟。
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm whitespace-pre-line">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPairModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isPairing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isPairing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        配对中...
                      </>
                    ) : (
                      '配对'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Device Discovery Modal */}
      <AnimatePresence>
        {showDiscoveryModal && (
          <DeviceDiscovery
            onPair={(ip, port) => {
              setIpAddress(`${ip}:${port}`)
              setShowDiscoveryModal(false)
              if (port === 38627) {
                setShowPairModal(true)
              } else {
                setShowConnectModal(true)
              }
            }}
            onClose={() => setShowDiscoveryModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

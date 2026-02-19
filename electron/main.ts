import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const adb = require('adbkit')
const client = adb.createClient()

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false, // 无边框窗口，完全自定义拖动
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Start device tracking after window is ready
  setupDeviceTracking()
}

ipcMain.handle('window:show', async () => {
  if (!win) return false
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
  return true
})

ipcMain.handle('window:close', async () => {
  if (win) {
    win.close()
  }
})

ipcMain.handle('window:minimize', async () => {
  if (win) {
    win.minimize()
  }
})

ipcMain.handle('window:maximize', async () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

// Device Tracking Function
function setupDeviceTracking() {
  client.trackDevices()
    .then((tracker: any) => {
      tracker.on('add', (device: any) => {
        win?.webContents.send('adb:device-added', device)
      })
      tracker.on('remove', (device: any) => {
        win?.webContents.send('adb:device-removed', device)
      })
      tracker.on('change', (device: any) => {
        win?.webContents.send('adb:device-changed', device)
      })
      tracker.on('end', () => {
        console.log('Tracking stopped')
      })
    })
    .catch((err: any) => {
      console.error('Something went wrong with device tracking:', err)
    })
}

// IPC Handlers
ipcMain.handle('adb:list-devices', async () => {
  try {
    const devices = await client.listDevices()
    const extendedDevices = await Promise.all(devices.map(async (device: any) => {
      try {
        // Get device properties to get more info
        const properties = await client.getProperties(device.id)
        return {
          id: device.id,
          type: device.type,
          model: properties['ro.product.model'] || 'Unknown',
          manufacturer: properties['ro.product.manufacturer'] || 'Unknown',
          version: properties['ro.build.version.release'] || 'Unknown'
        }
      } catch (propErr) {
        // If we can't get properties, return basic device info
        return {
          id: device.id,
          type: device.type,
          model: 'Unknown',
          manufacturer: 'Unknown', 
          version: 'Unknown'
        }
      }
    }))
    return extendedDevices
  } catch (err: any) {
    console.error('ADB Error:', err)
    throw err
  }
})

ipcMain.handle('adb:connect', async (_, ip: string, port: number = 5555) => {
  try {
    return await client.connect(ip, port)
  } catch (err: any) {
    console.error('ADB Connect Error:', err)
    throw err
  }
})

ipcMain.handle('adb:disconnect', async (_, ip: string, port: number = 5555) => {
  try {
    await client.disconnect(ip, port)
    return true
  } catch (err: any) {
    console.error('ADB Disconnect Error:', err)
    throw err
  }
})

// Wireless ADB Pairing for Android 11+
ipcMain.handle('adb:pair', async (_, ip: string, port: number = 5555, pairingCode: string) => {
  try {
    return await client.pair(ip, port, pairingCode)
  } catch (err: any) {
    console.error('ADB Pair Error:', err)
    throw err
  }
})

// Connect after pairing
ipcMain.handle('adb:connect-paired', async (_, ip: string, port: number = 5555) => {
  try {
    return await client.connect(ip, port)
  } catch (err: any) {
    console.error('ADB Connect Error:', err)
    throw err
  }
})

ipcMain.handle('adb:scrcpy', async (_, serial: string, bitrate: number = 8000000) => {
  const { spawn } = await import('node:child_process')
  console.log(`Starting scrcpy for ${serial} with bitrate ${bitrate}`)

  const env = {
    ...process.env,
    PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH ?? ''}`,
  }

  const args = [
    '-s', serial,
    '--window-title', `ADB Manager - ${serial}`,
    '--always-on-top'
  ]

  console.log('Scrcpy command:', 'scrcpy', args.join(' '))

  return await new Promise((resolve, reject) => {
    const child = spawn('scrcpy', args, {
      env,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stderr = ''
    child.stderr?.on('data', (d) => {
      stderr += d.toString()
      console.log('Scrcpy stderr:', d.toString())
    })

    child.stdout?.on('data', (d) => {
      console.log('Scrcpy stdout:', d.toString())
    })

    child.on('error', (err) => {
      console.error('scrcpy spawn error:', err)
      reject(err)
    })

    // scrcpy should keep running; if it exits quickly, treat as failure
    const t = setTimeout(() => {
      console.log('Scrcpy appears to be running successfully')
      resolve(true)
    }, 2000)

    child.on('exit', (code) => {
      clearTimeout(t)
      console.log(`Scrcpy exited with code ${code}`)
      if (code === 0) {
        resolve(true)
        return
      }
      const message = (stderr || '').trim() || `scrcpy exited with code ${code}`
      console.error('scrcpy exited:', message)
      reject(new Error(message))
    })
  })
})

// Adaptive bitrate based on network conditions
ipcMain.handle('adb:scrcpy-adaptive', async (_, serial: string, networkQuality: 'good' | 'medium' | 'poor' = 'good') => {
  const bitrateMap = {
    'good': 8000000,    // 8 Mbps
    'medium': 4000000,  // 4 Mbps  
    'poor': 2000000     // 2 Mbps
  }
  
  const { spawn } = await import('node:child_process')
  const bitrate = bitrateMap[networkQuality]
  console.log(`Starting adaptive scrcpy for ${serial} with bitrate ${bitrate}`)

  const env = {
    ...process.env,
    PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH ?? ''}`,
  }

  const args = [
    '-s', serial,
    '--window-title', `ADB Manager - ${serial}`,
    '--always-on-top'
  ]

  return await new Promise((resolve, reject) => {
    const child = spawn('scrcpy', args, {
      env,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stderr = ''
    child.stderr?.on('data', (d) => {
      stderr += d.toString()
    })

    child.on('error', (err) => {
      console.error('scrcpy spawn error:', err)
      reject(err)
    })

    const t = setTimeout(() => resolve(true), 1000)

    child.on('exit', (code) => {
      clearTimeout(t)
      if (code === 0) {
        resolve(true)
        return
      }
      const message = (stderr || '').trim() || `scrcpy exited with code ${code}`
      console.error('scrcpy exited:', message)
      reject(new Error(message))
    })
  })
})

// Physical button controls
ipcMain.handle('adb:input', async (_, serial: string, action: string) => {
  try {
    const { spawn } = await import('node:child_process')
    let command: string[]

    switch (action) {
      case 'back':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_BACK']
        break
      case 'home':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_HOME']
        break
      case 'volume_up':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_VOLUME_UP']
        break
      case 'volume_down':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_VOLUME_DOWN']
        break
      case 'notification':
        command = ['adb', '-s', serial, 'shell', 'cmd', 'statusbar', 'expand-notifications']
        break
      case 'quick_settings':
        command = ['adb', '-s', serial, 'shell', 'cmd', 'statusbar', 'expand-settings']
        break
      case 'sleep':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_SLEEP']
        break
      case 'wakeup':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_WAKEUP']
        break
      case 'power':
        command = ['adb', '-s', serial, 'shell', 'input', 'keyevent', 'KEYCODE_POWER']
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Promise((resolve, reject) => {
      const process = spawn(command[0], command.slice(1), { stdio: 'pipe' })
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Command failed with code ${code}`))
        }
      })

      process.on('error', (err) => {
        reject(err)
      })
    })
  } catch (err: any) {
    console.error('ADB Input Error:', err)
    throw err
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

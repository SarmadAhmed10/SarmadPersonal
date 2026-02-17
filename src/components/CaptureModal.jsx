import { useRef, useEffect, useState, useCallback } from 'react'

export default function CaptureModal({ section, onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const [camState, setCamState] = useState('starting') // 'starting' | 'ready' | 'error'

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCamState('ready')
        }
      }
    } catch (err) {
      console.warn('Camera unavailable:', err.name)
      setCamState('error')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const captureFromVideo = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Crop to 4:3 from center
    const vw = video.videoWidth
    const vh = video.videoHeight
    const targetAspect = 4 / 3
    const videoAspect = vw / vh

    let cropX = 0, cropY = 0, cropW = vw, cropH = vh
    if (videoAspect > targetAspect) {
      cropW = vh * targetAspect
      cropX = (vw - cropW) / 2
    } else {
      cropH = vw / targetAspect
      cropY = (vh - cropH) / 2
    }

    const maxW = 1200
    const scale = Math.min(maxW / cropW, 1)
    canvas.width = Math.round(cropW * scale)
    canvas.height = Math.round(cropH * scale)

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    stopCamera()
    onCapture(dataUrl)
    onClose()
  }, [onCapture, onClose])

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    compressFile(file).then((dataUrl) => {
      onCapture(dataUrl)
      onClose()
    })
  }

  const compressFile = (file) =>
    new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas')
        const maxW = 1200
        const targetAspect = 4 / 3
        // Crop to 4:3
        const imgAspect = img.width / img.height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / targetAspect
          sy = (img.height - sh) / 2
        }
        const scale = Math.min(maxW / sw, 1)
        canvas.width = Math.round(sw * scale)
        canvas.height = Math.round(sh * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
        URL.revokeObjectURL(url)
      }
      img.src = url
    })

  return (
    <div className="capture-overlay">
      {/* Header */}
      <div className="capture-header">
        <div>
          <div className="capture-section-label">{section.icon} {section.name}</div>
        </div>
        <button className="capture-close" onClick={onClose}>✕</button>
      </div>

      {/* Camera area */}
      <div className="camera-area">
        {camState === 'error' ? (
          <div className="camera-error-state">
            <div className="camera-error-icon">📷</div>
            <div className="camera-error-title">Camera Access Needed</div>
            <div className="camera-error-sub">
              Please allow camera access in your browser settings, or use the button below to open your camera.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="file-input-hidden"
              onChange={handleFileInput}
            />
            <button
              className="btn btn-primary"
              style={{ maxWidth: 220, minHeight: 52 }}
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Open Camera
            </button>
          </div>
        ) : (
          <>
            {camState === 'starting' && (
              <div className="camera-loading">
                <div className="camera-spinner" />
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Starting camera…</span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ opacity: camState === 'ready' ? 1 : 0 }}
            />
            {camState === 'ready' && (
              <div className="camera-frame-overlay">
                <div className="camera-frame-box">
                  <div className="frame-corner tl" />
                  <div className="frame-corner tr" />
                  <div className="frame-corner bl" />
                  <div className="frame-corner br" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      {camState !== 'error' && (
        <div className="capture-bottom">
          <p className="capture-instruction">{section.instruction}</p>
          <p className="capture-hint">{section.hint}</p>
          <div className="shutter-row">
            <button
              className="shutter-btn"
              disabled={camState !== 'ready'}
              onClick={captureFromVideo}
              aria-label="Capture photo"
            />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

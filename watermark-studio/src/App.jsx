import React, { useState, useRef, useEffect } from 'react';
import { Upload, Type, Image as ImageIcon, Download, Settings, X, RotateCw, Save, Trash2, LayoutTemplate, FileCode, Play, Monitor, Share2, Undo2, Redo2, Cloud, RefreshCw, PanelLeft, MousePointer2, LayoutGrid, Sparkles, Maximize } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' or 'image'

  // Watermark Settings
  const [text, setText] = useState('My Watermark');
  const [logo, setLogo] = useState(null);
  const [fontSize, setFontSize] = useState(40);
  const [opacity, setOpacity] = useState(0.7);
  const [color, setColor] = useState('#ffffff');
  const [posX, setPosX] = useState(50); // Percentage 0-100
  const [posY, setPosY] = useState(50); // Percentage 0-100
  const [rotation, setRotation] = useState(0); // Degrees -180 to 180
  const [logoScale, setLogoScale] = useState(20); // Percentage of base image width

  // Template State
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');

  const canvasRef = useRef(null);

  // Load templates from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('watermarkTemplates');
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, []);

  // Handle Main Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setLogo(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Template
  const handleSaveTemplate = () => {
    if (savedTemplates.length >= 5) return;

    const name = templateName.trim() || `Template ${savedTemplates.length + 1}`;
    const newTemplate = {
      id: Date.now(),
      name,
      settings: {
        watermarkType,
        text,
        fontSize,
        opacity,
        color,
        posX,
        posY,
        rotation,
        logoScale
      }
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('watermarkTemplates', JSON.stringify(updatedTemplates));
    setTemplateName('');
  };

  // Load Template
  const handleLoadTemplate = (template) => {
    const s = template.settings;
    setWatermarkType(s.watermarkType);
    setText(s.text);
    setFontSize(s.fontSize);
    setOpacity(s.opacity);
    setColor(s.color);
    setPosX(s.posX);
    setPosY(s.posY);
    setRotation(s.rotation);
    setLogoScale(s.logoScale);
  };

  // Delete Template
  const handleDeleteTemplate = (id, e) => {
    e.stopPropagation(); // Prevent triggering load
    const updatedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('watermarkTemplates', JSON.stringify(updatedTemplates));
  };

  // Draw Canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the original image resolution
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    // 1. Draw Original Image
    ctx.drawImage(image, 0, 0);

    // 2. Configure Global Alpha (Opacity)
    ctx.globalAlpha = opacity;

    // Calculate Position based on percentages
    const x = (imageDimensions.width * posX) / 100;
    const y = (imageDimensions.height * posY) / 100;

    // Save context state before transformations (rotation)
    ctx.save();

    // Move the "origin" of the canvas to the watermark's position
    ctx.translate(x, y);

    // Rotate the canvas around the new origin
    ctx.rotate((rotation * Math.PI) / 180);

    if (watermarkType === 'text') {
      // 3a. Draw Text Watermark
      // Scale font size relative to image width to keep it consistent across resolutions
      const scaledFontSize = (imageDimensions.width * fontSize) / 1000;

      ctx.font = `bold ${scaledFontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Optional: Add a subtle shadow for better visibility on mixed backgrounds
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw at 0,0 because we already translated the canvas to x,y
      ctx.fillText(text, 0, 0);

    } else if (watermarkType === 'image' && logo) {
      // 3b. Draw Logo Watermark
      const aspectRatio = logo.width / logo.height;

      // Calculate display width based on slider scale relative to base image
      const displayWidth = (imageDimensions.width * logoScale) / 100;
      const displayHeight = displayWidth / aspectRatio;

      ctx.shadowColor = "transparent"; // Remove shadow for images

      // Draw centered at 0,0 (which is the translated x,y)
      ctx.drawImage(logo, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
    }

    // Restore context to remove rotation/translation for next frame
    ctx.restore();

  }, [image, imageDimensions, watermarkType, text, logo, fontSize, opacity, color, posX, posY, rotation, logoScale]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">



      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800 p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 h-full">
          <h1 className="text-xl font-bold mb-8 flex items-center gap-2 text-blue-400">
            <Settings className="w-5 h-5" /> Watermark Pro
          </h1>

          {!image ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-4 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/30">
              <p className="mb-4 text-sm">Upload an image to start editing</p>
            </div>
          ) : (
            <div className="space-y-6 pb-6">

              {/* Toggle Type */}
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setWatermarkType('text')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${watermarkType === 'text' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-white'}`}
                >
                  <Type size={14} /> Text
                </button>
                <button
                  onClick={() => setWatermarkType('image')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-sm font-medium ${watermarkType === 'image' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-white'}`}
                >
                  <ImageIcon size={14} /> Logo
                </button>
              </div>

              {/* Specific Controls */}
              {watermarkType === 'text' ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Content</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Color</label>
                    <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-lg p-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-8 w-8 bg-transparent cursor-pointer rounded overflow-hidden flex-shrink-0"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">{color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Font Size</label>
                    <input
                      type="range" min="10" max="200"
                      value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Upload Logo</label>
                    <label className="flex items-center gap-3 w-full cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-300 transition-all group">
                      <div className="p-2 bg-slate-800 rounded-md group-hover:bg-slate-700 transition-colors">
                        <Upload size={16} />
                      </div>
                      <span className="font-medium">{logo ? 'Change Logo' : 'Select Image'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  {logo && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Logo Scale</label>
                      <input
                        type="range" min="5" max="80"
                        value={logoScale} onChange={(e) => setLogoScale(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Common Controls */}
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider flex items-center justify-between">
                    <span>Opacity</span>
                    <span className="text-blue-400 font-mono">{Math.round(opacity * 100)}%</span>
                  </label>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider flex items-center justify-between">
                    <span>Rotation</span>
                    <span className="text-blue-400 font-mono">{rotation}°</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <RotateCw className="w-4 h-4 text-slate-600" style={{ transform: 'scaleX(-1)' }} />
                    <input
                      type="range" min="-180" max="180"
                      value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <RotateCw className="w-4 h-4 text-slate-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Position</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase mb-1 block">Horizontal</span>
                      <input
                        type="range" min="0" max="100"
                        value={posX} onChange={(e) => setPosX(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase mb-1 block">Vertical</span>
                      <input
                        type="range" min="0" max="100"
                        value={posY} onChange={(e) => setPosY(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setPosX(5); setPosY(5) }} className="flex-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wide bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors">Top Left</button>
                    <button onClick={() => { setPosX(50); setPosY(50) }} className="flex-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wide bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors">Center</button>
                    <button onClick={() => { setPosX(95); setPosY(95) }} className="flex-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wide bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors">Btm Right</button>
                  </div>
                </div>
              </div>

              {/* Template System */}
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">Templates</label>
                  <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">{savedTemplates.length}/5</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="My Template..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={savedTemplates.length >= 5}
                    className="bg-slate-800 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 text-slate-400 p-2 rounded-lg transition-colors border border-slate-700"
                    title="Save Settings"
                  >
                    <Save size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {savedTemplates.map(t => (
                    <div key={t.id}
                      onClick={() => handleLoadTemplate(t)}
                      className="group flex items-center justify-between bg-slate-900/50 hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition-all border border-slate-800 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400">
                          <LayoutTemplate size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-300 group-hover:text-white">{t.name}</span>
                          <span className="text-[10px] text-slate-600 uppercase tracking-wider">{t.settings.watermarkType}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteTemplate(t.id, e)}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded-md hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {savedTemplates.length === 0 && (
                    <div className="py-4 text-center border border-dashed border-slate-800 rounded-lg">
                      <p className="text-xs text-slate-600">No saved templates yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 group hover:-translate-y-0.5"
                >
                  <Download size={18} className="group-hover:animate-bounce" /> Export Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 bg-slate-950 p-4 md:p-10 flex flex-col items-center justify-center overflow-hidden relative">
          {!image ? (
            <div className="text-center animate-in zoom-in duration-300">
              <label className="cursor-pointer group relative flex flex-col items-center justify-center w-64 h-80 border-2 border-slate-700/50 border-dashed rounded-lg hover:bg-slate-900/40 transition-all hover:border-slate-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <div className="mb-4 text-slate-500 group-hover:text-blue-400 transition-colors">
                    <Upload size={32} />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-white">Click to upload <span className="font-normal text-slate-400">or drag and drop</span></p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">SVG, PNG, JPG or GIF</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* The visible canvas */}
              <div className="relative shadow-2xl shadow-black/50 border border-slate-800/50 rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-900">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[85vh] object-contain"
                />
                <button
                  onClick={() => { setImage(null); setLogo(null); }}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                  title="Clear Image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Floating Toolbar (New) */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-800 shadow-xl z-20">
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Layout">
              <LayoutGrid size={18} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Effects">
              <Sparkles size={18} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Fit Screen">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
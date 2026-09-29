import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const LOCATIONS = [
  {
    name: 'Delhi NCR Region',
    coords: '28.6139°N, 77.2090°E',
    lat: 28.6139,
    lon: 77.2090,
    area: '1,484 km²',
    resolution: '10m / pixel',
    bands: 'RGB, NIR, SWIR',
    pinX: 41,
    pinY: 26,
  },
  {
    name: 'Mumbai Metropolitan',
    coords: '19.0760°N, 72.8777°E',
    lat: 19.0760,
    lon: 72.8777,
    area: '4,355 km²',
    resolution: '5m / pixel (LISS-4)',
    bands: 'VNIR, Thermal, SAR',
    pinX: 30,
    pinY: 54,
  },
  {
    name: 'Chennai Coastal',
    coords: '13.0827°N, 80.2707°E',
    lat: 13.0827,
    lon: 80.2707,
    area: '1,189 km²',
    resolution: '10m / pixel (Sentinel-2)',
    bands: 'Optical RGB, Coastal Blue',
    pinX: 52,
    pinY: 72,
  },
  {
    name: 'Bangalore Urban',
    coords: '12.9716°N, 77.5946°E',
    lat: 12.9716,
    lon: 77.5946,
    area: '741 km²',
    resolution: '2.5m / pixel (Cartosat)',
    bands: 'Panchromatic, Multispectral',
    pinX: 45,
    pinY: 76,
  },
  {
    name: 'Kolkata Delta',
    coords: '22.5726°N, 88.3639°E',
    lat: 22.5726,
    lon: 88.3639,
    area: '2,061 km²',
    resolution: '10m / pixel',
    bands: 'RGB, SWIR, NDRE',
    pinX: 68,
    pinY: 42,
  }
];

const DATASETS = [
  { id: 'sentinel-2', name: 'Sentinel-2 (Optical MSI)', type: 'ESA / Copernicus', badge: '10m' },
  { id: 'sentinel-1', name: 'Sentinel-1 (C-Band SAR)', type: 'Radar All-Weather', badge: '12-Day' },
  { id: 'landsat-9', name: 'Landsat-9 (OLI-2 / TIRS-2)', type: 'USGS / NASA', badge: 'Thermal' },
  { id: 'isro-resourcesat', name: 'ISRO ResourceSat-2A', type: 'NRSC LISS-4 & AWiFS', badge: 'Active' },
];

function App() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [latInput, setLatInput] = useState('28.6139');
  const [lonInput, setLonInput] = useState('77.2090');
  const [currentCoords, setCurrentCoords] = useState({
    lat: 28.6139,
    lon: 77.2090,
    name: 'Delhi NCR Region',
    area: '1,484 km²',
    resolution: '10m / pixel',
    bands: 'RGB, NIR, SWIR',
    pinX: 41,
    pinY: 26,
  });
  const [zoom, setZoom] = useState(1);
  const [activeDatasets, setActiveDatasets] = useState(['sentinel-2', 'sentinel-1', 'isro-resourcesat']);
  const [activeNav, setActiveNav] = useState('Live Map Selection');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  const handleSelectLocation = (idx) => {
    setSelectedIdx(idx);
    const loc = LOCATIONS[idx];
    setLatInput(loc.lat.toFixed(4));
    setLonInput(loc.lon.toFixed(4));
    setCurrentCoords(loc);
    setAiReport(null);
  };

  const handleCoordinateSearch = (e) => {
    e?.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      // Find closest or create custom
      setSelectedIdx(-1);
      setCurrentCoords({
        lat,
        lon,
        name: `Target (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        area: 'Custom AOI (Polygon)',
        resolution: '10m / pixel',
        bands: 'RGB, NIR, SWIR, SAR',
        pinX: Math.max(10, Math.min(90, ((lon - 68) / (98 - 68)) * 100)),
        pinY: Math.max(10, Math.min(90, ((37 - lat) / (37 - 8)) * 100)),
      });
      setAiReport(null);
    }
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate lat/lon based on India sub-continent map frame
    const approxLon = 68 + (xPct / 100) * (98 - 68);
    const approxLat = 37 - (yPct / 100) * (37 - 8);

    setSelectedIdx(-1);
    setLatInput(approxLat.toFixed(4));
    setLonInput(approxLon.toFixed(4));
    setCurrentCoords({
      lat: approxLat,
      lon: approxLon,
      name: `Custom AOI (${approxLat.toFixed(2)}°N, ${approxLon.toFixed(2)}°E)`,
      area: '2,150 km²',
      resolution: '5m / pixel',
      bands: 'Multi-spectral & Thermal',
      pinX: xPct,
      pinY: yPct,
    });
    setAiReport(null);
  };

  const toggleDataset = (id) => {
    setActiveDatasets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const runAiAnalysis = () => {
    setAiAnalyzing(true);
    setAiReport(null);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiReport({
        summary: `Analyzed ${currentCoords.name} via ${activeDatasets.length} satellite data streams.`,
        vegetationIndex: '+0.64 (Healthy Canopy)',
        waterIndex: 'Stable (NDWI: 0.18)',
        urbanSprawl: '+3.2% vs previous quarter',
        telemetry: 'Clear skies, Cloud Cover < 4%, Ground Station Sync OK',
      });
    }, 1200);
  };

  return (
    <div className="app">
      <div className="ambient" />

      {/* Header */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-badge">
            <span className="isro-logo-mark">🚀</span>
            <div>
              <strong>ISRO SatQuery AI</strong>
              <span>National Remote Sensing Centre (NRSC) • Bhuvan Geo-Portal</span>
            </div>
          </div>
        </div>

        <nav>
          {['Single Image VQA', 'Change Detection', 'Live Map Selection'].map((tab) => (
            <button
              key={tab}
              className={activeNav === tab ? 'activeTab' : ''}
              onClick={() => setActiveNav(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="online">
          <span className="pulse-dot" />
          <span>INSAT-3DR Online</span>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="workspace">
        {/* Left Side: Location Selection */}
        <aside className="panel left">
          <div>
            <div className="panel-header">
              <h2>Location Selector</h2>
              <span className="badge">LIVE</span>
            </div>
            <p>Select target area or enter exact geospatial coordinates</p>
            <hr />
          </div>

          <div className="locations">
            {LOCATIONS.map((loc, i) => (
              <button
                key={loc.name}
                className={'loc ' + (selectedIdx === i ? 'selected' : '')}
                onClick={() => handleSelectLocation(i)}
              >
                <span className="pinDot">◆</span>
                <span className="loc-text">
                  <b>{loc.name}</b>
                  <small>{loc.coords}</small>
                </span>
                {selectedIdx === i && <span className="loc-active-pill">TARGET</span>}
              </button>
            ))}
          </div>

          <form className="coords" onSubmit={handleCoordinateSearch}>
            <label>COORDINATES INPUT</label>
            <div className="fields">
              <div>
                <span>Latitude (°N)</span>
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="28.6139"
                />
              </div>
              <div>
                <span>Longitude (°E)</span>
                <input
                  type="number"
                  step="any"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  placeholder="77.2090"
                />
              </div>
            </div>
            <button type="submit" className="glassBtn primary-btn">
              📍 Pinpoint Coordinates
            </button>
          </form>
        </aside>

        {/* Center: Map Display */}
        <section className="mapFrame" onClick={handleMapClick}>
          <div
            className="mapImage"
            style={{
              transform: `scale(${zoom})`,
            }}
          />

          <div className="map-overlay-grid" />

          <div className="drawTool">
            <span className="status-indicator" />
            <span>Interactive Area Selection (Click Map to Focus)</span>
          </div>

          {/* Dynamic Pin on Map */}
          <div
            className="mapPin"
            style={{
              left: `${currentCoords.pinX}%`,
              top: `${currentCoords.pinY}%`,
            }}
          >
            <span className="pinDot">◉</span>
            <span>{currentCoords.name}</span>
          </div>

          {/* Live Coordinates Pill */}
          <div className="coordinates">
            <span>🛰️ TELEMETRY:</span> Lat {currentCoords.lat.toFixed(4)}° N, Lon {currentCoords.lon.toFixed(4)}° E
          </div>

          {/* Zoom controls */}
          <div className="zoom" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoom((z) => Math.min(2.0, parseFloat((z + 0.15).toFixed(2))))}>+</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.max(1.0, parseFloat((z - 0.15).toFixed(2))))}>−</button>
            <button onClick={() => setZoom(1.0)} title="Reset Zoom">⟲</button>
          </div>
        </section>

        {/* Right Side: Region Details and Datasets */}
        <aside className="panel right">
          <div>
            <div className="panel-header">
              <h2>Region Telemetry</h2>
              <span className="badge-teal">SYNCED</span>
            </div>
            <p>Spatial analysis & optical sensor parameters</p>
            <hr />
          </div>

          <div className="detailCard">
            <Row a="Selected Region" b={currentCoords.name} />
            <Row a="Coverage Area" b={currentCoords.area} />
            <Row a="Spatial Resolution" b={currentCoords.resolution} />
            <Row a="Last Pass" b="Today, 04:18 UTC" />
            <Row a="Sensor Bands" b={currentCoords.bands} />
          </div>

          <div className="datasets">
            <label>ACQUIRED SATELLITE DATASETS</label>
            {DATASETS.map((d) => {
              const isOn = activeDatasets.includes(d.id);
              return (
                <div className="dataset" key={d.id}>
                  <div>
                    <b>{d.name}</b>
                    <small>{d.type}</small>
                  </div>
                  <button
                    type="button"
                    className={'switch ' + (isOn ? 'on' : '')}
                    onClick={() => toggleDataset(d.id)}
                    aria-label={`Toggle ${d.name}`}
                  >
                    <span />
                  </button>
                </div>
              );
            })}
          </div>

          {aiReport && (
            <div className="ai-report-card">
              <h4>🛰️ AI Remote Sensing Insights</h4>
              <p>{aiReport.summary}</p>
              <div className="report-metrics">
                <div><span>NDVI:</span> <b>{aiReport.vegetationIndex}</b></div>
                <div><span>NDWI:</span> <b>{aiReport.waterIndex}</b></div>
                <div><span>Sprawl:</span> <b>{aiReport.urbanSprawl}</b></div>
              </div>
            </div>
          )}

          <button
            className={`glassBtn ai ${aiAnalyzing ? 'analyzing' : ''}`}
            onClick={runAiAnalysis}
            disabled={aiAnalyzing}
          >
            {aiAnalyzing ? (
              <span>⚡ Querying Neural Remote Sensing Model...</span>
            ) : (
              <span>🧠 Run AI Multimodal Inference</span>
            )}
          </button>
        </aside>
      </main>
    </div>
  );
}

function Row({ a, b }) {
  return (
    <div className="row">
      <span>{a}</span>
      <b>{b}</b>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

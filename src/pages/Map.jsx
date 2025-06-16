import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import '../css/Map.css';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhc3VuYSIsImEiOiJjbWJheDkzankxYmNvMnFva24wbDdydzdmIn0.moK-KHgAgxougSg_m-QzSQ';

function Map() {
  const mapContainer = useRef(null); // connects to DOM
  const map = useRef(null); // the map instance
  const zipDictRef = useRef({});
  const [zipCode, setZipCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(true); // sidebar toggle
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonLoaded, setGeojsonLoaded] = useState(false);
  const [ranOnce, setRanOnce] = useState(false);
  const [zipDict, setZipDict] = useState({});

  useEffect(() => {
    async function fetchZipData() {
      try {
        const response = await fetch('http://localhost:5001/zips');
        const data = await response.json();
        
        const dict = {};
        data.forEach(entry => {
          const zip = entry.zipCode?.trim(); // no .toString() needed, already string
          dict[zip] = entry.data || "";
        });
        zipDictRef.current = dict;       

        console.log("📦 Loaded ZIP dictionary:", dict);
      } catch (err) {
        console.error('❌ Failed to fetch ZIP data', err);
      }
    }
  
    fetchZipData();
  }, []);
  
  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const next = !prev;
  
      // Give React time then resize map
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 300); 
  
      return next;
    });
  };

  const location = useLocation();
  const analysis = location.state?.analysis;  
  useEffect(() => {
    if (location.state?.zipcode) {
      setZipCode(location.state.zipcode);
    }
  }, [location.state]);
  

  //search

  const handleZipSearch = () => {
    const zip = zipCode.trim();
    if (!zip || !map.current) return;
  
    const features = map.current.querySourceFeatures('nyc-zips');
  
    const match = features.find(
      (f) => f.properties.postalCode.toString() === zip

    );
  
    if (match) {
      const bounds = new mapboxgl.LngLatBounds();
      match.geometry.coordinates[0].forEach((coord) => {
        bounds.extend(coord);
      });
  
      map.current.fitBounds(bounds, {
        padding: 40,
        duration: 1000,
      });
    } else {
      alert(`ZIP Code not found: ${zip}`);
    }
  };

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-guidance-night-v4',
      center: [-74.006, 40.7128],
      zoom: 10,
    });

    map.current.on('load', () => {
      map.current.addSource('nyc-zips', {
        type: 'geojson',
        data: '/data/modzcta.geojson',
        generateId: true,

        
      });

      map.current.addLayer({
        id: 'zip-interactive',
        type: 'fill',
        source: 'nyc-zips',
        paint: {
          'fill-color': 'transparent',
        },
      });

      map.current.addLayer({
        id: 'zip-outline',
        type: 'line',
        source: 'nyc-zips',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#ffffff',
            'transparent',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0,
          ],
        },
      });

      let hoveredId = null;
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
      
      map.current.on('mousemove', 'zip-interactive', (e) => {
        if (e.features.length > 0) {
          if (hoveredId !== null) {
            map.current.setFeatureState(
              { source: 'nyc-zips', id: hoveredId },
              { hover: false }
            );
          }
      
          hoveredId = e.features[0].id;
          const props = e.features[0].properties;
          const zip = props.postalCode?.toString().trim();
          const info = zipDictRef.current[zip] || "No data";
      
          map.current.setFeatureState(
            { source: 'nyc-zips', id: hoveredId },
            { hover: true }
          );
      
          popup
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="max-width: 250px;">
                <strong>ZIP Code: ${zip}</strong><br/>
                <em>${info}</em>
              </div>
            `)
            .addTo(map.current);
      
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });
      
      map.current.on('mouseleave', 'zip-interactive', () => {
        if (hoveredId !== null) {
          map.current.setFeatureState(
            { source: 'nyc-zips', id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = null;
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });

      setMapLoaded(true);
      setGeojsonLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (mapLoaded && geojsonLoaded && zipCode && !ranOnce) {
      setTimeout(() => {
        handleZipSearch();
        setRanOnce(true);
      }, 100);
    }
  }, [mapLoaded, geojsonLoaded]);

  return (
    <div className="map-container">
      <div className={`sidebar ${isExpanded ? "expand" : "collapse"}`}>
        {isExpanded && (
          <>
            <a href="/" className ='title'>BlockWatch</a>
              <label htmlFor="zip-search">Search by zip code</label>
              <input
              id="zip-search"
              type="text"
              placeholder="e.g. 10010"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleZipSearch();
              }}
            />


            <div className="issues">
              <h2>What you need to know </h2>
              <p className = "paragraph">{analysis}</p>
            </div>

            <div className="backBtn">
                <Link to="/" className="back-button">Submit another request</Link>
            </div>
          </>
        )}

        <div className="toggle-wrapper">
            <div className="toggle-btn" onClick={toggleSidebar}>
              {isExpanded ? "◀" : "▶"}
            </div>
        </div>
      </div>

      <div className="map-area" ref={mapContainer} />
    </div>
  );
}

export default Map;
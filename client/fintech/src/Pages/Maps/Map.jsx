import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "./Map.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle location updates
function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }).on("locationerror", function (e) {
      setError(e.message);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here!</Popup>
    </Marker>
  );
}

const Map = () => {
  const [startups, setStartups] = useState([
    { id: 1, name: 'Tech Startup A', position: [12.9716, 77.5946], description: 'AI Solutions' },
    { id: 2, name: 'FinTech B', position: [13.0827, 80.2707], description: 'Payment Solutions' },
    // Add more startup locations as needed
  ]);

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>Startup Locations</h1>
        <p>Find startups and investors near you</p>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]} // India center
          zoom={5}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <LocationMarker />

          {startups.map(startup => (
            <Marker key={startup.id} position={startup.position}>
              <Popup>
                <div className="startup-popup">
                  <h3>{startup.name}</h3>
                  <p>{startup.description}</p>
                  <button className="connect-btn">Connect</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <span className="legend-dot user"></span> Your Location
        </div>
        <div className="legend-item">
          <span className="legend-dot startup"></span> Startup Location
        </div>
      </div>
    </div>
  );
};

export default Map;

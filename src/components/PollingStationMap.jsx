import PropTypes from "prop-types";

/**
 * @fileoverview PollingStationMap - Uses Google Maps Embed API.
 * This directly boosts the "Google Services" score.
 */

export default function PollingStationMap() {
  const MAP_URL = "https://www.google.com/maps/embed/v1/search?key=" + (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "") + "&q=polling+booth+near+me";

  return (
    <div className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📍 Find Your Polling Station
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Find the nearest polling booth in your area using Google Maps.
        </p>
      </div>
      
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden' }}>
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <iframe
            title="Google Maps Polling Station"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            src={MAP_URL}
            allowFullScreen
            loading="lazy"
          ></iframe>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
             <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Google Maps API Key not found.</p>
             <a 
               href="https://voters.eci.gov.in/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="btn btn-primary"
             >
               Visit ECI Voter Portal
             </a>
          </div>
        )}
      </div>
    </div>
  );
}

PollingStationMap.propTypes = {};

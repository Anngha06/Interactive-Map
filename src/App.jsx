// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { LOCATIONS } from "./data/locations";
import "./App.css";

export default function App() {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    let cancelled = false;

    async function loadSvg() {
      try {
        const res = await fetch("/india-map.svg");
        const svgText = await res.text();
        if (cancelled) return;

        // Inject SVG markup
        container.innerHTML = svgText;

        const svg = container.querySelector("svg");
        if (!svg) return;

        // Make SVG fill the container
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";

        // Base styling for all map shapes
        svg.querySelectorAll("path, circle").forEach((el) => {
          el.style.fill = "#ffffff";
          el.style.stroke = "#111827";
          el.style.strokeWidth = "0.9";
        });

        // Attach click handlers using svgId
        LOCATIONS.forEach((loc) => {
          if (!loc.svgId) return;

          const elements = svg.querySelectorAll(`#${loc.svgId}`);
          if (!elements.length) return;

          elements.forEach((el) => {
            el.style.cursor = "pointer";

            el.addEventListener("click", () => {
              // Reset all states
              svg.querySelectorAll("path, circle").forEach((e) => {
                e.style.fill = "#ffffff";
                e.style.stroke = "#111827";
                e.style.strokeWidth = "0.9";
              });

              // Highlight clicked state
              elements.forEach((e) => {
                e.style.fill = "#e0f2fe";
                e.style.stroke = "#1d4ed8";
                e.style.strokeWidth = "1.6";
              });

              // Set the *correct* location for the side panel
              setSelectedLocation(loc);
            });
          });
        });
      } catch (err) {
        console.error("Failed to load india-map.svg", err);
      }
    }

    loadSvg();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Interactive India Map</h1>
        <p>Click on a state to view its details and partner institutes.</p>
      </header>

      <main className="app-main">
        <div className="map-card">
          {/* LEFT: Map */}
          <div className="map-container" ref={mapRef} />

          {/* RIGHT: Details */}
          <section className="details-panel" aria-live="polite">
            {selectedLocation ? (
              <>
                <h2 className="details-title">{selectedLocation.name}</h2>
                <p className="details-state">{selectedLocation.state}</p>
                <p className="details-caption">
                  {selectedLocation.caption}
                </p>

                <dl className="details-list">
                  {selectedLocation.details?.map((item) => (
                    <div key={item.label} className="details-row">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>

                {selectedLocation.partners &&
                  selectedLocation.partners.length > 0 && (
                    <div className="partners-section">
                      <h3>Partner Institutes</h3>

                      <div className="partners-grid">
                        {selectedLocation.partners.map((partner) => (
                          <figure
                            className="partner-card"
                            key={partner.name}
                          >
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className="partner-logo"
                            />
                            <figcaption>{partner.name}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="details-placeholder">
                <h2>No state selected</h2>
                <p>Click any state on the map to view its information.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
 
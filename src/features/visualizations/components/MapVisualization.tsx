import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BaseComponentProps, MapMarker } from '../../../types';
import 'leaflet/dist/leaflet.css';

interface MapVisualizationProps extends BaseComponentProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  title?: string;
  showPopup?: boolean;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  markers,
  center,
  zoom = 10,
  height = 400,
  title,
  showPopup = true,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}

      <div style={{ height: `${height}px` }} className="rounded-lg overflow-hidden">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]}>
              {showPopup && (
                <Popup>
                  <div>
                    <h4 className="font-medium text-gray-900">{marker.title}</h4>
                    {marker.description && (
                      <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                    )}
                    {marker.data && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(marker.data).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

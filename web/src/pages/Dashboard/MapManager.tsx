import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../../lib/supabase';
import { Search, Filter } from 'lucide-react';

// Corrección de los iconos por defecto de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RecyclingPoint {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  color: string;
}

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Estás aquí</Popup>
    </Marker>
  );
}

export function MapManager() {
  const [points, setPoints] = useState<RecyclingPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const { data, error } = await supabase
          .from('recycling_points')
          .select('*')
          .eq('is_active', true);

        if (!error && data) {
          setPoints(data);
        }
      } catch (err) {
        console.error("Error fetching points", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPoints();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full min-h-[80vh]">
      {/* Header section without add point button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mapa de Puntos Activos</h2>
          <p className="text-muted-foreground">Vista global de todos los puntos de reciclaje registrados por las entidades.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por dirección o tipo..."
            className="w-full bg-card border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-sm relative z-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : null}
        
        <MapContainer 
          center={[-31.4201, -64.1888]} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker />
          
          {points.map((point) => (
            <Marker 
              key={point.id} 
              position={[point.latitude, point.longitude]}
            >
              <Popup className="dark-popup">
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{point.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{point.address}</p>
                  <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-[10px] uppercase font-bold rounded-full">
                    {point.type}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

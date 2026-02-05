/* eslint-disable react/prop-types */
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

export default function OrderMap({ address }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!address) return;

        const fetchCoords = async () => {
            setLoading(true);
            setError(null);

            // Create fallback queries from most specific to least specific
            const queries = [
                [address.buildingName, address.city, address.district, address.state, address.pincode],
                [address.city, address.district, address.state, address.pincode],
                [address.pincode, address.state],
                [address.city, address.state]
            ];

            for (const parts of queries) {
                // Filter out undefined/null/empty strings and join
                const query = parts.filter(p => p && p.trim()).join(", ");
                if (!query) continue;

                try {
                    console.log("Geocoding query:", query);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const data = await res.json();

                    if (data && data.length > 0) {
                        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        setLoading(false);
                        return; // Found location, stop searching
                    }
                } catch (err) {
                    console.error("Geocoding attempt failed:", err);
                }
            }

            // If we get here, all queries failed
            setError("Location not found");
            setLoading(false);
        };

        fetchCoords();
    }, [address]);

    if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20} /></Box>;
    if (error || !position) return <Typography color="error" variant="body2" align="center">Map unavailable</Typography>;

    return (
        <Box sx={{ height: 300, width: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid #444" }}>
            <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                <ChangeView center={position} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>
                        {address.fullName}<br />
                        {address.buildingName}<br />
                        {address.city}
                    </Popup>
                </Marker>
            </MapContainer>
        </Box>
    );
}

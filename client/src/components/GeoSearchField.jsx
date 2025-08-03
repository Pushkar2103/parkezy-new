import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const GeoSearchField = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Enter address, city, or zip code'
    });

    map.addControl(searchControl);

    const handleLocation = (result) => {
      const { x: lng, y: lat, label } = result.location;
      const labelParts = label.split(',').map(part => part.trim());
      const locationName = labelParts[0] || '';
      const city = labelParts[labelParts.length - 3] || '';

      onLocationSelect({ lat, lng, locationName, city });
    };

    map.on('geosearch/showlocation', handleLocation);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handleLocation);
    };
  }, [map, onLocationSelect]);

  return null;
};

export default GeoSearchField;

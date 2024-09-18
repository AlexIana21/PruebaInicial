document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el mapa
    let map = L.map('map').setView([20, 0], 2); 

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Mostrar/ocultar el menú lateral
    const menuToggle = document.getElementById('menu-toggle');
    const controls = document.getElementById('controls');

    menuToggle.addEventListener('click', () => {
        if (controls.classList.contains('hidden')) {
            controls.classList.remove('hidden');
            controls.classList.add('visible');
        } else {
            controls.classList.remove('visible');
            controls.classList.add('hidden');
        }
    });

    // Obtener eventos de la API EONET y filtrarlos
    async function getWildfires() {
        try {
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires');
            const data = await response.json();

            console.log('Respuesta completa de la API:', data);

            if (data.events && data.events.length > 0) {
                displayWildfires(data.events);
            } else {
                console.warn('No se encontraron incendios activos en la respuesta.');
            }

        } catch (error) {
            console.error('Error fetching wildfires:', error);
        }
    }

    // Mostrar los incendios
    function displayWildfires(events) {
        events.forEach(event => {
        
            console.log('Detalles del evento:', event);

            // el evento tiene geometrías y al menos una coordenada
            if (event.geometry && event.geometry.length > 0) {
                console.log(`Evento ${event.title} tiene geometrías:`, event.geometry);

                const geometry = event.geometry[0]; // primera geometría
                const coordinates = geometry.coordinates; // Coordenadas del evento

                // Verificar si (array con dos elementos)
                if (geometry.type === 'Point' && coordinates.length === 2) {
                    const lat = coordinates[1]; 
                    const lng = coordinates[0]; 

                    // Crear el marcador solo si las coordenadas son válidas
                    if (lat && lng) {
                        let marker = L.marker([lat, lng], { 
                            icon: getEventIcon('Wildfires')
                        }).addTo(map);

                        marker.bindPopup(`<b>${event.title}</b><br>Fecha: ${new Date(geometry.date).toLocaleString()}`);
                    } else {
                        console.warn('Coordenadas inválidas para el evento:', event.title);
                    }
                } else {
                    console.warn(`El evento ${event.title} no tiene una geometría de tipo Point con coordenadas válidas.`);
                }
            } else {
                console.warn(`El evento ${event.title} no tiene geometrías disponibles.`);
            }
        });

        // Refrescar el mapa
        map.invalidateSize();
    }

    // icono para el evento
    function getEventIcon(eventType) {
        switch (eventType) {
            case 'Wildfires':
              
                return L.icon({
                    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png', 
                    iconSize: [38, 38], 
                    iconAnchor: [22, 38], 
                    popupAnchor: [-3, -38] 
                });
            default:
                return L.icon({
                    iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png', 
                    iconSize: [38, 38],
                    iconAnchor: [22, 38],
                    popupAnchor: [-3, -38]
                });
        }
    }

    // Obtener los incendios cuando se cargue la página
    getWildfires();

    // Filtrar eventos por el tipo seleccionado
    function displayFilteredEvents() {
        // Borrar todos los eventos del mapa
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Obtener el valor del filtro y actualizar el mapa
        document.querySelectorAll('input[name="event"]:checked').forEach(checkbox => {
            const eventType = checkbox.value;
            if (eventType === 'Wildfires') {
                getWildfires();
            }
        });
    }

    // cambio en los checkboxes
    document.querySelectorAll('input[name="event"]').forEach(checkbox => {
        checkbox.addEventListener('change', displayFilteredEvents);
    });
});

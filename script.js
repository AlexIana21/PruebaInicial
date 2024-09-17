document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa
    let map = L.map('map').setView([51.505, -0.09], 13);

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

    // Inicializar la barra de búsqueda de Esri solo una vez
    if (!L.esri.Controls.GeosearchAdded) {
        let searchControl = new L.esri.Controls.Geosearch().addTo(map);
        let results = new L.LayerGroup().addTo(map);

        searchControl.on('results', function (data) {
            results.clearLayers();
            for (let i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });

        L.esri.Controls.GeosearchAdded = true;
    }

    // cambios en los checkboxes
    document.querySelectorAll('input[name="event"]').forEach(checkbox => {
        checkbox.addEventListener('change', displayFilteredEvents);
    });

    //  almacenar los marcadores de eventos
    let eventMarkers = [];

    /* Intento de cocina fallido :(
    
    // Función para mostrar eventos filtrados
    function displayFilteredEvents() {
        const selectedEventTypes = Array.from(document.querySelectorAll('input[name="event"]:checked')).map(cb => cb.value);

        eventMarkers.forEach(marker => map.removeLayer(marker));
        eventMarkers = [];

        fetch('https://eonet.gsfc.nasa.gov/api/v3/events')
            .then(response => response.json())
            .then(data => {
                const events = data.events;
                const noGeometriesList = document.getElementById('no-geometries-list');
                const noGeometriesContainer = document.getElementById('no-geometries');
                
                // Verifica si noGeometriesList existe
                if (!noGeometriesList) {
                    console.error("El elemento no-geometries-list no existe.");
                    return;
                }

                // Limpiar la lista de eventos sin geometrías
                noGeometriesList.innerHTML = '';

                let eventsWithoutGeometries = 0;

                events.forEach(event => {
                    const eventType = event.categories[0]?.title || 'Desconocido';

                    if (event.geometries && event.geometries.length > 0) {
                        const coordinates = event.geometries[0]?.coordinates;

                        if (coordinates && coordinates.length === 2) {
                            const lat = coordinates[1];
                            const lng = coordinates[0];

                            const marker = L.marker([lat, lng], { icon: getEventIcon(eventType) }).addTo(map);

                            marker.bindPopup(`
                                <strong>${event.title}</strong><br>
                                Tipo: ${eventType}<br>
                                Fecha: ${new Date(event.geometries[0].date).toLocaleDateString()}<br>
                                <a href="${event.link}" target="_blank">Más información</a>
                            `);
                        } else {
                            console.warn(`El evento "${event.title}" no tiene coordenadas válidas.`);
                        }
                    } else {
                        const li = document.createElement('li');
                        li.textContent = event.title;
                        noGeometriesList.appendChild(li);
                        eventsWithoutGeometries++;
                    }
                });

                if (eventsWithoutGeometries > 0) {
                    noGeometriesContainer.style.display = 'block';
                } else {
                    noGeometriesContainer.style.display = 'none';
                }
            })
            .catch(error => console.error('Error al obtener los datos de EONET:', error));
    }
     */

    // obtener el icono 
    function getEventIcon(eventType) {
        let iconHtml = '';

        switch (eventType) {
            case 'Wildfires':
                iconHtml = '🔥';
                break;
            case 'Severe Storms':
            case 'Storms':
                iconHtml = '🌩️';
                break;
            case 'Earthquakes':
                iconHtml = '🌍';
                break;
            default:
                iconHtml = '❓';
        }

        return L.divIcon({
            className: 'custom-icon',
            html: `<span style="font-size: 24px;">${iconHtml}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    }
});
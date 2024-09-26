
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

    let currentMarker = null; // almacenar el marcador actual

    // obtener la temperatura
    async function getTemperatureForDate(lat, lon) {
        // API de WeatherAPI
        const url = `http://api.weatherapi.com/v1/current.json?key=7efd92e5d70c4aa9b6e140648242509&q=${lat},${lon}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('Datos obtenidos:', data);
    
            // Verificar si hay datos 
            if (data && data.current && typeof data.current.temp_c !== 'undefined') {
                return data.current.temp_c;
            } else {
                console.warn('No se encontraron datos de temperatura para esta ubicación.');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener los datos de temperatura:', error);
            return null;
        }
    }
    
    // Mostrar temp mapa
    async function displayTemperatureOnClick(lat, lon) {
        const temperature = await getTemperatureForDate(lat, lon);
    
        let popupContent = '';
    
        if (temperature !== null) {
            
            popupContent += `<b>Temperatura Actual:</b> ${temperature.toFixed(2)} °C<br>`;
        } else {
            popupContent += 'Datos no disponibles para esta ubicación.';
        }
    
        // Eliminar marca antigua
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
    
        // nuevo marcador con popup
        currentMarker = L.marker([lat, lon]).addTo(map);
        currentMarker.bindPopup(popupContent).openPopup();
    }
    
    // Evento al hacer clic en el mapa
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        displayTemperatureOnClick(lat, lng);
    });
    
    // Obtener eventos de la API EONET y filtrarlos
    async function getWildfires(startDate, endDate) {
        try {
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires');
            const data = await response.json();
            
            const filteredEvents = data.events.filter(event => {
                const eventDate = new Date(event.geometry[0].date);
                return eventDate >= startDate && eventDate <= endDate;
            });
    
            if (filteredEvents.length > 0) {
                displayWildfires(filteredEvents);
            } else {
                console.warn('No wildfires found in the specified date range.');
            }
        } catch (error) {
            console.error('Error fetching wildfires:', error);
        }
    }

    async function getVolcanoes(startDate, endDate) {
        try {
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=volcanoes');
            const data = await response.json();

            const filteredEvents = data.events.filter(event => {
                const eventDate = new Date(event.geometry[0].date);
                return eventDate >= startDate && eventDate <= endDate;
            });
    
            if (filteredEvents.length > 0) {
                displayVolcanoes(filteredEvents);
            } else {
                console.warn('No volcanoes found in the specified date range.');
            }
        } catch (error) {
            console.error('Error fetching volcanoes:', error);
        }
    }

    async function getSevereStorms(startDate, endDate) {
        try {
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=severeStorms');
            const data = await response.json();

            const filteredEvents = data.events.filter(event => {
                const eventDate = new Date(event.geometry[0].date);
                return eventDate >= startDate && eventDate <= endDate;
            });
    
            if (filteredEvents.length > 0) {
                displaySevereStorms(filteredEvents);
            } else {
                console.warn('No severe events found in the specified date range.');
            }
        } catch (error) {
            console.error('Error fetching severe events:', error);
        }
    }
    
    async function getSeaLakeIce(startDate, endDate) {
        try {
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=seaLakeIce');
            const data = await response.json();

            const filteredEvents = data.events.filter(event => {
                const eventDate = new Date(event.geometry[0].date);
                return eventDate >= startDate && eventDate <= endDate;
            });
    
            if (filteredEvents.length > 0) {
                displaySeaLakeIce(filteredEvents);
            } else {
                console.warn('No sea lakes found in the specified date range.');
            }
        } catch (error) {
            console.error('Error fetching sea lakes:', error);
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
        // Mostrar los volcanes
        function displayVolcanoes(events) {
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
                                icon: getEventIcon('Volcanoes')
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

        // Mostrar las tormentas severas
        function displaySevereStorms(events) {
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
                                icon: getEventIcon('SevereStorms')
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

    // Mostrar los icebergs

    function displaySeaLakeIce(events) {
        events.forEach(event => {
            if (event.geometry && event.geometry.length > 0) {
                const geometry = event.geometry[0];
                const coordinates = geometry.coordinates;

                if (geometry.type === 'Point' && coordinates.length === 2) {
                    const lat = coordinates[1]; 
                    const lng = coordinates[0];

                    if (lat && lng) {
                        let marker = L.marker([lat, lng], { 
                            icon: getEventIcon('SeaLakeIce')
                        }).addTo(map);

                        marker.bindPopup(`<b>${event.title}</b><br>Fecha: ${new Date(geometry.date).toLocaleString()}`);
                    }  else {
                        console.warn('Coordenadas inválidas para el evento:', event.title); 
                    }
                }else {
                    console.warn(`El evento ${event.title} no tiene una geometría de tipo Point con coordenadas válidas.`); 
                }
            } else {
                console.warn(`El evento ${event.title} no tiene geometrías disponibles.`); 
            }
        });

        map.invalidateSize();
    }

    // icono para el evento
    function getEventIcon(eventType) {
        switch (eventType) {
            case 'Wildfires':
            
                return L.icon({
                    iconUrl: './img/fuego.png', 
                    iconSize: [25, 25], 
                    iconAnchor: [22, 38], 
                    popupAnchor: [-3, -38] 
                });

            case 'Earthquakes':

                return L.icon({
                    iconUrl: './img/terremoto.png', 
                    iconSize: [20, 20], 
                    iconAnchor: [22, 38], 
                    popupAnchor: [-3, -38] 
                });
            
            case 'Volcanoes':
                return L.icon({
                    iconUrl: './img/volcan.png', 
                    iconSize: [30, 30], 
                    iconAnchor: [22, 38], 
                    popupAnchor: [-3, -38] 
                });
            
            case 'SevereStorms':
            return L.icon({
                iconUrl: './img/severestorms.png', 
                iconSize: [30, 30], 
                iconAnchor: [22, 38], 
                popupAnchor: [-3, -38] 
            });

            case 'SeaLakeIce': 
            return L.icon({
                iconUrl: './img/seaLakeIce.png', 
                iconSize: [22, 22], 
                iconAnchor: [22, 38], 
                popupAnchor: [-3, -38] 
            });
            default:
                return L.icon({
                    iconUrl: '', 
                    iconSize: [38, 38],
                    iconAnchor: [22, 38],
                    popupAnchor: [-3, -38]
                });
        }
    }

    document.getElementById('event-filter').addEventListener('submit', function (e) {
        e.preventDefault();
        displayFilteredEvents();
    });

   
    async function displayFilteredEvents() {
        
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Recupera las fechas del formulario
        const startDateInput = document.getElementById('start').value;
        const endDateInput = document.getElementById('end').value;

        let startDate = null;
        let endDate = null;

        if (startDateInput) {
            startDate = new Date(startDateInput);
        }

        if (endDateInput) {
            endDate = new Date(endDateInput);
        }


        // Selecciona los eventos del checkbox seleccionado
        document.querySelectorAll('input[name="event"]:checked').forEach(checkbox => {
            const eventType = checkbox.value;

            if (eventType === 'Wildfires') {
                if (startDate && endDate) {
                    getWildfires(startDate, endDate);
                } else {
                    getWildfires(new Date('2000-01-01'), new Date());
                }
            } else if (eventType === 'Volcanoes') {
                if (startDate && endDate) {
                    getVolcanoes(startDate, endDate);
                } else {
                    getVolcanoes(new Date('2000-01-01'), new Date());
                }
            } else if (eventType === 'SevereStorms') {
                if (startDate && endDate) {
                    getSevereStorms(startDate, endDate);
                } else {
                    getSevereStorms(new Date('2000-01-01'), new Date());
                }
            } else if (eventType === 'SeaLakeIce') {
                if (startDate && endDate) {
                    getSeaLakeIce(startDate, endDate);
                } else {
                    getSeaLakeIce(new Date('2000-01-01'), new Date());
                }
            }
        });
    }
    

    // cambio en los checkboxes
    document.querySelectorAll('input[name="event"]').forEach(checkbox => {
        checkbox.addEventListener('change', displayFilteredEvents);
    });

    // capas 
    
    let openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });
    
    
    let esriSat =  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors'
    });

    let cartoDBDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    // capa base  por defecto
    openStreetMap.addTo(map);

    //  marcadores (capa superpuesta)
    let markers = L.layerGroup();

    // Añadir los marcadores al mapa
    markers.addTo(map);

    //  control de capas
    let baseMaps = {
        "Mapa": openStreetMap,
        "Topógrafico": esriSat,
        "Oscuro": cartoDBDark
    };

    // definir overlayMaps como un objeto vacío
    let overlayMaps = {}; 

    // Añadir el control 
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Mapa 3D
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const globeContainer = document.getElementById('globe-container');
    if (globeContainer) {
        globeContainer.appendChild(renderer.domElement);
    } else {
        console.error('El contenedor 3D "globe-container" no existe en el DOM.');
    }

    const radius = 5;
    const segments = 50;
    const globeGeometry = new THREE.SphereGeometry(radius, segments, segments);

    const globeMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://a.tile.openstreetmap.org/0/0/0.png')
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    camera.position.z = 15;

    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.001;
        renderer.render(scene, camera);
    }

    animate();

    // Alternar mapa 2D y 3D
    const btn3D = document.getElementById('btn3D');
    const mapContainer = document.getElementById('map-container');

    btn3D.addEventListener('click', () => {
        if (mapContainer.style.display === 'none') {
            mapContainer.style.display = 'block';
            globeContainer.style.display = 'none';
            btn3D.textContent = 'Cambiar a 3D';
            map.invalidateSize();
        } else {
            mapContainer.style.display = 'none';
            globeContainer.style.display = 'block';
            btn3D.textContent = 'Cambiar a 2D';
        }
    });

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        map.invalidateSize();
    });

    // Search bar
    let searchControl = new L.esri.Controls.Geosearch().addTo(map);

    let results = new L.LayerGroup().addTo(map);

      searchControl.on('results', function(data){
        results.clearLayers();
        for (let i = data.results.length - 1; i >= 0; i--) {
          results.addLayer(L.marker(data.results[i].latlng));
        }
    });
    
     // voz
    // configurando el comando de voz
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    var eventos = ['volcanoes', 'wildfires','storms','icebergs'];

    var grammar = '#JSGF V1.0; grammar eventos; public <evento> = ' + eventos.join(' | ') + ' ;';

    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();

    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = false; // si lo pongo true reconoce la voz todo el rato 
    recognition.lang = "en-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    //hacer la function onclick para pulsar en el btn y que se active el reconocimiento solo. 
    const voiceButton = document.getElementById('voiceButton')

    voiceButton.addEventListener('click', () => {
        recognition.start();
        console.log('Voice recognition started');
    });

    // manejo resultados
    recognition.onresult = function (event) {
        var evento = event.results[0][0].transcript.toLowerCase();
        console.log("Resultado recibido: " + evento + ".");
    
        // llamar a la funcion 
        if (evento.includes('volcanoes')) {
            console.log('Mostrando eventos de volcanes');
            getVolcanoes(new Date('2000-01-01'), new Date());
        } else if (evento.includes('wildfires')) {
            console.log('Mostrando eventos de incendios');
            getWildfires(new Date('2000-01-01'), new Date());
        } else if (evento.includes('storms')) {
            console.log('Mostrando eventos de tormentas severas');
            getSevereStorms(new Date('2000-01-01'), new Date());
        } else if (evento.includes('icebergs')) {
            console.log('Mostrando eventos de icebergs');
            getSeaLakeIce(new Date('2000-01-01'), new Date());
        } else {
            console.log('No se reconoció el evento.');
        }
    };

  //errores en la voz

    recognition.onerror = function (evento) {
    diagnostic.textContent = "Error en crear el evento: " + evento.error;
    };


    
});
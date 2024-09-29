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
        btn3D.textContent = '3D MAP';
        map.invalidateSize();
    } else {
        mapContainer.style.display = 'none';
        globeContainer.style.display = 'block';
        btn3D.textContent = '2D MAP';
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    map.invalidateSize();
});
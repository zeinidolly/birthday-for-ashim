// --- 1. Инициализация Сцены ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x00001a); // Цвет темного неба
document.getElementById('scene-container').appendChild(renderer.domElement);

// Устанавливаем камеру для лучшего обзора торта
camera.position.set(0, 4, 10);

// --- 2. Свет ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

// Добавляем Directional Light, чтобы торт выглядел объемным
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 5);
scene.add(mainLight);


// --- 3. Создание Звездного Неба ---
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 6000;
    const vertices = [];

    for (let i = 0; i < starCount; i++) {
        // Рандомное распределение звезд в очень большом пространстве
        const x = THREE.MathUtils.randFloatSpread(500); 
        const y = THREE.MathUtils.randFloatSpread(500);
        const z = THREE.MathUtils.randFloatSpread(500);
        vertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15, // Немного крупнее для видимости
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

const stars = createStarField();


// --- 4. Создание Вращающегося Торта и Свечей ---

const cakeGroup = new THREE.Group();
const cakeColor = 0xf5b7c8; // Светло-розовый цвет
const frostingColor = 0xffe6f0; // Более светлый крем
const cakeMaterial = new THREE.MeshPhongMaterial({ color: cakeColor });
const frostingMaterial = new THREE.MeshPhongMaterial({ color: frostingColor });

// 4.1. Слои торта
const layers = [
    { radius: 2.5, y: 0.5 },
    { radius: 2.0, y: 1.5 },
    { radius: 1.5, y: 2.5 }
];

layers.forEach(layer => {
    const geo = new THREE.CylinderGeometry(layer.radius, layer.radius, 1, 64);
    const mesh = new THREE.Mesh(geo, cakeMaterial);
    mesh.position.y = layer.y;
    cakeGroup.add(mesh);

    // 4.2. Декоративный крем (Ruffles) по краю
    const ruffleRadius = layer.radius + 0.05;
    const ruffleGeo = new THREE.TorusGeometry(ruffleRadius, 0.08, 16, 100);
    const ruffle = new THREE.Mesh(ruffleGeo, frostingMaterial);
    ruffle.rotation.x = Math.PI / 2;
    ruffle.position.y = layer.y + 0.5;
    cakeGroup.add(ruffle);
});

// 4.3. Подставка для торта (как на макете)
const standGeo = new THREE.CylinderGeometry(0.5, 1.5, 1.5, 32);
const standMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const stand = new THREE.Mesh(standGeo, standMat);
stand.position.y = -0.75;
cakeGroup.add(stand);

// 4.4. Свечи
function addCandles(group, radius, count, height) {
    const candleGeometry = new THREE.CylinderGeometry(0.08, 0.08, height, 16);
    const candleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); 
    const flameColor = 0xffaa00; 
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        // Тело свечи
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        candle.position.set(x, 3.0 + height / 2, z); 
        group.add(candle);
        
        // Пламя (Light) - Имитация мерцания
        const flameLight = new THREE.PointLight(flameColor, 3, 1.5); 
        flameLight.position.set(x, 3.0 + height, z);
        flameLight.userData.baseIntensity = 3; // Для анимации мерцания
        group.add(flameLight);
        
        // Пламя (Visual - жёлтая точка)
        const flameGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: flameColor });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.copy(flameLight.position);
        group.add(flame);
    }
}

// Добавляем 5 свечей на верхний слой торта (радиус 0.7, высота 1.0)
addCandles(cakeGroup, 0.7, 5, 1.0); 

scene.add(cakeGroup);
cakeGroup.position.y = 0.5;


// --- 5. Интерактивные Ячейки (Сюрпризы) ---
const surpriseData = [
    // УКАЗАТЬ ВАШИ ПОЖЕЛАНИЯ И ПУТИ К ФОТО
    { title: "Наша Первая Встреча", text: "Вспоминаешь этот день? Как будто вчера! (Ваше пожелание 1)", image: './2026-01-03 18.07.05.jpg', position: new THREE.Vector3(3.5, 4.5, 0) },
    { title: "Мое Главное Пожелание", text: "Ашим, я желаю тебе достичь,всего что ты желаешь ", image: './photo2.jpg', position: new THREE.Vector3(-3.5, 4.5, 0) },
    { title: "Мой Огромный Сюрприз", text: "Тут ты должен развернуть большой подарок! (Ваше пожелание 3)", image: '', position: new THREE.Vector3(0, 7, 0) }
];

const interactiveMeshes = [];
const surpriseMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.01 }); // Почти невидимый объект
const surpriseGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1); // Большая кликабельная область

surpriseData.forEach((data) => {
    const mesh = new THREE.Mesh(surpriseGeometry, surpriseMaterial.clone());
    mesh.position.copy(data.position);
    mesh.userData = data; 
    scene.add(mesh);
    interactiveMeshes.push(mesh);
});

// --- 6. Raycasting (Для кликов) ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let INTERSECTED = null;

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    document.body.style.cursor = 'default'; // Сброс курсора
}

function onClick(event) {
    // При клике открываем модальное окно, только если объект наведен
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
        showModal(intersects[0].object.userData);
    }
}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('click', onClick);


// --- 7. Анимационный Цикл ---
const allFlameLights = cakeGroup.children.filter(obj => obj.isPointLight);

function animate() {
    requestAnimationFrame(animate);

    // Вращение торта и звезд
    cakeGroup.rotation.y += 0.005;
    stars.rotation.y += 0.0005;

    // Мерцание пламени
    const time = Date.now() * 0.003;
    allFlameLights.forEach(light => {
        // Рандомное изменение интенсивности
        light.intensity = light.userData.baseIntensity + Math.sin(time + light.position.x * 10) * 0.5;
    });


    // Обработка наведения курсора
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
        // Устанавливаем курсор "рука", чтобы показать интерактивность
        document.body.style.cursor = 'pointer'; 
    } else {
        document.body.style.cursor = 'default'; 
    }

    renderer.render(scene, camera);
}

animate();

// --- 8. Управление Модальным Окном ---

const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalImage = document.getElementById('modal-image');

function showModal(data) {
    modalTitle.textContent = data.title;
    modalText.textContent = data.text;
    
    if (data.image) {
        modalImage.src = data.image;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }

    modal.style.display = 'block';
}

closeButton.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


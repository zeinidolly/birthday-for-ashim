// --- 1. Инициализация Сцены ---
const scene = new THREE.Scene();
// Камера с более широким обзором
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Глубокий черный фон для ночного неба
document.getElementById('scene-container').appendChild(renderer.domElement);

// Позиция камеры, чтобы торт был хорошо виден
camera.position.set(0, 4, 10);

// --- 2. Свет ---
const ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

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
        size: 0.25, // Увеличенный размер для видимости на черном фоне
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

const stars = createStarField();


// --- 4. Создание Вращающегося Торта и Свечей ---

const cakeGroup = new THREE.Group();
const cakeColor = 0xf5b7c8;
const frostingColor = 0xffe6f0;
const cakeMaterial = new THREE.MeshPhongMaterial({ color: cakeColor });
const frostingMaterial = new THREE.MeshPhongMaterial({ color: frostingColor });

// Слои торта
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

    // Декоративный крем (Ruffles)
    const ruffleRadius = layer.radius + 0.05;
    const ruffleGeo = new THREE.TorusGeometry(ruffleRadius, 0.08, 16, 100);
    const ruffle = new THREE.Mesh(ruffleGeo, frostingMaterial);
    ruffle.rotation.x = Math.PI / 2;
    ruffle.position.y = layer.y + 0.5;
    cakeGroup.add(ruffle);
});

// Подставка
const standGeo = new THREE.CylinderGeometry(0.5, 1.5, 1.5, 32);
const standMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const stand = new THREE.Mesh(standGeo, standMat);
stand.position.y = -0.75;
cakeGroup.add(stand);

// Свечи
function addCandles(group, radius, count, height) {
    const candleGeometry = new THREE.CylinderGeometry(0.08, 0.08, height, 16);
    const candleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); 
    const flameColor = 0xffaa00; 
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        const candle = new THREE.Mesh(candleGeometry, candleMaterial.clone());
        candle.position.set(x, 3.0 + height / 2, z); 
        group.add(candle);
        
        const flameLight = new THREE.PointLight(flameColor, 3, 1.5); 
        flameLight.position.set(x, 3.0 + height, z);
        flameLight.userData.baseIntensity = 3; 
        group.add(flameLight);
        
        const flameGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: flameColor });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.copy(flameLight.position);
        group.add(flame);
    }
}

addCandles(cakeGroup, 0.7, 5, 1.0); 
scene.add(cakeGroup);
cakeGroup.position.y = 0.5;

const allFlameLights = cakeGroup.children.filter(obj => obj.isPointLight);


// --- 5. Интерактивные Сердечки-Сюрпризы ---
// !!! ВАЖНО: ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ !!!
const surpriseData = [
    { title: "🎁 Сердечко 1: Наша Встреча", text: "Вспоминаешь этот день? Как будто вчера! (Ваше пожелание 1)", image: './photo1.jpg', position: new THREE.Vector3(4, 3, 0), color: 0xff007f },
    { title: "💖 Сердечко 2: Главное Пожелание", text: "Ашим, я желаю тебе... (Ваше пожелание 2)", image: './photo2.jpg', position: new THREE.Vector3(-4, 6, 1), color: 0x00ffff },
    { title: "🌟 Сердечко 3: Секретный Подарок", text: "Тут ты должен развернуть большой подарок! (Ваше пожелание 3)", image: '', position: new THREE.Vector3(0, 8, -2), color: 0xffff00 },
];

const interactiveMeshes = [];

// Геометрия сердечка (приближенная форма)
function createHeartGeometry() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.15, y + 0.65, x, y + 0.85);
    shape.bezierCurveTo(x + 0.15, y + 0.65, x + 0.3, y + 0.55, x + 0.3, y + 0.35);
    shape.bezierCurveTo(x + 0.3, y + 0.35, x + 0.3, y, x + 0.25, y + 0.25);
    
    const geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 2,
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 1
    });
    geometry.scale(0.5, 0.5, 0.5); 
    return geometry;
}

const heartGeometry = createHeartGeometry();

surpriseData.forEach((data, index) => {
    const heartMaterial = new THREE.MeshPhongMaterial({ 
        color: data.color, 
        transparent: true, 
        opacity: 0.9,
        emissive: data.color, 
        emissiveIntensity: 0.3
    });
    
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    
    heart.position.copy(data.position);
    heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    heart.userData = data; 
    heart.userData.baseY = data.position.y;
    heart.userData.animationIndex = index;
    
    scene.add(heart);
    interactiveMeshes.push(heart);
});


// --- 6. Raycasting (Для кликов) ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    document.body.style.cursor = 'default'; 
}

function onClick(event) {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
        showModal(intersects[0].object.userData);
    }
}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('click', onClick);


// --- 7. Анимационный Цикл ---
function animate(time) {
    requestAnimationFrame(animate);
    const actualTime = time * 0.003;

    // Вращение торта и звезд
    cakeGroup.rotation.y += 0.005;
    stars.rotation.y += 0.0005;

    // Мерцание пламени
    allFlameLights.forEach(light => {
        light.intensity = light.userData.baseIntensity + Math.sin(actualTime + light.position.x * 10) * 0.5;
    });

    // Анимация полета сердечек
    interactiveMeshes.forEach((heart) => {
        // Медленное вертикальное движение (вверх-вниз)
        const verticalShift = Math.sin(actualTime * 0.5 + heart.userData.animationIndex * 5) * 0.5;
        heart.position.y = heart.userData.baseY + verticalShift;
        
        // Постоянное медленное вращение
        heart.rotation.z += 0.01;
    });

    // Обработка наведения курсора
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
        // Эффект выделения: увеличиваем сердечко
        const intersectedHeart = intersects[0].object;
        if (intersectedHeart.scale.x < 1.1) {
             intersectedHeart.scale.set(1.1, 1.1, 1.1);
        }
        document.body.style.cursor = 'pointer'; 
    } else {
        // Сброс размера всех сердечек
        interactiveMeshes.forEach(heart => {
            if (heart.scale.x > 1.0) {
                heart.scale.set(1.0, 1.0, 1.0);
            }
        });
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

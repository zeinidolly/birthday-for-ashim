// --- 1. Инициализация Сцены ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// Устанавливаем камеру
camera.position.z = 8;
camera.position.y = 3;

// --- 2. Свет ---
// Добавляем мягкий свет для освещения торта
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Мягкий окружающий свет
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5); // Точечный свет
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- 3. Создание Звездного Неба (Много мелких деталей!) ---
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const vertices = [];

    for (let i = 0; i < starCount; i++) {
        // Рандомное распределение звезд в большом кубе
        const x = THREE.MathUtils.randFloatSpread(400); // От -200 до 200
        const y = THREE.MathUtils.randFloatSpread(400);
        const z = THREE.MathUtils.randFloatSpread(400);
        vertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1, // Мелкие звезды
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

const stars = createStarField();

// --- 4. Создание Вращающегося Торта (Многослойный) ---
const cakeGroup = new THREE.Group();
const cakeMaterial = new THREE.MeshPhongMaterial({ color: 0xffa0c0 }); // Розовый крем

// Слой 1 (Нижний)
const geo1 = new THREE.CylinderGeometry(2.5, 2.5, 1, 32);
const mesh1 = new THREE.Mesh(geo1, cakeMaterial);
mesh1.position.y = 0.5;
cakeGroup.add(mesh1);

// Слой 2 (Средний)
const geo2 = new THREE.CylinderGeometry(2.0, 2.0, 1, 32);
const mesh2 = new THREE.Mesh(geo2, cakeMaterial);
mesh2.position.y = 1.5;
cakeGroup.add(mesh2);

// Слой 3 (Верхний)
const geo3 = new THREE.CylinderGeometry(1.5, 1.5, 1, 32);
const mesh3 = new THREE.Mesh(geo3, cakeMaterial);
mesh3.position.y = 2.5;
cakeGroup.add(mesh3);

// Добавляем торт в сцену
scene.add(cakeGroup);
cakeGroup.position.y = -1; // Опускаем его немного, чтобы был виден постамент

// --- 5. Интерактивные Ячейки (Сюрпризы) ---
const surpriseData = [
    { title: "Наша Первая Встреча", text: "Вспоминаешь этот день? Как будто вчера!", image: './photo1.jpg', position: new THREE.Vector3(3, 1.5, 0) },
    { title: "Забавный Случай", text: "Ха-ха, помнишь, как...", image: './photo2.jpg', position: new THREE.Vector3(-3, 1.5, 0) },
    { title: "Мое Пожелание", text: "Ашим, я желаю тебе... (Твой текст).", image: '', position: new THREE.Vector3(0, 4, 1) }
];

const interactiveMeshes = [];
const surpriseMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, transparent: true, opacity: 0.8 });
const surpriseGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.05);

surpriseData.forEach((data) => {
    const mesh = new THREE.Mesh(surpriseGeometry, surpriseMaterial.clone());
    mesh.position.copy(data.position);
    mesh.userData = data; // Сохраняем данные сюрприза в объекте
    scene.add(mesh);
    interactiveMeshes.push(mesh);
});

// --- 6. Raycasting (Для кликов и наведения) ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let INTERSECTED = null;

function onPointerMove(event) {
    // Нормализация координат мыши
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    if (INTERSECTED) {
        // Если кликнули на интерактивный объект, показываем модальное окно
        showModal(INTERSECTED.userData);
    }
}

// Добавляем слушатели
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('click', onClick);

// --- 7. Анимационный Цикл ---
function animate() {
    requestAnimationFrame(animate);

    // Вращение торта
    cakeGroup.rotation.y += 0.005;

    // Вращение звезд (для динамики)
    stars.rotation.y += 0.0005;

    // Обновление Raycaster для эффекта наведения
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            // Возвращаем цвет предыдущему объекту (если был)
            if (INTERSECTED) {
                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            }
            // Выделяем новый объект
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xffff00); // Желтое свечение
        }
    } else {
        // Если ничего не наведено
        if (INTERSECTED) {
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = null;
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

// Закрытие модального окна по кнопке или клику вне его
closeButton.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Адаптивность
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
  


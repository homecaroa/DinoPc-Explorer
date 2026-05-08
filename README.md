# 🦕 DinoPC Explorer

**Juego educativo HTML para niños de 7-10 años que enseña informática básica mediante un sistema operativo temático jurásico.**

![DinoPC Explorer](assets/images/preview-placeholder.png)

---

## 🎮 Cómo jugar

1. **Abre `index.html`** en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
2. No necesita servidor, instalación ni conexión a internet.
3. Haz clic en **▶ JUGAR** para comenzar.

---

## 🗂️ Estructura del proyecto

```
DinoPC-Explorer/
├── index.html              ← Punto de entrada
├── css/
│   └── style.css           ← Estilos completos (tema oscuro jurásico)
├── js/
│   ├── app.js              ← Estado global y navegación de pantallas
│   ├── desktop.js          ← Gestor de ventanas + FileExplorer + DinoWord
│   ├── mission.js          ← Sistema de misión (5 pasos auto-detectados)
│   ├── minigame.js         ← Minijuego "Rescate del Río" (Canvas 2D)
│   ├── quiz.js             ← DinoQuiz (10 preguntas, 3 aleatorias)
│   └── collection.js       ← Colección de fichas de dinosaurios
└── assets/
    ├── images/             ← Carpeta para imágenes futuras
    └── audio/              ← Carpeta para audio futuro
```

---

## 🦕 Misión principal

| Paso | Objetivo |
|------|----------|
| 1️⃣ | Crear carpeta **"Expedición Spinosaurio"** en el Explorador de Archivos |
| 2️⃣ | Abrir el editor **DinoWord** |
| 3️⃣ | Escribir: *"El Spinosaurio encontró peces gigantes en el río."* |
| 4️⃣ | Guardar el archivo como **`informe_spino.doc`** |
| 5️⃣ | Mover el archivo a la carpeta de la expedición |

Al completar la misión → se abre el **DinoQuiz** → al superarlo → se desbloquea la **ficha del Spinosaurio** 🏆

---

## 🎯 Módulos del juego

### 🖥️ Escritorio (Windows-inspired)
- Iconos arrastrables y ventanas flotantes
- Barra de tareas con menú Inicio
- Reloj en tiempo real
- Guía Spinosaurio (Rex) con consejos

### 📁 Explorador de Archivos
- Sistema de archivos virtual
- Crear carpetas y mover archivos

### 📝 DinoWord
- Editor de texto educativo
- Detección automática del texto correcto
- Guardar archivos con nombre personalizable

### 🎮 Rescate del Río
- Canvas 2D puro
- Spinosaurio animado nadando
- Recoger documentos (⭐ +10) y evitar virus (⭐ -5)
- 60 segundos de duración
- Controles: flechas ↑↓ o W/S

### 🧠 DinoQuiz
- 10 preguntas científicas sobre dinosaurios
- 3 seleccionadas aleatoriamente por partida
- Feedback inmediato con datos reales
- Desbloquea fichas de dinosaurios

### 🏆 Colección
- Fichas detalladas de dinosaurios desbloqueados
- Datos científicos: peso, tamaño, dieta, período
- Fichas bloqueadas como incentivo de progresión

---

## 🎨 Stack técnico

- **HTML5** puro (sin frameworks)
- **CSS3** con variables, animaciones y CSS art
- **JavaScript ES6** vanilla y modular
- **Canvas API** para el minijuego
- **localStorage** para persistir la colección

---

## 🦴 Datos científicos incluidos

| Dinosaurio | Período | Dieta | Longitud | Peso |
|------------|---------|-------|----------|------|
| Spinosaurio | Cretácico (~95-100 Ma) | Piscívoro | 14–18m | 7–14t |
| T-Rex *(bloqueado)* | Cretácico tardío | Carnívoro | 12–13m | 8–14t |
| Triceratops *(bloqueado)* | Cretácico tardío | Herbívoro | 8–9m | 6–12t |
| Braquiosaurio *(bloqueado)* | Jurásico tardío | Herbívoro | 22–26m | 28–60t |

---

## 🚀 Próximas funcionalidades (roadmap)

- [ ] Más misiones y dinosaurios desbloqueables
- [ ] Música ambiental procedural
- [ ] Modo multijugador local
- [ ] Generador de informes PDF
- [ ] Mini-enciclopedia jurásica
- [ ] Sistema de insignias y logros

---

## 📄 Licencia

MIT License — Libre para uso educativo.

---

*DinoPC Explorer — Donde la informática se encuentra con el Jurásico 🦕*

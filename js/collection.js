/**
 * DinoPC Explorer — collection.js
 * Sistema de colección de dinosaurios.
 * Define los datos científicos de cada dinosaurio
 * y renderiza las fichas en la pantalla de colección.
 */

const Collection = {

  /** Base de datos de dinosaurios */
  data: {
    spinosaurus: {
      id:      'spinosaurus',
      name:    'Spinosaurus aegyptiacus',
      emoji:   '🦕',
      cardImg: 'assets/images/spinosaurus_card.png',
      weight:  '7–14 toneladas',
      size:    '14–18 metros',
      diet:    'Piscívoro / Carnívoro',
      period:  'Cretácico (95–100 Ma)',
      fact:    'El Spinosaurio era semiacuático y el mayor carnívoro conocido. Su larga vela dorsal y su hocico cocodrileño lo hacen inconfundible.',
      color:   '#00ff88'
    },
    trex: {
      id:      'trex',
      name:    'Tyrannosaurus rex',
      emoji:   '🦖',
      cardImg: 'assets/images/t_rex_card.png',
      weight:  '8–14 toneladas',
      size:    '12–13 metros',
      diet:    'Carnívoro (cazador/carroñero)',
      period:  'Cretácico tardío (68–66 Ma)',
      fact:    'El T-Rex tenía la mordida más poderosa de la historia animal y sentidos excepcionales para cazar.',
      color:   '#ff6644'
    },
    triceratops: {
      id:      'triceratops',
      name:    'Triceratops horridus',
      emoji:   '🦏',
      cardImg: 'assets/images/triceratops_card.png',
      weight:  '6–12 toneladas',
      size:    '8–9 metros',
      diet:    'Herbívoro',
      period:  'Cretácico tardío (68–66 Ma)',
      fact:    'El Triceratops era contemporáneo del T-Rex y su collarín óseo podía medir hasta 2 metros de diámetro.',
      color:   '#4488ff'
    },
    velociraptor: {
      id:      'velociraptor',
      name:    'Velociraptor mongoliensis',
      emoji:   '🦎',
      cardImg: 'assets/images/velociraptor_card.png',
      weight:  '15–25 kilogramos',
      size:    '1.8–2 metros',
      diet:    'Carnívoro (pequeñas presas)',
      period:  'Cretácico tardío (75–71 Ma)',
      fact:    'El Velociraptor real era del tamaño de un pavo y estaba cubierto de plumas. Las películas lo hicieron famoso pero ¡mucho más grande de lo que era!',
      color:   '#ffaa22'
    },
    ankylosaurus: {
      id:      'ankylosaurus',
      name:    'Ankylosaurus magniventris',
      emoji:   '🐢',
      cardImg: 'assets/images/ankylosaurus_card.png',
      weight:  '6–8 toneladas',
      size:    '6–8 metros',
      diet:    'Herbívoro (plantas bajas)',
      period:  'Cretácico tardío (68–66 Ma)',
      fact:    'El Ankylosaurus tenía una cola en forma de maza tan potente que podía romper los huesos de un T-Rex. ¡El dinosaurio más acorazado de la historia!',
      color:   '#66bbaa'
    },
    stegosaurus: {
      id:      'stegosaurus',
      name:    'Stegosaurus stenops',
      emoji:   '🦕',
      cardImg: 'assets/images/stegosaurus_card.png',
      weight:  '5–7 toneladas',
      size:    '9 metros',
      diet:    'Herbívoro (plantas bajas)',
      period:  'Jurásico tardío (155–150 Ma)',
      fact:    'Las placas del Estegosaurio servían para regular la temperatura y posiblemente para comunicarse con su especie mediante cambios de color.',
      color:   '#88bb44'
    },
    parasaurolophus: {
      id:      'parasaurolophus',
      name:    'Parasaurolophus walkeri',
      emoji:   '🦕',
      cardImg: 'assets/images/parasaurolophus_card.png',
      weight:  '2.5–5 toneladas',
      size:    '9–10 metros',
      diet:    'Herbívoro (coníferas y hojas)',
      period:  'Cretácico tardío (76–73 Ma)',
      fact:    'Su cresta hueca de hasta 1.8 m actuaba como un instrumento musical para comunicarse. ¡El dino con megáfono natural del Cretácico!',
      color:   '#44aacc'
    },
    carnotaurus: {
      id:      'carnotaurus',
      name:    'Carnotaurus sastrei',
      emoji:   '🦖',
      cardImg: 'assets/images/carnotaurus_card.png',
      weight:  '1.3–2.1 toneladas',
      size:    '7–8 metros',
      diet:    'Carnívoro (dinosaurios medianos)',
      period:  'Cretácico tardío (70–69 Ma)',
      fact:    '¡Próximamente! El Carnotaurus es famoso por sus cuernos de toro sobre los ojos y sus brazos extremadamente cortos, ¡más que los del T-Rex!',
      color:   '#ff6633',
      locked:  true
    },
    brachiosaurus: {
      id:      'brachiosaurus',
      name:    'Brachiosaurus altithorax',
      emoji:   '🦒',
      cardImg: 'assets/images/brachiosaurus_card.png',
      weight:  '28–60 toneladas',
      size:    '22–26 metros',
      diet:    'Herbívoro (copas de árboles)',
      period:  'Jurásico tardío (~150 Ma)',
      fact:    'El Braquiosaurio podía levantar su cuello hasta 13 metros de altura, como un edificio de 4 plantas, para alcanzar las hojas más altas.',
      color:   '#cc88ff'
    },
    pteranodon: {
      id:      'pteranodon',
      name:    'Pteranodon longiceps',
      emoji:   '🦅',
      cardImg: 'assets/images/pteranodon_card.png',
      weight:  '20–30 kilogramos',
      size:    '5–6 m de envergadura',
      diet:    'Piscívoro (peces)',
      period:  'Cretácico tardío (86–84 Ma)',
      fact:    'El Pteranodón no era un dinosaurio sino un reptil volador. Podía planear cientos de km sin aletear, como los datos viajando por la red.',
      color:   '#44ccff'
    },
    iguanodon: {
      id:      'iguanodon',
      name:    'Iguanodon bernissartensis',
      emoji:   '🦎',
      cardImg: 'assets/images/iguanodon_card.svg',
      weight:  '3–4.5 toneladas',
      size:    '10 metros',
      diet:    'Herbívoro (plantas y frutos)',
      period:  'Cretácico temprano (126–125 Ma)',
      fact:    'El Iguanodón fue uno de los primeros dinosaurios identificados por la ciencia (1822). Sus pulgares en forma de espiga se usaban como herramienta.',
      color:   '#aadd66'
    }
  },

  // ─── Renderizado ──────────────────────────────────

  render() {
    const grid = document.getElementById('coll-grid');
    if (!grid) return;

    const unlocked = App.state.unlockedDinos;
    grid.innerHTML  = '';

    Object.values(this.data).forEach(dino => {
      const isUnlocked = !dino.locked && unlocked.includes(dino.id);
      const isLocked   = dino.locked  || !unlocked.includes(dino.id);

      const card = document.createElement('div');
      card.className = 'dino-card' + (isLocked ? ' locked' : '');

      card.innerHTML = `
        <div class="card-art" style="background:linear-gradient(135deg,${dino.color}18,#050a1a 70%)">
          ${isUnlocked
            ? `<img src="${dino.cardImg}" class="card-dino-img" alt="${dino.name}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
               ><span class="card-dino-emoji" style="display:none">${dino.emoji}</span>`
            : `<img src="${dino.cardImg}" class="card-dino-img card-dino-locked-img" alt="bloqueado"
                    onerror="this.outerHTML='<span style=\\'font-size:46px;opacity:.25\\'>🔒</span>'"
               >`
          }
        </div>
        <div class="card-body">
          <div class="card-name">${isUnlocked ? dino.name : '???'}</div>
          ${isUnlocked ? `
            <div class="card-stat">⚖️ Peso: <span>${dino.weight}</span></div>
            <div class="card-stat">📏 Largo: <span>${dino.size}</span></div>
            <div class="card-stat">🍖 Dieta: <span>${dino.diet}</span></div>
            <div class="card-stat">🕰️ Período: <span>${dino.period}</span></div>
            <p style="font-size:10px;color:var(--txt-dim);margin-top:8px;line-height:1.4;font-style:italic">
              💡 ${dino.fact}
            </p>
          ` : `
            <p style="font-size:11px;color:var(--txt-dim);margin-top:6px;">
              ${dino.locked ? dino.fact : '¡Completa la misión y el quiz para desbloquear esta ficha!'}
            </p>
          `}
        </div>
        ${isLocked ? '<div class="card-locked-badge">🔒 Bloqueado</div>' : ''}
      `;

      // Borde de color en fichas desbloqueadas
      if (isUnlocked) {
        card.style.borderColor = dino.color + '44';
        card.style.boxShadow   = `0 0 20px ${dino.color}22`;
      }

      grid.appendChild(card);
    });
  }
};

/* Fotos reales de Casa Rural La Bodega. h = alta (2000px), t = miniatura */
window.FOTOS = [
  { id: 'a000', c: 'Exterior', t: 'El cortijo y la piscina' },
  { id: 'a002', c: 'Piscina', t: 'Piscina de 10 × 5 m frente a la sierra' },
  { id: 'a004', c: 'Casa', t: 'Salón con chimenea' },
  { id: 'a018', c: 'Piscina', t: 'Solárium de piedra junto a la piscina' },
  { id: 'a030', c: 'Olivar', t: 'Olivo centenario sobre el césped' },
  { id: 'a009', c: 'Dormitorios', t: 'Dormitorio con baño propio' },
  { id: 'a021', c: 'Casa', t: 'Cocina equipada' },
  { id: 'a033', c: 'Exterior', t: 'Porche con mesa para todos' },
  { id: 'a010', c: 'Entorno', t: 'Atardecer sobre la Sierra de Grazalema' },
  { id: 'a024', c: 'Dormitorios', t: 'Dormitorio con cabecero de forja' },
  { id: 'a003', c: 'Olivar', t: 'Jardín entre olivos' },
  { id: 'a006', c: 'Casa', t: 'Salón' },
  { id: 'a037', c: 'Exterior', t: 'Barbacoa de piedra' },
  { id: 'a027', c: 'Dormitorios', t: 'Dormitorio bajo vigas de madera' },
  { id: 'a025', c: 'Olivar', t: 'La casa vista desde el olivar' },
  { id: 'a015', c: 'Casa', t: 'Comedor' },
  { id: 'a005', c: 'Dormitorios', t: 'Baño en suite' },
  { id: 'a036', c: 'Exterior', t: 'Fachada y pérgola' },
  { id: 'a014', c: 'Olivar', t: 'Camino entre olivos con la sierra al fondo' },
  { id: 'a007', c: 'Casa', t: 'Mesa de comedor' },
  { id: 'a013', c: 'Dormitorios', t: 'Dormitorio doble', jpg: 1 },
  { id: 'a029', c: 'Casa', t: 'Cocina' },
  { id: 'a001', c: 'Exterior', t: 'Rosales en la entrada' },
  { id: 'a017', c: 'Casa', t: 'Zona de estar' },
  { id: 'a032', c: 'Dormitorios', t: 'Dormitorio doble', jpg: 1 },
  { id: 'a012', c: 'Casa', t: 'Salón comedor' },
  { id: 'a016', c: 'Exterior', t: 'Acceso a la finca' },
  { id: 'a019', c: 'Casa', t: 'Comedor y escalera' },
  { id: 'a026', c: 'Dormitorios', t: 'Baño', jpg: 1 },
  { id: 'a034', c: 'Exterior', t: 'Porche', jpg: 1 },
  { id: 'a011', c: 'Casa', t: 'Entrada', jpg: 1 },
  { id: 'a031', c: 'Dormitorios', t: 'Baño con ducha', jpg: 1 },
  { id: 'a028', c: 'Casa', t: 'Ventana a la sierra', jpg: 1 }
];
window.FOTOS.forEach(function (f) {
  f.h = 'img/' + f.id + (f.jpg ? '.jpg' : '.webp');
  f.s = 'img/' + f.id + (f.jpg ? '.jpg' : '-t.webp');
});

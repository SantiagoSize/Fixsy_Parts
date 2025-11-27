export interface ChileComuna {
  nombre: string;
}

export interface ChileProvincia {
  nombre: string;
  comunas: ChileComuna[];
}

export interface ChileRegion {
  nombre: string;
  abreviatura: string;
  provincias: ChileProvincia[];
}

export const CHILE_REGIONES: ChileRegion[] = [
  {
    nombre: 'Región de Arica y Parinacota',
    abreviatura: 'XV',
    provincias: [
      {
        nombre: 'Arica',
        comunas: [
          { nombre: 'Arica' },
          { nombre: 'Camarones' },
        ],
      },
      {
        nombre: 'Parinacota',
        comunas: [
          { nombre: 'Putre' },
          { nombre: 'General Lagos' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Tarapacá',
    abreviatura: 'I',
    provincias: [
      {
        nombre: 'Iquique',
        comunas: [
          { nombre: 'Iquique' },
          { nombre: 'Alto Hospicio' },
        ],
      },
      {
        nombre: 'Tamarugal',
        comunas: [
          { nombre: 'Pozo Almonte' },
          { nombre: 'Camiña' },
          { nombre: 'Colchane' },
          { nombre: 'Huara' },
          { nombre: 'Pica' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Antofagasta',
    abreviatura: 'II',
    provincias: [
      {
        nombre: 'Antofagasta',
        comunas: [
          { nombre: 'Antofagasta' },
          { nombre: 'Mejillones' },
          { nombre: 'Sierra Gorda' },
          { nombre: 'Taltal' },
        ],
      },
      {
        nombre: 'El Loa',
        comunas: [
          { nombre: 'Calama' },
          { nombre: 'Ollagüe' },
          { nombre: 'San Pedro de Atacama' },
        ],
      },
      {
        nombre: 'Tocopilla',
        comunas: [
          { nombre: 'Tocopilla' },
          { nombre: 'María Elena' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Atacama',
    abreviatura: 'III',
    provincias: [
      {
        nombre: 'Copiapó',
        comunas: [
          { nombre: 'Copiapó' },
          { nombre: 'Caldera' },
          { nombre: 'Tierra Amarilla' },
        ],
      },
      {
        nombre: 'Chañaral',
        comunas: [
          { nombre: 'Chañaral' },
          { nombre: 'Diego de Almagro' },
        ],
      },
      {
        nombre: 'Huasco',
        comunas: [
          { nombre: 'Vallenar' },
          { nombre: 'Alto del Carmen' },
          { nombre: 'Freirina' },
          { nombre: 'Huasco' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Coquimbo',
    abreviatura: 'IV',
    provincias: [
      {
        nombre: 'Elqui',
        comunas: [
          { nombre: 'La Serena' },
          { nombre: 'Coquimbo' },
          { nombre: 'Andacollo' },
          { nombre: 'La Higuera' },
          { nombre: 'Paiguano' },
          { nombre: 'Vicuña' },
        ],
      },
      {
        nombre: 'Choapa',
        comunas: [
          { nombre: 'Illapel' },
          { nombre: 'Canela' },
          { nombre: 'Los Vilos' },
          { nombre: 'Salamanca' },
        ],
      },
      {
        nombre: 'Limarí',
        comunas: [
          { nombre: 'Ovalle' },
          { nombre: 'Combarbalá' },
          { nombre: 'Monte Patria' },
          { nombre: 'Punitaqui' },
          { nombre: 'Río Hurtado' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Valparaíso',
    abreviatura: 'V',
    provincias: [
      {
        nombre: 'Valparaíso',
        comunas: [
          { nombre: 'Valparaíso' },
          { nombre: 'Casablanca' },
          { nombre: 'Concón' },
          { nombre: 'Juan Fernández' },
          { nombre: 'Puchuncaví' },
          { nombre: 'Quintero' },
          { nombre: 'Viña del Mar' },
        ],
      },
      {
        nombre: 'Isla de Pascua',
        comunas: [
          { nombre: 'Isla de Pascua' },
        ],
      },
      {
        nombre: 'Los Andes',
        comunas: [
          { nombre: 'Los Andes' },
          { nombre: 'Calle Larga' },
          { nombre: 'Rinconada' },
          { nombre: 'San Esteban' },
        ],
      },
      {
        nombre: 'Petorca',
        comunas: [
          { nombre: 'La Ligua' },
          { nombre: 'Cabildo' },
          { nombre: 'Papudo' },
          { nombre: 'Petorca' },
          { nombre: 'Zapallar' },
        ],
      },
      {
        nombre: 'Quillota',
        comunas: [
          { nombre: 'Quillota' },
          { nombre: 'Calera' },
          { nombre: 'Hijuelas' },
          { nombre: 'La Cruz' },
          { nombre: 'Nogales' },
        ],
      },
      {
        nombre: 'San Antonio',
        comunas: [
          { nombre: 'San Antonio' },
          { nombre: 'Algarrobo' },
          { nombre: 'Cartagena' },
          { nombre: 'El Quisco' },
          { nombre: 'El Tabo' },
          { nombre: 'Santo Domingo' },
        ],
      },
      {
        nombre: 'San Felipe de Aconcagua',
        comunas: [
          { nombre: 'San Felipe' },
          { nombre: 'Catemu' },
          { nombre: 'Llaillay' },
          { nombre: 'Panquehue' },
          { nombre: 'Putaendo' },
          { nombre: 'Santa María' },
        ],
      },
      {
        nombre: 'Marga Marga',
        comunas: [
          { nombre: 'Quilpué' },
          { nombre: 'Limache' },
          { nombre: 'Olmué' },
          { nombre: 'Villa Alemana' },
        ],
      },
    ],
  },
  {
    nombre: "Región del Libertador General Bernardo O'Higgins",
    abreviatura: 'VI',
    provincias: [
      {
        nombre: 'Cachapoal',
        comunas: [
          { nombre: 'Rancagua' },
          { nombre: 'Codegua' },
          { nombre: 'Coinco' },
          { nombre: 'Coltauco' },
          { nombre: 'Doñihue' },
          { nombre: 'Graneros' },
          { nombre: 'Las Cabras' },
          { nombre: 'Machalí' },
          { nombre: 'Malloa' },
          { nombre: 'Mostazal' },
          { nombre: 'Olivar' },
          { nombre: 'Peumo' },
          { nombre: 'Pichidegua' },
          { nombre: 'Quinta de Tilcoco' },
          { nombre: 'Rengo' },
          { nombre: 'Requínoa' },
          { nombre: 'San Vicente' },
        ],
      },
      {
        nombre: 'Colchagua',
        comunas: [
          { nombre: 'San Fernando' },
          { nombre: 'Chépica' },
          { nombre: 'Chimbarongo' },
          { nombre: 'Lolol' },
          { nombre: 'Nancagua' },
          { nombre: 'Palmilla' },
          { nombre: 'Peralillo' },
          { nombre: 'Placilla' },
          { nombre: 'Pumanque' },
          { nombre: 'Santa Cruz' },
        ],
      },
      {
        nombre: 'Cardenal Caro',
        comunas: [
          { nombre: 'Pichilemu' },
          { nombre: 'La Estrella' },
          { nombre: 'Litueche' },
          { nombre: 'Marchihue' },
          { nombre: 'Navidad' },
          { nombre: 'Paredones' },
        ],
      },
    ],
  },
  {
    nombre: 'Región del Maule',
    abreviatura: 'VII',
    provincias: [
      {
        nombre: 'Talca',
        comunas: [
          { nombre: 'Talca' },
          { nombre: 'Constitución' },
          { nombre: 'Curepto' },
          { nombre: 'Empedrado' },
          { nombre: 'Maule' },
          { nombre: 'Pelarco' },
          { nombre: 'Pencahue' },
          { nombre: 'Río Claro' },
          { nombre: 'San Clemente' },
          { nombre: 'San Rafael' },
        ],
      },
      {
        nombre: 'Cauquenes',
        comunas: [
          { nombre: 'Cauquenes' },
          { nombre: 'Chanco' },
          { nombre: 'Pelluhue' },
        ],
      },
      {
        nombre: 'Curicó',
        comunas: [
          { nombre: 'Curicó' },
          { nombre: 'Hualañé' },
          { nombre: 'Licantén' },
          { nombre: 'Molina' },
          { nombre: 'Rauco' },
          { nombre: 'Romeral' },
          { nombre: 'Sagrada Familia' },
          { nombre: 'Teno' },
          { nombre: 'Vichuquén' },
        ],
      },
      {
        nombre: 'Linares',
        comunas: [
          { nombre: 'Linares' },
          { nombre: 'Colbún' },
          { nombre: 'Longaví' },
          { nombre: 'Parral' },
          { nombre: 'Retiro' },
          { nombre: 'San Javier' },
          { nombre: 'Villa Alegre' },
          { nombre: 'Yerbas Buenas' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Ñuble',
    abreviatura: 'XVI',
    provincias: [
      {
        nombre: 'Diguillín',
        comunas: [
          { nombre: 'Chillán' },
          { nombre: 'Chillán Viejo' },
          { nombre: 'Bulnes' },
          { nombre: 'Cobquecura' },
          { nombre: 'Coelemu' },
          { nombre: 'Coihueco' },
          { nombre: 'El Carmen' },
          { nombre: 'Ninhue' },
          { nombre: 'Ñiquén' },
          { nombre: 'Pemuco' },
          { nombre: 'Pinto' },
          { nombre: 'Portezuelo' },
          { nombre: 'Quillón' },
          { nombre: 'Quirihue' },
          { nombre: 'Ránquil' },
          { nombre: 'San Carlos' },
          { nombre: 'San Fabián' },
          { nombre: 'San Ignacio' },
          { nombre: 'San Nicolás' },
          { nombre: 'Treguaco' },
          { nombre: 'Yungay' },
        ],
      },
      {
        nombre: 'Itata',
        comunas: [
          { nombre: 'Cobquecura' },
          { nombre: 'Coelemu' },
          { nombre: 'Ninhue' },
          { nombre: 'Portezuelo' },
          { nombre: 'Quirihue' },
          { nombre: 'Ránquil' },
          { nombre: 'Treguaco' },
        ],
      },
      {
        nombre: 'Punilla',
        comunas: [
          { nombre: 'San Carlos' },
          { nombre: 'Coihueco' },
          { nombre: 'Ñiquén' },
          { nombre: 'San Fabián' },
          { nombre: 'San Nicolás' },
        ],
      },
    ],
  },
  {
    nombre: 'Región del Biobío',
    abreviatura: 'VIII',
    provincias: [
      {
        nombre: 'Concepción',
        comunas: [
          { nombre: 'Concepción' },
          { nombre: 'Coronel' },
          { nombre: 'Chiguayante' },
          { nombre: 'Florida' },
          { nombre: 'Hualqui' },
          { nombre: 'Lota' },
          { nombre: 'Penco' },
          { nombre: 'San Pedro de la Paz' },
          { nombre: 'Santa Juana' },
          { nombre: 'Talcahuano' },
          { nombre: 'Tomé' },
          { nombre: 'Hualpén' },
        ],
      },
      {
        nombre: 'Arauco',
        comunas: [
          { nombre: 'Lebu' },
          { nombre: 'Arauco' },
          { nombre: 'Cañete' },
          { nombre: 'Contulmo' },
          { nombre: 'Curanilahue' },
          { nombre: 'Los Álamos' },
          { nombre: 'Tirúa' },
        ],
      },
      {
        nombre: 'Biobío',
        comunas: [
          { nombre: 'Los Ángeles' },
          { nombre: 'Antuco' },
          { nombre: 'Cabrero' },
          { nombre: 'Laja' },
          { nombre: 'Mulchén' },
          { nombre: 'Nacimiento' },
          { nombre: 'Negrete' },
          { nombre: 'Quilaco' },
          { nombre: 'Quilleco' },
          { nombre: 'San Rosendo' },
          { nombre: 'Santa Bárbara' },
          { nombre: 'Tucapel' },
          { nombre: 'Yumbel' },
          { nombre: 'Alto Biobío' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de La Araucanía',
    abreviatura: 'IX',
    provincias: [
      {
        nombre: 'Cautín',
        comunas: [
          { nombre: 'Temuco' },
          { nombre: 'Carahue' },
          { nombre: 'Cunco' },
          { nombre: 'Curarrehue' },
          { nombre: 'Freire' },
          { nombre: 'Galvarino' },
          { nombre: 'Gorbea' },
          { nombre: 'Lautaro' },
          { nombre: 'Loncoche' },
          { nombre: 'Melipeuco' },
          { nombre: 'Nueva Imperial' },
          { nombre: 'Padre Las Casas' },
          { nombre: 'Perquenco' },
          { nombre: 'Pitrufquén' },
          { nombre: 'Pucón' },
          { nombre: 'Saavedra' },
          { nombre: 'Teodoro Schmidt' },
          { nombre: 'Toltén' },
          { nombre: 'Vilcún' },
          { nombre: 'Villarrica' },
          { nombre: 'Cholchol' },
        ],
      },
      {
        nombre: 'Malleco',
        comunas: [
          { nombre: 'Angol' },
          { nombre: 'Collipulli' },
          { nombre: 'Curacautín' },
          { nombre: 'Ercilla' },
          { nombre: 'Lonquimay' },
          { nombre: 'Los Sauces' },
          { nombre: 'Lumaco' },
          { nombre: 'Purén' },
          { nombre: 'Renaico' },
          { nombre: 'Traiguén' },
          { nombre: 'Victoria' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Los Ríos',
    abreviatura: 'XIV',
    provincias: [
      {
        nombre: 'Valdivia',
        comunas: [
          { nombre: 'Valdivia' },
          { nombre: 'Corral' },
          { nombre: 'Lanco' },
          { nombre: 'Los Lagos' },
          { nombre: 'Máfil' },
          { nombre: 'Mariquina' },
          { nombre: 'Paillaco' },
          { nombre: 'Panguipulli' },
        ],
      },
      {
        nombre: 'Ranco',
        comunas: [
          { nombre: 'La Unión' },
          { nombre: 'Futrono' },
          { nombre: 'Lago Ranco' },
          { nombre: 'Río Bueno' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Los Lagos',
    abreviatura: 'X',
    provincias: [
      {
        nombre: 'Llanquihue',
        comunas: [
          { nombre: 'Puerto Montt' },
          { nombre: 'Calbuco' },
          { nombre: 'Cochamó' },
          { nombre: 'Fresia' },
          { nombre: 'Frutillar' },
          { nombre: 'Los Muermos' },
          { nombre: 'Llanquihue' },
          { nombre: 'Maullín' },
          { nombre: 'Puerto Varas' },
        ],
      },
      {
        nombre: 'Chiloé',
        comunas: [
          { nombre: 'Castro' },
          { nombre: 'Ancud' },
          { nombre: 'Chonchi' },
          { nombre: 'Curaco de Vélez' },
          { nombre: 'Dalcahue' },
          { nombre: 'Puqueldón' },
          { nombre: 'Queilén' },
          { nombre: 'Quellón' },
          { nombre: 'Quemchi' },
          { nombre: 'Quinchao' },
        ],
      },
      {
        nombre: 'Osorno',
        comunas: [
          { nombre: 'Osorno' },
          { nombre: 'Puerto Octay' },
          { nombre: 'Purranque' },
          { nombre: 'Puyehue' },
          { nombre: 'Río Negro' },
          { nombre: 'San Juan de la Costa' },
          { nombre: 'San Pablo' },
        ],
      },
      {
        nombre: 'Palena',
        comunas: [
          { nombre: 'Chaitén' },
          { nombre: 'Futaleufú' },
          { nombre: 'Hualaihué' },
          { nombre: 'Palena' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Aysén del General Carlos Ibáñez del Campo',
    abreviatura: 'XI',
    provincias: [
      {
        nombre: 'Coyhaique',
        comunas: [
          { nombre: 'Coyhaique' },
          { nombre: 'Lago Verde' },
        ],
      },
      {
        nombre: 'Aysén',
        comunas: [
          { nombre: 'Aysén' },
          { nombre: 'Cisnes' },
          { nombre: 'Guaitecas' },
        ],
      },
      {
        nombre: 'Capitán Prat',
        comunas: [
          { nombre: 'Cochrane' },
          { nombre: 'O\'Higgins' },
          { nombre: 'Tortel' },
        ],
      },
      {
        nombre: 'General Carrera',
        comunas: [
          { nombre: 'Chile Chico' },
          { nombre: 'Río Ibáñez' },
        ],
      },
    ],
  },
  {
    nombre: 'Región de Magallanes y de la Antártica Chilena',
    abreviatura: 'XII',
    provincias: [
      {
        nombre: 'Magallanes',
        comunas: [
          { nombre: 'Punta Arenas' },
          { nombre: 'Laguna Blanca' },
          { nombre: 'Río Verde' },
          { nombre: 'San Gregorio' },
        ],
      },
      {
        nombre: 'Antártica Chilena',
        comunas: [
          { nombre: 'Cabo de Hornos' },
          { nombre: 'Antártica' },
        ],
      },
      {
        nombre: 'Tierra del Fuego',
        comunas: [
          { nombre: 'Porvenir' },
          { nombre: 'Primavera' },
          { nombre: 'Timaukel' },
        ],
      },
      {
        nombre: 'Última Esperanza',
        comunas: [
          { nombre: 'Puerto Natales' },
          { nombre: 'Torres del Paine' },
        ],
      },
    ],
  },
  {
    nombre: 'Región Metropolitana de Santiago',
    abreviatura: 'RM',
    provincias: [
      {
        nombre: 'Santiago',
        comunas: [
          { nombre: 'Santiago' },
          { nombre: 'Cerrillos' },
          { nombre: 'Cerro Navia' },
          { nombre: 'Conchalí' },
          { nombre: 'El Bosque' },
          { nombre: 'Estación Central' },
          { nombre: 'Huechuraba' },
          { nombre: 'Independencia' },
          { nombre: 'La Cisterna' },
          { nombre: 'La Florida' },
          { nombre: 'La Granja' },
          { nombre: 'La Pintana' },
          { nombre: 'La Reina' },
          { nombre: 'Las Condes' },
          { nombre: 'Lo Barnechea' },
          { nombre: 'Lo Espejo' },
          { nombre: 'Lo Prado' },
          { nombre: 'Macul' },
          { nombre: 'Maipú' },
          { nombre: 'Ñuñoa' },
          { nombre: 'Pedro Aguirre Cerda' },
          { nombre: 'Peñalolén' },
          { nombre: 'Providencia' },
          { nombre: 'Pudahuel' },
          { nombre: 'Quilicura' },
          { nombre: 'Quinta Normal' },
          { nombre: 'Recoleta' },
          { nombre: 'Renca' },
          { nombre: 'San Joaquín' },
          { nombre: 'San Miguel' },
          { nombre: 'San Ramón' },
          { nombre: 'Vitacura' },
        ],
      },
      {
        nombre: 'Cordillera',
        comunas: [
          { nombre: 'Puente Alto' },
          { nombre: 'Pirque' },
          { nombre: 'San José de Maipo' },
        ],
      },
      {
        nombre: 'Chacabuco',
        comunas: [
          { nombre: 'Colina' },
          { nombre: 'Lampa' },
          { nombre: 'Tiltil' },
        ],
      },
      {
        nombre: 'Maipo',
        comunas: [
          { nombre: 'San Bernardo' },
          { nombre: 'Buin' },
          { nombre: 'Calera de Tango' },
          { nombre: 'Paine' },
        ],
      },
      {
        nombre: 'Melipilla',
        comunas: [
          { nombre: 'Melipilla' },
          { nombre: 'Alhué' },
          { nombre: 'Curacaví' },
          { nombre: 'María Pinto' },
          { nombre: 'San Pedro' },
        ],
      },
      {
        nombre: 'Talagante',
        comunas: [
          { nombre: 'Talagante' },
          { nombre: 'El Monte' },
          { nombre: 'Isla de Maipo' },
          { nombre: 'Padre Hurtado' },
          { nombre: 'Peñaflor' },
        ],
      },
    ],
  },
];

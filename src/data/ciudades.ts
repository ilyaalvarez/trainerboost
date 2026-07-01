export interface Ciudad {
  slug: string
  name: string
  region: string
  gentilicio: string
}

export const CIUDADES: Ciudad[] = [
  { slug: 'madrid',                    name: 'Madrid',                    region: 'Comunidad de Madrid',   gentilicio: 'madrileños' },
  { slug: 'barcelona',                 name: 'Barcelona',                 region: 'Cataluña',              gentilicio: 'barceloneses' },
  { slug: 'valencia',                  name: 'Valencia',                  region: 'Comunidad Valenciana',  gentilicio: 'valencianos' },
  { slug: 'sevilla',                   name: 'Sevilla',                   region: 'Andalucía',             gentilicio: 'sevillanos' },
  { slug: 'zaragoza',                  name: 'Zaragoza',                  region: 'Aragón',                gentilicio: 'zaragozanos' },
  { slug: 'malaga',                    name: 'Málaga',                    region: 'Andalucía',             gentilicio: 'malagueños' },
  { slug: 'murcia',                    name: 'Murcia',                    region: 'Región de Murcia',      gentilicio: 'murcianos' },
  { slug: 'palma',                     name: 'Palma',                     region: 'Islas Baleares',        gentilicio: 'palmesanos' },
  { slug: 'las-palmas',                name: 'Las Palmas de Gran Canaria', region: 'Canarias',             gentilicio: 'canarios' },
  { slug: 'bilbao',                    name: 'Bilbao',                    region: 'País Vasco',            gentilicio: 'bilbaínos' },
  { slug: 'alicante',                  name: 'Alicante',                  region: 'Comunidad Valenciana',  gentilicio: 'alicantinos' },
  { slug: 'cordoba',                   name: 'Córdoba',                   region: 'Andalucía',             gentilicio: 'cordobeses' },
  { slug: 'valladolid',                name: 'Valladolid',                region: 'Castilla y León',       gentilicio: 'vallisoletanos' },
  { slug: 'vigo',                      name: 'Vigo',                      region: 'Galicia',               gentilicio: 'vigueses' },
  { slug: 'gijon',                     name: 'Gijón',                     region: 'Asturias',              gentilicio: 'gijoneses' },
  { slug: 'granada',                   name: 'Granada',                   region: 'Andalucía',             gentilicio: 'granadinos' },
  { slug: 'vitoria',                   name: 'Vitoria-Gasteiz',           region: 'País Vasco',            gentilicio: 'vitorianos' },
  { slug: 'la-coruna',                 name: 'A Coruña',                  region: 'Galicia',               gentilicio: 'coruñeses' },
  { slug: 'santa-cruz-de-tenerife',    name: 'Santa Cruz de Tenerife',    region: 'Canarias',              gentilicio: 'tinerfeños' },
  { slug: 'pamplona',                  name: 'Pamplona',                  region: 'Navarra',               gentilicio: 'pamploneses' },
  { slug: 'almeria',                   name: 'Almería',                   region: 'Andalucía',             gentilicio: 'almerienses' },
  { slug: 'burgos',                    name: 'Burgos',                    region: 'Castilla y León',       gentilicio: 'burgaleses' },
  { slug: 'jerez',                     name: 'Jerez de la Frontera',      region: 'Andalucía',             gentilicio: 'jerezanos' },
  { slug: 'santander',                 name: 'Santander',                 region: 'Cantabria',             gentilicio: 'santanderinos' },
  { slug: 'castellon',                 name: 'Castellón de la Plana',     region: 'Comunidad Valenciana',  gentilicio: 'castellonenses' },
  { slug: 'albacete',                  name: 'Albacete',                  region: 'Castilla-La Mancha',    gentilicio: 'albaceteños' },
  { slug: 'salamanca',                 name: 'Salamanca',                 region: 'Castilla y León',       gentilicio: 'salmantinos' },
  { slug: 'huelva',                    name: 'Huelva',                    region: 'Andalucía',             gentilicio: 'onubenses' },
  { slug: 'logrono',                   name: 'Logroño',                   region: 'La Rioja',              gentilicio: 'logroñeses' },
  { slug: 'san-sebastian',             name: 'San Sebastián',             region: 'País Vasco',            gentilicio: 'donostiarras' },
  { slug: 'badajoz',                   name: 'Badajoz',                   region: 'Extremadura',           gentilicio: 'pacenses' },
  { slug: 'tarragona',                 name: 'Tarragona',                 region: 'Cataluña',              gentilicio: 'tarraconenses' },
  { slug: 'leon',                      name: 'León',                      region: 'Castilla y León',       gentilicio: 'leoneses' },
  { slug: 'lleida',                    name: 'Lleida',                    region: 'Cataluña',              gentilicio: 'leridanos' },
  { slug: 'cadiz',                     name: 'Cádiz',                     region: 'Andalucía',             gentilicio: 'gaditanos' },
  { slug: 'marbella',                  name: 'Marbella',                  region: 'Andalucía',             gentilicio: 'marbelleños' },
  { slug: 'oviedo',                    name: 'Oviedo',                    region: 'Asturias',              gentilicio: 'ovetenses' },
  { slug: 'badalona',                  name: 'Badalona',                  region: 'Cataluña',              gentilicio: 'badaloneses' },
  { slug: 'cartagena',                 name: 'Cartagena',                 region: 'Región de Murcia',      gentilicio: 'cartageneros' },
  { slug: 'sabadell',                  name: 'Sabadell',                  region: 'Cataluña',              gentilicio: 'sabadellenses' },
  { slug: 'terrassa',                  name: 'Terrassa',                  region: 'Cataluña',              gentilicio: 'terrassencos' },
  { slug: 'mostoles',                  name: 'Móstoles',                  region: 'Comunidad de Madrid',   gentilicio: 'mostolencos' },
  { slug: 'alcala-de-henares',         name: 'Alcalá de Henares',         region: 'Comunidad de Madrid',   gentilicio: 'complutenses' },
  { slug: 'fuenlabrada',               name: 'Fuenlabrada',               region: 'Comunidad de Madrid',   gentilicio: 'fuenlabreños' },
  { slug: 'alcorcon',                  name: 'Alcorcón',                  region: 'Comunidad de Madrid',   gentilicio: 'alcorconeros' },
  { slug: 'getafe',                    name: 'Getafe',                    region: 'Comunidad de Madrid',   gentilicio: 'getafeños' },
  { slug: 'leganes',                   name: 'Leganés',                   region: 'Comunidad de Madrid',   gentilicio: 'legananeses' },
  { slug: 'elche',                     name: 'Elche',                     region: 'Comunidad Valenciana',  gentilicio: 'ilicitanos' },
  { slug: 'parla',                     name: 'Parla',                     region: 'Comunidad de Madrid',   gentilicio: 'parleños' },
  { slug: 'torrejón-de-ardoz',         name: 'Torrejón de Ardoz',         region: 'Comunidad de Madrid',   gentilicio: 'torrejoneros' },
]

export function getCiudad(slug: string): Ciudad | undefined {
  return CIUDADES.find(c => c.slug === slug)
}

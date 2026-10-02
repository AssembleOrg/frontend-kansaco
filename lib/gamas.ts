// Gama de Tango por presentación. Se muestra el código tal cual
// (significado pendiente de confirmar con quien maneja Tango).
export const GAMAS = ['AAG', 'AMG', 'ABG', 'GAG', 'GMG', 'GBG'] as const;
export type Gama = (typeof GAMAS)[number];

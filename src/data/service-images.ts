import type { ServiceKind } from "@/data/services";

/**
 * Visuel d'en-tête associé à chaque type de démarche.
 *
 * Ces photographies sont **illustratives** : elles donnent un repère visuel à
 * chaque rubrique de l'annuaire, elles ne montrent pas le guichet réel d'un
 * organisme. C'est pour cette raison que le texte alternatif décrit ce que la
 * photo contient — « un passeport posé sur une carte » — et jamais un lieu
 * précis. Laisser croire qu'il s'agit de la façade d'un bureau enverrait un
 * candidat chercher un bâtiment qui n'existe pas.
 *
 * Chaque identifiant a été ouvert et regardé avant d'être retenu : deviner un
 * identifiant Unsplash donne une image valide une fois sur deux, et le reste
 * du temps un panda ou une paire de lunettes de soleil sur une fiche
 * « Légalisation ».
 */
const BY_KIND: Record<ServiceKind, { id: string; alt: string }> = {
  "etat-civil": {
    id: "photo-1423592707957-3b212afa6733",
    alt: "Registres reliés et carnet ouvert sur un bureau",
  },
  passeport: {
    id: "photo-1578894381163-e72c17f2d45f",
    alt: "Passeport posé sur une carte du monde, entouré d'objets de voyage",
  },
  legalisation: {
    id: "photo-1450101499163-c8848c66ca85",
    alt: "Main signant un document à la plume sur une feuille blanche",
  },
  traduction: {
    id: "photo-1544716278-ca5e3f4abd8c",
    alt: "Livre ouvert, paire de lunettes et tasse de café",
  },
  apostille: {
    id: "photo-1589829545856-d10d557cf95f",
    alt: "Statuette de la justice tenant une balance",
  },
  langue: {
    id: "photo-1503676260728-1c00da094a0b",
    alt: "Pile de livres, pomme et cubes alphabétiques",
  },
  medical: {
    id: "photo-1576091160550-2173dba999ef",
    alt: "Stéthoscope posé sur un ordinateur portable",
  },
  photo: {
    id: "photo-1554048612-b6a482bc67e5",
    alt: "Mains tenant un appareil photo reflex en prise de vue",
  },
  financier: {
    id: "photo-1554224154-26032ffc0d07",
    alt: "Formulaires administratifs, calculatrice et stylo sur un bureau",
  },
  visa: {
    id: "photo-1436491865332-7a61a109cc05",
    alt: "Aile d'avion au-dessus d'une mer de nuages",
  },
};

/** URL du visuel d'une rubrique, à la largeur demandée. */
export function serviceImage(kind: ServiceKind, width = 640): string {
  return `https://images.unsplash.com/${BY_KIND[kind].id}?auto=format&fit=crop&w=${width}&q=72`;
}

/** Texte alternatif décrivant la photo, jamais le lieu. */
export function serviceImageAlt(kind: ServiceKind): string {
  return BY_KIND[kind].alt;
}

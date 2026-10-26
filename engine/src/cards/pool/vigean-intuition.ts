import { defineCard } from "../define.js";
import type { CardType } from "../define.js";

// EDHREC rank 31004.
//
// Winding Way's shape over every card type: the type is chosen as the spell
// resolves (rule 608.2), then every revealed card of that type goes to the
// hand (Mulch's shape) and the rest to the graveyard.

const CARD_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

const label = (type: CardType): string => type.charAt(0).toUpperCase() + type.slice(1);

export default defineCard({
  name: "Vigean Intuition",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: "Choose a card type, then reveal the top four cards of your library. Put all cards of the chosen type revealed this way into your hand and the rest into your graveyard. (Artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and sorcery are card types.)",
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: CARD_TYPES.map((type) => ({
      text: label(type),
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { type },
        destination: "hand",
        leftover: "graveyard",
      },
    })),
  },
});

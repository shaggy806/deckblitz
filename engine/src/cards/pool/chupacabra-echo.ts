import { defineCard } from "../define.js";

// EDHREC rank 13684. The Lost Caverns of Ixalan.
//
// Cloud of Darkness's Particle Beam, word for word: X counted as it resolves.

const TEXT =
  "Fathomless descent — When this creature enters, target creature an opponent controls gets -X/-X until end of turn, where X is the number of permanent cards in your graveyard.";
const PERMANENT_CARDS = {
  countInGraveyard: {
    typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
    ownedBy: "you",
  },
} as const;

export default defineCard({
  name: "Chupacabra Echo",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast", "Horror", "Spirit"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [PERMANENT_CARDS, -1] },
        toughness: { product: [PERMANENT_CARDS, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Entry Denied",
  art: "https://cards.scryfall.io/art_crop/back/5/c/5c1d410e-4237-4963-b015-54d26730e63d.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Return target creature you don't control with mana value 3 or less to its owner's hand. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "return-to-hand", target: 0 },
  faces: ["Beluna's Gatekeeper", "Entry Denied"],
  adventure: true,
});

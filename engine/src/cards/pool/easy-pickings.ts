import { defineCard } from "../define.js";

// Glóin the Mighty's Adventure (`gloin-the-mighty.ts`).

export default defineCard({
  name: "Easy Pickings",
  art: "https://cards.scryfall.io/art_crop/back/5/7/5793b8eb-2fc5-454d-8fa2-20346fef167a.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Easy Pickings deals 1 damage to each creature your opponents control. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
  faces: ["Glóin the Mighty", "Easy Pickings"],
  adventure: true,
});

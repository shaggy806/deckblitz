import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 19552. Dredge is
// `CardDefinition.dredge`; the sacrifice-draw may itself be dredged (the
// Scarab is in the graveyard by then — the first ruling).
const SAC_TEXT = "{1}, Sacrifice this creature: Draw a card.";

export default defineCard({
  name: "Grave-Shell Scarab",
  manaCost: "{2}{B}{G}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 4,
  dredge: 1,
  text: `${SAC_TEXT}\nDredge 1 (If you would draw a card, you may mill a card instead. If you do, return this card from your graveyard to your hand.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

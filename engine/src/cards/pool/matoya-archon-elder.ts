import { defineCard } from "../define.js";

const TEXT = "Whenever you scry or surveil, draw a card. (Draw after you scry or surveil.)";

export default defineCard({
  name: "Matoya, Archon Elder",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

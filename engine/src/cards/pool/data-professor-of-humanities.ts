import { defineCard } from "../define.js";

// EDHREC rank 28560.

const SEEK_TEXT =
  "Seek out — Whenever you draw your second card each turn, create two 1/1 blue Faerie creature tokens with flying.";

export default defineCard({
  name: "Data, Professor of Humanities",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Android", "Scientist"],
  power: 3,
  toughness: 4,
  text: SEEK_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Faerie Token", count: 2 },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});

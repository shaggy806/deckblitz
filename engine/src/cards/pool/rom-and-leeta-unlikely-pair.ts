import { defineCard } from "../define.js";

const TEXT = "Seek out — Whenever you draw your second card each turn, create two tapped Treasure tokens.";

export default defineCard({
  name: "Rom and Leeta, Unlikely Pair",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ferengi", "Bajoran"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

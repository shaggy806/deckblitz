import { defineCard } from "../define.js";

const FACES = ["Connive // Concoct", "Connive", "Concoct"];
const CONCOCT_TEXT = "Surveil 3, then return a creature card from your graveyard to the battlefield.";

// The right half of Connive // Concoct (see connive-concoct.ts). The creature
// card may be one just surveilled into the graveyard, and nobody acts between
// the two (rulings) — one resolution, Summon Undead's return.
export default defineCard({
  name: "Concoct",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: CONCOCT_TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: 3 },
      { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: 1 },
    ],
  },
  faces: FACES,
  split: true,
});

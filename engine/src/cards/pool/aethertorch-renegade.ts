import { defineCard } from "../define.js";

// Kaladesh.
const ENTER_TEXT = "When this creature enters, you get {E}{E}{E}{E} (four energy counters).";
const PING_TEXT = "{T}, Pay {E}{E}: This creature deals 1 damage to target creature.";
const BLAST_TEXT = "{T}, Pay eight {E}: This creature deals 6 damage to target player or planeswalker.";

export default defineCard({
  name: "Aethertorch Renegade",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  text: `${ENTER_TEXT}\n${PING_TEXT}\n${BLAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 2 },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: { mana: null, tap: true, payEnergy: 8 },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 6, target: 0 },
      resolve: null,
      text: BLAST_TEXT,
    },
  ],
});

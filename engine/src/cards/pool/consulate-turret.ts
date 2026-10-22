import { defineCard } from "../define.js";

// EDHREC rank 16406.

const ENERGY_TEXT = "{T}: You get {E} (an energy counter).";
const DAMAGE_TEXT = "{T}, Pay {E}{E}{E}: This artifact deals 2 damage to target player or planeswalker.";

export default defineCard({
  name: "Consulate Turret",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENERGY_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      cost: { mana: null, tap: true, payEnergy: 3 },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 18261.
//
// Rulings:
//   In a multiplayer game, a player may lose the game at the same time that
//   their creatures die. If so, Bone Picker's cost reduction applies.

export default defineCard({
  name: "Bone Picker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "deathtouch"],
  text: "This spell costs {3} less to cast if a creature died this turn.\nFlying, deathtouch",
  selfCostReduction: {
    condition: { kind: "creature-died-this-turn" },
    reduceGeneric: 3,
  },
});

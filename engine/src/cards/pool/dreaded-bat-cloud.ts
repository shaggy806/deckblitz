import { defineCard } from "../define.js";

// EDHREC rank 19767.
//
// Rulings:
//   [2026-06-29] In a multiplayer game, a player may lose the game at the same time that their
//     creatures die. If so, Dreaded Bat-Cloud's cost reduction applies.
//
// Grim Reaper's Sprint's reduction: morbid as a `selfCostReduction`.

export default defineCard({
  name: "Dreaded Bat-Cloud",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 4,
  toughness: 2,
  keywords: ["flying", "deathtouch"],
  text: "This spell costs {3} less to cast if a creature died this turn.\nFlying, deathtouch",
  selfCostReduction: { condition: { kind: "creature-died-this-turn" }, reduceGeneric: 3 },
});

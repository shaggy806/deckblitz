import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 27381.
//
// `damage-divided-evenly` `among` the creatures the target opponent controls,
// counted as it resolves; more creatures than X and none is dealt any.
//
// Rulings:
//   - The creatures are counted as it resolves, and X divided by that number then.
//   - X 5 against three creatures deals 1 damage to each.
//   - If the opponent controls more than X creatures, no damage is dealt.

export default defineCard({
  name: "Dwarven Catapult",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dwarven Catapult deals X damage divided evenly, rounded down, among all creatures target opponent controls.",
  targets: ["opponent"],
  effect: { kind: "damage-divided-evenly", amount: "x", from: 0, among: { type: "creature" } },
});

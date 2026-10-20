import { defineCard } from "../define.js";

// EDHREC rank 21643. "If that permanent is green" is read as the spell
// resolves, of the target as it is then.
export default defineCard({
  name: "Burning Hands",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Burning Hands deals 2 damage to target creature or planeswalker. If that permanent is green, Burning Hands deals 6 damage instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "target", index: 0, filter: { colors: ["G"] } }, then: 6, else: 2 },
  },
});

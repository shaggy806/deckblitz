import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 17379.
//
// Whether you control a Chandra planeswalker is asked as it resolves (its
// ruling); two of them are no better than one.

export default defineCard({
  name: "Chandra's Triumph",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Triumph deals 3 damage to target creature or planeswalker an opponent controls. Chandra's Triumph deals 5 damage instead if you control a Chandra planeswalker.",
  targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Chandra" }, atLeast: 1 },
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});

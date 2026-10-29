import { defineCard } from "../define.js";

// EDHREC rank 29591.
//
// - A `damage-rule` over every source that is black or red as the damage
//   would be dealt, combat damage or not.
export default defineCard({
  name: "Luminesce",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that black sources and red sources would deal this turn.",
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } } },
});

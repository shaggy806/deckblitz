import { defineCard } from "../define.js";

// EDHREC rank 26452. Refuse's shape: to the spell's controller, its mana value
// with X counted.
export default defineCard({
  name: "Parallectric Feedback",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Parallectric Feedback deals damage to target spell's controller equal to that spell's mana value.",
  targets: ["spell"],
  effect: { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
});

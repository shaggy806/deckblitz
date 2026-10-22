import { defineCard } from "../define.js";

// The half of Refuse // Cooperate cast from the hand.
const FACES = ["Refuse // Cooperate", "Refuse", "Cooperate"];

export default defineCard({
  name: "Refuse",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Refuse deals damage to target spell's controller equal to that spell's mana value.",
  targets: ["spell"],
  // To the spell's controller, its mana value with X counted (the ruling).
  effect: { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
  faces: FACES,
  split: true,
});

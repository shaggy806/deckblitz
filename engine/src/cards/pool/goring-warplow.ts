import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {1}{B} it's a black 1/1
// on the stack and the battlefield, a colorless 5/4 everywhere else.
export default defineCard({
  name: "Goring Warplow",
  manaCost: "{6}",
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 4,
  keywords: ["deathtouch"],
  text:
    "Prototype {1}{B} — 1/1 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\nDeathtouch",
  prototype: { cost: "{1}{B}", power: 1, toughness: 1 },
});

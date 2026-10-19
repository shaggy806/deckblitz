import { defineCard } from "../define.js";

// The Brothers' War. Prototype (rule 718): cast for {2}{R} it's a red 3/2 on
// the stack and the battlefield, a colorless 6/4 everywhere else.
export default defineCard({
  name: "Blitz Automaton",
  manaCost: "{7}",
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 6,
  toughness: 4,
  keywords: ["haste"],
  text:
    "Prototype {2}{R} — 3/2 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\nHaste",
  prototype: { cost: "{2}{R}", power: 3, toughness: 2 },
});

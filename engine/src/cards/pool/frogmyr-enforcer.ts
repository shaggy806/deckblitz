import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 8435. Modern Horizons 3.
//
// Prototype (rule 718) is `prototype`, as on Combat Thresher: cast for {3}{R}
// it's a red 2/2 with mana value 4, and a colourless 4/4 everywhere else. Its
// affinity applies to either cast (the ruling) — generic mana only, so the
// prototype's {R} stays.

export default defineCard({
  name: "Frogmyr Enforcer",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Frog", "Myr"],
  power: 4,
  toughness: 4,
  prototype: { cost: "{3}{R}", power: 2, toughness: 2 },
  selfCostReduction: affinity({ type: "artifact" }),
  text: "Prototype {3}{R} — 2/2 (You may cast this spell with different mana cost, color, and size. It keeps its abilities and types.)\nAffinity for artifacts (This spell costs {1} less to cast for each artifact you control.)",
});

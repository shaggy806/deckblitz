import { defineCard } from "../define.js";

// EDHREC rank 15950.

export default defineCard({
  name: "Michelangelo's Technique",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  sneak: { cost: "{3}{G}" },
  text: "Sneak {3}{G} (You may cast this spell for {3}{G} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nLook at the top eight cards of your library. Put up to two creature cards with total mana value 6 or less from among them onto the battlefield and the rest on the bottom of your library in a random order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 8,
    min: 0,
    max: 2,
    filter: { type: "creature" },
    together: { totalManaValueAtMost: 6 },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});

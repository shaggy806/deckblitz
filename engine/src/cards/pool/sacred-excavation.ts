import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Amonkhet. EDHREC rank 22177. `hasCycling` counts typecycling and
// landcycling too (its ruling).

export default defineCard({
  name: "Sacred Excavation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target cards with cycling from your graveyard to your hand.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { hasCycling: true } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});

import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 25344.
//
// Rulings:
//   If animated so it is a creature, it can be triggered off its own destruction.
//
// A dies trigger looks back (rule 603.10a), so an animated Soul Net sees
// itself die.
const TEXT = "Whenever a creature dies, you may pay {1}. If you do, you gain 1 life.";

export default defineCard({
  name: "Soul Net",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to gain 1 life?", cost: "{1}", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});

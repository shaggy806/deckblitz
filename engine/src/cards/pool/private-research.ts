import { defineCard } from "../define.js";

// EDHREC rank 23426. The dies trigger counts the page counters as this Aura
// last existed on the battlefield (it's in the graveyard by then — rule 608.2h).
//
// Rulings:
//   Putting on a counter is optional. If you forget, you can't go back later even if it is
//   something you usually do.

const UPKEEP = "At the beginning of your upkeep, you may put a page counter on this Aura.";
const DIES = "When enchanted creature dies, draw a card for each page counter on this Aura.";

export default defineCard({
  name: "Private Research",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP}\n${DIES}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a page counter on Private Research?",
        effect: { kind: "add-counter", target: "source", counter: "page", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "page" } },
      resolve: null,
      text: DIES,
    },
  ],
});

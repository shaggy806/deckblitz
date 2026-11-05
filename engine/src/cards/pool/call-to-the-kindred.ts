import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, you may look at the top five cards of your library. If you do, you may put a creature card that shares a creature type with enchanted creature from among them onto the battlefield, then you put the rest of those cards on the bottom of your library in any order.";

// Not looking leaves the five on top, so the look is its own `may`.
export default defineCard({
  name: "Call to the Kindred",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at the top five cards of your library?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          min: 0,
          max: 1,
          filter: { type: "creature", sharesCreatureTypeWith: "attached" },
          destination: "battlefield",
          leftover: "bottom-any-order",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

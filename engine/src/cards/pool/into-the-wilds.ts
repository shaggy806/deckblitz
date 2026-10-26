import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, look at the top card of your library. If it's a land card, you may put it onto the battlefield.";

export default defineCard({
  name: "Into the Wilds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

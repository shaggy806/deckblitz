import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each end step, if this creature attacked or blocked this turn, its owner shuffles it into their library.";

export default defineCard({
  name: "Inferno Hellion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 7,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "source",
        filter: { anyOf: [{ attackedThisTurn: true }, { blockedThisTurn: { relation: "blocked" } }] },
      },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});

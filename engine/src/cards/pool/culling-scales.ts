import { defineCard } from "../define.js";

// "Lowest mana value" among every nonland permanent (`greatestInZone` with
// `least`), ties all legal targets (the reminder text). Rechecked as it
// resolves: a target no longer lowest is illegal and nothing is destroyed (the
// ruling); at lowest 3 it can target itself (the ruling).
const TEXT =
  "At the beginning of your upkeep, destroy target nonland permanent with the lowest mana value. (If two or more permanents are tied for lowest, target any one of them.)";

export default defineCard({
  name: "Culling Scales",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        {
          kind: "permanent",
          filter: { notTypes: ["land"], greatestInZone: { of: "mana-value", among: { notTypes: ["land"] }, least: true } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 23044. Monocolored: exactly one colour (rule 105.2a) — not
// multicolored, and at least one colour (Sultai Charm's filter).
const UPKEEP =
  "At the beginning of each player's upkeep, that player sacrifices a monocolored creature of their choice.";

export default defineCard({
  name: "Defiler of Souls",
  manaCost: "{3}{B}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "active-player",
        filter: {
          type: "creature",
          multicolored: false,
          anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
        },
        count: 1,
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});

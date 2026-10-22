import { defineCard } from "../define.js";

// EDHREC rank 27424. X counts the Islands this resolution tapped — an
// Island already tapped isn't tapped again, so it isn't counted.
const TEXT =
  "At the beginning of each player's end step, tap all untapped Islands that player controls and this enchantment deals X damage to the player, where X is the number of Islands tapped this way.";

export default defineCard({
  name: "Monsoon",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { subtype: "Island", controlledBy: "active-player", tapped: false } },
          { kind: "damage", who: "active-player", amount: { thisWay: "tapped" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

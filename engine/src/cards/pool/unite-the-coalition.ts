import { defineCard } from "../define.js";

// EDHREC rank 8731.

export default defineCard({
  name: "Unite the Coalition",
  manaCost: "{2}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["instant"],
  text: "Choose five. You may choose the same mode more than once.\n• Target permanent phases out.\n• Target player draws a card.\n• Exile target player's graveyard.\n• Unite the Coalition deals 2 damage to any target.\n• Destroy target artifact or enchantment.",
  castModal: {
    minModes: 5,
    maxModes: 5,
    repeatModes: true,
    modes: [
      {
        text: "Target permanent phases out.",
        targets: ["permanent"],
        effect: { kind: "phase-out", target: 0 },
      },
      {
        text: "Target player draws a card.",
        targets: ["player"],
        effect: { kind: "draw", amount: 1, target: 0 },
      },
      {
        text: "Exile target player's graveyard.",
        targets: ["player"],
        effect: { kind: "exile-graveyard", target: 0 },
      },
      {
        text: "Unite the Coalition deals 2 damage to any target.",
        targets: ["any-target"],
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      {
        text: "Destroy target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

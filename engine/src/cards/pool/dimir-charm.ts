import { defineCard } from "../define.js";

export default defineCard({
  name: "Dimir Charm",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose one —\n• Counter target sorcery spell.\n• Destroy target creature with power 2 or less.\n• Look at the top three cards of target player's library. Put one back and the rest into that player's graveyard.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target sorcery spell.",
        targets: [{ kind: "spell", filter: { type: "sorcery" } }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Destroy target creature with power 2 or less.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Look at the top three cards of target player's library. Put one back and the rest into that player's graveyard.",
        targets: ["player"],
        effect: {
          kind: "look-and-choose",
          from: { target: 0 },
          zone: "library",
          count: 3,
          min: 1,
          max: 1,
          destination: "library-top",
          leftover: "graveyard",
        },
      },
    ],
  },
});

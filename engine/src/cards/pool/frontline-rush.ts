import { defineCard } from "../define.js";

// EDHREC rank 7668.
// Makes Goblin → "Goblin Token".
//
// Rulings:
//   [2025-04-04] The value of X is calculated only once, as Frontline Rush resolves.

const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Frontline Rush",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Choose one —\n• Create two 1/1 red Goblin creature tokens.\n• Target creature gets +X/+X until end of turn, where X is the number of creatures you control.",
  // The second mode targets, so the mode is chosen as it's cast.
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Create two 1/1 red Goblin creature tokens.",
        effect: { kind: "create-token", token: "Goblin Token", count: 2 },
      },
      {
        text: "Target creature gets +X/+X until end of turn, where X is the number of creatures you control.",
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: CREATURES_YOU_CONTROL,
          toughness: CREATURES_YOU_CONTROL,
          duration: "end-of-turn",
        },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 12612.

const SMASH_MODE = "Smash It — Destroy target artifact.";
const LIFT_MODE = "Lift the Curse — Destroy target enchantment.";
const STEAL_MODE =
  "Steal Its Eyes — Create a Treasure token and venture into the dungeon. (Enter the first room or advance to the next room.)";

export default defineCard({
  name: "You Find a Cursed Idol",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${SMASH_MODE}\n• ${LIFT_MODE}\n• ${STEAL_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SMASH_MODE,
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: LIFT_MODE,
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: STEAL_MODE,
        effect: {
          kind: "sequence",
          effects: [{ kind: "create-token", token: "Treasure Token", count: 1 }, { kind: "venture" }],
        },
      },
    ],
  },
});

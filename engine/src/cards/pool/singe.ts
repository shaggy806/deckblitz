import { defineCard } from "../define.js";

// EDHREC rank 30719.

export default defineCard({
  name: "Singe",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Singe deals 1 damage to target creature. That creature becomes black until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
    ],
  },
});

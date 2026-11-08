import { defineCard } from "../define.js";

// EDHREC rank 31093.

export default defineCard({
  name: "Misfortune's Gain",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target creature. Its owner gains 4 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 4, who: { ownerOf: 0 } },
    ],
  },
});

import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 28054. Midnight Charm's modal shape.

export default defineCard({
  name: "Hope Charm",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gains first strike until end of turn.\n• Target player gains 2 life.\n• Destroy target Aura.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gains first strike until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
      {
        text: "Target player gains 2 life.",
        targets: ["player"],
        effect: { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
      },
      {
        text: "Destroy target Aura.",
        targets: [{ kind: "permanent", filter: { subtype: "Aura" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});

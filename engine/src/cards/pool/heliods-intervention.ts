import { defineCard } from "../define.js";

// Its first mode is exactly X targets (an any-number group in a mode, the
// last mode with targets — rule 700.2: a modal spell's targets are its chosen
// modes', in order).
export default defineCard({
  name: "Heliod's Intervention",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Destroy X target artifacts and/or enchantments.\n• Target player gains twice X life.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: [{ kind: "any-number", of: "artifact-or-enchantment", min: "x", max: "x" }],
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "destroy", target: 0 },
        },
        text: "Destroy X target artifacts and/or enchantments.",
      },
      {
        targets: ["player"],
        effect: { kind: "gain-life", amount: { product: ["x", 2] }, toControllerOfTarget: 0 },
        text: "Target player gains twice X life.",
      },
    ],
  },
});

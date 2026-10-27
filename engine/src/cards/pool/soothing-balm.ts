import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27037.

export default defineCard({
  name: "Soothing Balm",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player gains 5 life.",
  targets: ["player"],
  effect: { kind: "gain-life", amount: 5, toControllerOfTarget: 0 },
});

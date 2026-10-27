import { defineCard } from "../define.js";

// EDHREC rank 18267.
export default defineCard({
  name: "Heroes' Reunion",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Target player gains 7 life.",
  targets: ["player"],
  effect: { kind: "gain-life", amount: 7, toControllerOfTarget: 0 },
});

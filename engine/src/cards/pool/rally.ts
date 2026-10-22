import { defineCard } from "../define.js";

// Ice Age. Piety's shape: the creatures blocking as it resolves.

export default defineCard({
  name: "Rally",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Blocking creatures get +1/+1 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", blocking: true },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Celestial Flare",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player sacrifices an attacking or blocking creature of their choice.",
  targets: ["player"],
  effect: {
    kind: "sacrifice",
    who: "target",
    filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
    count: 1,
  },
});

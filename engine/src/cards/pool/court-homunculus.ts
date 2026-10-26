import { defineCard } from "../define.js";

// EDHREC rank 26524.
//
// "Another artifact": a static's `controls` scan skips its own source
// (Magitek Infantry's shape).

const TEXT = "This creature gets +1/+1 as long as you control another artifact.";

export default defineCard({
  name: "Court Homunculus",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});

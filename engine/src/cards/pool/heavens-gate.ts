import { defineCard } from "../define.js";

// EDHREC rank 19079. Layer 5 (rule 613.1e): each becomes white only.

export default defineCard({
  name: "Heaven's Gate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "One or more target creatures become white until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: ["W"], duration: "end-of-turn" },
  },
});

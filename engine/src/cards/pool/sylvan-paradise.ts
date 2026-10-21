import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 27450. Heaven's Gate in green — layer 5 (rule
// 613.1e): each becomes green only.

export default defineCard({
  name: "Sylvan Paradise",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "One or more target creatures become green until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: ["G"], duration: "end-of-turn" },
  },
});

import { defineCard } from "../define.js";

// Legends. EDHREC rank 29848. Heaven's Gate's shape — layer 5 (rule
// 613.1e): each becomes red only.

export default defineCard({
  name: "Dwarven Song",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "One or more target creatures become red until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: ["R"], duration: "end-of-turn" },
  },
});

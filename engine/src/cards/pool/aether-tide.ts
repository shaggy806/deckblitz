import { defineCard } from "../define.js";

// EDHREC rank 26912. Torment.

export default defineCard({
  name: "Aether Tide",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X creature cards.\nReturn X target creatures to their owners' hands.",
  additionalCost: { discard: "x", discardFilter: { type: "creature" } },
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0 },
  },
});

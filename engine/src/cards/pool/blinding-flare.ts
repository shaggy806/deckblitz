import { defineCard } from "../define.js";

export default defineCard({
  name: "Blinding Flare",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Strive — This spell costs {R} more to cast for each target beyond the first.\n" +
    "Any number of target creatures can't block this turn.",
  costPerExtraTarget: "{R}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] } },
});

import { defineCard } from "../define.js";

// EDHREC rank 15439. Torment.

export default defineCard({
  name: "Turbulent Dreams",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards.\nReturn X target nonland permanents to their owners' hands.",
  additionalCost: { discard: "x" },
  targets: [{ kind: "any-number", of: "nonland-permanent", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "return-to-hand", target: 0 } },
});

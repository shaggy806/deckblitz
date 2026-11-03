import { defineCard } from "../define.js";

export default defineCard({
  name: "Scorched Earth",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X land cards.\nDestroy X target lands.",
  additionalCost: { discard: "x", discardFilter: { type: "land" } },
  targets: [{ kind: "any-number", of: "land", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
});

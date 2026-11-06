import { defineCard } from "../define.js";

// "X plus 1" divided as it's cast, at least 1 to each target (rule 601.2d):
// so no more than X + 1 targets. A target gone illegal loses its share.
export default defineCard({
  name: "Meteor Shower",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Meteor Shower deals X plus 1 damage divided as you choose among any number of targets.",
  targets: [{ kind: "any-number", of: "any-target" }],
  divided: { total: { sum: ["x", 1] }, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});

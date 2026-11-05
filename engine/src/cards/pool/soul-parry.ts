import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Parry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage one or two target creatures would deal this turn.",
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 2 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "damage-rule", by: { target: 0 } } },
});

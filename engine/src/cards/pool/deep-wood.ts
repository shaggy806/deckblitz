import { defineCard } from "../define.js";

// EDHREC rank 24948.
//
// Noncombat damage too, from a creature that's attacking as it would be
// dealt; to you only, not your planeswalkers.

export default defineCard({
  name: "Deep Wood",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nPrevent all damage that would be dealt to you this turn by attacking creatures.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: { kind: "prevent-damage-to-you", by: { type: "creature", attacking: true } },
});

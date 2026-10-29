import { defineCard } from "../define.js";

// EDHREC rank 10915.
//
// Rulings:
//   Safe Passage will prevent damage dealt to creatures that weren't on the battlefield at the
//   time it resolved.
//   Safe Passage doesn't prevent damage that would be dealt to planeswalkers you control.
export default defineCard({
  name: "Safe Passage",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to you and creatures you control this turn.",
  targets: [],
  effect: { kind: "damage-rule", to: { players: "you", permanents: { type: "creature", controlledBy: "you" } } },
});

import { defineCard } from "../define.js";

// Outlaws of Thunder Junction. EDHREC rank 22112.
//
// Rulings:
//   If you controlled a Mount as you finished casting Steer Clear, it doesn't matter whether you
//   still control one as the spell resolves. Steer Clear will still deal 4 damage.

export default defineCard({
  name: "Steer Clear",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Steer Clear deals 2 damage to target attacking or blocking creature. Steer Clear deals 4 damage to that creature instead if you controlled a Mount as you cast this spell.",
  asCast: [{ condition: { kind: "controls", filter: { subtype: "Mount" }, atLeast: 1 } }],
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "damage",
    amount: { ifCondition: { kind: "as-cast", fact: 0 }, then: 4, else: 2 },
    target: 0,
  },
});

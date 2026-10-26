import { defineCard } from "../define.js";

// EDHREC rank 18729.
//
// Rulings:
//   [2012-10-01] Abilities that change the power of a creature (such as the one of Collective
//     Blessing) affect only creatures on the battlefield. They won't change a creature spell's
//     power on the stack.
//   [2012-10-01] Essence Backlash can target a creature spell that can't be countered. If Essence
//     Backlash resolves, it won't counter the spell but it will still deal damage.
//   [2012-10-01] If the creature's power is * and it has an ability defining its power, use that
//     ability to determine its power.
//
// Mindswipe's "counter, then damage that spell's controller" order; the power is read off the
// targeted spell (its last-known self once countered).

export default defineCard({
  name: "Essence Backlash",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target creature spell. Essence Backlash deals damage equal to that spell's power to its controller.",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
    ],
  },
});

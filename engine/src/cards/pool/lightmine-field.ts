import { defineCard } from "../define.js";

// Rulings:
//   Which creatures are dealt damage is based on which creatures were declared as attackers during
//     the declare attackers step.
//   It triggers when any creatures attack, including your own.
//   A creature that attacked but was removed from combat before it resolves is dealt damage but isn't
//     counted for the amount; a creature put onto the battlefield attacking isn't dealt damage but is
//     counted.
//   How much damage each is dealt is based on how many creatures are attacking as it resolves.

const TEXT =
  "Whenever one or more creatures attack, this enchantment deals damage to each of those creatures equal to the number of attacking creatures.";

export default defineCard({
  name: "Lightmine Field",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "any" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { inSet: "trigger-batch" },
        amount: { countOf: { type: "creature", attacking: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

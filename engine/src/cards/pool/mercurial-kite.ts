import { defineCard } from "../define.js";

// EDHREC rank 31013.

export default defineCard({
  name: "Mercurial Kite",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a creature, tap that creature. That creature doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, tap that creature. That creature doesn't untap during its controller's next untap step.",
    },
  ],
});

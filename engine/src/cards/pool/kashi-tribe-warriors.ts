import { defineCard } from "../define.js";

// EDHREC rank 28688.

export default defineCard({
  name: "Kashi-Tribe Warriors",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 2,
  toughness: 4,
  text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
    },
  ],
});

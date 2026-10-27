import { defineCard } from "../define.js";

// EDHREC rank 25608.

export default defineCard({
  name: "Kashi-Tribe Reaver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.\n{1}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
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

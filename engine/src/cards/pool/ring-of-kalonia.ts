import { defineCard } from "../define.js";

// "If it's green" is checked as the upkeep ability resolves (not an
// intervening "if" — it ends the sentence), of the creature equipped then.
const UPKEEP = "At the beginning of your upkeep, put a +1/+1 counter on equipped creature if it's green.";

export default defineCard({
  name: "Ring of Kalonia",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)\n${UPKEEP}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { colors: ["G"] } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["trample"],
      text: "Equipped creature has trample.",
    },
  ],
});

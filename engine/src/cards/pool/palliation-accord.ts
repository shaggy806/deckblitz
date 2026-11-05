import { defineCard } from "../define.js";

// EDHREC rank 19689.
const TAP_TEXT = "Whenever a creature an opponent controls becomes tapped, put a palliation counter on this enchantment.";
const SHIELD_TEXT = "Remove a palliation counter from this enchantment: Prevent the next 1 damage that would be dealt to you this turn.";

export default defineCard({
  name: "Palliation Accord",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `${TAP_TEXT}\n${SHIELD_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "palliation", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "palliation", count: 1 } },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 1 },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
});

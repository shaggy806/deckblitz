import { defineCard } from "../define.js";

const TAP_TEXT = "Whenever a creature an opponent controls becomes tapped, if it isn't being declared as an attacker, you may draw a card.";
const ACTIVATED_TEXT = "{4}{U}: Tap target creature without flying.";

export default defineCard({
  name: "Verity Circle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TAP_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "creature", controlledBy: "opponent" }, notAttacking: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});

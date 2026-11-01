import { defineCard } from "../define.js";

// Makes Spirit → "Spirit Token (Colorless)".
//
// It has a target, so it isn't a mana ability however it's worded (rule
// 605.1b): the opponent is chosen as it goes on the stack.
const MANA = "{T}: Add one mana of any color.";
const SPIRIT = "Whenever you tap this land for mana, target opponent creates a 1/1 colorless Spirit creature token.";

export default defineCard({
  name: "Forbidden Orchard",
  colors: [],
  types: ["land"],
  text: `${MANA}\n${SPIRIT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1, who: "target-controller" },
      resolve: null,
      text: SPIRIT,
    },
  ],
});

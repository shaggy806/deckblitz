import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, it deals 3 damage to any target.";
const RETURN_TEXT = "When a Cartouche you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Trial of Zeal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cartouche" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});

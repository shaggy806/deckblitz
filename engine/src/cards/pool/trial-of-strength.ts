import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, create a 4/2 green Beast creature token.";
const CARTOUCHE_TEXT = "When a Cartouche you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Trial of Strength",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CARTOUCHE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "4/2 Beast Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cartouche" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: CARTOUCHE_TEXT,
    },
  ],
});

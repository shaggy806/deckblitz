import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, draw a card.";
const SEAL_TEXT = "Cards in graveyards can't be the targets of spells or abilities.";

export default defineCard({
  name: "Ground Seal",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SEAL_TEXT}`,
  static: [{ affects: { scope: "self" }, graveyardCardsUntargetable: {}, text: SEAL_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 25609.

const FLASH_TEXT = "You may cast Hero spells as though they had flash.";

export default defineCard({
  name: "Blur of Heroism",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `When this enchantment enters, draw a card.\n${FLASH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this enchantment enters, draw a card.",
    },
  ],
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { subtype: "Hero" }, text: FLASH_TEXT }],
});

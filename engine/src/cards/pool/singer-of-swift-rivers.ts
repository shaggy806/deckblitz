import { defineCard } from "../define.js";

// EDHREC rank 6128.

const ENTERS_TEXT =
  "When this creature enters, put a shield counter on another target creature you control. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)";
const FLASH_TEXT = "You may cast Merfolk spells as though they had flash.";

export default defineCard({
  name: "Singer of Swift Rivers",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT}\n${FLASH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { subtype: "Merfolk" }, text: FLASH_TEXT }],
});

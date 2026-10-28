import { defineCard } from "../define.js";

// EDHREC rank 5642.
//
// The flash permission is for casting only: an "activate only as a sorcery"
// ability stays where it was (the ruling). Choosing a Ring-bearer that
// already was one still counts as choosing it (the ruling) — `chosen:
// "other"` asks only whether the creature chosen is Gandalf.

const FLASH_TEXT = "You may cast sorcery spells as though they had flash.";
const TEMPT_TEXT =
  "Whenever the Ring tempts you, if you chose a creature other than Gandalf as your Ring-bearer, draw a card.";

export default defineCard({
  name: "Gandalf, Friend of the Shire",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${FLASH_TEXT}\n${TEMPT_TEXT}`,
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { type: "sorcery" }, text: FLASH_TEXT }],
  triggered: [
    {
      trigger: { on: "ring-tempts", who: "you", chosen: "other" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEMPT_TEXT,
    },
  ],
});

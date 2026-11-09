import { defineCard } from "../define.js";

const FLASH = "You may cast legendary spells and artifact spells as though they had flash.";
const DOUBLE =
  "If a legendary permanent or an artifact entering or leaving the battlefield causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";
const WHICH = { anyOf: [{ supertype: "legendary" }, { type: "artifact" }] } as const;

export default defineCard({
  name: "Gandalf the White",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 4,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${FLASH}\n${DOUBLE}`,
  static: [
    { affects: { scope: "self" }, castAsThoughFlash: WHICH, text: FLASH },
    { affects: { scope: "self" }, doubleTriggers: { cause: ["enters", "leaves"], filter: WHICH }, text: DOUBLE },
  ],
});

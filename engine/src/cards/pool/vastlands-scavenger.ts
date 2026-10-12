import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Bind to Life, no card
// of its own (`bind-to-life.ts`, `prepareSpellOnly`).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Vastlands Scavenger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  prepareSpell: "Bind to Life",
  text: `Deathtouch\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
});

import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER, ward } from "../helpers.js";

// EDHREC rank 23153. A preparation card (rule 722): its prepare spell is
// Awaken the Ages, a spell with no card of its own (`prepareSpellOnly`).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Strife Scholar",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Sorcerer"],
  power: 3,
  toughness: 2,
  prepareSpell: "Awaken the Ages",
  text: `Ward—Pay 2 life.\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [ward({ payLife: 2 })],
});

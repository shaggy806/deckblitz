import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 16389. A preparation card (rule 722): its prepare spell is
// Stream of Life, a card of its own — the same Oracle text.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Infirmary Healer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 3,
  prepareSpell: "Stream of Life",
  text: ENTERS_TEXT,
  static: [entersPrepared(ENTERS_TEXT)],
});

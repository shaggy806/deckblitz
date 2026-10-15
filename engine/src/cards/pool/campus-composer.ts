import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER, ward } from "../helpers.js";

// EDHREC rank 21760. A preparation card (rule 722): its prepare spell is
// Aqueous Aria, a spell with no card of its own (`prepareSpellOnly`).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Campus Composer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Bard"],
  power: 3,
  toughness: 4,
  prepareSpell: "Aqueous Aria",
  text: `Ward {2}\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [ward({ mana: "{2}" })],
});

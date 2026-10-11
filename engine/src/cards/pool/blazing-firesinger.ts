import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Seething Song, the
// pool's own card — the same Oracle text.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Blazing Firesinger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 2,
  toughness: 3,
  prepareSpell: "Seething Song",
  text: ENTERS_TEXT,
  static: [entersPrepared(ENTERS_TEXT)],
});

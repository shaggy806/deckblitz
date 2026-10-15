import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 23245.
//
// A preparation card (rule 722): its prepare spell is Peer Review, which has
// no card of its own (`peer-review.ts`, `prepareSpellOnly`).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Fatehold Chronologist",
  manaCost: "{1}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  prepareSpell: "Peer Review",
  text: `Flying\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
});

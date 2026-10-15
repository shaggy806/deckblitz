import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 25443.
// A preparation card (rule 722) whose prepare spell, Vicious Verse, is the
// pool's own prepare-only face (Stingerquill Voxmancer's too).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const RUMMAGE_TEXT = "{T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Hallway Heckler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 2,
  toughness: 3,
  prepareSpell: "Vicious Verse",
  text: `${ENTERS_TEXT}\n${RUMMAGE_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: RUMMAGE_TEXT,
    },
  ],
});

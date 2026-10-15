import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// Reality Fracture (FRA). EDHREC rank 26256.
// A preparation card (rule 722) whose prepare spell, Vicious Verse, is the
// pool's own prepare-only face (Hallway Heckler's and Stingerquill
// Voxmancer's too). "An opponent was dealt noncombat damage this turn" is any
// one opponent's `noncombat-damage-taken`.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const EVASION_TEXT =
  "As long as an opponent was dealt noncombat damage this turn, this creature has flying and haste.";

export default defineCard({
  name: "Whiplash Wordsmith",
  manaCost: "{3}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Sorcerer"],
  power: 3,
  toughness: 3,
  prepareSpell: "Vicious Verse",
  text: `${ENTERS_TEXT}\n${EVASION_TEXT}`,
  static: [
    entersPrepared(ENTERS_TEXT),
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "noncombat-damage-taken", who: "opponent", atLeast: 1 },
      grantKeywords: ["flying", "haste"],
      text: EVASION_TEXT,
    },
  ],
});

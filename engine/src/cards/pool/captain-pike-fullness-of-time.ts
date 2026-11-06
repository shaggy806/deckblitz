import { defineCard } from "../define.js";

// EDHREC rank 27978.
// "Strange new worlds" is an ability word (rule 207.2c): no rules of its own.

const PT_TEXT =
  "Strange new worlds — Captain Pike's power and toughness are each equal to the number of differently named lands you control.";
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play lands from the top of your library.";

export default defineCard({
  name: "Captain Pike, Fullness of Time",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer", "Scout"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${LOOK_TEXT}\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    { affects: { scope: "self" }, playFromLibraryTop: { type: "land" }, text: PLAY_TEXT },
  ],
});

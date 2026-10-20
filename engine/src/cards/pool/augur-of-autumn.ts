import { defineCard } from "../define.js";

const LOOK_TEXT = "You may look at the top card of your library any time.";
const LANDS_TEXT = "You may play lands from the top of your library.";
const COVEN_TEXT =
  "Coven — As long as you control three or more creatures with different powers, you may cast creature spells from the top of your library.";

export default defineCard({
  name: "Augur of Autumn",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 3,
  text: `${LOOK_TEXT}\n${LANDS_TEXT}\n${COVEN_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land" },
      text: LANDS_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "coven" },
      castFromLibraryTop: { filter: { type: "creature" } },
      text: COVEN_TEXT,
    },
  ],
});

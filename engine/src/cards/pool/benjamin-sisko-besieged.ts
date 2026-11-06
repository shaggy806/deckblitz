import { defineCard } from "../define.js";

// EDHREC rank 29060.

const REVEAL_TEXT = "Play with the top card of your library revealed.";
const PLAY_TEXT = "You may play lands and cast creature spells from the top of your library.";

export default defineCard({
  name: "Benjamin Sisko, Besieged",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 5,
  toughness: 5,
  text: `${REVEAL_TEXT}\n${PLAY_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { libraryTopRevealed: "you" }, text: REVEAL_TEXT },
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land" },
      castFromLibraryTop: { filter: { type: "creature" } },
      text: PLAY_TEXT,
    },
  ],
});

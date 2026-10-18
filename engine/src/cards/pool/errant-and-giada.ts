import { defineCard } from "../define.js";

// EDHREC rank 7768.
//
// Sigarda, Font of Blessings' shape: looking at the top card any time is for
// the controller alone (rule 401.5), and a spell cast from the top is judged
// as the spell it would be (rule 601.3e) — one with flash or flying — paying
// every cost and keeping its own timing (a flying sorcery-speed creature
// still waits for a main phase).
//
// Rulings:
//   [2023-04-14] Errant and Giada lets you look at the top card of your library whenever you want
//     (with one restriction—see below), even if you don't have priority. This action doesn't use
//     the stack.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const CAST_TEXT = "You may cast spells with flash or flying from the top of your library.";

export default defineCard({
  name: "Errant and Giada",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Angel"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${LOOK_TEXT}\n${CAST_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { anyOf: [{ keyword: "flash" }, { keyword: "flying" }] } },
      text: CAST_TEXT,
    },
  ],
});

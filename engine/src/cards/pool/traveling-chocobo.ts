import { defineCard } from "../define.js";

// EDHREC rank 1878. Final Fantasy.
//
// Doubles any trigger a land or Bird of yours entering causes (`doubleTriggers`,
// the rulings' "its own enters abilities as well as other triggered abilities"),
// so landfall as much as "enters". The entering permanent is read as it is on
// the battlefield, this creature itself included. Replacement effects and "as
// this enters" abilities aren't triggered abilities (the rulings).
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play lands and cast Bird spells from the top of your library.";
const DOUBLE_TEXT =
  "If a land or Bird you control entering the battlefield causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";

export default defineCard({
  name: "Traveling Chocobo",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 2,
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${DOUBLE_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land" },
      castFromLibraryTop: { filter: { subtype: "Bird" } },
      text: PLAY_TEXT,
    },
    {
      affects: { scope: "self" },
      doubleTriggers: { cause: "enters", filter: { anyOf: [{ type: "land" }, { subtype: "Bird" }], controlledBy: "you" } },
      text: DOUBLE_TEXT,
    },
  ],
});

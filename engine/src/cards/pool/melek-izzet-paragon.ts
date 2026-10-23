import { defineCard } from "../define.js";

const CAST_TEXT = "You may cast instant and sorcery spells from the top of your library.";
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell from your library, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Melek, Izzet Paragon",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Weird", "Wizard"],
  power: 2,
  toughness: 4,
  text: `Play with the top card of your library revealed.\n${CAST_TEXT}\n${COPY_TEXT}`,
  revealsOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { typesAnyOf: ["instant", "sorcery"] } },
      text: CAST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "library", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});

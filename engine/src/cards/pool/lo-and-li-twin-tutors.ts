import { defineCard } from "../define.js";

// EDHREC rank 15239.
//
// Rulings:
//   [2025-11-21] An instant or sorcery spell with lifelink causes its controller to gain life only
//     if it's the source of any damage that's dealt. An instant or sorcery spell with lifelink that
//     causes another source to deal damage won't cause its controller to gain life.
//
// "Lesson spells you control" is Samut, Tyrant of Naktamun's `grantsToSpells`:
// every Lesson spell its controller controls, a copy included, while Lo and
// Li are on the battlefield; a granted keyword is the spell's own, so the
// damage it deals itself has lifelink.
const TUTOR_TEXT =
  "When Lo and Li enter, search your library for a Lesson or Noble card, reveal it, put it into your hand, then shuffle.";
const LIFELINK_TEXT = "Noble creatures you control and Lesson spells you control have lifelink.";

export default defineCard({
  name: "Lo and Li, Twin Tutors",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${TUTOR_TEXT}\n${LIFELINK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ subtype: "Lesson" }, { subtype: "Noble" }] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TUTOR_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Noble" },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { subtype: "Lesson" }, keywords: ["lifelink"] },
      text: LIFELINK_TEXT,
    },
  ],
});

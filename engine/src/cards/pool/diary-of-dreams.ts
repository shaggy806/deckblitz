import { defineCard } from "../define.js";

// EDHREC rank 9620.
//
// Rulings:
//   [2026-03-20] Book is a new artifact type with no inherent rules meaning.

const PAGE_TEXT = "Whenever you cast an instant or sorcery spell, put a page counter on this artifact.";
const DRAW_TEXT =
  "{5}, {T}: Draw a card. This ability costs {1} less to activate for each page counter on this artifact.";

export default defineCard({
  name: "Diary of Dreams",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${PAGE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "page", amount: 1 },
      resolve: null,
      text: PAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      // Generic only, never below {0} (rule 601.2f).
      costReduction: { reduceGeneric: { countersOnSource: "page" } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

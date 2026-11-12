import { defineCard } from "../define.js";

// EDHREC rank 11639. Dream Devourer's foretell grant; Wayspeaker Bodyguard's
// second-spell trigger, goading.

const FORETELL_TEXT =
  "Each nonland card in your hand without foretell has foretell. Its foretell cost is equal to its mana cost reduced by {2}. (During your turn, you may pay {2} and exile it from your hand face down. Cast it on a later turn for its foretell cost.)";
const GOAD_TEXT = "Whenever you cast your second spell each turn, goad target creature an opponent controls.";

export default defineCard({
  name: "Bohn, Beguiling Balladeer",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 3,
  toughness: 3,
  text: `${FORETELL_TEXT}\n${GOAD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToHand: {
        filter: { notTypes: ["land"] },
        keywordValues: [{ keyword: "foretell", cost: { manaCostLess: 2 } }],
      },
      text: FORETELL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: GOAD_TEXT,
    },
  ],
});

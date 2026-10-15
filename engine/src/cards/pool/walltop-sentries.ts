import { defineCard } from "../define.js";

// EDHREC rank 12432.
//
// Rulings:
//   [2025-10-02] Walltop Sentries's triggered ability checks if there is a Lesson card in your
//     graveyard when it is put on the stack and again when it goes to resolve. If there is no
//     Lesson card in your graveyard when Walltop Sentries dies, the ability will not be put on the
//     stack at all.
//
// An intervening "if" (rule 603.4): the trigger's `condition`, asked as it
// triggers and again as it resolves.

const DIES_TEXT = "When this creature dies, if there's a Lesson card in your graveyard, you gain 2 life.";

export default defineCard({
  name: "Walltop Sentries",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 3,
  keywords: ["reach", "deathtouch"],
  text: `Reach, deathtouch\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
    },
  ],
});

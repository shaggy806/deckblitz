import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may search your library for exactly two cards not named Burning-Rune Demon that have different names. If you do, reveal those cards. An opponent chooses one of them. Put the chosen card into your hand and the other into your graveyard, then shuffle.";

/** Declining the search reveals and shuffles nothing (its ruling): the search
 * is inside the `may`. The opponent's pick goes to hand, the rest to the
 * graveyard. */
export default defineCard({
  name: "Burning-Rune Demon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Berserker"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for two cards with different names?",
        effect: {
          kind: "search-library",
          filter: { notName: "Burning-Rune Demon" },
          together: { distinctNames: true },
          destination: "graveyard",
          min: 2,
          max: 2,
          reveal: true,
          instead: { destination: "hand", pick: { exactly: 1 }, chooser: "an-opponent" },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

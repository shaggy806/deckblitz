import { defineCard } from "../define.js";

/** With three cards found, two still go back (its ruling): the opponent's
 * `exactly: 2` takes every find when there are no more than two. */
export default defineCard({
  name: "Ecological Appreciation",
  manaCost: "{X}{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library and graveyard for up to four creature cards with different names that each have mana value X or less and reveal them. An opponent chooses two of those cards. Shuffle the chosen cards into your library and put the rest onto the battlefield. Exile Ecological Appreciation.",
  exileOnResolve: true,
  effect: {
    kind: "search-library",
    filter: { type: "creature", manaValue: { op: "lte", n: { amount: "x" } } },
    zones: "library-and-graveyard",
    upTo: true,
    together: { distinctNames: true },
    destination: "battlefield",
    min: 0,
    max: 4,
    reveal: true,
    instead: { destination: "library", pick: { exactly: 2 }, chooser: "an-opponent" },
  },
});

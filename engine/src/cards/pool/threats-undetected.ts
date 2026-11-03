import { defineCard } from "../define.js";

// "Up to four" may find fewer. An opponent chooses two of the finds, all of
// them when there are no more than two; those go back and are shuffled in, and
// the rest go to hand.
export default defineCard({
  name: "Threats Undetected",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Search your library for up to four creature cards with different powers and reveal them. An opponent chooses " +
    "two of those cards. Shuffle the chosen cards into your library and put the rest into your hand.",
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "hand",
    min: 0,
    max: 4,
    reveal: true,
    together: { distinctPowers: true },
    instead: { destination: "library", pick: { exactly: 2 }, chooser: "an-opponent" },
  },
});

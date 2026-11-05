import { defineCard } from "../define.js";

// EDHREC rank 5517.

export default defineCard({
  name: "Elemental Teachings",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Search your library for up to four land cards with different names and reveal them. An opponent chooses two of those cards. Put the chosen cards into your graveyard and the rest onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "land" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 4,
    reveal: true,
    together: { distinctNames: true },
    instead: { destination: "graveyard", pick: { exactly: 2 }, chooser: "an-opponent" },
  },
});

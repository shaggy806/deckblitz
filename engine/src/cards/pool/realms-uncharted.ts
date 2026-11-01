import { defineCard } from "../define.js";

// Not targeted: "an opponent" is the caster's choice, as that instruction is
// followed, with the finds revealed. One or two finds go to the graveyard with
// nothing to choose (the ruling).
export default defineCard({
  name: "Realms Uncharted",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Search your library for up to four land cards with different names and reveal them. An opponent chooses two of " +
    "those cards. Put the chosen cards into your graveyard and the rest into your hand. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "land" },
    destination: "hand",
    min: 0,
    max: 4,
    reveal: true,
    together: { distinctNames: true },
    instead: { destination: "graveyard", pick: { exactly: 2 }, chooser: "an-opponent" },
  },
});

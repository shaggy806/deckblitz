import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 17746. Battalion Foot Soldier's "any
// number", into the graveyard (nothing is revealed).
const TEXT =
  "When Iname enters, you may search your library for any number of Spirit cards, put them into your graveyard, then shuffle.";

export default defineCard({
  name: "Iname, Death Aspect",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of Spirit cards to put into your graveyard?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Spirit" },
          destination: "graveyard",
          min: 0,
          max: { librarySize: "you" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

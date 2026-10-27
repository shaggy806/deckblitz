import { defineCard } from "../define.js";

// EDHREC rank 20639. "You may search": a `may` around
// Wood Elves' search; searching, you needn't find one (its ruling).

const TEXT =
  "When this creature enters, you may search your library for a Forest card, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Silverglade Elemental",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      resolve: null,
      effect: {
        kind: "may",
        prompt: "Search your library for a Forest card?",
        effect: { kind: "search-library", filter: { subtype: "Forest" }, destination: "battlefield", min: 0, max: 1 },
      },
      text: TEXT,
    },
  ],
});

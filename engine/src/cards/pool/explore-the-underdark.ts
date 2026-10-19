import { defineCard } from "../define.js";

// EDHREC rank 5808.

export default defineCard({
  name: "Explore the Underdark",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic land cards and/or Gate cards, put them onto the battlefield tapped, then shuffle.\nYou take the initiative.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { anyOf: [{ type: "land", supertype: "basic" }, { subtype: "Gate" }] },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 2,
      },
      { kind: "take-initiative" },
    ],
  },
});

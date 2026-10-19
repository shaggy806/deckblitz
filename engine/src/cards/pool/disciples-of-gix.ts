import { defineCard } from "../define.js";

// EDHREC rank 17622. The Brothers' War.

const ENTER_TEXT =
  "When this creature enters, search your library for up to three artifact cards, put them into your graveyard, then shuffle.";

export default defineCard({
  name: "Disciples of Gix",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "search-library", filter: { type: "artifact" }, destination: "graveyard", min: 0, max: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

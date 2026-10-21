import { defineCard } from "../define.js";

// Not targeted, so the card the search put in the graveyard may be returned
// (the ruling).
export default defineCard({
  name: "Mythos of Brokkos",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "If {U}{B} was spent to cast this spell, search your library for a card, put that card into your graveyard, then shuffle.\nReturn up to two permanent cards from your graveyard to your hand.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 1, B: 1 } } },
        then: { kind: "search-library", filter: {}, destination: "graveyard", min: 1, max: 1 },
      },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
        destination: "hand",
        leftover: "stay",
      },
    ],
  },
});

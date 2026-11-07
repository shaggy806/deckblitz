import { defineCard } from "../define.js";

// Secrets of Strixhaven. The exiling stops once the cards exiled add up to
// mana value 4 (`measure: "mana-value"`); the spells are cast while this
// resolves, timing ignored (its rulings), as Primeval Spawn's are.
export default defineCard({
  name: "Improvisation Capstone",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    "Exile cards from the top of your library until you exile cards with total mana value 4 or greater. You may cast any number of spells from among them without paying their mana costs.\n" +
    "Paradigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "reveal-until-count",
        filter: {},
        count: 4,
        measure: "mana-value",
        exile: true,
        put: "with-rest",
        rest: "stay",
      },
      { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
      { kind: "paradigm" },
    ],
  },
  exileOnResolve: true,
});

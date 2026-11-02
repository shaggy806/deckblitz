import { defineCard } from "../define.js";

// "Five cards" is simply a quantity, so five must be found while the zones
// hold five (rule 701.23d). Everything else in the library and the graveyard
// is exiled and nothing is shuffled: the five go on top in the order the
// player asks for.

export default defineCard({
  name: "Doomsday",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library and graveyard for five cards and exile the rest. Put the chosen cards on top of your library in any order. You lose half your life, rounded up.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        zones: "library-and-graveyard",
        filter: {},
        destination: "library-top",
        min: 5,
        max: 5,
        exileRest: true,
        inAnyOrder: true,
      },
      { kind: "lose-life", amount: { half: { lifeTotal: "you" }, round: "up" } },
    ],
  },
});

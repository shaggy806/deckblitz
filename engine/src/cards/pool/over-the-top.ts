import { defineCard } from "../define.js";

// `choicesHeld`: every player's cards go at once (rule 603.6a), so each
// player's count is of what they control as it starts.
const COUNT = { countOf: { notTypes: ["land"], controlledBy: "you" }, forPlayer: "that-player" } as const;

export default defineCard({
  name: "Over the Top",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player reveals a number of cards from the top of their library equal to the number of nonland permanents they control, puts all permanent cards they revealed this way onto the battlefield, and puts the rest into their graveyard.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    choicesHeld: true,
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "library",
      count: COUNT,
      reveal: true,
      min: COUNT,
      max: COUNT,
      filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      destination: "battlefield",
      leftover: "graveyard",
    },
  },
});

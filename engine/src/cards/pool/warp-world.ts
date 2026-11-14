import { defineCard } from "../define.js";

// EDHREC rank 7097. Each player's count includes their tokens and a commander
// put into the command zone instead (the rulings); every player's artifacts,
// creatures and lands enter at once, then every player's enchantments (an
// Aura choosing among what's already there), and each owner orders the rest
// on the bottom (rule 401.4).
export default defineCard({
  name: "Warp World",
  manaCost: "{5}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player shuffles all permanents they own into their library, then reveals that many cards from the top of their library. Each player puts all artifact, creature, and land cards revealed this way onto the battlefield, then does the same for enchantment cards, then puts all cards revealed this way that weren't put onto the battlefield on the bottom of their library.",
  effect: {
    kind: "shuffle-graveyard-into-library",
    target: "each-player",
    zones: ["permanents"],
    revealThatMany: {
      onto: [{ typesAnyOf: ["artifact", "creature", "land"] }, { type: "enchantment" }],
      rest: "bottom",
    },
  },
});

import { defineCard } from "../define.js";

// Prophecy. "That player" is the one whose upkeep it is, compared against
// every other player (each of them an opponent of theirs, rule 102.3); a tie
// for the most isn't "more". An intervening-if (rule 603.4).

const TEXT =
  "At the beginning of each player's upkeep, if that player controls more lands than each other player, this enchantment deals 2 damage to them.";

export default defineCard({
  name: "Rivalry",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: {
        kind: "of-player",
        player: "active-player",
        condition: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "more", than: "each-opponent" },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

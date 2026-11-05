import { defineCard } from "../define.js";

// Rulings:
//   The ability does not trigger unless the player has more lands at the beginning of upkeep. This
//     is checked again on resolution, and if the player does not still have more lands, no token
//     is generated.

const TEXT =
  "At the beginning of each player's upkeep, if that player controls more lands than each other player, the player creates a 1/1 green Saproling creature token.";

export default defineCard({
  name: "Greener Pastures",
  manaCost: "{2}{G}",
  colors: ["G"],
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
      effect: { kind: "create-token", token: "Saproling Token", count: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

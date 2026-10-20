import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] You will exile all X cards from the top of your library before taking any of the
//     listed actions.
//   [2021-04-16] If multiple red cards are exiled, all of the damage is dealt as a single event.
//   [2021-04-16] If an exiled card is both blue and red, Culmination of Studies deals 1 damage to
//     each opponent and you draw a card.

export default defineCard({
  name: "Culmination of Studies",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Exile the top X cards of your library. For each land card exiled this way, create a Treasure token. For each blue card exiled this way, draw a card. For each red card exiled this way, Culmination of Studies deals 1 damage to each opponent.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: "x" },
      {
        kind: "create-token",
        token: "Treasure Token",
        count: { thisWay: "exiled", filter: { type: "land" } },
      },
      { kind: "draw", amount: { thisWay: "exiled", filter: { colors: ["U"] } } },
      {
        kind: "damage",
        amount: { thisWay: "exiled", filter: { colors: ["R"] } },
        who: "each-opponent",
      },
    ],
  },
});

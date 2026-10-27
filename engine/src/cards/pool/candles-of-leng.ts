import { defineCard } from "../define.js";

const TEXT =
  "{4}, {T}: Reveal the top card of your library. If it has the same name as a card in your graveyard, put it into your graveyard. Otherwise, draw a card.";

export default defineCard({
  name: "Candles of Leng",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          // A card was revealed (an empty library reveals nothing, and then
          // "otherwise, draw a card" draws) and it shares a name with a card
          // in your graveyard.
          condition: {
            kind: "all",
            of: [
              { kind: "target", index: 0, filter: {} },
              { kind: "not", of: { kind: "target", index: 0, filter: { nameUnlike: { graveyard: { ownedBy: "you" } } } } },
            ],
          },
          // The revealed card is still the top one: it goes to the graveyard.
          then: { kind: "look-and-choose", zone: "library", count: 1, min: 0, max: 0, destination: "hand", leftover: "graveyard" },
          else: { kind: "draw", amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 26137.
//
// Rulings:
//   [2019-06-14] While resolving Rank Officer's triggered ability, you can't discard multiple
//     cards to create multiple Zombie tokens.

export default defineCard({
  name: "Rank Officer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, you may discard a card. If you do, create a 2/2 black Zombie creature token.\n{1}{B}, {T}, Exile a creature card from your graveyard: Each opponent loses 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to create a 2/2 black Zombie creature token?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "create-token", token: "Zombie Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may discard a card. If you do, create a 2/2 black Zombie creature token.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "{1}{B}, {T}, Exile a creature card from your graveyard: Each opponent loses 2 life.",
    },
  ],
});

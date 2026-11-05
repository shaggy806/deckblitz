import { defineCard } from "../define.js";

// EDHREC rank 19001. With a land among them one must be taken (the ruling);
// with none, the look takes nothing and the draw makes up for it.

const TEXT =
  "{1}, {T}, Sacrifice this artifact: Reveal the top five cards of your library. Put a land card from among them into your hand and the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, draw a card.";

export default defineCard({
  name: "Inscribed Tablet",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 5,
            reveal: true,
            min: 1,
            max: 1,
            filter: { type: "land" },
            destination: "hand",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

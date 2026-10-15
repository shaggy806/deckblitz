import { defineCard } from "../define.js";

// EDHREC rank 23726.
//
// Rulings:
//   [2026-06-29] Once a spell or ability that causes you to recruit begins to resolve, no player
//     may take any other actions until it's done. Any responses made to the spell or ability must
//     be made before you draw, discard, and potentially create a token.
//
// Recruit is The Queen of Dale's draw, discard, then a token if the card
// discarded was nonland.

const TEXT = "When this creature enters, recruit.";

export default defineCard({
  name: "Long Lake Nuisance",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

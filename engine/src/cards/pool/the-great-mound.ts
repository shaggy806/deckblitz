import { defineCard } from "../define.js";

// EDHREC rank 12406.

const TOKEN_TEXT =
  "{3}, {T}: Create a tapped Vibranium token. (It's an artifact with indestructible and \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";

export default defineCard({
  name: "The Great Mound",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${TOKEN_TEXT}\n{6}, {T}: Draw a card.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Vibranium Token", count: 1, tapped: true },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{6}, {T}: Draw a card.",
    },
  ],
});
